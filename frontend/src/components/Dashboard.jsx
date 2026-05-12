import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { FiShield, FiAlertTriangle, FiTrendingUp, FiTrendingDown, FiActivity, FiBriefcase } from 'react-icons/fi';

const mockPriceData = [
  { name: 'Jan', price: 150, risk: 20 },
  { name: 'Feb', price: 160, risk: 25 },
  { name: 'Mar', price: 155, risk: 30 },
  { name: 'Apr', price: 170, risk: 22 },
  { name: 'May', price: 185, risk: 15 },
  { name: 'Jun', price: 180, risk: 18 },
  { name: 'Jul', price: 195, risk: 10 },
];

const mockRadarData = [
  { subject: 'Market Volatility', A: 80, fullMark: 100 },
  { subject: 'Credit Default', A: 40, fullMark: 100 },
  { subject: 'Regulatory', A: 30, fullMark: 100 },
  { subject: 'Liquidity', A: 60, fullMark: 100 },
  { subject: 'Operational', A: 50, fullMark: 100 },
  { subject: 'Geopolitical', A: 70, fullMark: 100 },
];

const Dashboard = ({ data }) => {
  // Extract or mock data based on API response
  // If data is just a generic response from the hackathon API, we will adapt it
  const symbol = data?.symbols?.[0] || 'AAPL';
  
  // Use data from backend if available, otherwise mock
  const aiSignal = data?.decision === 'APPROVED' ? 'BUY' : data?.decision === 'REJECTED' ? 'SELL' : 'BUY';
  const complianceStatus = data?.compliance_notes?.includes('Risk') ? 'VETO' : 'CLEAR';
  const confidence = data?.confidence_score || 94.5;
  
  const isVeto = complianceStatus === 'VETO';
  const isBuy = aiSignal === 'BUY';

  return (
    <div className="w-full max-w-7xl mx-auto font-sans animate-fade-in text-slate-200">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-mono tracking-wider">
              {symbol}
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

      {/* Top Neon Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Overall AI Signal */}
        <div className={`p-6 rounded-xl border backdrop-blur-sm relative overflow-hidden ${
          isBuy 
            ? 'border-emerald-500/40 bg-emerald-950/20 cyber-glow' 
            : 'border-red-500/40 bg-red-950/20 cyber-glow-red'
        }`}>
          <div className="absolute -right-6 -top-6 opacity-10">
            {isBuy ? <FiTrendingUp size={120} /> : <FiTrendingDown size={120} />}
          </div>
          <div className="text-sm text-slate-400 mb-2 font-mono uppercase tracking-widest">Overall AI Signal</div>
          <div className="flex items-end gap-4">
            <div className={`text-5xl font-bold ${isBuy ? 'text-emerald-400' : 'text-red-500'}`}>
              {aiSignal}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <FiActivity className={isBuy ? 'text-emerald-400' : 'text-red-500'} />
            <span>Confidence: {confidence}%</span>
          </div>
        </div>

        {/* Compliance Status */}
        <div className={`p-6 rounded-xl border backdrop-blur-sm relative overflow-hidden ${
          isVeto 
            ? 'border-red-500/40 bg-red-950/20 cyber-glow-red' 
            : 'border-cyan-500/40 bg-cyan-950/20 cyber-glow-blue'
        }`}>
          <div className="absolute -right-6 -top-6 opacity-10">
            {isVeto ? <FiAlertTriangle size={120} /> : <FiShield size={120} />}
          </div>
          <div className="text-sm text-slate-400 mb-2 font-mono uppercase tracking-widest">Compliance Status</div>
          <div className="flex items-end gap-4">
            <div className={`text-5xl font-bold ${isVeto ? 'text-red-500' : 'text-cyan-400'}`}>
              {complianceStatus}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            {isVeto ? <FiAlertTriangle className="text-red-500" /> : <FiShield className="text-cyan-400" />}
            <span>Legal review {isVeto ? 'flagged issues' : 'passed without issues'}</span>
          </div>
        </div>

        {/* VaR (Value at Risk) */}
        <div className="p-6 rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur-sm">
          <div className="text-sm text-slate-400 mb-2 font-mono uppercase tracking-widest">1-Day VaR (99%)</div>
          <div className="text-3xl font-bold text-slate-200">
            $2.4M
          </div>
          <div className="mt-4 text-xs text-amber-400 flex items-center gap-1">
            <FiAlertTriangle />
            <span>Elevated volatility detected</span>
          </div>
        </div>

        {/* ESG Score */}
        <div className="p-6 rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur-sm">
          <div className="text-sm text-slate-400 mb-2 font-mono uppercase tracking-widest">ESG Rating</div>
          <div className="text-3xl font-bold text-slate-200">
            AA<span className="text-lg text-emerald-400 ml-1">+</span>
          </div>
          <div className="mt-4 text-xs text-emerald-400 flex items-center gap-1">
            <FiTrendingUp />
            <span>Top 15% in sector</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price & Risk Chart */}
          <div className="p-6 rounded-xl border border-slate-800 bg-[#0b0f19] shadow-lg">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 font-mono border-b border-slate-800 pb-4">
              <FiActivity className="text-cyan-400" />
              Price & Risk Correlation
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockPriceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={{stroke: '#334155'}} />
                  <YAxis yAxisId="left" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={{stroke: '#334155'}} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={{stroke: '#334155'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={3} dot={{r: 4, fill: '#0f172a', stroke: '#38bdf8', strokeWidth: 2}} activeDot={{r: 6, fill: '#38bdf8'}} />
                  <Line yAxisId="right" type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Multi-Dimensional Risk Radar */}
          <div className="p-6 rounded-xl border border-slate-800 bg-[#0b0f19] shadow-lg flex flex-col items-center">
             <h3 className="text-lg font-semibold mb-2 w-full flex items-center gap-2 font-mono border-b border-slate-800 pb-4">
              <FiBriefcase className="text-purple-400" />
              Multi-Dimensional Risk Vector
            </h3>
            <div className="h-[300px] w-full max-w-md">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockRadarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 12}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fill: '#475569'}} />
                  <Radar name="Risk Exposure" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Legal & Compliance Panel */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-xl border border-slate-800 bg-[#0b0f19] shadow-lg h-full">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 font-mono border-b border-slate-800 pb-4">
              <FiShield className="text-amber-400" />
              Legal & Compliance Panel
            </h3>
            
            <div className="space-y-6">
              {/* Agent Output Box */}
              <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-lg"></div>
                <h4 className="text-sm font-mono text-amber-500 mb-2 uppercase">Agent Synopsis</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {data?.agent_deliberation || "Extensive cross-referencing of global sanction lists, pending litigations, and regulatory filings (10-K, 10-Q) completed. The entity's operational structure demonstrates high resilience to upcoming GDPR and KVKK legislative updates."}
                </p>
              </div>

              {/* Status Checks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700/50">
                  <span className="text-sm text-slate-300">Sanctions List Scan</span>
                  <span className="px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PASSED</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700/50">
                  <span className="text-sm text-slate-300">Pending Litigation</span>
                  <span className="px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">LOW RISK</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700/50">
                  <span className="text-sm text-slate-300">Data Privacy (GDPR)</span>
                  <span className="px-2 py-1 text-xs rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">MONITOR</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700/50">
                  <span className="text-sm text-slate-300">Antitrust Violations</span>
                  <span className="px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PASSED</span>
                </div>
              </div>

              {/* Key Notes */}
              <div className="mt-6">
                <h4 className="text-sm font-mono text-slate-400 mb-3 uppercase">Critical Findings</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">▹</span>
                    <span>No material impact from recent SEC regulatory shifts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">▹</span>
                    <span>Minor intellectual property dispute in EU jurisdiction; financial impact estimated &lt;0.05% of revenue.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">▹</span>
                    <span>Executive board compliance certification verified.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
