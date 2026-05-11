import React from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const DefaultRiskAssessment = ({ defaultProbability, riskFactors, creditScore, dtiRatio }) => {
  const getRiskColor = (probability) => {
    if (probability < 5) return 'banking-green';
    if (probability < 15) return 'banking-amber';
    return 'banking-red';
  };

  const getRiskLevel = (probability) => {
    if (probability < 5) return 'Çok Düşük';
    if (probability < 15) return 'Düşük';
    if (probability < 25) return 'Orta';
    return 'Yüksek';
  };

  const riskColor = getRiskColor(defaultProbability);
  const riskLevel = getRiskLevel(defaultProbability);

  const riskTextClass =
    riskColor === 'banking-green'
      ? 'text-banking-green'
      : riskColor === 'banking-amber'
        ? 'text-banking-amber'
        : 'text-banking-red';

  return (
    <div className="space-y-6">
      {/* Main Risk Gauge */}
      <div className="bg-white rounded-lg shadow-banking-md p-8">
        <h2 className="text-2xl font-bold text-banking-navy mb-8">Temerrüt Riski Analizi</h2>

        {/* Risk Gauge Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48">
            <svg className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="96" cy="96" r="88" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke={
                  riskColor === 'banking-green' ? '#10b981' : riskColor === 'banking-amber' ? '#f59e0b' : '#ef4444'
                }
                strokeWidth="8"
                strokeDasharray={`${(defaultProbability / 100) * 552} 552`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold ${riskTextClass}`}>{defaultProbability.toFixed(1)}%</span>
              <span className={`text-sm font-semibold ${riskTextClass} mt-2`}>{riskLevel} Risk</span>
            </div>
          </div>
        </div>

        {/* Risk Interpretation */}
        <div className="p-4 bg-banking-light rounded-lg border border-banking-border">
          <p className="text-sm text-banking-slate">
            {defaultProbability < 5
              ? '✓ Bu başvuru çok düşük temerrüt riski göstermektedir. Güçlü finansal profil.'
              : defaultProbability < 15
              ? '✓ Düşük temerrüt riski. İyi ödeme geçmişi ve borç yönetimi.'
              : defaultProbability < 25
              ? '⚠ Orta seviye risk. Bazı uyarı işaretleri mevcut olabilir.'
              : '⚠ Yüksek temerrüt riski. Detaylı inceleme önerilmektedir.'}
          </p>
        </div>
      </div>

      {/* Risk Factors Grid */}
      <div className="bg-white rounded-lg shadow-banking-md p-8">
        <h3 className="text-lg font-bold text-banking-navy mb-6">Risk Faktörleri</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Credit Score Risk */}
          <div className="p-4 border border-banking-border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              {creditScore >= 670 ? (
                <FiCheckCircle className="text-banking-green" size={24} />
              ) : (
                <FiAlertCircle className="text-banking-red" size={24} />
              )}
              <h4 className="font-semibold text-banking-navy">Kredi Notu</h4>
            </div>
            <p className="text-2xl font-bold text-banking-navy mb-2">{creditScore}</p>
            <p className="text-xs text-banking-slate">
              {creditScore >= 780
                ? 'Mükemmel - Düşük Risk'
                : creditScore >= 740
                ? 'Çok İyi - Düşük Risk'
                : creditScore >= 670
                ? 'İyi - Orta Risk'
                : 'Zayıf - Yüksek Risk'}
            </p>
          </div>

          {/* DTI Ratio Risk */}
          <div className="p-4 border border-banking-border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              {dtiRatio < 36 ? (
                <FiCheckCircle className="text-banking-green" size={24} />
              ) : (
                <FiAlertCircle className="text-banking-red" size={24} />
              )}
              <h4 className="font-semibold text-banking-navy">DTI Oranı</h4>
            </div>
            <p className="text-2xl font-bold text-banking-navy mb-2">{dtiRatio.toFixed(1)}%</p>
            <p className="text-xs text-banking-slate">
              {dtiRatio < 36
                ? 'Sağlıklı - Düşük Risk'
                : dtiRatio < 50
                ? 'Dikkat - Orta Risk'
                : 'Yüksek - Yüksek Risk'}
            </p>
          </div>
        </div>

        {/* Additional Risk Factors */}
        {riskFactors && riskFactors.length > 0 && (
          <div className="mt-6 pt-6 border-t border-banking-border">
            <h4 className="font-semibold text-banking-navy mb-4">Belirtilen Risk Faktörleri:</h4>
            <div className="space-y-2">
              {riskFactors.map((factor, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-banking-red/5 rounded-lg border border-banking-red/20"
                >
                  <FiAlertCircle className="text-banking-red flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-banking-navy">{factor.name}</p>
                    <p className="text-xs text-banking-slate">{factor.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Risk Distribution Comparison */}
      <div className="bg-white rounded-lg shadow-banking-md p-8">
        <h3 className="text-lg font-bold text-banking-navy mb-6">Benzer Başvurular ile Karşılaştırma</h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-banking-navy">Bu Başvuru</p>
              <p className="text-sm font-bold text-banking-navy">{defaultProbability.toFixed(1)}%</p>
            </div>
            <div className="w-full bg-banking-border rounded-full h-3">
              <div
                className="bg-banking-amber h-3 rounded-full"
                style={{ width: `${defaultProbability}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-banking-slate">Benzer Profil Ortalaması</p>
              <p className="text-sm font-bold text-banking-slate">12%</p>
            </div>
            <div className="w-full bg-banking-border rounded-full h-3">
              <div className="bg-banking-teal h-3 rounded-full" style={{ width: '12%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-banking-slate">Tüm Başvuruların Ortalaması</p>
              <p className="text-sm font-bold text-banking-slate">18%</p>
            </div>
            <div className="w-full bg-banking-border rounded-full h-3">
              <div className="bg-banking-slate h-3 rounded-full" style={{ width: '18%' }}></div>
            </div>
          </div>
        </div>

        <p className="text-xs text-banking-slate mt-6 p-4 bg-banking-light rounded-lg">
          💡 <strong>Açıklama:</strong> Bu karşılaştırma, benzer demografik ve finansal profillere sahip başvuruları
          temel alarak oluşturulmuştur.
        </p>
      </div>

      {/* LGD & EAD Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-banking-md p-6">
          <h4 className="text-sm font-semibold text-banking-slate uppercase mb-4">Temerrüt Durumunda Zarar (LGD)</h4>
          <p className="text-4xl font-bold text-banking-navy mb-2">32%</p>
          <div className="w-full bg-banking-border rounded-full h-2">
            <div className="bg-banking-red h-2 rounded-full" style={{ width: '32%' }}></div>
          </div>
          <p className="text-xs text-banking-slate mt-3">
            Temerrüt durumunda beklenen kayıp oranı (tasarruflar ve teminatlar hariç)
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-banking-md p-6">
          <h4 className="text-sm font-semibold text-banking-slate uppercase mb-4">Maruz Kalınan Risk (EAD)</h4>
          <p className="text-4xl font-bold text-banking-navy mb-2">₺50,000</p>
          <p className="text-sm text-banking-slate mt-4">Kredi tutarı kadar maruz kalınan risk</p>
          <p className="text-xs text-banking-slate mt-2">
            Temerrüt durumunda banka tarafından maruz kalınacak toplam tutar
          </p>
        </div>
      </div>
    </div>
  );
};

export default DefaultRiskAssessment;
