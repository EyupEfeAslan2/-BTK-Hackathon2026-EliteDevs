import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const CreditScorecard = ({ creditScore, factors, creditHistory, numAccounts }) => {
  // Determine color based on credit score
  const getScoreColor = (score) => {
    if (score >= 780) return 'banking-green';
    if (score >= 740) return 'banking-amber';
    if (score >= 580) return 'banking-amber';
    return 'banking-red';
  };

  const getScoreCategory = (score) => {
    if (score >= 780) return 'Mükemmel';
    if (score >= 740) return 'Çok İyi';
    if (score >= 670) return 'İyi';
    if (score >= 580) return 'Orta';
    return 'Zayıf';
  };

  const scoreColor = getScoreColor(creditScore);
  const scoreCategory = getScoreCategory(creditScore);

  const scoreTextClass =
    scoreColor === 'banking-green'
      ? 'text-banking-green'
      : scoreColor === 'banking-amber'
        ? 'text-banking-amber'
        : 'text-banking-red';

  return (
    <div className="bg-white rounded-lg shadow-banking-md p-8">
      <h2 className="text-2xl font-bold text-banking-navy mb-8">Kredi Skorunuz</h2>

      {/* Score Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative w-48 h-48">
          <svg className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke={
                scoreColor === 'banking-green'
                  ? '#10b981'
                  : scoreColor === 'banking-amber'
                  ? '#f59e0b'
                  : '#ef4444'
              }
              strokeWidth="8"
              strokeDasharray={`${(creditScore / 850) * 552} 552`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${scoreTextClass}`}>
              {creditScore}
            </span>
            <span className="text-sm text-banking-slate mt-1">/850</span>
            <span className={`text-sm font-semibold ${scoreTextClass} mt-2`}>
              {scoreCategory}
            </span>
          </div>
        </div>
      </div>

      {/* Score Ranges Reference */}
      <div className="grid grid-cols-5 gap-2 mb-8 text-center text-xs">
        <div className="p-2 bg-banking-red/10 rounded">
          <p className="font-semibold text-banking-red">Zayıf</p>
          <p className="text-banking-slate">300-579</p>
        </div>
        <div className="p-2 bg-banking-amber/10 rounded">
          <p className="font-semibold text-banking-amber">Orta</p>
          <p className="text-banking-slate">580-669</p>
        </div>
        <div className="p-2 bg-banking-amber/10 rounded">
          <p className="font-semibold text-banking-amber">İyi</p>
          <p className="text-banking-slate">670-739</p>
        </div>
        <div className="p-2 bg-banking-green/10 rounded">
          <p className="font-semibold text-banking-green">Çok İyi</p>
          <p className="text-banking-slate">740-779</p>
        </div>
        <div className="p-2 bg-banking-green/10 rounded">
          <p className="font-semibold text-banking-green">Mükemmel</p>
          <p className="text-banking-slate">780-850</p>
        </div>
      </div>

      {/* Key Factors */}
      <div className="border-t border-banking-border pt-8">
        <h3 className="text-lg font-semibold text-banking-navy mb-4">Skorunuzu Etkileyen Faktörler</h3>

        {factors && factors.length > 0 ? (
          <div className="space-y-3">
            {factors.map((factor, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  factor.impact > 0 ? 'bg-banking-green/10' : 'bg-banking-red/10'
                }`}
              >
                <div className="flex-shrink-0">
                  {factor.impact > 0 ? (
                    <FiTrendingUp className="text-banking-green" size={20} />
                  ) : (
                    <FiTrendingDown className="text-banking-red" size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-banking-navy">{factor.name}</p>
                  <p className="text-xs text-banking-slate">{factor.description}</p>
                </div>
                <div className={`text-sm font-bold ${factor.impact > 0 ? 'text-banking-green' : 'text-banking-red'}`}>
                  {factor.impact > 0 ? '+' : ''}{factor.impact}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-banking-light border border-banking-border rounded-lg">
            <p className="text-banking-slate text-sm">Faktör verisi henüz mevcut değil</p>
          </div>
        )}
      </div>

      {/* Credit Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-banking-border">
        <div className="p-4 bg-banking-light rounded-lg">
          <p className="text-xs text-banking-slate uppercase font-semibold mb-1">Kredi Geçmişi</p>
          <p className="text-lg font-bold text-banking-navy">{creditHistory || 'Verisi yok'}</p>
        </div>
        <div className="p-4 bg-banking-light rounded-lg">
          <p className="text-xs text-banking-slate uppercase font-semibold mb-1">Aktif Hesap Sayısı</p>
          <p className="text-lg font-bold text-banking-navy">{numAccounts || 0} Hesap</p>
        </div>
      </div>
    </div>
  );
};

export default CreditScorecard;
