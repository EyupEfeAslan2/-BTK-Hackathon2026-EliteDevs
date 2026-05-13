import { useState } from 'react';
import { FiAlertTriangle, FiBriefcase, FiCpu, FiFileText, FiShield, FiDownload } from 'react-icons/fi';
import { useThemeStore } from '../store/themeStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const MODERN_COLOR_SYNTAX =
  /oklab|oklch|\blab\(|\blch\(|color-mix|\bin oklab\b|\bin oklch\b|hwb\(/i;

let colorProbeCtx = null;
function getColorProbeCtx() {
  if (!colorProbeCtx) {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    colorProbeCtx = c.getContext('2d', { willReadFrequently: true });
  }
  return colorProbeCtx;
}

/** Resolve any browser-supported color to rgb/hex (html2canvas-safe). */
function resolveColorThroughCanvas(cssColor) {
  if (!cssColor || cssColor === 'none' || cssColor === 'transparent') return cssColor;
  try {
    const ctx = getColorProbeCtx();
    ctx.fillStyle = '#000';
    ctx.fillStyle = cssColor;
    const out = ctx.fillStyle;
    if (typeof out === 'string' && !MODERN_COLOR_SYNTAX.test(out)) return out;
  } catch {
    /* ignore */
  }

  try {
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

  // Tüm stylesheetleri kaldır
  clonedDoc.querySelectorAll('link[rel="stylesheet"], link[as="style"]').forEach((link) => {
    link.remove();
  });
  clonedDoc.querySelectorAll('style').forEach((node) => node.remove());

  // Tüm elementlerdeki inline style'ları temizle ve calculated style'ları uygula
  const walkElements = (element) => {
    if (!(element instanceof Element)) return;

    // Class ve inline style'ı kaldır
    element.removeAttribute('class');
    element.removeAttribute('style');

    if (element instanceof HTMLElement || element instanceof SVGGraphicsElement) {
      const cs = window.getComputedStyle(element);
      const newStyle = {};

      for (let i = 0; i < cs.length; i++) {
        const name = cs.item(i);
        const value = cs.getPropertyValue(name);
        
        // Modern renk syntax'ını kontrol et
        if (MODERN_COLOR_SYNTAX.test(value)) {
          const cleaned = resolveColorThroughCanvas(value);
          if (cleaned && !MODERN_COLOR_SYNTAX.test(cleaned)) {
            newStyle[name] = cleaned;
          }
          // Aksi halde bu property'i atla
        } else {
          newStyle[name] = value;
        }
      }

      // Inline style'a yazmadan önce en önemlileri filtrele
      const cssText = Object.entries(newStyle)
        .filter(([key, val]) => {
          // Backdrop filter'ı her zaman none'a çevir
          if (key.includes('backdrop-filter')) return false;
          // Modern renk syntax'ı içeren herhangi bir şeyi atla
          if (MODERN_COLOR_SYNTAX.test(String(val))) return false;
          return true;
        })
        .map(([key, val]) => `${key}: ${val}`)
        .join('; ');

      if (cssText) {
        element.setAttribute('style', cssText);
      }
    }

    // SVG attribute'lerindeki modern renkleri temizle
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

    // Çocuk elementleri işle
    for (const child of element.children) {
      walkElements(child);
    }
  };

  walkElements(cloneRoot);
}

const Dashboard = ({ data, error, ticker }) => {
  const { isDark } = useThemeStore();
  const [pdfExporting, setPdfExporting] = useState(false);

  const exportPDF = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;

    setPdfExporting(true);
    try {
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });

      // HTML2Canvas için cloned DOM'u hazırla ve ikonları kaldır
      const canvas = await html2canvas(element, {
        scale: 3.5,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        windowHeight: element.scrollHeight,
        windowWidth: element.scrollWidth,
        imageTimeout: 10000,
        onclone: (clonedDoc) => {
          // Cloned element'i bul
          const clonedElement = clonedDoc.getElementById('dashboard-content');
          
          if (clonedElement) {
            // Koyu tema'yı light tema'ya dönüştür PDF için
            clonedElement.classList.remove('dark');
            clonedElement.style.backgroundColor = '#ffffff';
            clonedElement.style.color = '#0f172a';
          }

          // Tüm dark class'larını kaldır
          clonedDoc.querySelectorAll('[class*="dark:"]').forEach((el) => {
            if (el instanceof HTMLElement && el.className && typeof el.className === 'string') {
              const classes = el.className.split(' ').filter(c => !c.includes('dark:'));
              el.className = classes.join(' ');
            }
          });

          // Tüm SVG ikonlarını kaldır (react-icons)
          clonedDoc.querySelectorAll('svg').forEach((svg) => {
            svg.remove();
          });

          // @media print CSS'ini ekle
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * {
              background-color: transparent !important;
              background-image: none !important;
              color: #000 !important;
            }
            svg { display: none !important; }
            .hidden { display: none !important; }
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
            .text-\\3xl, .text-4xl, .text-5xl, .text-6xl, .text-7xl {
              font-size: 2.5rem !important;
              font-weight: 700 !important;
              color: #000 !important;
            }
            .text-lg, .text-xl {
              font-size: 1.5rem !important;
            }
            .text-base, .text-sm {
              font-size: 1.1rem !important;
            }
            .text-xs {
              font-size: 0.95rem !important;
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
            ::before, ::after {
              background-color: transparent !important;
              color: #000 !important;
            }
          `;
          clonedDoc.head.appendChild(style);

          // Tüm stylesheet'leri kaldır
          clonedDoc.querySelectorAll('link[rel="stylesheet"], style:not(:last-child)').forEach((el) => {
            el.remove();
          });

          // Text renkleri ve background'ları sıfırla
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.color = '#000';
              el.style.backgroundColor = 'transparent';
              el.style.backgroundImage = 'none';
            }
          });

          prepareClonedDomForCanvas(element, clonedDoc);
        },
      });

      const imgData = canvas.toDataURL('image/png');
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
      
      // Aspect ratio'yu koru
      const contentHeight = (canvas.height * contentWidth) / canvas.width;
      
      // Kullanılabilir sayfa yüksekliği (margin'ler hariç)
      const availableHeight = pageHeight - 2 * margin;
      
      // Kaç sayfa gerekli?
      const totalPages = Math.ceil(contentHeight / availableHeight);
      
      // Her sayfa için image slice'ları oluştur
      let currentY = 0;
      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        if (pageNum > 0) {
          pdf.addPage();
        }

        const srcY = (currentY / contentHeight) * canvas.height;
        const srcHeight = Math.min(
          (availableHeight / contentHeight) * canvas.height,
          canvas.height - srcY
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
          canvas.width, srcHeight
        );

        const sliceImgData = sliceCanvas.toDataURL('image/png');
        const sliceHeight = (srcHeight * contentWidth) / canvas.width;
        
        pdf.addImage(sliceImgData, 'PNG', margin, margin, contentWidth, sliceHeight);
        currentY += availableHeight;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const safeTicker = String(ticker || 'report').replace(/[^\w.-]/g, '_').slice(0, 32);
      const filename = `credit-memo-${safeTicker}-${timestamp}.pdf`;

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
    } catch (err) {
      console.error('Error exporting PDF:', err);
    } finally {
      setPdfExporting(false);
    }
  };

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <FiAlertTriangle className="text-red-500 text-6xl mb-6 animate-pulse" />
        <h2 className="text-4xl font-mono font-bold text-red-500 mb-4 tracking-widest cyber-glow-red">
          404_ERROR: ENTITY NOT FOUND OR INSUFFICIENT DATA
        </h2>
        <p className="text-emerald-700 dark:text-slate-400 font-mono max-w-lg mb-8">
          The AI committee could not retrieve verifiable public records for this corporate ID.
        </p>
        <div className="p-4 border border-red-500/30 bg-red-100 dark:bg-red-950/20 rounded-md font-mono text-red-600 dark:text-red-400 text-sm mb-8 break-all max-w-2xl">
          ERROR_DETAILS: {error || 'Insufficient data returned from analysis.'}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <FiAlertTriangle className="text-red-500 text-6xl mb-6 animate-pulse" />
        <h2 className="text-4xl font-mono font-bold text-red-500 mb-4 tracking-widest cyber-glow-red">
          NO DATA RECEIVED
        </h2>
        <p className="text-emerald-700 dark:text-slate-400 font-mono max-w-lg mb-8">
          The dashboard did not receive any data from the server.
        </p>
      </div>
    );
  }

  const committeeDecision = data?.committee_decision || 'N/A';
  const defaultRiskLevel = data?.default_risk_level || 'N/A';
  const recommendedTerms = data?.recommended_loan_terms || {};
  const covenants = data?.recommended_loan_terms?.covenants || [];
  const justificationSummary = data?.justification_summary || 'N/A';

  const isApproved = committeeDecision === 'APPROVED';
  const isRejected = committeeDecision === 'REJECTED';
  const signalClass = isApproved
    ? 'border-emerald-500/40 bg-emerald-950/20 cyber-glow text-emerald-400'
    : isRejected
      ? 'border-red-500/40 bg-red-950/20 cyber-glow-red text-red-500'
      : 'border-amber-500/40 bg-amber-950/20 text-amber-950 dark:text-amber-400';

  return (
    <>
      <style>{`
        @media print {
          svg { display: none !important; }
        }
      `}</style>
      <div id="dashboard-content" className="w-full max-w-7xl mx-auto font-sans animate-fade-in text-slate-900 dark:text-slate-200 transition-colors duration-300 text-base md:text-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 dark:from-emerald-400 to-cyan-600 dark:to-cyan-400 font-mono tracking-wider">
              Corporate Credit Memo
            </span>
            <span className="text-emerald-700 dark:text-slate-400 text-xl md:text-2xl font-normal">| Institutional Risk Profile</span>
          </h2>
          <p className="text-emerald-600 dark:text-slate-500 mt-1 font-mono text-sm md:text-base">
            Last Updated: {new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC
          </p>
        </div>
        <div className="px-4 py-2 border border-emerald-400 dark:border-emerald-500/30 bg-emerald-100 dark:bg-emerald-500/10 rounded-md font-mono text-emerald-700 dark:text-emerald-400 text-sm md:text-base cyber-glow">
          SYSTEM_ONLINE // AI_CONSENSUS_REACHED
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className={`p-6 rounded-xl border backdrop-blur-sm relative overflow-hidden ${signalClass}`}>
          <div className="absolute -right-6 -top-6 opacity-10 hidden">
            <FiShield size={120} />
          </div>
          <div className="text-sm text-emerald-700 dark:text-slate-400 mb-2 font-mono uppercase tracking-widest">Overall AI Signal</div>
          <div className="flex items-end gap-4">
            <div className="text-6xl md:text-7xl font-bold">
              {data?.committee_decision || 'N/A'}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/20 cyber-glow-blue backdrop-blur-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 opacity-10 hidden">
            <FiAlertTriangle size={120} />
          </div>
          <div className="text-sm text-emerald-700 dark:text-slate-400 mb-2 font-mono uppercase tracking-widest">Credit Default Risk</div>
          <div className="flex items-end gap-4">
            <div className="text-6xl md:text-7xl font-bold text-cyan-600 dark:text-cyan-400">
              {defaultRiskLevel || 'N/A'}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-emerald-200 dark:border-slate-700 bg-emerald-50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="text-sm text-emerald-700 dark:text-slate-400 mb-2 font-mono uppercase tracking-widest">Memo Status</div>
          <div className="text-4xl md:text-5xl font-bold text-emerald-900 dark:text-slate-200">
            {committeeDecision || 'N/A'}
          </div>
          <div className="mt-4 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hidden">
            <FiFileText />
          </div>
          <p className="mt-4 text-xs text-emerald-600 dark:text-emerald-400">Structured credit committee output</p>
        </div>
      </div>

      <div className="mb-8 p-6 rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-[#0b0f19] shadow-lg relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${isRejected ? 'from-red-500 to-orange-500' : 'from-emerald-400 to-cyan-500'}`}></div>
        <h3 className="text-sm md:text-base font-mono text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-widest flex items-center gap-2">
          <span className="hidden"><FiCpu /></span>
          AI CONSENSUS JUSTIFICATION
        </h3>
        <p className="text-emerald-900 dark:text-slate-300 font-mono text-sm md:text-base leading-relaxed pl-2">
          {data?.justification_summary || 'N/A'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="p-6 rounded-xl border border-emerald-200 dark:border-slate-800 bg-emerald-50 dark:bg-[#0b0f19] shadow-lg h-full">
            <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2 font-mono border-b border-emerald-200 dark:border-slate-800 pb-4">
              <span className="hidden"><FiBriefcase className="text-cyan-600 dark:text-cyan-400" /></span>
              RECOMMENDED LOAN TERMS
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-slate-900/80 rounded-lg p-4 border border-emerald-200 dark:border-slate-700">
                <div className="text-xs text-emerald-700 dark:text-slate-500 font-mono uppercase tracking-widest mb-2">Max Amount</div>
                <div className="text-4xl md:text-5xl font-bold text-emerald-900 dark:text-slate-100">{recommendedTerms?.max_amount || 'N/A'}</div>
              </div>
              <div className="bg-white dark:bg-slate-900/80 rounded-lg p-4 border border-emerald-200 dark:border-slate-700">
                <div className="text-xs text-emerald-700 dark:text-slate-500 font-mono uppercase tracking-widest mb-2">Tenor</div>
                <div className="text-4xl md:text-5xl font-bold text-emerald-900 dark:text-slate-100">{recommendedTerms?.tenor || 'N/A'}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm md:text-base font-mono text-emerald-700 dark:text-slate-400 mb-3 uppercase">Covenants</h4>
              <ul className="space-y-2 text-sm md:text-base text-emerald-900 dark:text-slate-300">
                {(covenants || []).length > 0 ? (
                  (covenants || []).map((covenant, idx) => (
                    <li key={idx} className="flex items-start gap-2 rounded bg-white dark:bg-slate-800/50 border border-emerald-200 dark:border-slate-700/50 p-3">
                      <span className="text-cyan-600 dark:text-cyan-400 mt-1">▹</span>
                      <span>{covenant || 'N/A'}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2 rounded bg-emerald-100 dark:bg-slate-800/20 border border-emerald-200 dark:border-slate-700/20 p-3 text-emerald-700 dark:text-slate-500">
                    <span>N/A</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="p-6 rounded-xl border border-emerald-200 dark:border-slate-800 bg-emerald-50 dark:bg-[#0b0f19] shadow-lg h-full">
            <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2 font-mono border-b border-emerald-200 dark:border-slate-800 pb-4">
              <span className="hidden"><FiShield className="text-amber-500 dark:text-amber-400" /></span>
              Committee Snapshot
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded bg-white dark:bg-slate-800/50 border border-emerald-200 dark:border-slate-700/50">
                <span className="text-sm md:text-base text-emerald-900 dark:text-slate-300">Decision</span>
                <span className="px-2 py-1 text-xs md:text-sm rounded bg-emerald-200 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 uppercase font-semibold">
                  {data?.committee_decision || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-white dark:bg-slate-800/50 border border-emerald-200 dark:border-slate-700/50">
                <span className="text-sm md:text-base text-emerald-900 dark:text-slate-300">Default Risk</span>
                <span className="px-2 py-1 text-xs md:text-sm rounded bg-cyan-200 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30 uppercase font-semibold">
                  {data?.default_risk_level || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-white dark:bg-slate-800/50 border border-emerald-200 dark:border-slate-700/50">
                <span className="text-sm md:text-base text-emerald-900 dark:text-slate-300">Max Amount</span>
                <span className="px-2 py-1 text-xs md:text-sm rounded bg-emerald-100 dark:bg-slate-700/60 text-emerald-700 dark:text-slate-200 border border-emerald-200 dark:border-slate-600 uppercase font-semibold">
                  {data?.recommended_loan_terms?.max_amount || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-white dark:bg-slate-800/50 border border-emerald-200 dark:border-slate-700/50">
                <span className="text-sm md:text-base text-emerald-900 dark:text-slate-300">Tenor</span>
                <span className="px-2 py-1 text-xs md:text-sm rounded bg-emerald-100 dark:bg-slate-700/60 text-emerald-700 dark:text-slate-200 border border-emerald-200 dark:border-slate-600 uppercase font-semibold">
                  {data?.recommended_loan_terms?.tenor || 'N/A'}
                </span>
              </div>
            </div>

            <div className="mt-6 bg-emerald-100 dark:bg-slate-900/80 rounded-lg p-4 border border-emerald-200 dark:border-slate-700 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-lg"></div>
              <h4 className="text-sm md:text-base font-mono text-amber-700 dark:text-amber-500 mb-2 uppercase font-semibold">Summary</h4>
              <p className="text-sm md:text-base text-emerald-900 dark:text-slate-300 leading-relaxed">
                {justificationSummary || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="w-full max-w-7xl mx-auto mt-10 flex flex-col items-center gap-3 border-t border-emerald-200 dark:border-emerald-500/20 pt-8">
        <p className="text-center text-sm md:text-base text-emerald-700 dark:text-slate-500 font-mono">
          Use the button below to download this analysis as a PDF.
        </p>
        <button
          type="button"
          onClick={() => void exportPDF()}
          disabled={pdfExporting}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-mono text-base md:text-lg font-semibold border transition-colors duration-200 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-white dark:text-emerald-200 border-emerald-600 dark:border-emerald-500/40 disabled:opacity-50 disabled:pointer-events-none cyber-glow"
        >
          <FiDownload className="text-lg shrink-0" />
          {pdfExporting ? 'Preparing PDF…' : 'Download analysis as PDF'}
        </button>
      </div>
    </>
  );
};

export default Dashboard;