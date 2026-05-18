import { useState } from 'react';
import { createPortal } from 'react-dom'; // ← EKLEDİK: Modalı dışarı fırlatmak için
import { FiDownload, FiChevronLeft, FiDatabase, FiX } from 'react-icons/fi';
import {
  exportBatchAnalysisPdf,
  exportBatchAnalysisExcel,
  sanitizeReportCopy,
  formatTelemetryLabel,
  formatTelemetryValue,
} from '../utils/creditMemoExport';
import React from 'react';

const getDecisionBadgeClass = (decision) => {
  const normalized = String(decision || '').toUpperCase();
  if (normalized === 'APPROVED' || normalized === 'APPROVE') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
  }
  if (normalized === 'REJECTED' || normalized === 'REJECT') {
    return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30';
  }
  return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-500/15 dark:text-yellow-200 dark:border-yellow-500/30';
};

const getRiskBadgeClass = (risk) => {
  const normalized = String(risk || '').toUpperCase();
  if (normalized.includes('LOW')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
  }
  if (normalized.includes('HIGH')) {
    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30';
  }
  return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30';
};

export default function BatchResultsTable({ results, onSelectResult, onBackToTable, selectedItem }) {
  const [pdfExporting, setPdfExporting] = useState(false);
  const [excelExporting, setExcelExporting] = useState(false);
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [telemetryData, setTelemetryData] = useState(null);

  // Eğer bir item seçildiyse, o item'ın detaylı view'ını göster
  if (selectedItem && selectedItem?.data) {
    const rawTelemetry = selectedItem?.data?.raw_telemetry || {};
    const hasRawTelemetry = Object.keys(rawTelemetry).length > 0;

    const handleOpenTelemetry = () => {
      setTelemetryData(rawTelemetry);
      setTelemetryOpen(true);
    };

    return (
      <div className="w-full max-w-7xl mx-auto font-sans animate-fade-in text-slate-900 dark:text-slate-200 text-base md:text-lg transition-colors duration-300">
        {/* Geri Dönüş Button'ı */}
        <button
          onClick={onBackToTable}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm font-semibold border transition-colors duration-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
        >
          <FiChevronLeft className="text-lg" />
          Back to Results Table
        </button>

        {/* Seçili Item'ın Detaylı Gösterimi */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-6 space-y-6 shadow-xl">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-3xl md:text-4xl font-bold font-mono text-slate-950 dark:text-slate-100 uppercase tracking-wide">
                {selectedItem.ticker}
              </h2>
              <span className={`inline-flex rounded-md border px-3 py-1 text-xs font-mono font-bold uppercase tracking-wide ${getDecisionBadgeClass(selectedItem?.data?.committee_decision)}`}>
                {selectedItem?.data?.committee_decision || 'UNKNOWN'}
              </span>
              <span className={`inline-flex rounded-md border px-3 py-1 text-xs font-mono font-bold uppercase tracking-wide ${getRiskBadgeClass(selectedItem?.data?.default_risk_level)}`}>
                {selectedItem?.data?.default_risk_level || 'UNKNOWN'}
              </span>
            </div>
            <p className="text-sm font-mono text-slate-500 dark:text-slate-400">
              Detailed credit committee analysis // yfinance provenance layer
            </p>
          </div>

          {/* Justification Summary (Örnek şablonunla birebir eşitlendi) */}
          <div className="rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-[#0b0f19] p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-cyan-500"></div>
            <h3 className="text-sm md:text-base font-mono text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-widest flex items-center gap-2">
              AI CONSENSUS JUSTIFICATION
            </h3>
            <p className="text-emerald-900 dark:text-slate-300 font-mono text-sm md:text-base leading-relaxed pl-2">
              {sanitizeReportCopy(selectedItem?.data?.justification_summary) || 'No justification available.'}
            </p>
          </div>

          {/* Recommended Loan Terms (Örnek şablon başlık ve grid yapısıyla eşitlendi) */}
          {selectedItem?.data?.recommended_loan_terms && (
            <div className="p-6 rounded-xl border border-emerald-200 dark:border-slate-800 bg-emerald-50 dark:bg-[#0b0f19] shadow-lg">
              <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2 font-mono border-b border-emerald-200 dark:border-slate-800 pb-4 text-slate-900 dark:text-slate-200">
                RECOMMENDED LOAN TERMS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedItem.data.recommended_loan_terms.max_amount && (
                  <div className="bg-white dark:bg-slate-900/80 rounded-lg p-4 border border-emerald-200 dark:border-slate-700">
                    <p className="text-xs text-emerald-700 dark:text-slate-500 font-mono uppercase tracking-widest mb-2">Max Amount</p>
                    <p className="text-3xl font-bold text-emerald-900 dark:text-slate-100 font-mono">
                      {selectedItem.data.recommended_loan_terms.max_amount}
                    </p>
                  </div>
                )}
                {selectedItem.data.recommended_loan_terms.tenor && (
                  <div className="bg-white dark:bg-slate-900/80 rounded-lg p-4 border border-emerald-200 dark:border-slate-700">
                    <p className="text-xs text-emerald-700 dark:text-slate-500 font-mono uppercase tracking-widest mb-2">Tenor</p>
                    <p className="text-3xl font-bold text-emerald-900 dark:text-slate-100 font-mono">
                      {selectedItem.data.recommended_loan_terms.tenor}
                    </p>
                  </div>
                )}
                {selectedItem.data.recommended_loan_terms.interest_rate && (
                  <div className="bg-white dark:bg-slate-900/80 rounded-lg p-4 border border-emerald-200 dark:border-slate-700">
                    <p className="text-xs text-emerald-700 dark:text-slate-500 font-mono uppercase tracking-widest mb-2">Interest Rate</p>
                    <p className="text-3xl font-bold text-emerald-900 dark:text-slate-100 font-mono">
                      {selectedItem.data.recommended_loan_terms.interest_rate}
                    </p>
                  </div>
                )}
                {selectedItem.data.recommended_loan_terms.required_covenants && (
                  <div className="bg-white dark:bg-slate-900/80 rounded-lg p-4 border border-emerald-200 dark:border-slate-700">
                    <p className="text-xs text-emerald-700 dark:text-slate-500 font-mono uppercase tracking-widest mb-2">Covenants</p>
                    <p className="text-base font-bold text-emerald-900 dark:text-slate-100 font-mono truncate">
                      {selectedItem.data.recommended_loan_terms.required_covenants}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Agent Votes -> AGENT AUDIT LOG (Log kartları font-sans akıcılığına kavuştu) */}
          {selectedItem?.data?.agent_votes && Array.isArray(selectedItem.data.agent_votes) && (
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] shadow-lg w-full">
              <h3 className="text-lg md:text-xl font-semibold mb-5 flex items-center gap-2 font-mono border-b border-slate-200 dark:border-slate-800 pb-4 text-slate-900 dark:text-slate-200">
                AGENT AUDIT LOG
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedItem.data.agent_votes.map((vote, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/70 p-4 flex flex-col justify-between">
                    <div className="mb-2">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-200 break-words">
                          {vote.agent_name}
                        </span>
                        <span className={`w-fit px-2.5 py-1 rounded-md border text-[11px] font-mono font-bold uppercase tracking-wide ${getDecisionBadgeClass(vote.vote)}`}>
                          {vote.vote}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed break-words mt-1">
                        {vote.brief_reason || 'Automated agent vote recorded.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Metrics */}
          {selectedItem?.data?.risk_metrics && (
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] shadow-lg">
              <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2 font-mono border-b border-slate-200 dark:border-slate-800 pb-4 text-slate-900 dark:text-slate-200">
                RISK METRICS
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(selectedItem.data.risk_metrics || {}).map(([key, value]) => (
                  <div key={key} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] p-3">
                    <div className="text-[11px] font-mono uppercase tracking-wide text-slate-500 dark:text-slate-500 mb-1">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm md:text-base font-mono font-semibold text-slate-950 dark:text-slate-100 break-words">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Raw Telemetry Button */}
          {hasRawTelemetry ? (
            <button
              type="button"
              onClick={handleOpenTelemetry}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-cyan-200 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-200 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors font-mono text-sm font-semibold uppercase tracking-wide shadow-sm"
            >
              <FiDatabase className="shrink-0" />
              View Raw Telemetry
            </button>
          ) : null}
        </div>

        {/* Raw Telemetry Portal */}
        {telemetryOpen && hasRawTelemetry ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] shadow-2xl">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300">
                    <FiDatabase />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-mono text-base md:text-lg font-bold uppercase tracking-wide text-slate-950 dark:text-slate-100 truncate">
                      Raw Telemetry — {selectedItem.ticker}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-500 truncate">yfinance provenance layer</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTelemetryOpen(false)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FiX />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-5 space-y-5">
                {Object.entries(telemetryData || {}).map(([entity, telemetry]) => (
                  <div key={entity} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-4">
                    <h4 className="mb-4 font-mono text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
                      {entity}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(telemetry || {}).map(([key, value]) => (
                        <div key={`${entity}-${key}`} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] p-3">
                          <div className="text-[11px] font-mono uppercase tracking-wide text-slate-500 dark:text-slate-500">
                            {formatTelemetryLabel(key)}
                          </div>
                          <div className="mt-1 text-sm md:text-base font-semibold text-slate-950 dark:text-slate-100 break-words">
                            {formatTelemetryValue(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        ) : null}
      </div>
    );
  };

  // Table view (default)
  if (!Array.isArray(results) || results.length === 0) return null;

  const tickers = results.map((item) => item?.ticker).filter(Boolean);

  const exportPDF = async () => {
    setPdfExporting(true);
    try {
      await exportBatchAnalysisPdf(tickers);
    } catch (err) {
      console.error('Error exporting batch PDF:', err);
    } finally {
      setPdfExporting(false);
    }
  };

  const exportExcel = () => {
    try {
      setExcelExporting(true);
      exportBatchAnalysisExcel(results);
    } catch (err) {
      console.error('Error exporting batch Excel:', err);
    } finally {
      setExcelExporting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">

      <div id="batch-results-content" className="w-full">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold font-mono text-slate-950 dark:text-slate-100 uppercase tracking-wide">
            Batch Analysis Results
          </h2>
          <p className="mt-1 text-sm font-mono text-slate-500 dark:text-slate-500">
            {results.length} credit memos evaluated
          </p>
          <p className="mt-1 text-xs font-mono text-slate-400 dark:text-slate-600">
            Generated: {new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC
          </p>
        </div>

        {/* Excel, PDF */}
        <div className="w-full max-w-7xl mx-auto pdf-exclude mb-8 md:mb-6">
          <div className="w-full p-5 md:p-6 rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5 shadow-lg relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <FiDownload className="text-emerald-600 dark:text-emerald-400 text-lg" />
                <h4 className="text-sm md:text-base font-mono text-emerald-700 dark:text-emerald-300 uppercase tracking-wide font-semibold">
                  Export Analysis
                </h4>
              </div>
              <span className="w-fit rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
                Download Options
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-start">
              <button
                type="button"
                onClick={() => void exportPDF()}
                disabled={pdfExporting}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-mono text-sm md:text-base font-semibold border transition-colors duration-200 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-white dark:text-emerald-200 border-emerald-600 dark:border-emerald-500/40 disabled:opacity-50 disabled:pointer-events-none cyber-glow"
              >
                <FiDownload className="text-lg shrink-0" />
                {pdfExporting ? 'Preparing PDF…' : 'PDF'}
              </button>
              <button
                type="button"
                onClick={() => void exportExcel()}
                disabled={excelExporting}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-mono text-sm md:text-base font-semibold border transition-colors duration-200 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500/20 dark:hover:bg-cyan-500/30 text-white dark:text-cyan-200 border-cyan-600 dark:border-cyan-500/40 disabled:opacity-50 disabled:pointer-events-none cyber-glow"
              >
                <FiDownload className="text-lg shrink-0" />
                {excelExporting ? 'Preparing Excel…' : 'Excel'}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                  <th className="px-5 py-4 text-left text-xs font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Ticker</th>
                  <th className="px-5 py-4 text-left text-xs font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Committee Decision</th>
                  <th className="px-5 py-4 text-left text-xs font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Default Risk</th>
                  <th className="px-5 py-4 text-left text-xs font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Max Amount</th>
                  <th className="px-5 py-4 text-left text-xs font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Tenor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {results.map((item) => (
                  <tr
                    key={item.ticker}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/70 transition-colors cursor-pointer"
                    onClick={() => onSelectResult?.(item)}
                  >
                    <td className="px-5 py-4 font-mono text-sm md:text-base font-bold text-slate-950 dark:text-slate-100">
                      {item.ticker}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wide ${getDecisionBadgeClass(item?.data?.committee_decision)}`}>
                        {item?.data?.committee_decision || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wide ${getRiskBadgeClass(item?.data?.default_risk_level)}`}>
                        {item?.data?.default_risk_level || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-slate-800 dark:text-slate-200">
                      {item?.data?.recommended_loan_terms?.max_amount || 'N/A'}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-slate-800 dark:text-slate-200">
                      {item?.data?.recommended_loan_terms?.tenor || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] p-5 space-y-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-slate-900 dark:text-emerald-400">
            Analysis Summaries
          </h3>
          {results.map((item) => (
            <div
              key={`${item.ticker}-summary`}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              onClick={() => onSelectResult?.(item)}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-sm font-bold text-slate-950 dark:text-slate-100">{item.ticker}</span>
                <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${getDecisionBadgeClass(item?.data?.committee_decision)}`}>
                  {item?.data?.committee_decision || 'UNKNOWN'}
                </span>
                <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${getRiskBadgeClass(item?.data?.default_risk_level)}`}>
                  {item?.data?.default_risk_level || 'UNKNOWN'}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed">
                {sanitizeReportCopy(item?.data?.justification_summary) || 'No justification summary available.'}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}