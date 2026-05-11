import React from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

const ApprovalRecommendation = ({ decision, confidenceScore, reasons, suggestedTerms, complianceNotes }) => {
  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'APPROVE':
        return { bg: 'bg-banking-green', text: 'text-banking-green', icon: FiCheckCircle };
      case 'DENY':
        return { bg: 'bg-banking-red', text: 'text-banking-red', icon: FiXCircle };
      case 'REVIEW':
        return { bg: 'bg-banking-amber', text: 'text-banking-amber', icon: FiAlertCircle };
      default:
        return { bg: 'bg-banking-slate', text: 'text-banking-slate', icon: FiAlertCircle };
    }
  };

  const getDecisionLabel = (decision) => {
    switch (decision) {
      case 'APPROVE':
        return 'ONAYLANDI ✓';
      case 'DENY':
        return 'REDDEDİLDİ ✗';
      case 'REVIEW':
        return 'İNCELEME GEREKLİ ⚠';
      default:
        return 'BEKLEMEYE ALINDI';
    }
  };

  const decisionStyle = getDecisionColor(decision);
  const DecisionIcon = decisionStyle.icon;

  return (
    <div className="space-y-6">
      {/* Main Decision Banner */}
      <div className={`${decisionStyle.bg} rounded-lg shadow-banking-md p-8 text-white`}>
        <div className="flex items-start gap-4">
          <DecisionIcon size={48} className="flex-shrink-0" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{getDecisionLabel(decision)}</h1>
            <p className="text-lg opacity-90">
              {decision === 'APPROVE'
                ? 'Kredi başvurunuz onaylanmıştır. Tebrikler!'
                : decision === 'DENY'
                ? 'Maalesef kredi başvurunuz reddedilmiştir.'
                : 'Kredi başvurunuz detaylı incelemeye alınmıştır.'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Güven Skoru</p>
            <p className="text-3xl font-bold">{confidenceScore}%</p>
          </div>
        </div>
      </div>

      {/* Decision Reasons */}
      <div className="bg-white rounded-lg shadow-banking-md p-8">
        <h2 className="text-2xl font-bold text-banking-navy mb-6">Karar Gerekçeleri</h2>

        {reasons && reasons.length > 0 ? (
          <div className="space-y-3">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  reason.type === 'positive'
                    ? 'bg-banking-green/5 border-banking-green/20'
                    : reason.type === 'negative'
                    ? 'bg-banking-red/5 border-banking-red/20'
                    : 'bg-banking-amber/5 border-banking-amber/20'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    reason.type === 'positive'
                      ? 'bg-banking-green'
                      : reason.type === 'negative'
                      ? 'bg-banking-red'
                      : 'bg-banking-amber'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-banking-navy">{reason.title}</p>
                  <p className="text-sm text-banking-slate mt-1">{reason.description}</p>
                  {reason.impact && (
                    <p
                      className={`text-xs font-bold mt-2 ${
                        reason.type === 'positive'
                          ? 'text-banking-green'
                          : reason.type === 'negative'
                          ? 'text-banking-red'
                          : 'text-banking-amber'
                      }`}
                    >
                      Etki: {reason.impact}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-banking-light border border-banking-border rounded-lg">
            <p className="text-banking-slate text-sm">Karar gerekçeleri henüz mevcut değil</p>
          </div>
        )}
      </div>

      {/* Suggested Terms (if approved) */}
      {decision === 'APPROVE' && suggestedTerms && (
        <div className="bg-white rounded-lg shadow-banking-md p-8">
          <h2 className="text-2xl font-bold text-banking-navy mb-6">Önerilen Kredi Şartları</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-banking-teal rounded-lg">
              <p className="text-sm font-semibold text-banking-slate uppercase mb-2">Kredi Tutarı</p>
              <p className="text-3xl font-bold text-banking-navy">
                ₺{suggestedTerms.loanAmount?.toLocaleString('tr-TR')}
              </p>
            </div>

            <div className="p-6 border border-banking-teal rounded-lg">
              <p className="text-sm font-semibold text-banking-slate uppercase mb-2">Faiz Oranı</p>
              <p className="text-3xl font-bold text-banking-navy">{suggestedTerms.interestRate}%</p>
              <p className="text-xs text-banking-slate mt-1">Yıllık</p>
            </div>

            <div className="p-6 border border-banking-teal rounded-lg">
              <p className="text-sm font-semibold text-banking-slate uppercase mb-2">Vade</p>
              <p className="text-3xl font-bold text-banking-navy">{suggestedTerms.term}</p>
              <p className="text-xs text-banking-slate mt-1">Ay</p>
            </div>

            <div className="p-6 border border-banking-teal rounded-lg">
              <p className="text-sm font-semibold text-banking-slate uppercase mb-2">Aylık Ödeme</p>
              <p className="text-3xl font-bold text-banking-navy">
                ₺{suggestedTerms.monthlyPayment?.toLocaleString('tr-TR')}
              </p>
              <p className="text-xs text-banking-slate mt-1">Tahmini</p>
            </div>
          </div>

          {(() => {
            const mp = Number(suggestedTerms.monthlyPayment);
            const term = Number(suggestedTerms.term);
            const principal = Number(suggestedTerms.loanAmount);
            const total = mp * term - principal;
            if (!Number.isFinite(total)) return null;
            return (
              <div className="mt-6 rounded-lg border border-banking-green/20 bg-banking-green/5 p-4">
                <p className="text-sm text-banking-slate">
                  💡 <strong>Toplam Faiz Tutarı (tahmini):</strong> ₺{Math.round(total).toLocaleString('tr-TR')}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Compliance Notes */}
      {complianceNotes && complianceNotes.length > 0 && (
        <div className="bg-white rounded-lg shadow-banking-md p-8">
          <h2 className="text-2xl font-bold text-banking-navy mb-6">Uyum & Yasal Notlar</h2>

          <div className="space-y-3">
            {complianceNotes.map((note, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  note.status === 'passed'
                    ? 'bg-banking-green/5 border-banking-green/20'
                    : 'bg-banking-amber/5 border-banking-amber/20'
                }`}
              >
                <div className={note.status === 'passed' ? 'text-banking-green' : 'text-banking-amber'}>
                  {note.status === 'passed' ? <FiCheckCircle size={24} /> : <FiAlertCircle size={24} />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-banking-navy">{note.title}</p>
                  <p className="text-sm text-banking-slate mt-1">{note.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-banking-md p-8">
        <h2 className="text-lg font-bold text-banking-navy mb-6">Sonraki Adımlar</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {decision === 'APPROVE' && (
            <>
              <button className="px-6 py-3 bg-banking-green text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                ✓ Teklifi Kabul Et
              </button>
              <button className="px-6 py-3 bg-banking-slate text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors">
                📄 Başvuru Formunu İndir
              </button>
              <button className="px-6 py-3 bg-banking-light text-banking-navy rounded-lg font-semibold border border-banking-border hover:bg-banking-border transition-colors">
                ❓ Soru Sor
              </button>
            </>
          )}

          {decision === 'REVIEW' && (
            <>
              <button className="px-6 py-3 bg-banking-amber text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors">
                📞 İletişime Geç
              </button>
              <button className="px-6 py-3 bg-banking-light text-banking-navy rounded-lg font-semibold border border-banking-border hover:bg-banking-border transition-colors">
                📋 Eksik Belgeleri Gönder
              </button>
              <button className="px-6 py-3 bg-banking-light text-banking-navy rounded-lg font-semibold border border-banking-border hover:bg-banking-border transition-colors">
                🔄 Başvuruyu Yenile
              </button>
            </>
          )}

          {decision === 'DENY' && (
            <>
              <button className="px-6 py-3 bg-banking-slate text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors">
                ❓ İtiraz Et
              </button>
              <button className="px-6 py-3 bg-banking-light text-banking-navy rounded-lg font-semibold border border-banking-border hover:bg-banking-border transition-colors">
                📞 Danışman ile Konuş
              </button>
              <button className="px-6 py-3 bg-banking-light text-banking-navy rounded-lg font-semibold border border-banking-border hover:bg-banking-border transition-colors">
                🔄 Tekrar Başvur
              </button>
            </>
          )}
        </div>

        <p className="text-xs text-banking-slate mt-6 p-4 bg-banking-light rounded-lg">
          💡 <strong>Not:</strong> Tüm başvuruların sonuclandırılmasına kadar prosedürler değiştirilebilir.
        </p>
      </div>
    </div>
  );
};

export default ApprovalRecommendation;
