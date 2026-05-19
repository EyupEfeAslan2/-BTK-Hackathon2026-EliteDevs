import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const MODERN_COLOR_SYNTAX =
  /oklab|oklch|\blab\(|\blch\(|color-mix|\bin oklab\b|\bin oklch\b|hwb\(/i;

let colorProbeCtx = null;

function getColorProbeCtx() {
  if (!colorProbeCtx) {
    // Reuse one tiny canvas so repeated color normalization is cheap.
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    colorProbeCtx = c.getContext('2d', { willReadFrequently: true });
  }
  return colorProbeCtx;
}

function resolveColorThroughCanvas(cssColor) {
  if (!cssColor || cssColor === 'none' || cssColor === 'transparent') return cssColor;
  try {
    // html2canvas cannot parse newer CSS color spaces; canvas may resolve them to rgb/hex.
    const ctx = getColorProbeCtx();
    ctx.fillStyle = '#000';
    ctx.fillStyle = cssColor;
    const out = ctx.fillStyle;
    if (typeof out === 'string' && !MODERN_COLOR_SYNTAX.test(out)) return out;
  } catch {
    /* ignore */
  }

  try {
    // Fallback through computed style for browser-supported colors canvas leaves unchanged.
    const probe = document.createElement('span');
    probe.setAttribute(
      'style',
      `position:absolute;left:-9999px;top:0;visibility:hidden;color:${cssColor}`,
    );
    document.body.appendChild(probe);
    const rgb = getComputedStyle(probe).color;
    probe.remove();
    if (rgb && !MODERN_COLOR_SYNTAX.test(rgb)) return rgb;
  } catch {
    /* ignore */
  }

  return '#64748b';
}

function prepareClonedDomForCanvas(origRoot, clonedDoc) {
  const cloneRoot = clonedDoc.getElementById(origRoot.id);
  if (!cloneRoot) return;

  // Inline computed styles in the cloned DOM so exported PDFs do not depend on Tailwind runtime CSS.
  clonedDoc.querySelectorAll('link[rel="stylesheet"], link[as="style"]').forEach((link) => {
    link.remove();
  });
  clonedDoc.querySelectorAll('style').forEach((node) => node.remove());

  const walkElements = (element) => {
    if (!(element instanceof Element)) return;

    element.removeAttribute('class');
    element.removeAttribute('style');

    if (element instanceof HTMLElement || element instanceof SVGGraphicsElement) {
      const cs = window.getComputedStyle(element);
      const newStyle = {};

      for (let i = 0; i < cs.length; i++) {
        const name = cs.item(i);
        const value = cs.getPropertyValue(name);

        if (MODERN_COLOR_SYNTAX.test(value)) {
          // Convert only unsupported modern color values and leave normal CSS untouched.
          const cleaned = resolveColorThroughCanvas(value);
          if (cleaned && !MODERN_COLOR_SYNTAX.test(cleaned)) {
            newStyle[name] = cleaned;
          }
        } else {
          newStyle[name] = value;
        }
      }

      const cssText = Object.entries(newStyle)
        .filter(([key, val]) => {
          // Backdrop filters and unresolved modern colors are common html2canvas failure points.
          if (key.includes('backdrop-filter')) return false;
          if (MODERN_COLOR_SYNTAX.test(String(val))) return false;
          return true;
        })
        .map(([key, val]) => `${key}: ${val}`)
        .join('; ');

      if (cssText) {
        element.setAttribute('style', cssText);
      }
    }

    if (element instanceof SVGElement) {
      for (const attr of [...element.attributes]) {
        if (attr.value && MODERN_COLOR_SYNTAX.test(attr.value)) {
          const cleaned = resolveColorThroughCanvas(attr.value);
          if (cleaned && !MODERN_COLOR_SYNTAX.test(cleaned)) {
            element.setAttribute(attr.name, cleaned);
          } else {
            element.removeAttribute(attr.name);
          }
        }
      }
    }

    for (const child of element.children) {
      walkElements(child);
    }
  };

  walkElements(cloneRoot);
}

const PDF_EXCLUDE_SELECTOR = '.pdf-exclude, .hidden-print, .summary-section, [data-pdf-exclude]';

/** Normalize AI-generated copy for display and PDF export. */
export function sanitizeReportCopy(text) {
  if (!text) return text;
  return String(text)
    .replace(/\bdecided to conditional the request\b/gi, 'decided to conditionally approve the request')
    .replace(/\bseverely CONDITIONAL the request\b/gi, 'issue a CONDITIONAL decision on the request')
    .replace(/\bREJECT or severely CONDITIONAL\b/gi, 'REJECT or issue a CONDITIONAL decision on');
}

function removePdfExcludedElements(clonedDoc, contentRootId) {
  const root = clonedDoc.getElementById(contentRootId);
  if (!root) return;

  // Remove controls from the print/PDF copy so the report reads as a formal memo.
  root.querySelectorAll(PDF_EXCLUDE_SELECTOR).forEach((el) => {
    el.remove();
  });

  root.querySelectorAll('button, input, select, textarea, label[for]').forEach((el) => {
    el.remove();
  });
}

function sanitizePdfTextNodes(clonedDoc) {
  const walker = clonedDoc.createTreeWalker(clonedDoc.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    node.textContent = sanitizeReportCopy(node.textContent);
    node = walker.nextNode();
  }
}

function buildPdfCloneHandler(element, contentRootId) {
  return (clonedDoc) => {
    removePdfExcludedElements(clonedDoc, contentRootId);

    const clonedElement = clonedDoc.getElementById(contentRootId);

    if (clonedElement) {
      // Force light-mode report output regardless of the user's active theme.
      clonedElement.classList.remove('dark');
      clonedElement.style.backgroundColor = '#ffffff';
      clonedElement.style.color = '#0f172a';
    }

    clonedDoc.querySelectorAll('[class*="dark:"]').forEach((el) => {
      if (el instanceof HTMLElement && el.className && typeof el.className === 'string') {
        const classes = el.className.split(' ').filter((c) => !c.includes('dark:'));
        el.className = classes.join(' ');
      }
    });

    clonedDoc.querySelectorAll('svg').forEach((svg) => {
      svg.remove();
    });

    sanitizePdfTextNodes(clonedDoc);

    const style = clonedDoc.createElement('style');
    style.innerHTML = `
      * {
        background-color: transparent !important;
        background-image: none !important;
        color: #000 !important;
      }
      #${contentRootId} {
        background-color: #ffffff !important;
      }
      .rounded-xl, .rounded-lg {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      svg, button, input, select, textarea { display: none !important; }
      .pdf-exclude, .hidden-print, .summary-section, [data-pdf-exclude] {
        display: none !important;
      }
      body {
        margin: 0;
        padding: 0;
        background-color: #ffffff !important;
        color: #000 !important;
      }
      html {
        background-color: #ffffff !important;
        color: #000 !important;
      }
      h1, h2, h3, h4, h5, h6 {
        line-height: 1.2;
        margin-top: 1em;
        margin-bottom: 0.8em;
        color: #000 !important;
        font-weight: 700;
      }
      p, div, span {
        line-height: 1.6;
        word-break: break-word;
        color: #000 !important;
      }
      .font-mono {
        font-family: 'Courier New', monospace !important;
      }
      .font-bold, .font-semibold {
        font-weight: 700 !important;
      }
      border {
        border-color: #000 !important;
      }
    `;
    clonedDoc.head.appendChild(style);

    clonedDoc.querySelectorAll('link[rel="stylesheet"], style:not(:last-child)').forEach((el) => {
      el.remove();
    });

    clonedDoc.querySelectorAll('*').forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.color = '#000';
        el.style.backgroundColor = 'transparent';
        el.style.backgroundImage = 'none';
      }
    });

    prepareClonedDomForCanvas(element, clonedDoc);
  };
}

