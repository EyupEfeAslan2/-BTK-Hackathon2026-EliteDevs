import React from 'react';
import { FiDollarSign, FiPercent, FiPieChart } from 'react-icons/fi';

const FinancialMetrics = ({ monthlyIncome, totalDebts, loanAmount, savingsAmount }) => {
  // Calculate DTI (Debt-to-Income) Ratio
  const dti = monthlyIncome > 0 ? (totalDebts / monthlyIncome) * 100 : 0;
  const projectedDTI = monthlyIncome > 0 ? ((totalDebts + loanAmount) / monthlyIncome) * 100 : 0;

  // Calculate debt-to-savings ratio
  const debtToSavings = savingsAmount > 0 ? (totalDebts / savingsAmount) * 100 : 0;

  // Monthly obligations estimate (new loan monthly payment)
  // Assuming average interest rate of 12% annually
  const loanMonthlyPayment = loanAmount > 0 ? (loanAmount / 36) + (loanAmount * 0.12) / 12 : 0;
  const totalMonthlyObligations = totalDebts + loanMonthlyPayment;

  const getDTIStatus = (dti) => {
    if (dti < 20) return { status: 'Çok İyi', color: 'banking-green' };
    if (dti < 36) return { status: 'İyi', color: 'banking-green' };
    if (dti < 50) return { status: 'Orta', color: 'banking-amber' };
    return { status: 'Yüksek', color: 'banking-red' };
  };

  const dtiStatus = getDTIStatus(projectedDTI);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Monthly Income Card */}
      <div className="bg-white rounded-lg shadow-banking-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-banking-slate uppercase">Aylık Gelir</h3>
          <FiDollarSign className="text-banking-teal" size={24} />
        </div>
        <p className="text-3xl font-bold text-banking-navy">
          ₺{monthlyIncome ? monthlyIncome.toLocaleString('tr-TR') : '0'}
        </p>
        <p className="text-xs text-banking-slate mt-2">Doğrulanmış aylık gelir</p>
      </div>

      {/* Total Existing Debts Card */}
      <div className="bg-white rounded-lg shadow-banking-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-banking-slate uppercase">Mevcut Borçlar</h3>
          <FiDollarSign className="text-banking-red" size={24} />
        </div>
        <p className="text-3xl font-bold text-banking-navy">
          ₺{totalDebts ? totalDebts.toLocaleString('tr-TR') : '0'}
        </p>
        <p className="text-xs text-banking-slate mt-2">Toplam aktif borçlar</p>
      </div>

      {/* Current DTI Ratio */}
      <div className="bg-white rounded-lg shadow-banking-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-banking-slate uppercase">Cari Borç/Gelir Oranı</h3>
          <FiPercent className="text-banking-amber" size={24} />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-banking-navy">{dti.toFixed(1)}%</p>
          <span className="text-xs text-banking-slate">(Hedef: &lt;36%)</span>
        </div>
        <div className="mt-4 w-full bg-banking-border rounded-full h-2">
          <div
            className={`h-2 rounded-full ${dti > 50 ? 'bg-banking-red' : dti > 36 ? 'bg-banking-amber' : 'bg-banking-green'}`}
            style={{ width: `${Math.min((dti / 100) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-banking-slate mt-2">
          {dti < 36 ? '✓ Sağlıklı DTI oranı' : '⚠ DTI oranı yüksek'}
        </p>
      </div>

      {/* Projected DTI with New Loan */}
      <div className="bg-white rounded-lg shadow-banking-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-banking-slate uppercase">Tahmin Edilen DTI (Kredi Sonrası)</h3>
          <FiPercent className={`text-${dtiStatus.color}`} size={24} />
        </div>
        <div className="flex items-baseline gap-2">
          <p className={`text-3xl font-bold text-${dtiStatus.color}`}>{projectedDTI.toFixed(1)}%</p>
          <span className={`text-xs text-${dtiStatus.color}`}>({dtiStatus.status})</span>
        </div>
        <div className="mt-4 w-full bg-banking-border rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              projectedDTI > 50
                ? 'bg-banking-red'
                : projectedDTI > 36
                ? 'bg-banking-amber'
                : 'bg-banking-green'
            }`}
            style={{ width: `${Math.min((projectedDTI / 100) * 100, 100)}%` }}
          ></div>
        </div>
        <p className={`text-xs text-${dtiStatus.color} mt-2`}>
          {projectedDTI < 36 ? '✓ Kabul edilebilir' : '⚠ Risk altında'}
        </p>
      </div>

      {/* Monthly Obligations */}
      <div className="bg-white rounded-lg shadow-banking-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-banking-slate uppercase">Aylık Yükümlülükler</h3>
          <FiPieChart className="text-banking-slate" size={24} />
        </div>
        <p className="text-3xl font-bold text-banking-navy">
          ₺{Math.round(totalMonthlyObligations).toLocaleString('tr-TR')}
        </p>
        <div className="mt-3 space-y-2 text-xs text-banking-slate">
          <p>Mevcut borçlar: ₺{Math.round(totalDebts).toLocaleString('tr-TR')}</p>
          <p>Yeni kredi tahmini: ₺{Math.round(loanMonthlyPayment).toLocaleString('tr-TR')}</p>
        </div>
      </div>

      {/* Available Savings */}
      <div className="bg-white rounded-lg shadow-banking-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-banking-slate uppercase">Tasarruf & Rezervler</h3>
          <FiDollarSign className="text-banking-green" size={24} />
        </div>
        <p className="text-3xl font-bold text-banking-navy">
          ₺{savingsAmount ? savingsAmount.toLocaleString('tr-TR') : '0'}
        </p>
        <p className="text-xs text-banking-slate mt-2">
          {savingsAmount > 0
            ? `${(savingsAmount / monthlyIncome).toFixed(1)} aylık gelir kadar`
            : 'Tasarruf verisi yok'}
        </p>
      </div>

      {/* Debt-to-Savings Ratio */}
      <div className="bg-white rounded-lg shadow-banking-md p-6 md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-banking-slate uppercase">Borç/Tasarruf Oranı</h3>
          <FiPercent className={`text-${debtToSavings > 100 ? 'banking-red' : debtToSavings > 50 ? 'banking-amber' : 'banking-green'}`} size={24} />
        </div>
        <div className="flex items-baseline gap-2">
          <p className={`text-3xl font-bold text-${debtToSavings > 100 ? 'banking-red' : debtToSavings > 50 ? 'banking-amber' : 'banking-green'}`}>
            {debtToSavings.toFixed(1)}%
          </p>
          <span className="text-xs text-banking-slate">
            {debtToSavings > 100
              ? '(Borçlar tasarruflardan fazla)'
              : debtToSavings > 50
              ? '(Dikkat - yüksek borç)'
              : '(Sağlıklı seviye)'}
          </span>
        </div>
        <div className="mt-4 w-full bg-banking-border rounded-full h-2">
          <div
            className={`h-2 rounded-full ${debtToSavings > 100 ? 'bg-banking-red' : debtToSavings > 50 ? 'bg-banking-amber' : 'bg-banking-green'}`}
            style={{ width: `${Math.min((debtToSavings / 200) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default FinancialMetrics;
