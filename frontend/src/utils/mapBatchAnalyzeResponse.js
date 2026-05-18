/**
 * Normalizes various /api/v1/analyze response shapes into dashboard row `data`
 * (fields expected by Dashboard + BatchResultsTable).
 */
const DASHBOARD_KEYS = [
  'committee_decision',
  'default_risk_level',
  'recommended_loan_terms',
  'justification_summary',
  'raw_telemetry',
  'agent_votes',
  'symbols',
  'analysis_period',
  'method',
  'status',
  'timestamp',
];

function pickDashboardFields(source) {
  if (!source || typeof source !== 'object') return {};
  const out = {};
  for (const key of DASHBOARD_KEYS) {
    if (source[key] !== undefined) out[key] = source[key];
  }
  if (
    !out.committee_decision &&
    !out.default_risk_level &&
    source.credit_committee_memo &&
    typeof source.credit_committee_memo === 'object'
  ) {
    return pickDashboardFields(source.credit_committee_memo);
  }
  return out;
}

function buildPerTickerTelemetry(fullTelemetry, ticker) {
  if (!fullTelemetry || typeof fullTelemetry !== 'object') return fullTelemetry;
  if (Object.prototype.hasOwnProperty.call(fullTelemetry, ticker)) {
    return { [ticker]: fullTelemetry[ticker] };
  }
  return fullTelemetry;
}

function withTelemetrySlice(payload, ticker) {
  const base = pickDashboardFields(payload);
  const next = { ...base };
  if (base.raw_telemetry && typeof base.raw_telemetry === 'object') {
    next.raw_telemetry = buildPerTickerTelemetry(base.raw_telemetry, ticker);
  }
  return next;
}

/**
 * Maps one API payload + requested tickers to batch UI rows `{ ticker, data }[]`.
 * Supports optional `per_symbol` (object map or array); otherwise splits shared
 * `raw_telemetry` by ticker when present, else duplicates the shared memo per row.
 *
 * @param {Record<string, unknown>} payload - axios response.data
 * @param {string[]} requestedSymbols - resolved uppercase tickers (same order as request)
 * @returns {{ ticker: string, data: Record<string, unknown> }[]}
 */
export function mapBatchAnalyzeResponse(payload, requestedSymbols) {
  const symbols = (requestedSymbols || [])
    .map((s) => String(s || '').trim().toUpperCase())
    .filter(Boolean);

  if (!symbols.length) return [];

  const per = payload?.per_symbol;

  if (per && typeof per === 'object' && !Array.isArray(per)) {
    return symbols.map((ticker) => {
      const slice = per[ticker];
      if (slice !== undefined && slice !== null) {
        return {
          ticker,
          data: { ...pickDashboardFields(payload), ...pickDashboardFields(slice) },
        };
      }
      return { ticker, data: withTelemetrySlice(payload, ticker) };
    });
  }

  if (Array.isArray(per)) {
    const byTicker = new Map();
    for (const entry of per) {
      const t = String(entry?.ticker ?? entry?.symbol ?? '')
        .trim()
        .toUpperCase();
      if (!t) continue;
      const inner = entry?.data ?? entry;
      byTicker.set(t, { ...pickDashboardFields(payload), ...pickDashboardFields(inner) });
    }
    return symbols.map((ticker) => ({
      ticker,
      data: byTicker.get(ticker) ?? withTelemetrySlice(payload, ticker),
    }));
  }

  return symbols.map((ticker) => ({
    ticker,
    data: withTelemetrySlice(payload, ticker),
  }));
}
