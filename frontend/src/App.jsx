import React, { useState } from 'react';
import axios from 'axios';
import { FiSearch, FiCpu } from 'react-icons/fi';
import TerminalLoading from './components/TerminalLoading';
import Dashboard from './components/Dashboard';

import './App.css';

function App() {
  const [symbolInput, setSymbolInput] = useState('');
  const [appState, setAppState] = useState('idle'); // 'idle', 'analyzing', 'results', 'error'
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // We track two sub-states during 'analyzing' to wait for BOTH API and Terminal Animation to finish
  const [apiDone, setApiDone] = useState(false);
  const [terminalDone, setTerminalDone] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symbolInput.trim()) return;

    setAppState('analyzing');
    setData(null);
    setErrorMsg('');
    setApiDone(false);
    setTerminalDone(false);

    const symbol = symbolInput.toUpperCase().trim();

    try {
      const response = await axios.post('http://localhost:3030/api/v1/analyze', {
        symbols: [symbol],
        period: "1mo"
      });
      setData(response.data);
      setApiDone(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || err.message || "Failed to connect to the AI Gateway.");
      setAppState('error');
    }
  };

  const handleTerminalComplete = () => {
    setTerminalDone(true);
  };

  // When both terminal animation and API are done, transition to results
  React.useEffect(() => {
    if (appState === 'analyzing' && apiDone && terminalDone) {
      setAppState('results');
    }
  }, [appState, apiDone, terminalDone]);

  return (
    <div className="min-h-screen bg-[#050508] text-slate-300 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Navigation / Search Bar */}
      <nav className="sticky top-0 z-50 border-b border-emerald-500/20 bg-[#0a0a0f]/80 backdrop-blur-md px-6 py-4 shadow-lg shadow-emerald-900/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-emerald-500/40 bg-emerald-950/50 flex items-center justify-center cyber-glow">
              <FiCpu className="text-emerald-400 text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-widest bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-mono">
                SOC_ORACLE
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-emerald-500/60 font-mono">
                B2B Financial Risk Gateway
              </p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleAnalyze} className="w-full md:w-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full md:w-80 pl-10 pr-24 py-2.5 bg-[#0b0f19] border border-emerald-500/30 rounded-lg text-emerald-50 font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-600 focus:outline-none focus:cyber-glow"
              placeholder="ENTER SYMBOL (e.g. AAPL)"
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
              disabled={appState === 'analyzing'}
            />
            <button
              type="submit"
              disabled={appState === 'analyzing' || !symbolInput.trim()}
              className="absolute inset-y-1 right-1 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-mono font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ANALYZE
            </button>
          </form>

        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          {appState === 'idle' && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="mb-6 p-4 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                <FiCpu className="text-emerald-500/50 text-6xl" />
              </div>
              <h2 className="text-3xl font-mono text-emerald-50 mb-4 tracking-tight">
                AWAITING TARGET INPUT
              </h2>
              <p className="max-w-md text-slate-500 font-mono text-sm leading-relaxed">
                Enter a financial ticker symbol above to initialize multi-agent risk assessment and compliance scanning protocol.
              </p>
            </div>
          )}

          {appState === 'analyzing' && (
            <div className="mt-8">
              <TerminalLoading onComplete={handleTerminalComplete} />
            </div>
          )}

          {appState === 'results' && data && (
            <Dashboard data={data} />
          )}

          {appState === 'error' && (
            <div className="max-w-2xl mx-auto mt-12 p-6 rounded-lg border border-red-500/30 bg-red-950/20 cyber-glow-red animate-fade-in">
              <h3 className="text-red-500 font-mono font-bold text-lg mb-2 flex items-center gap-2">
                <span className="text-2xl">⚠</span> CRITICAL EXCEPTION
              </h3>
              <p className="text-slate-300 font-mono text-sm">
                {errorMsg}
              </p>
              <button 
                onClick={() => setAppState('idle')}
                className="mt-6 px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded font-mono text-sm transition-colors"
              >
                ACKNOWLEDGE & RESET
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;