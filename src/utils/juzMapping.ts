export const JUZ_NAMES_AR = [
  "",
  "الجزء الأول (الم)",
  "الجزء الثاني (سيقول)",
  "الجزء الثالث (تلك الرسل)",
  "الجزء الرابع (لن تنالوا)",
  "الجزء الخامس (والمحصنات)",
  "الجزء السادس (لا يحب الله)",
  "الجزء السابع (وإذا سمعوا)",
  "الجزء الثامن (ولو أننا)",
  "الجزء التاسع (قال الملأ)",
  "الجزء العاشر (واعلموا)",
  "الجزء الحادي عشر (يعتذرون)",
  "الجزء الثاني عشر (وما من دابة)",
  "الجزء الثالث عشر (وما أبرئ)",
  "الجزء الرابع عشر (ربما)",
  "الجزء الخامس عشر (سبحان الذي)",
  "الجزء السادس عشر (قال ألم)",
  "الجزء السابع عشر (اقترب)",
  "الجزء الثامن عشر (قد أفلح)",
  "الجزء التاسع عشر (وقال الذين)",
  "الجزء العشرون (أمن خلق)",
  "الجزء الحادي والعشرون (اتل ما أوحي)",
  "الجزء الثاني والعشرون (ومن يقنت)",
  "الجزء الثالث والعشرون (وما لي)",
  "الجزء الرابع والعشرون (فمن أظلم)",
  "الجزء الخامس والعشرون (إليه يرد)",
  "الجزء السادس والعشرون (حم)",
  "الجزء السابع والعشرون (قال فما خطبكم)",
  "الجزء الثامن والعشرون (قد سمع الله)",
  "الجزء التاسع والعشرون (تبارك الذي)",
  "الجزء الثلاثون (عمّ)"
];

// Rough or standard page to Juz mapping for the 604-page Madani Mushaf
export function getJuzForPage(page: number): number {
  if (page <= 21) return 1;
  if (page <= 41) return 2;
  if (page <= 61) return 3;
  if (page <= 81) return 4;
  if (page <= 101) return 5;
  if (page <= 121) return 6;
  if (page <= 141) return 7;
  if (page <= 161) return 8;
  if (page <= 181) return 9;
  if (page <= 201) return 10;
  if (page <= 221) return 11;
  if (page <= 241) return 12;
  if (page <= 261) return 13;
  if (page <= 281) return 14;
  if (page <= 301) return 15;
  if (page <= 321) return 16;
  if (page <= 341) return 17;
  if (page <= 361) return 18;
  if (page <= 381) return 19;
  if (page <= 401) return 20;
  if (page <= 421) return 21;
  if (page <= 441) return 22;
  if (page <= 461) return 23;
  if (page <= 481) return 24;
  if (page <= 501) return 25;
  if (page <= 521) return 26;
  if (page <= 541) return 27; // Surah 55 (pages 531-534) is here!
  if (page <= 561) return 28;
  if (page <= 581) return 29;
  return 30;
}

export function toArabicDigits(num: number): string {
  const arabicDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, (d) => arabicDigits[parseInt(d, 10)]);
}
