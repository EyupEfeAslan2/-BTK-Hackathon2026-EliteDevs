import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiCpu } from 'react-icons/fi';
import TerminalLoading from './components/TerminalLoading';
import Dashboard from './components/Dashboard';
import CompanyCombobox, { TOP_50_COMPANIES } from './components/CompanyCombobox';
import ThemeToggle from './components/ThemeToggle';
import { useThemeStore } from './store/themeStore';

import './App.css';

function App() {
  const [symbolInput, setSymbolInput] = useState('');
  const [analyzedTicker, setAnalyzedTicker] = useState('');
  const [appState, setAppState] = useState('idle'); // 'idle', 'analyzing', 'results', 'error'
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [historyItems, setHistoryItems] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { isDark } = useThemeStore();

  // We track two sub-states during 'analyzing' to wait for BOTH API and Terminal Animation to finish
  const [apiDone, setApiDone] = useState(false);
  const [terminalDone, setTerminalDone] = useState(false);

  // Apply/remove dark mode class to document root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('https://elitedevs-go-gateway.onrender.com/history');
        setHistoryItems(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('History fetch failed:', err);
      }
    };

    fetchHistory();
  }, []);

  const normalizeCompanyName = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

  const resolveTicker = (value) => {
    const input = value.trim();
    const matched = TOP_50_COMPANIES.find((company) => (
      company.ticker.toLowerCase() === input.toLowerCase() ||
      normalizeCompanyName(company.name) === normalizeCompanyName(input)
    ));

    return (matched?.ticker || input).toUpperCase();
  };

  const runAnalyze = async (rawSymbol) => {
    if (!rawSymbol.trim()) return;

    setAppState('analyzing');
    setData(null);
    setErrorMsg('');
    setApiDone(false);
    setTerminalDone(false);

    const symbol = resolveTicker(rawSymbol);
    setSymbolInput(symbol);
    setAnalyzedTicker(symbol);
    setHistoryOpen(false);

    try {
      const response = await axios.post('https://elitedevs-go-gateway.onrender.com/api/v1/analyze', {
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

  const handleAnalyze = async (e) => {
    e.preventDefault();
    await runAnalyze(symbolInput);
  };

  const handleHistoryAnalyze = async (ticker) => {
    const symbol = String(ticker || '').split('|')[0].split(',')[0].trim();
    await runAnalyze(symbol);
  };

  const handleTerminalComplete = () => {
    setTerminalDone(true);
  };

  // When both terminal animation and API are done, transition to results
  React.useEffect(() => {
    if (appState === 'analyzing' && apiDone && terminalDone) {
      setAppState('results');
    }
    if (appState === 'error' && terminalDone) {
      setAppState('results');
    }
  }, [appState, apiDone, terminalDone]);

  return (
    <div className="min-h-screen bg-[#050508] dark:bg-[#050508] bg-white dark:text-slate-300 text-slate-900 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 dark:selection:bg-emerald-500/30 dark:selection:text-emerald-200 transition-colors duration-300">
      
      {/* Top Navigation / Search Bar */}
      <nav className="sticky top-0 z-50 border-b border-emerald-500/20 dark:border-emerald-500/20 bg-white dark:bg-[#0a0a0f]/80 dark:backdrop-blur-md px-6 py-4 shadow-lg shadow-emerald-900/10 dark:shadow-emerald-900/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-emerald-500/40 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center cyber-glow">
              <FiCpu className="text-emerald-600 dark:text-emerald-400 text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-widest bg-gradient-to-r from-emerald-600 dark:from-emerald-400 to-cyan-600 dark:to-cyan-400 bg-clip-text text-transparent font-mono">
                SOC_ORACLE
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-500/60 font-mono">
                B2B Financial Risk Gateway
              </p>
            </div>
          </div>

          {/* Search Form + Theme Toggle */}
          <div className="w-full md:w-auto flex justify-center md:justify-end gap-3 items-center">
            {historyItems.length > 0 ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setHistoryOpen((open) => !open)}
                  className="h-11 px-4 rounded-lg border border-slate-200 dark:border-emerald-500/30 bg-white dark:bg-emerald-500/10 text-slate-800 dark:text-emerald-300 font-mono text-xs font-semibold uppercase tracking-wide hover:bg-slate-50 dark:hover:bg-emerald-500/20 transition-colors"
                >
                  Recent Memos
                </button>
                {historyOpen ? (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 dark:border-emerald-500/20 bg-white dark:bg-[#0b0f19] shadow-xl shadow-slate-900/10 dark:shadow-emerald-900/20 p-2">
                    <div className="max-h-80 overflow-y-auto space-y-1">
                      {historyItems.map((item) => {
                        const symbol = String(item?.ticker || '').split('|')[0];
                        return (
                          <button
                            key={`${item?.ticker}-${item?.created_at}`}
                            type="button"
                            onClick={() => handleHistoryAnalyze(item?.ticker)}
                            className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{symbol}</span>
                              <span className="shrink-0 rounded border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                                {item?.committee_decision || 'UNKNOWN'}
                              </span>
                            </div>
                            <div className="mt-1 text-[11px] font-mono text-slate-500 dark:text-slate-500 truncate">
                              {item?.created_at || ''}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            <form onSubmit={handleAnalyze} className="flex justify-center md:justify-end">
              <CompanyCombobox 
                onSymbolChange={setSymbolInput} 
                disabled={appState === 'analyzing'} 
              />
            </form>
            <ThemeToggle />
          </div>

        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative transition-colors duration-300">
        
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-emerald-600/5 dark:bg-emerald-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-cyan-600/5 dark:bg-cyan-600/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          {appState === 'idle' && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="mb-6 p-4 rounded-full bg-emerald-100 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10">
                <FiCpu className="text-emerald-600 dark:text-emerald-500/50 text-6xl" />
              </div>
              <h2 className="text-3xl font-mono text-emerald-900 dark:text-emerald-50 mb-4 tracking-tight">
                AWAITING TARGET INPUT
              </h2>
              <p className="max-w-md text-emerald-700 dark:text-slate-500 font-mono text-sm leading-relaxed">
                Enter a financial ticker symbol above to initialize multi-agent risk assessment and compliance scanning protocol.
              </p>
            </div>
          )}

          {(appState === 'analyzing' || appState === 'error') && (
            <div className="mt-8 flex flex-col items-center">
              <TerminalLoading 
                onComplete={handleTerminalComplete} 
                apiDone={apiDone || appState === 'error'} 
                error={appState === 'error' ? errorMsg : null}
                symbol={symbolInput}
                companyName={TOP_50_COMPANIES.find(c => c.ticker === symbolInput.toUpperCase())?.name}
                sector={undefined} // Defaulting to "Corporate" in TerminalLoading
              />
              {appState === 'error' && (
                <button 
                  onClick={() => setAppState('idle')}
                  className="mt-6 px-4 py-2 border border-red-500/50 dark:border-red-500/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded font-mono text-sm transition-colors animate-fade-in"
                >
                  ACKNOWLEDGE & RESET
                </button>
              )}
            </div>
          )}

          {appState === 'results' && (data || errorMsg) && (
            <Dashboard data={data} error={errorMsg} ticker={analyzedTicker} onSimulationResult={(newData) => setData(newData)} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
