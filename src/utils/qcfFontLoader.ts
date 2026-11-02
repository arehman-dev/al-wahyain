/**
 * Utility to dynamically inject and preload King Fahd Complex QCF V2 & QCF V4 (COLRv1 Tajweed) page fonts.
 * - QCF V2 ('p{page}-v2') stored locally in /fonts/qcf_v2/p{page}.woff2
 * - QCF V4 ('p{page}-v4') COLRv1 multi-layer color Tajweed font served via /api/fonts/qcf_v4/p{page}.woff2
 *   and cached in /public/fonts/qcf_v4/p{page}.woff2 with @font-palette-values for Light, Dark, and Sepia themes.
 */

const loadedV2Pages = new Set<number>();
const loadedV4Pages = new Set<number>();

export function getQcfFontFamily(pageNumber?: number, showTajweed: boolean = false): string {
  if (!pageNumber || pageNumber < 1 || pageNumber > 604) {
    return "'KFGQPC HAFS Uthmanic Script', 'QCF V2', serif";
  }
  if (showTajweed) {
    return `'p${pageNumber}-v4', 'p${pageNumber}-v2', 'KFGQPC HAFS Uthmanic Script', serif`;
  }
  return `'p${pageNumber}-v2', 'KFGQPC HAFS Uthmanic Script', serif`;
}

export function loadQcfPageFont(pageNumber: number, showTajweed: boolean = false): Promise<void> {
  if (typeof window === 'undefined' || !pageNumber || pageNumber < 1 || pageNumber > 604) {
    return Promise.resolve();
  }

  // Always ensure base QCF V2 font is available
  injectV2Font(pageNumber);

  // If Tajweed V4 is requested, inject COLRv1 V4 font and its theme palettes
  if (showTajweed) {
    injectV4TajweedFont(pageNumber);
  }

  preloadAdjacentQcfFonts(pageNumber, showTajweed);
  return Promise.resolve();
}

function injectV2Font(pageNumber: number): void {
  const fontId = `qcf-v2-p${pageNumber}`;
  if (loadedV2Pages.has(pageNumber) || document.getElementById(fontId)) {
    loadedV2Pages.add(pageNumber);
    return;
  }

  const style = document.createElement('style');
  style.id = fontId;
  style.textContent = `
    @font-face {
      font-family: 'p${pageNumber}-v2';
      src: url('/fonts/qcf_v2/p${pageNumber}.woff2') format('woff2'),
           url('/api/fonts/qcf_v2/p${pageNumber}.woff2') format('woff2');
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
  loadedV2Pages.add(pageNumber);

  if ('fonts' in document) {
    (document.fonts as any).load(`1em p${pageNumber}-v2`).catch(() => {});
  }
}

function injectV4TajweedFont(pageNumber: number): void {
  const fontId = `qcf-v4-p${pageNumber}`;
  if (loadedV4Pages.has(pageNumber) || document.getElementById(fontId)) {
    loadedV4Pages.add(pageNumber);
    return;
  }

  const style = document.createElement('style');
  style.id = fontId;
  style.textContent = `
    @font-face {
      font-family: 'p${pageNumber}-v4';
      src: url('/api/fonts/qcf_v4/p${pageNumber}.woff2') format('woff2'),
           url('/fonts/qcf_v4/p${pageNumber}.woff2') format('woff2');
      font-display: swap;
    }
    @font-palette-values --Light {
      font-family: 'p${pageNumber}-v4';
      base-palette: 0;
    }
    @font-palette-values --Dark {
      font-family: 'p${pageNumber}-v4';
      base-palette: 1;
    }
    @font-palette-values --Sepia {
      font-family: 'p${pageNumber}-v4';
      base-palette: 2;
    }
  `;
  document.head.appendChild(style);
  loadedV4Pages.add(pageNumber);

  if ('fonts' in document) {
    (document.fonts as any).load(`1em p${pageNumber}-v4`).catch(() => {});
  }
}

export function preloadAdjacentQcfFonts(pageNumber: number, showTajweed: boolean = false): void {
  if (typeof window === 'undefined') return;
  const adjacent = [pageNumber - 1, pageNumber + 1].filter(p => p >= 1 && p <= 604);

  for (const p of adjacent) {
    injectV2Font(p);
    if (showTajweed) {
      injectV4TajweedFont(p);
    }
  }
}
