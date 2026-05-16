import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import {
  exportBatchAnalysisPdf,
  exportBatchAnalysisExcel,
} from '../utils/creditMemoExport';

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

export default function BatchResultsTable({ results }) {
  const [pdfExporting, setPdfExporting] = useState(false);
  const [excelExporting, setExcelExporting] = useState(false);

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
                  <tr key={item.ticker} className="hover:bg-slate-50 dark:hover:bg-slate-900/70 transition-colors">
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
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 p-4"
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
                {item?.data?.justification_summary || 'No justification summary available.'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-3 border-t border-emerald-200 dark:border-emerald-500/20 pt-8 mt-8">
        <p className="text-center text-sm md:text-base text-emerald-700 dark:text-slate-500 font-mono">
          Download this batch analysis as PDF or Excel.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => void exportPDF()}
            disabled={pdfExporting}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-mono text-base md:text-lg font-semibold border transition-colors duration-200 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-white dark:text-emerald-200 border-emerald-600 dark:border-emerald-500/40 disabled:opacity-50 disabled:pointer-events-none cyber-glow"
          >
            <FiDownload className="text-lg shrink-0" />
            {pdfExporting ? 'Preparing PDF…' : 'Download as PDF'}
          </button>
          <button
            type="button"
            onClick={() => void exportExcel()}
            disabled={excelExporting}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-mono text-base md:text-lg font-semibold border transition-colors duration-200 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500/20 dark:hover:bg-cyan-500/30 text-white dark:text-cyan-200 border-cyan-600 dark:border-cyan-500/40 disabled:opacity-50 disabled:pointer-events-none cyber-glow"
          >
            <FiDownload className="text-lg shrink-0" />
            {excelExporting ? 'Preparing Excel…' : 'Download as Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}
