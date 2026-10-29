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
 * Injects highlights into HTML text while avoiding HTML tags.
 */
export function applyHighlightsToHtml(
  html: string,
  highlights: TafsirHighlight[]
): string {
  if (!html || !highlights || highlights.length === 0) return html;

  let result = html;

  for (const hl of highlights) {
    if (!hl.text || hl.text.length < 2) continue;
    
    const escaped = escapeRegExp(hl.text.trim());
    const style = HIGHLIGHT_STYLES[hl.color] || HIGHLIGHT_STYLES.yellow;

    // Replace occurrences that are NOT inside HTML tags
    // Matches text outside <...>
    const regex = new RegExp(`(?![^<]*>)(${escaped})`, 'gi');
    result = result.replace(regex, (match) => {
      return `<mark data-highlight-id="${hl.id}" class="${style.mark} cursor-pointer transition-all hover:opacity-80" title="ہائی لائٹ حذف کرنے کے لیے کلک کریں">${match}</mark>`;
    });
  }

  return result;
}
