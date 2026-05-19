import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiActivity, FiCpu, FiShield, FiTrendingUp, FiUsers } from 'react-icons/fi';

const AGENTS = [
  { id: 'orchestrator', name: 'Orkestratör', role: 'Koordinasyon', icon: FiUsers },
  { id: 'data', name: 'Veri Ajanı', role: 'Profil doğrulama', icon: FiCpu },
  { id: 'risk', name: 'Risk Ajanı', role: 'Borç & ödeme gücü', icon: FiShield },
  { id: 'score', name: 'Skor Ajanı', role: 'Skor & senaryo', icon: FiTrendingUp },
];

const ACTIVE_AGENT_PANEL_BY_ID = {
  orchestrator: 'border-sky-400/50 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30',
  data: 'border-sky-400/50 bg-gradient-to-br from-sky-500 to-blue-800 text-white shadow-lg shadow-blue-900/30',
  risk: 'border-sky-400/50 bg-gradient-to-br from-blue-500 to-slate-800 text-white shadow-lg shadow-blue-900/30',
  score: 'border-sky-400/50 bg-gradient-to-br from-indigo-500 to-blue-950 text-white shadow-lg shadow-blue-900/30',
};

const AVATAR_GRADIENT_BY_ID = {
  orchestrator: 'from-blue-600 to-indigo-600',
  data: 'from-sky-500 to-blue-800',
  risk: 'from-blue-500 to-slate-800',
  score: 'from-indigo-500 to-blue-950',
};

function formatMoney(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  // This board is for Turkish loan applications, so format amounts with TRY locale rules.
  return `₺${Math.round(v).toLocaleString('tr-TR')}`;
}

