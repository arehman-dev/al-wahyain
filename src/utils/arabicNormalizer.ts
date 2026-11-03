/**
 * Arabic Normalization & Tashkeel Utilities for Precision Lexical Search.
 * Pure functional, zero external dependencies.
 */

export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Remove Tashkeel (Fathah, Dammah, Kasrah, Sukun, Shaddah, Tanween, dagger alif)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alefs (أ, إ, آ, ء, ؤ, ئ -> ا)
    .replace(/[إأآءؤئ]/g, 'ا')
    // Normalize Alif Maqsurah (ى -> ي)
    .replace(/ى/g, 'ي')
    // Normalize Ta Marbuta (ة -> ه)
    .replace(/ة/g, 'ه')
    // Strip Quranic Waqf symbols (ۖ ۗ ۚ ۛ ۜ ۞ ۟ ۠ ۡ ۢ)
    .replace(/[\u06D6-\u06ED]/g, '')
    // Normalize Persian/Urdu Yeh and Kaf if any
    .replace(/ی/g, 'ي')
    .replace(/ک/g, 'ك')
    .trim();
}

/**
 * Checks if a string contains Arabic diacritical marks (Tashkeel).
 */
export function hasTashkeel(text: string): boolean {
  if (!text) return false;
  return /[\u064B-\u065F\u0670]/.test(text);
}

/**
 * Check if word matches exact diacritics / vowels.
 */
export function isStrictVowelMatch(target: string, pattern: string): boolean {
  if (!target || !pattern) return false;
  return target.includes(pattern);
}
