import React, { useState } from 'react';
import BorrowerApplicationForm from './components/BorrowerApplicationForm';
import CreditScorecard from './components/CreditScorecard';
import FinancialMetrics from './components/FinancialMetrics';
import DefaultRiskAssessment from './components/DefaultRiskAssessment';
import ApprovalRecommendation from './components/ApprovalRecommendation';
import DocumentChecklist from './components/DocumentChecklist';
import AgentReviewBoard from './components/AgentReviewBoard';
import ApplicationOutcomeCard from './components/ApplicationOutcomeCard';
import ErrorMessage from './components/ErrorMessage';
import { assessCredit } from './api/client';

import './App.css';

const MIN_AGENT_REVIEW_MS = 6400;

function formatErrorDetail(err) {
  const d = err.response?.data?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) {
    return d
      .map((item) => (typeof item === 'string' ? item : item?.msg || JSON.stringify(item)))
      .filter(Boolean)
      .join(' · ');
  }
  if (d && typeof d === 'object') {
    try {
      return JSON.stringify(d);
    } catch {
      return err.message;
    }
  }
  return err.message;
}

function App() {
  const [stage, setStage] = useState('form'); // 'form' or 'results'
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviewContext, setReviewContext] = useState(null);

  const handleApplicationSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setReviewContext({
      firstName: formData.firstName,
      lastName: formData.lastName,
      loanAmount: formData.loanAmount,
    });

    const started = Date.now();
    try {
      const response = await assessCredit(formData);
      const elapsed = Date.now() - started;
      const pad = Math.max(0, MIN_AGENT_REVIEW_MS - elapsed);
      if (pad > 0) {
        await new Promise((resolve) => setTimeout(resolve, pad));
      }
      setResults(response);
      setStage('results');
    } catch (err) {
      setError(
        formatErrorDetail(err) ||
          "Kredi değerlendirmesi sırasında bir hata oluştu. Lütfen backend'in çalıştığından emin olun."
      );
    } finally {
      setLoading(false);
      setReviewContext(null);
    }
  };

  const handleReset = () => {
    setStage('form');
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-banking-ink via-slate-950 to-blue-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 h-[28rem] w-[28rem] rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[26rem] w-[26rem] rounded-full bg-indigo-700/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-blue-500/20 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 py-10 text-white shadow-2xl shadow-blue-950/30 md:py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl shadow-lg shadow-blue-900/40">
                
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/90">kredi değerlendirme</p>
                <h1 className="mt-1 bg-gradient-to-r from-sky-200 via-white to-blue-200 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                  EliteDevs
                </h1>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-300 backdrop-blur-md">
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-6 animate-fade-in">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* Ajan inceleme panosu (statik spinner yerine) */}
        {loading && (
          <div className="mb-10 animate-fade-in">
            <AgentReviewBoard active={loading} context={reviewContext} />
          </div>
        )}

        {/* Form Stage */}
        {stage === 'form' && !loading && (
          <div className="space-y-8 animate-fade-in">
            {/* Intro Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-slate-900/45 p-8 shadow-2xl shadow-blue-950/20 backdrop-blur-xl transition-all duration-300 hover:border-sky-400/35">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-indigo-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <h2 className="mb-3 bg-gradient-to-r from-sky-200 to-white bg-clip-text text-3xl font-bold text-transparent">
                  Kredi Başvurunuz
                </h2>
                <p className="text-lg leading-relaxed text-slate-200">
                  Adımları tamamladığınızda başvuru sunucuya gider; ekranda veri, risk ve skor ajanlarının sıralı çıktıları
                  gösterilir. En sonda karar ve gerekçeler listelenir.
                </p>
              </div>
            </div>

            {/* Form */}
            <BorrowerApplicationForm onSubmit={handleApplicationSubmit} isLoading={loading} />

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-sky-400/30 hover:bg-slate-900/60">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-3 text-3xl transition-transform duration-300 group-hover:scale-110">⚡</div>
                  <h3 className="mb-2 text-lg font-bold text-white">Hızlı</h3>
                  <p className="text-sm text-slate-300">
                    Değerlendirme uçtan uca otomatik; ajan panosu süreci görünür kılar.
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-sky-400/30 hover:bg-slate-900/60">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-3 text-3xl transition-transform duration-300 group-hover:scale-110">🔒</div>
                  <h3 className="mb-2 text-lg font-bold text-white">Güvenli</h3>
                  <p className="text-sm text-slate-300">
                    .
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-sky-400/30 hover:bg-slate-900/60">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-3 text-3xl transition-transform duration-300 group-hover:scale-110">🤖</div>
                  <h3 className="mb-2 text-lg font-bold text-white">Akıllı</h3>
                  <p className="text-sm text-slate-300">
                    Skor, DTI ve likidite sinyalleri birlikte değerlendirilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Stage */}
        {stage === 'results' && results && !loading && (
          <div className="space-y-8 animate-fade-in">
            {/* Results Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="mb-2 bg-gradient-to-r from-sky-200 via-white to-blue-200 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                  Değerlendirme Sonuçları
                </h2>
                <p className="text-slate-300">
                  {results.applicant_name} adına yapılan detaylı analiz
                </p>
              </div>
              <button
                onClick={handleReset}
                className="rounded-xl border border-white/15 bg-slate-900/50 px-8 py-3 font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:border-sky-400/40 hover:bg-slate-900/80"
              >
                ← Yeni Başvuru
              </button>
            </div>

            <ApplicationOutcomeCard
              explanation={results.explanation}
              agentDeliberation={results.agent_deliberation}
              decision={results.decision}
            />

            {/* Main Decision */}
            {results.decision && (
              <ApprovalRecommendation
                decision={results.decision}
                confidenceScore={results.confidence_score || 85}
                reasons={results.decision_reasons}
                suggestedTerms={results.suggested_terms}
                complianceNotes={results.compliance_notes}
              />
            )}

            {/* Credit Scorecard */}
            {results.credit_score !== undefined && (
              <CreditScorecard
                creditScore={results.credit_score}
                factors={results.credit_factors}
                creditHistory={results.credit_history}
                numAccounts={results.num_credit_accounts}
              />
            )}

            {/* Financial Metrics */}
            {results.monthly_income !== undefined && (
              <FinancialMetrics
                monthlyIncome={results.monthly_income}
                totalDebts={results.total_existing_debts}
                loanAmount={results.requested_loan_amount}
                savingsAmount={results.savings_amount}
              />
            )}

            {/* Risk Assessment */}
            {results.default_probability !== undefined && (
              <DefaultRiskAssessment
                defaultProbability={results.default_probability}
                riskFactors={results.risk_factors}
                creditScore={results.credit_score}
                dtiRatio={
                  results.monthly_income > 0
                    ? ((results.total_existing_debts + results.monthly_loan_payment) / results.monthly_income) * 100
                    : 0
                }
              />
            )}

            {/* Document Checklist */}
            <DocumentChecklist requiredDocuments={results.required_documents} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative mt-20 border-t border-blue-500/15 bg-gradient-to-t from-slate-950/80 to-transparent py-8 text-center text-slate-500 backdrop-blur-sm">
        <p className="font-medium text-slate-400">© 2026 EliteDevs — BTK Hackathon 2026</p>
        <p className="mt-1 text-xs text-slate-500">Demo değerlendirme: gerçek hukuki / kredi taahhüdü oluşturmaz.</p>
      </footer>
    </div>
  );
}

export default App;