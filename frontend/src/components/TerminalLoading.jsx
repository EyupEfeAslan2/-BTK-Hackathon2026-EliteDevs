import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';



const TerminalLoading = ({ onComplete, apiDone, error, symbol, companyName, sector }) => {
  const { isDark } = useThemeStore();
  const [logs, setLogs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasHalted, setHasHalted] = useState(false);

  const finalSector = sector || 'Corporate';
  const displaySymbol = companyName || symbol || "UNKNOWN";

  const LOG_SEQUENCE = React.useMemo(() => [
    { time: 0.0, text: "Booting EliteDevs AI Gateway...", type: "system" },
    { time: 0.8, text: `Scanning external databases for ${displaySymbol} in the ${finalSector} sector...`, type: "info" },
    { time: 1.5, text: "Connection Established. IPv6: 2001:db8:85a3::8a2e:370:7334", type: "success" },
    { time: 2.1, text: "DataAgent: Fetching historical metrics...", type: "agent" },
    { time: 3.2, text: "DataAgent: Aggregating 10 years of financial statements...", type: "info" },
    { time: 4.5, text: "DataAgent: Metrics extracted successfully.", type: "success" },
    { time: 5.4, text: "RiskAgent: Calculating Sharpe & VaR...", type: "agent" },
    { time: 6.7, text: "RiskAgent: Simulating Monte Carlo scenarios (n=10,000)...", type: "info" },
    { time: 7.9, text: "RiskAgent: Volatility profile stabilized.", type: "success" },
    { time: 8.8, text: "ComplianceAgent: Scanning GDPR/KVKK databases for pending lawsuits...", type: "agent" },
    { time: 9.6, text: "ComplianceAgent: Cross-referencing SEC filings & global sanctions lists...", type: "info" },
    { time: 10.5, text: "ComplianceAgent: Legal scan complete. No critical violations found.", type: "success" },
    { time: 11.2, text: "Synthesizing intelligence...", type: "system" },
    { time: 12.0, text: "Consensus Reached.", type: "success" }
  ], [displaySymbol, finalSector]);

  // Auto-scroll terminal
  useEffect(() => {
    const terminalBody = document.getElementById('terminal-body');
    if (terminalBody) {
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (hasHalted) return;

    if (error) {
      setLogs((prev) => [...prev, { time: prev.length ? (prev[prev.length - 1].time + 0.1) : 0, text: `CRITICAL ERROR: ${error}`, type: "error" }]);
      setHasHalted(true);
      return;
    }

    if (currentIndex >= LOG_SEQUENCE.length) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }

    // PAUSE LOGIC: wait for API to resolve before showing the final "Consensus Reached" message
    if (currentIndex === LOG_SEQUENCE.length - 1 && !apiDone) {
      return; 
    }

    const currentLog = LOG_SEQUENCE[currentIndex];
    
    // Calculate delay based on the time difference from the previous log
    const prevTime = currentIndex === 0 ? 0 : LOG_SEQUENCE[currentIndex - 1].time;
    let delay = (currentLog.time - prevTime) * 1000;

    // If we were paused and apiDone just became true, show the final log quickly
    if (currentIndex === LOG_SEQUENCE.length - 1 && apiDone) {
      delay = Math.min(delay, 200);
    }

    const timer = setTimeout(() => {
      setLogs((prev) => [...prev, currentLog]);
      setCurrentIndex((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, onComplete, apiDone, error, hasHalted, LOG_SEQUENCE]);

  const getColorClass = (type) => {
    switch (type) {
      case 'system': return 'text-emerald-700 dark:text-slate-400';
      case 'info': return 'text-cyan-600 dark:text-sky-400';
      case 'success': return 'text-emerald-600 dark:text-emerald-400';
      case 'agent': return 'text-amber-600 dark:text-amber-400 font-semibold';
      case 'error': return 'text-red-600 dark:text-red-500 font-bold';
      default: return 'text-slate-900 dark:text-slate-300';
    }
  };



  return (
    <div className={`w-full max-w-6xl mx-auto rounded-lg overflow-hidden border ${error ? 'border-red-500/50 cyber-glow-red' : 'border-emerald-500/30 cyber-glow'} bg-white dark:bg-[#0a0a0f] font-mono shadow-2xl relative grid grid-cols-1 md:grid-cols-3 transition-colors duration-300`}>
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none scanline opacity-20 z-10"></div>
      
      {/* Left Panel: Company Dossier */}
      <div className={`col-span-1 border-b md:border-b-0 md:border-r ${error ? 'border-red-500/20 bg-red-50 dark:bg-red-950/10' : 'border-emerald-500/20 bg-emerald-50 dark:bg-[#0e1118]'} p-6 relative z-20 transition-colors duration-300`}>
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500 animate-pulse' : 'bg-cyan-500 animate-pulse'}`}></div>
          <div className={`text-xs tracking-widest font-bold ${error ? 'text-red-600 dark:text-red-400' : 'text-cyan-600 dark:text-cyan-500/80'}`}>DOSSIER_BUILD</div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="border-b border-emerald-200 dark:border-slate-800 pb-2">
            <span className="text-emerald-700 dark:text-slate-500 block text-xs uppercase tracking-wider">Target Entity</span>
            <span className={`font-bold ${error ? 'text-red-600 dark:text-red-400' : 'text-emerald-900 dark:text-slate-200'} tracking-wider text-lg transition-colors duration-300`}>{displaySymbol}</span>
          </div>
          <div className="border-b border-emerald-200 dark:border-slate-800 pb-2">
            <span className="text-emerald-700 dark:text-slate-500 block text-xs uppercase tracking-wider">Sector</span>
            <span className="text-emerald-900 dark:text-slate-300">{finalSector}</span>
          </div>
          <div className="border-b border-emerald-200 dark:border-slate-800 pb-2">
            <span className="text-emerald-700 dark:text-slate-500 block text-xs uppercase tracking-wider">Status</span>
            <span className={error ? 'text-red-600 dark:text-red-400 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>{error ? 'ERROR' : 'Active'}</span>
          </div>
          <div className="border-b border-emerald-200 dark:border-slate-800 pb-2">
            <span className="text-emerald-700 dark:text-slate-500 block text-xs uppercase tracking-wider">Audit</span>
            <span className={error ? 'text-red-600 dark:text-red-500 animate-pulse' : 'text-amber-600 dark:text-amber-400 animate-pulse'}>{error ? 'FAILED' : 'Pending...'}</span>
          </div>
        </div>

        {/* Spinning Radar Animation */}
        <div className="mt-8 flex justify-center items-center h-48 relative">
          <div className={`absolute w-32 h-32 rounded-full border ${error ? 'border-red-500/30' : 'border-emerald-500/30'}`}></div>
          <div className={`absolute w-24 h-24 rounded-full border ${error ? 'border-red-500/20' : 'border-emerald-500/20'}`}></div>
          <div className={`absolute w-16 h-16 rounded-full border ${error ? 'border-red-500/10' : 'border-emerald-500/10'}`}></div>
          <div className={`absolute w-32 h-32 rounded-full border-t border-r ${error ? 'border-red-400' : 'border-cyan-400'} animate-spin`} style={{ animationDuration: '3s' }}></div>
          <div className={`absolute w-24 h-24 rounded-full border-b border-l ${error ? 'border-red-500' : 'border-emerald-400'} animate-spin`} style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
          {/* Biometric / Center dot */}
          <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : 'bg-cyan-400'} shadow-[0_0_10px_currentColor] animate-pulse`}></div>
        </div>
      </div>

      {/* Right Panel: The Matrix */}
      <div className="col-span-1 md:col-span-2 flex flex-col h-full z-20">
        {/* Terminal Header */}
        <div className={`bg-emerald-100 dark:bg-[#111118] border-b ${error ? 'border-red-500/20 dark:border-red-500/20' : 'border-emerald-200 dark:border-emerald-500/20'} px-4 py-3 flex items-center justify-between transition-colors duration-300`}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500/80 cyber-glow-red' : 'bg-emerald-500/80 cyber-glow'}`}></div>
          </div>
          <div className={`${error ? 'text-red-600 dark:text-red-500/60' : 'text-emerald-700 dark:text-emerald-500/60'} text-xs tracking-widest font-bold transition-colors duration-300`}>SOC_TERM // SECURE_UPLINK</div>
          <div className="text-xs text-emerald-700 dark:text-slate-500">{new Date().toISOString().split('T')[1].substring(0, 8)} UTC</div>
        </div>

        {/* Terminal Body */}
        <div 
          id="terminal-body"
          className="p-6 h-[400px] overflow-y-auto font-mono text-sm sm:text-base leading-relaxed bg-white dark:bg-[#050508] text-emerald-900 dark:text-slate-200 transition-colors duration-300"
        >
          <div className={`mb-6 ${error ? 'text-red-500/80 dark:text-red-500/80' : 'text-emerald-500/80 dark:text-emerald-500/80'}`}>
            <pre className="text-[10px] sm:text-xs font-bold whitespace-pre-wrap leading-tight">
{`███████╗██╗     ██╗████████╗███████╗    ██████╗ ███████╗██╗   ██╗███████╗
██╔════╝██║     ██║╚══██╔══╝██╔════╝    ██╔══██╗██╔════╝██║   ██║██╔════╝
█████╗  ██║     ██║   ██║   █████╗      ██║  ██║█████╗  ██║   ██║███████╗
██╔══╝  ██║     ██║   ██║   ██╔══╝      ██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║
███████╗███████╗██║   ██║   ███████╗    ██████╔╝███████╗ ╚████╔╝ ███████║
╚══════╝╚══════╝╚═╝   ╚═╝   ╚══════╝    ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝`}
            </pre>
          </div>

          <div className="space-y-2">
            {logs.map((log, idx) => (
              <div key={idx} className="flex animate-fade-in opacity-0" style={{ animationFillMode: 'forwards' }}>
                <span className={`mr-4 w-[60px] flex-shrink-0 ${error && log.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-slate-600'} transition-colors duration-300`}>
                  [{log.time.toFixed(1)}s]
                </span>
                <span className={getColorClass(log.type)}>
                  {log.text}
                </span>
              </div>
            ))}
            {!hasHalted && currentIndex < LOG_SEQUENCE.length && (
              <div className="flex">
                <span className="text-emerald-600 dark:text-slate-600 mr-4 w-[60px] flex-shrink-0 transition-colors duration-300">
                  {currentIndex === LOG_SEQUENCE.length - 1 && !apiDone ? "[WAIT]" : "[...s]"}
                </span>
                <span className="text-emerald-500 dark:text-emerald-500 animate-pulse">
                  {currentIndex === LOG_SEQUENCE.length - 1 && !apiDone ? "Awaiting final consensus... █" : "█"}
                </span>
              </div>
            )}
            {hasHalted && (
              <div className="flex mt-4">
                <span className="text-red-600 dark:text-red-500 animate-pulse">
                  SYSTEM HALTED █
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalLoading;