export default function AgentReviewBoard({ active, context }) {
  const [lines, setLines] = useState([]);
  const [activeAgent, setActiveAgent] = useState('orchestrator');
  const timers = useRef([]);

  const label = useMemo(() => {
    if (!context) return 'Başvuru';
    const n = `${context.firstName || ''} ${context.lastName || ''}`.trim();
    return n || 'Başvuru sahibi';
  }, [context]);

  useEffect(() => {
    // Restart the scripted agent timeline every time a new review becomes active.
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!active) {
      setLines([]);
      setActiveAgent('orchestrator');
      return;
    }

    const loan = context?.loanAmount;
    const schedule = (delayMs, fn) => {
      const id = setTimeout(fn, delayMs);
      timers.current.push(id);
    };

    const pushMsg = (agentId, text, delayMs) => {
      schedule(delayMs, () => {
        // Store timeline rows instead of replacing them so the user can audit the sequence.
        setActiveAgent(agentId);
        setLines((prev) => [...prev, { kind: 'msg', agentId, text, t: Date.now() }]);
      });
    };

    const pushSummary = (title, text, delayMs) => {
      schedule(delayMs, () => {
        setLines((prev) => [...prev, { kind: 'summary', title, text, t: Date.now() }]);
      });
    };

    let acc = 350;
    // Staggered delays make the frontend animation line up with real backend waiting time.
    pushMsg(
      'orchestrator',
      `${label} için çok-ajan değerlendirmesi başlatıldı. Görevler sırayla yürütülüyor.`,
      acc
    );
    acc += 1150;
    pushMsg('data', 'Başvuru formu alanları birleştiriliyor; gelir ve istihdam tutarlılığı kontrol ediliyor…', acc);
    acc += 950;
    pushSummary(
      'Ara özet · Veri',
      'Kimlik ve iletişim alanları tamam; istihdam bilgisi ile gelir kalemi ön kontrolden geçti.',
      acc
    );
    acc += 1150;
    pushMsg('risk', `Mevcut borçlar ve talep edilen tutar (${formatMoney(loan)}) için ödeme gücü senaryoları üretiliyor…`, acc);
    acc += 950;
    pushSummary(
      'Ara özet · Risk',
      'Borç/gelir baskısı ve likidite tamponu (tasarruf) birlikte değerlendiriliyor; uç senaryolar taranıyor.',
      acc
    );
    acc += 1150;
    pushMsg('score', 'Kredi notu bandı, geçmiş etiketi ve temerrüt olasılığı için skor kartı çıktıları harmanlanıyor…', acc);
    acc += 950;
    pushSummary(
      'Ara özet · Skor',
      'Skor ajanı, politika eşikleriyle uyumlu tek bir risk görünümü oluşturdu; orkestratöre aktarıldı.',
      acc
    );
    acc += 1150;
    pushMsg(
      'orchestrator',
      'Ajan çıktıları birleştiriliyor. Birkaç saniye içinde resmi karar ve gerekçeler ekranda olacak.',
      acc
    );

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [active, context, label]);

  if (!active) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-950 via-blue-950/80 to-slate-950 shadow-2xl shadow-blue-950/40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.18),_transparent_55%)]" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative z-10 border-b border-white/10 px-6 py-5 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-300/90">Canlı · çok-ajan inceleme</p>
            <h2 className="mt-1 text-2xl font-bold text-white md:text-3xl">Ajanlar çalışıyor</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Statik “değerlendiriliyor” yerine; veri, risk ve skor ajanlarının sıralı çıktıları ve ara özetleri gösterilir.
              Sunucu yanıtı geldiğinde süre tamamlanınca karar ekranına geçilir.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-blue-400/25 bg-blue-950/40 px-4 py-3 text-blue-100 backdrop-blur-md">
            <FiActivity className="animate-pulse text-sky-300" size={22} />
            <div>
              <p className="text-xs text-blue-200/80">Durum</p>
              <p className="text-sm font-semibold">İşlemde</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {AGENTS.map((a) => {
            const Icon = a.icon;
            const on = activeAgent === a.id;
            return (
              <div
                key={a.id}
                className={`rounded-xl border px-3 py-3 transition-all ${
                  on
                    ? ACTIVE_AGENT_PANEL_BY_ID[a.id] ||
                      'border-sky-400/50 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30'
                    : 'border-white/10 bg-slate-900/40 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={18} className={on ? 'text-white' : 'text-slate-400'} />
                  <p className="text-sm font-semibold leading-tight">{a.name}</p>
                </div>
                <p className={`mt-1 text-xs ${on ? 'text-white/85' : 'text-slate-500'}`}>{a.role}</p>
                {on && <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-white/20"><div className="h-full w-1/2 animate-pulse bg-white/80" /></div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 max-h-[min(52vh,520px)] space-y-3 overflow-y-auto px-6 py-6 md:px-8">
        {lines.length === 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-4 text-slate-300">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-500/30 border-t-sky-400" />
            <p className="text-sm">Oturum başlatılıyor…</p>
          </div>
        )}

        {lines.map((item, idx) => {
          if (item.kind === 'summary') {
            return (
              <div
                key={`${item.t}-${idx}`}
                className="rounded-xl border border-blue-400/20 bg-blue-950/35 px-4 py-3 text-left backdrop-blur-md animate-fade-in"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-sky-200/90">{item.title}</p>
                <p className="mt-1 text-sm text-slate-100">{item.text}</p>
              </div>
            );
          }

          const agent = AGENTS.find((x) => x.id === item.agentId) || AGENTS[0];
          const Icon = agent.icon;
          return (
            <div key={`${item.t}-${idx}`} className="flex gap-3 text-left animate-fade-in">
              <div
                className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                  AVATAR_GRADIENT_BY_ID[agent.id] || 'from-blue-600 to-indigo-700'
                } text-white shadow-md`}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-900/55 px-4 py-3 text-slate-100 shadow-inner backdrop-blur-md">
                <p className="text-xs font-semibold text-sky-200/90">{agent.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-100">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 border-t border-white/10 bg-slate-950/60 px-6 py-4 text-center text-xs text-slate-400 md:px-8">
        Bu görünüm gösterim amaçlıdır; nihai karar ve sayılar sunucudan gelen değerlendirme ile belirlenir.
      </div>
    </div>
  );
}
