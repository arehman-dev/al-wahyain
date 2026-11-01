/**
 * Utility to dynamically inject and preload King Fahd Complex QCF V2 page fonts.
 * Each page 1..604 has a dedicated glyph font 'p{page}-v2' stored locally in /fonts/qcf_v2/p{page}.woff2
 */

const loadedPages = new Set<number>();

export function getQcfFontFamily(pageNumber?: number): string {
  if (!pageNumber || pageNumber < 1 || pageNumber > 604) {
    return "'KFGQPC HAFS Uthmanic Script', 'Amiri Quran', 'Scheherazade New', serif";
  }
  return `'p${pageNumber}-v2', 'KFGQPC HAFS Uthmanic Script', 'Amiri Quran', serif`;
}

export function loadQcfPageFont(pageNumber: number): Promise<void> {
  if (typeof window === 'undefined' || !pageNumber || pageNumber < 1 || pageNumber > 604) {
    return Promise.resolve();
  }

  const fontId = `qcf-v2-p${pageNumber}`;
  if (loadedPages.has(pageNumber) || document.getElementById(fontId)) {
    loadedPages.add(pageNumber);
    return Promise.resolve();
  }

  // Preload adjacent pages (p - 1, p + 1) for instant page turning
  preloadAdjacentQcfFonts(pageNumber);

  const style = document.createElement('style');
  style.id = fontId;
  style.textContent = `
    @font-face {
      font-family: 'p${pageNumber}-v2';
      src: url('/fonts/qcf_v2/p${pageNumber}.woff2') format('woff2');
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
  loadedPages.add(pageNumber);

  if ('fonts' in document) {
    return (document.fonts as any).load(`1em p${pageNumber}-v2`).then(() => {}).catch(() => {});
  }
  return Promise.resolve();
}

export function preloadAdjacentQcfFonts(pageNumber: number): void {
  if (typeof window === 'undefined') return;
  const adjacent = [pageNumber - 1, pageNumber + 1].filter(p => p >= 1 && p <= 604);

  for (const p of adjacent) {
    const id = `qcf-v2-p${p}`;
    if (!loadedPages.has(p) && !document.getElementById(id)) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = `/fonts/qcf_v2/p${p}.woff2`;
      document.head.appendChild(link);

      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
        @font-face {
          font-family: 'p${p}-v2';
          src: url('/fonts/qcf_v2/p${p}.woff2') format('woff2');
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
      loadedPages.add(p);
    }
  }
}
