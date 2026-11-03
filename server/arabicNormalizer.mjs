export function normalizeArabic(text) {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآءؤئ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u06D6-\u06ED]/g, '')
    .replace(/ی/g, 'ي')
    .replace(/ک/g, 'ك')
    .trim();
}

export function hasTashkeel(text) {
  if (!text) return false;
  return /[\u064B-\u065F\u0670]/.test(text);
}
