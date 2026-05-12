import { FiAlertTriangle, FiBriefcase, FiCpu, FiFileText, FiShield } from 'react-icons/fi';

const Dashboard = ({ data, error }) => {
  if (!data) {
    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <FiAlertTriangle className="text-red-500 text-6xl mb-6 animate-pulse" />
        <h2 className="text-4xl font-mono font-bold text-red-500 mb-4 tracking-widest cyber-glow-red">
          NO DATA RECEIVED
        </h2>
        <p className="text-slate-400 font-mono max-w-lg mb-8">
          The dashboard did not receive any data from the server.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <FiAlertTriangle className="text-red-500 text-6xl mb-6 animate-pulse" />
        <h2 className="text-4xl font-mono font-bold text-red-500 mb-4 tracking-widest cyber-glow-red">
          404_ERROR: ENTITY NOT FOUND OR INSUFFICIENT DATA
        </h2>
        <p className="text-slate-400 font-mono max-w-lg mb-8">
          The AI committee could not retrieve verifiable public records for this corporate ID.
        </p>
        <div className="p-4 border border-red-500/30 bg-red-950/20 rounded-md font-mono text-red-400 text-sm mb-8 break-all max-w-2xl">
          ERROR_DETAILS: {error || 'Insufficient data returned from analysis.'}
        </div>
      </div>
    );
  }

  const committeeDecision = data?.committee_decision || 'N/A';
  const defaultRiskLevel = data?.default_risk_level || 'N/A';
  const recommendedTerms = data?.recommended_loan_terms || {};
  const covenants = data?.recommended_loan_terms?.covenants || [];
  const justificationSummary = data?.justification_summary || 'N/A';

  const isApproved = committeeDecision === 'APPROVED';
  const isRejected = committeeDecision === 'REJECTED';
  const signalClass = isApproved
    ? 'border-emerald-500/40 bg-emerald-950/20 cyber-glow text-emerald-400'
    : isRejected
      ? 'border-red-500/40 bg-red-950/20 cyber-glow-red text-red-500'
      : 'border-amber-500/40 bg-amber-950/20 text-amber-400';

  return (
    <div className="w-full max-w-7xl mx-auto font-sans animate-fade-in text-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-mono tracking-wider">
              Corporate Credit Memo
            </span>
            <span className="text-slate-400 text-xl font-normal">| Institutional Risk Profile</span>
          </h2>
          <p className="text-slate-500 mt-1 font-mono text-sm">
            Last Updated: {new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC
          </p>
        </div>
        <div className="px-4 py-2 border border-emerald-500/30 bg-emerald-500/10 rounded-md font-mono text-emerald-400 text-sm cyber-glow">
          SYSTEM_ONLINE // AI_CONSENSUS_REACHED
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className={`p-6 rounded-xl border backdrop-blur-sm relative overflow-hidden ${signalClass}`}>
          <div className="absolute -right-6 -top-6 opacity-10">
            <FiShield size={120} />
          </div>
          <div className="text-sm text-slate-400 mb-2 font-mono uppercase tracking-widest">Overall AI Signal</div>
          <div className="flex items-end gap-4">
            <div className="text-5xl font-bold">
              {data?.committee_decision || 'N/A'}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-cyan-500/40 bg-cyan-950/20 cyber-glow-blue backdrop-blur-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 opacity-10">
            <FiAlertTriangle size={120} />
          </div>
          <div className="text-sm text-slate-400 mb-2 font-mono uppercase tracking-widest">Credit Default Risk</div>
          <div className="flex items-end gap-4">
            <div className="text-5xl font-bold text-cyan-400">
              {defaultRiskLevel || 'N/A'}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur-sm">
          <div className="text-sm text-slate-400 mb-2 font-mono uppercase tracking-widest">Memo Status</div>
          <div className="text-3xl font-bold text-slate-200">
            {committeeDecision || 'N/A'}
          </div>
          <div className="mt-4 text-xs text-emerald-400 flex items-center gap-1">
            <FiFileText />
            <span>Structured credit committee output</span>
          </div>
        </div>
      </div>

      <div className="mb-8 p-6 rounded-xl border border-emerald-500/30 bg-[#0b0f19] shadow-lg relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${isRejected ? 'from-red-500 to-orange-500' : 'from-emerald-400 to-cyan-500'}`}></div>
        <h3 className="text-sm font-mono text-emerald-400 mb-2 uppercase tracking-widest flex items-center gap-2">
          <FiCpu /> AI CONSENSUS JUSTIFICATION
        </h3>
        <p className="text-slate-300 font-mono text-sm leading-relaxed pl-2">
          {data?.justification_summary || 'N/A'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="p-6 rounded-xl border border-slate-800 bg-[#0b0f19] shadow-lg h-full">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 font-mono border-b border-slate-800 pb-4">
              <FiBriefcase className="text-cyan-400" />
              RECOMMENDED LOAN TERMS
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700">
                <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2">Max Amount</div>
                <div className="text-3xl font-bold text-slate-100">{recommendedTerms?.max_amount || 'N/A'}</div>
              </div>
              <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700">
                <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2">Tenor</div>
                <div className="text-3xl font-bold text-slate-100">{recommendedTerms?.tenor || 'N/A'}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-mono text-slate-400 mb-3 uppercase">Covenants</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {(covenants || []).length > 0 ? (
                  (covenants || []).map((covenant, idx) => (
                    <li key={idx} className="flex items-start gap-2 rounded bg-slate-800/50 border border-slate-700/50 p-3">
                      <span className="text-cyan-400 mt-1">▹</span>
                      <span>{covenant || 'N/A'}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2 rounded bg-slate-800/20 border border-slate-700/20 p-3 text-slate-500">
                    <span>N/A</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="p-6 rounded-xl border border-slate-800 bg-[#0b0f19] shadow-lg h-full">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 font-mono border-b border-slate-800 pb-4">
              <FiShield className="text-amber-400" />
              Committee Snapshot
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700/50">
                <span className="text-sm text-slate-300">Decision</span>
                <span className="px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  {data?.committee_decision || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700/50">
                <span className="text-sm text-slate-300">Default Risk</span>
                <span className="px-2 py-1 text-xs rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase">
                  {data?.default_risk_level || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700/50">
                <span className="text-sm text-slate-300">Max Amount</span>
                <span className="px-2 py-1 text-xs rounded bg-slate-700/60 text-slate-200 border border-slate-600 uppercase">
                  {data?.recommended_loan_terms?.max_amount || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700/50">
                <span className="text-sm text-slate-300">Tenor</span>
                <span className="px-2 py-1 text-xs rounded bg-slate-700/60 text-slate-200 border border-slate-600 uppercase">
                  {data?.recommended_loan_terms?.tenor || 'N/A'}
                </span>
              </div>
            </div>

            <div className="mt-6 bg-slate-900/80 rounded-lg p-4 border border-slate-700 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-lg"></div>
              <h4 className="text-sm font-mono text-amber-500 mb-2 uppercase">Summary</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {justificationSummary || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
