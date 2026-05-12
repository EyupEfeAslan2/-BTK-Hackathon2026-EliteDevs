import React, { useState, useEffect } from 'react';

const LOG_SEQUENCE = [
  { time: 0.0, text: "Booting EliteDevs AI Gateway...", type: "system" },
  { time: 0.8, text: "Establishing secure connection to Data Nodes...", type: "info" },
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
];

const TerminalLoading = ({ onComplete }) => {
  const [logs, setLogs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= LOG_SEQUENCE.length) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }

    const currentLog = LOG_SEQUENCE[currentIndex];
    
    // Calculate delay based on the time difference from the previous log
    const prevTime = currentIndex === 0 ? 0 : LOG_SEQUENCE[currentIndex - 1].time;
    const delay = (currentLog.time - prevTime) * 1000;

    const timer = setTimeout(() => {
      setLogs((prev) => [...prev, currentLog]);
      setCurrentIndex((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, onComplete]);

  // Auto-scroll terminal
  useEffect(() => {
    const terminalBody = document.getElementById('terminal-body');
    if (terminalBody) {
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  }, [logs]);

  const getColorClass = (type) => {
    switch (type) {
      case 'system': return 'text-slate-400';
      case 'info': return 'text-sky-400';
      case 'success': return 'text-emerald-400';
      case 'agent': return 'text-amber-400 font-semibold';
      case 'error': return 'text-red-500';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg overflow-hidden border border-emerald-500/30 bg-[#0a0a0f] cyber-glow font-mono shadow-2xl relative">
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none scanline opacity-20 z-10"></div>
      
      {/* Terminal Header */}
      <div className="bg-[#111118] border-b border-emerald-500/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 cyber-glow"></div>
        </div>
        <div className="text-emerald-500/60 text-xs tracking-widest font-bold">SOC_TERM // SECURE_UPLINK</div>
        <div className="text-xs text-slate-500">{new Date().toISOString().split('T')[1].substring(0, 8)} UTC</div>
      </div>

      {/* Terminal Body */}
      <div 
        id="terminal-body"
        className="p-6 h-[400px] overflow-y-auto font-mono text-sm sm:text-base leading-relaxed relative z-20"
      >
        <div className="mb-6 text-emerald-500/80">
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
              <span className="text-slate-600 mr-4 w-[60px] flex-shrink-0">
                [{log.time.toFixed(1)}s]
              </span>
              <span className={getColorClass(log.type)}>
                {log.text}
              </span>
            </div>
          ))}
          {currentIndex < LOG_SEQUENCE.length && (
            <div className="flex">
              <span className="text-slate-600 mr-4 w-[60px] flex-shrink-0">
                [...s]
              </span>
              <span className="text-emerald-500 animate-pulse">
                █
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalLoading;
