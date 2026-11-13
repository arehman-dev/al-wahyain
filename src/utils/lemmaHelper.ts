/**
 * Quranic Arabic Corpus / Buckwalter Transliteration Decoder
 * Converts raw morphological lemma codes into authentic Arabic script with Tashkeel.
 */

export function decodeCorpusLemma(raw?: string | null): string {
  if (!raw) return '';

  let s = raw.trim();
  if (!s) return '';

  // 1. Convert phonetic vowels and diacritical marks
  s = s.replace(/~/g, '\u0651'); // Shadda (ّ)
  s = s.replace(/a/g, '\u064E'); // Fatha (َ)
  s = s.replace(/u/g, '\u064F'); // Damma (ُ)
  s = s.replace(/i/g, '\u0650'); // Kasra (ِ)
  s = s.replace(/o/g, '\u0652'); // Sukun (ْ)
  s = s.replace(/\^/g, '\u0653'); // Maddah (ٓ)
  s = s.replace(/F/g, '\u064B'); // Tanwin Fath (ً)
  s = s.replace(/N/g, '\u064C'); // Tanwin Damm (ٌ)
  s = s.replace(/K/g, '\u064D'); // Tanwin Kasr (ٍ)
  s = s.replace(/p/g, 'ة');      // Ta Marbuta (ة)

  // 2. Remove annotation metadata artifacts
  s = s.replace(/[\r\n#@\[\]_0-9]/g, '');

  return s.trim();
}
