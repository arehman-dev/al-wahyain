import { TafsirHighlight, HighlightColor } from '../types/quran';

export const HIGHLIGHT_STYLES: Record<HighlightColor, { badge: string; mark: string; label: string }> = {
  yellow: {
    badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800',
    mark: 'bg-amber-200/90 dark:bg-amber-900/60 text-slate-950 dark:text-amber-100 rounded px-1 py-0.5 shadow-2xs font-medium',
    label: 'سنہری (Yellow)'
  },
  green: {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800',
    mark: 'bg-emerald-200/90 dark:bg-emerald-900/60 text-slate-950 dark:text-emerald-100 rounded px-1 py-0.5 shadow-2xs font-medium',
    label: 'سبز (Green)'
  },
  blue: {
    badge: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-800',
    mark: 'bg-sky-200/90 dark:bg-sky-900/60 text-slate-950 dark:text-sky-100 rounded px-1 py-0.5 shadow-2xs font-medium',
    label: 'نیلا (Blue)'
  },
  purple: {
    badge: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-200 dark:border-purple-800',
    mark: 'bg-purple-200/90 dark:bg-purple-900/60 text-slate-950 dark:text-purple-100 rounded px-1 py-0.5 shadow-2xs font-medium',
    label: 'جامنی (Purple)'
  }
};

/**
 * Escapes regex special characters.
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Injects highlights into HTML text while safely avoiding HTML tags & inner attributes.
 * Splits HTML into tokens: tags vs text blocks, only replacing in pure text blocks.
 */
export function applyHighlightsToHtml(
  html: string,
  highlights: TafsirHighlight[]
): string {
  if (!html || !highlights || highlights.length === 0) return html;

  // Split HTML into alternating array of text and tags
  // Even indexes: plain text outside tags
  // Odd indexes: full HTML tag e.g. <p class="...">
  const tokens = html.split(/(<[^>]+>)/g);

  for (const hl of highlights) {
    if (!hl.text || hl.text.trim().length < 2) continue;

    const trimmed = hl.text.trim();
    // Normalize spaces to match arbitrary HTML whitespace
    const words = trimmed.split(/\s+/).map(w => escapeRegExp(w));
    if (words.length === 0) continue;

    const pattern = words.join('\\s+');
    const regex = new RegExp(`(${pattern})`, 'gi');
    const style = HIGHLIGHT_STYLES[hl.color] || HIGHLIGHT_STYLES.yellow;

    for (let i = 0; i < tokens.length; i += 2) {
      if (!tokens[i]) continue;
      tokens[i] = tokens[i].replace(regex, (match) => {
        return `<mark data-highlight-id="${hl.id}" class="${style.mark} cursor-pointer transition-all hover:opacity-80" title="ہائی لائٹ حذف کرنے کے لیے کلک کریں">${match}</mark>`;
      });
    }
  }

  return tokens.join('');
}
