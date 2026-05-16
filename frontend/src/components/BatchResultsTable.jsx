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
  if (!Array.isArray(results) || results.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold font-mono text-slate-950 dark:text-slate-100 uppercase tracking-wide">
          Batch Analysis Results
        </h2>
        <p className="mt-1 text-sm font-mono text-slate-500 dark:text-slate-500">
          {results.length} credit memos evaluated
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
    </div>
  );
}
