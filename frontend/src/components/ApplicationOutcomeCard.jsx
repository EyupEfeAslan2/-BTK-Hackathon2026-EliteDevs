import React from 'react';
import { FiCheckCircle, FiInfo, FiMessageCircle } from 'react-icons/fi';

export default function ApplicationOutcomeCard({ explanation, agentDeliberation, decision }) {
  if (!explanation && !(agentDeliberation && agentDeliberation.length)) return null;

  const decisionLabel =
    decision === 'APPROVE' ? 'Onay' : decision === 'DENY' ? 'Ret' : decision === 'REVIEW' ? 'İnceleme' : 'Sonuç';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/25 bg-gradient-to-br from-slate-900/90 via-blue-950/50 to-slate-950/90 p-6 shadow-xl backdrop-blur-xl md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,_rgba(59,130,246,0.22),_transparent_45%)]" />
      <div className="relative z-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/25 text-sky-200 ring-1 ring-blue-400/30">
              <FiMessageCircle size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-300/90">Başvuru cevabı</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Açıklama ve ajan özeti</h2>
              <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs font-semibold text-slate-200">
                <FiInfo className="text-sky-300" size={14} />
                Karar: <span className="text-white">{decisionLabel}</span>
              </p>
            </div>
          </div>
        </div>

        {explanation && (
          <p className="relative z-10 mt-6 text-base leading-relaxed text-slate-200 md:text-lg">{explanation}</p>
        )}

        {agentDeliberation && agentDeliberation.length > 0 && (
          <ul className="relative z-10 mt-6 space-y-3">
            {agentDeliberation.map((row, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-left text-sm text-slate-200"
              >
                <FiCheckCircle className="mt-0.5 flex-shrink-0 text-sky-400" size={18} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-200/80">{row.agent}</p>
                  <p className="mt-1 leading-relaxed">{row.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