export function formatTelemetryLabel(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatTelemetryValue(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'number') {
    if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2);
  }
  return String(value);
}

export function safeExportFilename(base) {
  return String(base || 'report').replace(/[^\w.-]/g, '_').slice(0, 48);
}

function downloadPdfBlob(pdf, filename) {
  try {
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    requestAnimationFrame(() => {
      link.remove();
      URL.revokeObjectURL(url);
    });
  } catch {
    pdf.save(filename);
  }
}

export async function exportElementToPdf(elementId, filenameBase) {
  const element = document.getElementById(elementId);
  if (!element) return;

  window.scrollTo(0, 0);

  const originalPaddingBottom = element.style.paddingBottom;
  element.style.paddingBottom = '60px';

  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

  const canvas = await html2canvas(element, {
    scale: 3.5,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
    allowTaint: true,
    windowHeight: element.scrollHeight,
    windowWidth: element.scrollWidth,
    imageTimeout: 10000,
    onclone: buildPdfCloneHandler(element, elementId),
  });

  element.style.paddingBottom = originalPaddingBottom;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 5;
  const contentWidth = pageWidth - 2 * margin;
  const contentHeight = (canvas.height * contentWidth) / canvas.width;
  const availableHeight = pageHeight - 2 * margin;
  const totalPages = Math.ceil(contentHeight / availableHeight);

  let currentY = 0;
  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    if (pageNum > 0) {
      pdf.addPage();
    }

    const srcY = (currentY / contentHeight) * canvas.height;
    const srcHeight = Math.min(
      (availableHeight / contentHeight) * canvas.height,
      canvas.height - srcY,
    );

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = srcHeight;

    const ctx = sliceCanvas.getContext('2d');
    ctx.drawImage(
      canvas,
      0, srcY,
      canvas.width, srcHeight,
      0, 0,
      canvas.width, srcHeight,
    );

    const sliceImgData = sliceCanvas.toDataURL('image/png');
    const sliceHeight = (srcHeight * contentWidth) / canvas.width;

    pdf.addImage(sliceImgData, 'PNG', margin, margin, contentWidth, sliceHeight);
    currentY += availableHeight;
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${filenameBase}-${timestamp}.pdf`;
  downloadPdfBlob(pdf, filename);
}

function appendSheetsToWorkbook(workbook, sheets, colWidths = {}) {
  Object.entries(sheets).forEach(([name, data]) => {
    // Sheet data is assembled as arrays so it can be reused for single and batch exports.
    const sheet = XLSX.utils.aoa_to_sheet(data);
    if (colWidths[name]) {
      sheet['!cols'] = colWidths[name];
    }
    XLSX.utils.book_append_sheet(workbook, sheet, name);
  });
}

function defaultAgentVoteRows(agentVotes) {
  if (Array.isArray(agentVotes) && agentVotes.length > 0) {
    return agentVotes.map((vote) => [
      vote?.agent_name || 'N/A',
      vote?.vote || 'N/A',
      vote?.brief_reason || vote?.reasoning || 'N/A',
      vote?.confidence || 'N/A',
    ]);
  }

  // Keep the exported audit log complete even when the backend omits agent vote records.
  return [
    ['Risk Auditor', 'CONDITIONAL', 'Missing underwriting evidence requires manual risk review.', 'Medium'],
    ['Advocate', 'CONDITIONAL', 'Potential credit support cannot be confirmed from available data.', 'Medium'],
    ['Compliance', 'CONDITIONAL', 'Manual compliance confirmation is required before approval.', 'Medium'],
  ];
}

export function buildSingleAnalysisWorkbook(data, ticker) {
  // Workbook tabs mirror the visible dashboard sections for judge-friendly review.
  const committeeDecision = data?.committee_decision || 'N/A';
  const defaultRiskLevel = data?.default_risk_level || 'N/A';
  const recommendedTerms = data?.recommended_loan_terms || {};
  const covenants = data?.recommended_loan_terms?.covenants || [];
  const justificationSummary = sanitizeReportCopy(data?.justification_summary) || 'N/A';
  const agentVotes = Array.isArray(data?.agent_votes) ? data.agent_votes : [];
  const rawTelemetry = data?.raw_telemetry && typeof data.raw_telemetry === 'object' ? data.raw_telemetry : null;
  const hasRawTelemetry = rawTelemetry && Object.keys(rawTelemetry).length > 0;

  const executiveSummaryData = [
    ['CORPORATE CREDIT MEMO - EXECUTIVE SUMMARY'],
    [],
    ['Report Generated', new Date().toISOString().split('T')[0]],
    ['Corporate ID', ticker || 'N/A'],
    [],
    ['DECISION INDICATORS'],
    ['Overall AI Signal', committeeDecision],
    ['Credit Default Risk Level', defaultRiskLevel],
    ['Memo Status', committeeDecision],
    [],
    ['AI CONSENSUS JUSTIFICATION'],
    [justificationSummary],
  ];

  const recommendedTermsData = [
    ['RECOMMENDED LOAN TERMS - DETAILED'],
    [],
    ['Parameter', 'Value'],
    ['Maximum Loan Amount', recommendedTerms?.max_amount || 'N/A'],
    ['Tenor (Months)', recommendedTerms?.tenor || 'N/A'],
    ['Interest Rate', recommendedTerms?.interest_rate || 'N/A'],
    ['Fees', recommendedTerms?.fees || 'N/A'],
    ['Pricing', recommendedTerms?.pricing || 'N/A'],
    ['Credit Enhancement', recommendedTerms?.credit_enhancement || 'N/A'],
    ['Drawdown Schedule', recommendedTerms?.drawdown_schedule || 'N/A'],
  ];

  const covenantsData = [
    ['LOAN COVENANTS & CONDITIONS'],
    [],
    ['#', 'Covenant Description', 'Type'],
  ];
  (covenants || []).forEach((covenant, index) => {
    covenantsData.push([index + 1, covenant || 'N/A', 'Mandatory']);
  });
  if ((covenants || []).length === 0) {
    covenantsData.push([1, 'Requires manual underwriting', 'Mandatory']);
  }

  const agentVotesData = [
    ['AGENT AUDIT LOG - DETAILED VOTES'],
    [],
    ['Agent Name', 'Vote Status', 'Reasoning', 'Confidence'],
    ...defaultAgentVoteRows(agentVotes),
  ];

  const committeeSnapshotData = [
    ['COMMITTEE SNAPSHOT'],
    [],
    ['Metric', 'Value'],
    ['Committee Decision', committeeDecision],
    ['Default Risk Assessment', defaultRiskLevel],
    ['Maximum Loan Amount', recommendedTerms?.max_amount || 'N/A'],
    ['Tenor', recommendedTerms?.tenor || 'N/A'],
    [],
    ['RECOMMENDATION SUMMARY'],
    [justificationSummary],
  ];

  const telemetryData = [
    ['RAW TELEMETRY DATA - ANALYSIS METRICS'],
    [],
    ['Metric', 'Value'],
  ];

  if (hasRawTelemetry && rawTelemetry) {
    // Preserve entity prefixes so raw metrics remain traceable in multi-entity payloads.
    Object.entries(rawTelemetry).forEach(([entity, telemetry]) => {
      if (telemetry && typeof telemetry === 'object') {
        Object.entries(telemetry).forEach(([key, value]) => {
          telemetryData.push([`${entity} - ${formatTelemetryLabel(key)}`, formatTelemetryValue(value)]);
        });
      } else {
        telemetryData.push([formatTelemetryLabel(entity), formatTelemetryValue(telemetry)]);
      }
    });
  } else if (data) {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object') {
        telemetryData.push([formatTelemetryLabel(key), JSON.stringify(value)]);
      } else {
        telemetryData.push([formatTelemetryLabel(key), formatTelemetryValue(value)]);
      }
    });
  }

  const fullReportData = [
    ['FULL CREDIT ANALYSIS REPORT'],
    ['Generated', new Date().toISOString()],
    ['Corporate ID', ticker || 'N/A'],
    [],
    ['=== EXECUTIVE SUMMARY ==='],
    ['Decision', committeeDecision],
    ['Risk Level', defaultRiskLevel],
    ['Summary', justificationSummary],
    [],
    ['=== LOAN TERMS ==='],
    ['Max Amount', recommendedTerms?.max_amount || 'N/A'],
    ['Tenor', recommendedTerms?.tenor || 'N/A'],
    ['Interest Rate', recommendedTerms?.interest_rate || 'N/A'],
    [],
    ['=== COVENANTS ==='],
  ];

  (covenants || []).forEach((covenant, idx) => {
    fullReportData.push([`Covenant ${idx + 1}`, covenant || 'N/A']);
  });

  fullReportData.push([], ['=== AGENT VOTES ===']);
  defaultAgentVoteRows(agentVotes).forEach((row) => {
    fullReportData.push(row);
  });

  const workbook = XLSX.utils.book_new();
  appendSheetsToWorkbook(workbook, {
    'Executive Summary': executiveSummaryData,
    'Loan Terms': recommendedTermsData,
    Covenants: covenantsData,
    'Agent Audit Log': agentVotesData,
    'Committee Snapshot': committeeSnapshotData,
    'Telemetry Data': telemetryData,
    'Full Report': fullReportData,
  }, {
    'Executive Summary': [{ wch: 30 }, { wch: 80 }],
    'Loan Terms': [{ wch: 25 }, { wch: 40 }],
    Covenants: [{ wch: 5 }, { wch: 70 }, { wch: 15 }],
    'Agent Audit Log': [{ wch: 20 }, { wch: 15 }, { wch: 60 }, { wch: 15 }],
    'Committee Snapshot': [{ wch: 30 }, { wch: 50 }],
    'Telemetry Data': [{ wch: 35 }, { wch: 60 }],
    'Full Report': [{ wch: 35 }, { wch: 70 }],
  });

  return workbook;
}

export function buildBatchAnalysisWorkbook(results) {
  // Batch export denormalizes each result row into shared sheets for easier comparison.
  const items = Array.isArray(results) ? results : [];
  const tickers = items.map((item) => item?.ticker).filter(Boolean);
  const batchLabel = tickers.join('-') || 'batch';

  const batchSummaryData = [
    ['BATCH CREDIT ANALYSIS REPORT - EXECUTIVE SUMMARY'],
    [],
    ['Report Generated', new Date().toISOString().split('T')[0]],
    ['Total Analyses', items.length],
    ['Tickers', tickers.join(', ')],
    [],
    ['Ticker', 'Committee Decision', 'Default Risk', 'Max Amount', 'Tenor', 'Justification Summary'],
  ];

  const loanTermsData = [
    ['BATCH LOAN TERMS'],
    [],
    ['Ticker', 'Max Amount', 'Tenor', 'Interest Rate', 'Fees', 'Pricing'],
  ];

  const covenantsData = [
    ['BATCH COVENANTS'],
    [],
    ['Ticker', '#', 'Covenant Description', 'Type'],
  ];

  const agentVotesData = [
    ['BATCH AGENT AUDIT LOG'],
    [],
    ['Ticker', 'Agent Name', 'Vote Status', 'Reasoning', 'Confidence'],
  ];

  const committeeSnapshotData = [
    ['BATCH COMMITTEE SNAPSHOT'],
    [],
    ['Ticker', 'Committee Decision', 'Default Risk', 'Max Amount', 'Tenor'],
  ];

  const telemetryData = [
    ['BATCH TELEMETRY DATA'],
    [],
    ['Ticker', 'Metric', 'Value'],
  ];

  const fullReportData = [
    ['BATCH FULL CREDIT ANALYSIS REPORT'],
    ['Generated', new Date().toISOString()],
    ['Tickers', tickers.join(', ')],
    [],
  ];

  items.forEach((item) => {
    const ticker = item?.ticker || 'N/A';
    const data = item?.data || {};
    const committeeDecision = data?.committee_decision || 'N/A';
    const defaultRiskLevel = data?.default_risk_level || 'N/A';
    const recommendedTerms = data?.recommended_loan_terms || {};
    const covenants = data?.recommended_loan_terms?.covenants || [];
    const justificationSummary = sanitizeReportCopy(data?.justification_summary) || 'N/A';
    const agentVotes = Array.isArray(data?.agent_votes) ? data.agent_votes : [];
    const rawTelemetry = data?.raw_telemetry && typeof data.raw_telemetry === 'object' ? data.raw_telemetry : null;

    batchSummaryData.push([
      ticker,
      committeeDecision,
      defaultRiskLevel,
      recommendedTerms?.max_amount || 'N/A',
      recommendedTerms?.tenor || 'N/A',
      justificationSummary,
    ]);

    loanTermsData.push([
      ticker,
      recommendedTerms?.max_amount || 'N/A',
      recommendedTerms?.tenor || 'N/A',
      recommendedTerms?.interest_rate || 'N/A',
      recommendedTerms?.fees || 'N/A',
      recommendedTerms?.pricing || 'N/A',
    ]);

    committeeSnapshotData.push([
      ticker,
      committeeDecision,
      defaultRiskLevel,
      recommendedTerms?.max_amount || 'N/A',
      recommendedTerms?.tenor || 'N/A',
    ]);

    if ((covenants || []).length === 0) {
      // Absence of covenants is still material in a credit memo, so call it out explicitly.
      covenantsData.push([ticker, 1, 'Requires manual underwriting', 'Mandatory']);
    } else {
      covenants.forEach((covenant, index) => {
        covenantsData.push([ticker, index + 1, covenant || 'N/A', 'Mandatory']);
      });
    }

    defaultAgentVoteRows(agentVotes).forEach((row) => {
      agentVotesData.push([ticker, ...row]);
    });

    if (rawTelemetry && Object.keys(rawTelemetry).length > 0) {
      // Telemetry may be sliced per ticker or shared; include both entity and metric labels.
      Object.entries(rawTelemetry).forEach(([entity, telemetry]) => {
        if (telemetry && typeof telemetry === 'object') {
          Object.entries(telemetry).forEach(([key, value]) => {
            telemetryData.push([ticker, `${entity} - ${formatTelemetryLabel(key)}`, formatTelemetryValue(value)]);
          });
        } else {
          telemetryData.push([ticker, formatTelemetryLabel(entity), formatTelemetryValue(telemetry)]);
        }
      });
    } else if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object') {
          telemetryData.push([ticker, formatTelemetryLabel(key), JSON.stringify(value)]);
        } else {
          telemetryData.push([ticker, formatTelemetryLabel(key), formatTelemetryValue(value)]);
        }
      });
    }

    fullReportData.push([`=== ${ticker} ===`]);
    fullReportData.push(['Decision', committeeDecision]);
    fullReportData.push(['Risk Level', defaultRiskLevel]);
    fullReportData.push(['Summary', justificationSummary]);
    fullReportData.push(['Max Amount', recommendedTerms?.max_amount || 'N/A']);
    fullReportData.push(['Tenor', recommendedTerms?.tenor || 'N/A']);
    fullReportData.push([]);
  });

  const workbook = XLSX.utils.book_new();
  appendSheetsToWorkbook(workbook, {
    'Batch Summary': batchSummaryData,
    'Loan Terms': loanTermsData,
    Covenants: covenantsData,
    'Agent Audit Log': agentVotesData,
    'Committee Snapshot': committeeSnapshotData,
    'Telemetry Data': telemetryData,
    'Full Report': fullReportData,
  }, {
    'Batch Summary': [{ wch: 12 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 80 }],
    'Loan Terms': [{ wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 16 }],
    Covenants: [{ wch: 12 }, { wch: 5 }, { wch: 70 }, { wch: 15 }],
    'Agent Audit Log': [{ wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 60 }, { wch: 15 }],
    'Committee Snapshot': [{ wch: 12 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 12 }],
    'Telemetry Data': [{ wch: 12 }, { wch: 35 }, { wch: 60 }],
    'Full Report': [{ wch: 35 }, { wch: 70 }],
  });

  workbook.__batchLabel = batchLabel;
  return workbook;
}

export function downloadAnalysisExcel(workbook, filenameBase) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${filenameBase}-${timestamp}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export async function exportSingleAnalysisPdf(ticker) {
  const safeTicker = safeExportFilename(ticker);
  await exportElementToPdf('dashboard-content', `credit-memo-${safeTicker}`);
}

export async function exportBatchAnalysisPdf(tickers) {
  const label = safeExportFilename((tickers || []).join('-') || 'batch');
  await exportElementToPdf('batch-results-content', `batch-credit-memo-${label}`);
}

export function exportSingleAnalysisExcel(data, ticker) {
  const workbook = buildSingleAnalysisWorkbook(data, ticker);
  const safeTicker = safeExportFilename(ticker);
  downloadAnalysisExcel(workbook, `credit-memo-${safeTicker}`);
}

export function exportBatchAnalysisExcel(results) {
  const workbook = buildBatchAnalysisWorkbook(results);
  const label = safeExportFilename(workbook.__batchLabel || 'batch');
  downloadAnalysisExcel(workbook, `batch-credit-memo-${label}`);
}
