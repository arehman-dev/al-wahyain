import { toArabicDigits } from './juzMapping';

export interface RukuInfo {
  surahId: number;
  ayahNumber: number;
  surahRuku: number;
  ayahsInRuku: number;
  juzRuku?: number;
}

export interface QuarterInfo {
  surahId: number;
  ayahNumber: number;
  type: 'rub' | 'nisf' | 'thalatha' | 'juz';
  labelUrdu: string;
}

export interface SajdahInfo {
  surahId: number;
  ayahNumber: number;
  number: number;
}

// 1. Classical Rukus for Seeded Surahs (1, 2, 3, 4, 55, 56, 57)
export const RUKU_END_AYAHS: Record<string, { surahRuku: number; count: number }> = {
  // Surah 1 (1 ruku)
  '1:7': { surahRuku: 1, count: 7 },

  // Surah 2 (40 rukus)
  '2:7': { surahRuku: 1, count: 7 },
  '2:20': { surahRuku: 2, count: 13 },
  '2:29': { surahRuku: 3, count: 9 },
  '2:39': { surahRuku: 4, count: 10 },
  '2:46': { surahRuku: 5, count: 7 },
  '2:59': { surahRuku: 6, count: 13 },
  '2:61': { surahRuku: 7, count: 2 },
  '2:71': { surahRuku: 8, count: 10 },
  '2:82': { surahRuku: 9, count: 11 },
  '2:86': { surahRuku: 10, count: 4 },
  '2:96': { surahRuku: 11, count: 10 },
  '2:103': { surahRuku: 12, count: 7 },
  '2:112': { surahRuku: 13, count: 9 },
  '2:121': { surahRuku: 14, count: 9 },
  '2:129': { surahRuku: 15, count: 8 },
  '2:141': { surahRuku: 16, count: 12 },
  '2:152': { surahRuku: 17, count: 11 },
  '2:163': { surahRuku: 18, count: 11 },
  '2:167': { surahRuku: 19, count: 4 },
  '2:176': { surahRuku: 20, count: 9 },
  '2:182': { surahRuku: 21, count: 6 },
  '2:188': { surahRuku: 22, count: 6 },
  '2:196': { surahRuku: 23, count: 8 },
  '2:202': { surahRuku: 24, count: 6 },
  '2:210': { surahRuku: 25, count: 8 },
  '2:216': { surahRuku: 26, count: 6 },
  '2:221': { surahRuku: 27, count: 5 },
  '2:228': { surahRuku: 28, count: 7 },
  '2:229': { surahRuku: 29, count: 1 },
  '2:231': { surahRuku: 30, count: 2 },
  '2:235': { surahRuku: 31, count: 4 },
  '2:242': { surahRuku: 32, count: 7 },
  '2:253': { surahRuku: 33, count: 11 },
  '2:257': { surahRuku: 34, count: 4 },
  '2:260': { surahRuku: 35, count: 3 },
  '2:266': { surahRuku: 36, count: 6 },
  '2:273': { surahRuku: 37, count: 7 },
  '2:277': { surahRuku: 38, count: 4 },
  '2:281': { surahRuku: 39, count: 4 },
  '2:283': { surahRuku: 40, count: 2 },
  '2:286': { surahRuku: 40, count: 3 },

  // Surah 3 (20 rukus)
  '3:9': { surahRuku: 1, count: 9 },
  '3:20': { surahRuku: 2, count: 11 },
  '3:30': { surahRuku: 3, count: 10 },
  '3:41': { surahRuku: 4, count: 11 },
  '3:54': { surahRuku: 5, count: 13 },
  '3:63': { surahRuku: 6, count: 9 },
  '3:71': { surahRuku: 7, count: 8 },
  '3:80': { surahRuku: 8, count: 9 },
  '3:91': { surahRuku: 9, count: 11 },
  '3:101': { surahRuku: 10, count: 10 },
  '3:109': { surahRuku: 11, count: 8 },
  '3:120': { surahRuku: 12, count: 11 },
  '3:129': { surahRuku: 13, count: 9 },
  '3:143': { surahRuku: 14, count: 14 },
  '3:148': { surahRuku: 15, count: 5 },
  '3:155': { surahRuku: 16, count: 7 },
  '3:171': { surahRuku: 17, count: 16 },
  '3:180': { surahRuku: 18, count: 9 },
  '3:189': { surahRuku: 19, count: 9 },
  '3:200': { surahRuku: 20, count: 11 },

  // Surah 4 (24 rukus)
  '4:10': { surahRuku: 1, count: 10 },
  '4:14': { surahRuku: 2, count: 4 },
  '4:22': { surahRuku: 3, count: 8 },
  '4:25': { surahRuku: 4, count: 3 },
  '4:33': { surahRuku: 5, count: 8 },
  '4:42': { surahRuku: 6, count: 9 },
  '4:50': { surahRuku: 7, count: 8 },
  '4:59': { surahRuku: 8, count: 9 },
  '4:70': { surahRuku: 9, count: 11 },
  '4:76': { surahRuku: 10, count: 6 },
  '4:87': { surahRuku: 11, count: 11 },
  '4:91': { surahRuku: 12, count: 4 },
  '4:96': { surahRuku: 13, count: 5 },
  '4:100': { surahRuku: 14, count: 4 },
  '4:104': { surahRuku: 15, count: 4 },
  '4:112': { surahRuku: 16, count: 8 },
  '4:126': { surahRuku: 17, count: 14 },
  '4:134': { surahRuku: 18, count: 8 },
  '4:141': { surahRuku: 19, count: 7 },
  '4:147': { surahRuku: 20, count: 6 },
  '4:152': { surahRuku: 21, count: 5 },
  '4:162': { surahRuku: 22, count: 10 },
  '4:171': { surahRuku: 23, count: 9 },
  '4:176': { surahRuku: 24, count: 5 },

  // Surah 55 (3 rukus)
  '55:25': { surahRuku: 1, count: 25 },
  '55:45': { surahRuku: 2, count: 20 },
  '55:78': { surahRuku: 3, count: 33 },

  // Surah 56 (3 rukus)
  '56:38': { surahRuku: 1, count: 38 },
  '56:74': { surahRuku: 2, count: 36 },
  '56:96': { surahRuku: 3, count: 22 },

  // Surah 57 (4 rukus)
  '57:10': { surahRuku: 1, count: 10 },
  '57:19': { surahRuku: 2, count: 9 },
  '57:25': { surahRuku: 3, count: 6 },
  '57:29': { surahRuku: 4, count: 4 }
};

// 2. Quarters (Rub' al-Hizb ۞)
export const QUARTER_AYAHS: Record<string, { type: 'rub' | 'nisf' | 'thalatha' | 'juz'; labelUrdu: string }> = {
  '1:1': { type: 'juz', labelUrdu: 'پارہ ۱: الم' },
  '2:25': { type: 'rub', labelUrdu: 'ربع پارہ (۱/۴)' },
  '2:44': { type: 'nisf', labelUrdu: 'نصف پارہ (۱/۲)' },
  '2:60': { type: 'thalatha', labelUrdu: 'ثلاثہ پارہ (۳/۴)' },
  '2:75': { type: 'juz', labelUrdu: 'الحزب ۲' },
  '2:92': { type: 'rub', labelUrdu: 'ربع' },
  '2:106': { type: 'nisf', labelUrdu: 'نصف' },
  '2:124': { type: 'thalatha', labelUrdu: 'ثلاثہ' },
  '2:142': { type: 'juz', labelUrdu: 'پارہ ۲: سَيَقُولُ' },
  '2:158': { type: 'rub', labelUrdu: 'ربع' },
  '2:177': { type: 'nisf', labelUrdu: 'نصف' },
  '2:189': { type: 'thalatha', labelUrdu: 'ثلاثہ' },
  '2:203': { type: 'juz', labelUrdu: 'الحزب ۴' },
  '2:219': { type: 'rub', labelUrdu: 'ربع' },
  '2:233': { type: 'nisf', labelUrdu: 'نصف' },
  '2:243': { type: 'thalatha', labelUrdu: 'ثلاثہ' },
  '2:253': { type: 'juz', labelUrdu: 'پارہ ۳: تِلْكَ الرُّسُلُ' },
  '3:93': { type: 'juz', labelUrdu: 'پارہ ۴: لَنْ تَنَالُوا' },
  '4:24': { type: 'juz', labelUrdu: 'پارہ ۵: وَالْمُحْصَنَاتُ' },
  '4:148': { type: 'juz', labelUrdu: 'پارہ ۶: لَا يُحِبُّ اللَّهُ' },
  '55:1': { type: 'juz', labelUrdu: 'پارہ ۲۷: قَالَ فَمَا خَطْبُكُمْ' }
};

// 3. Sajdah Tilawat verses (14-15 classical verses)
export const SAJDAH_AYAHS: Record<string, { number: number; type: string }> = {
  '7:206': { number: 1, type: 'وجوب' },
  '13:15': { number: 2, type: 'وجوب' },
  '16:50': { number: 3, type: 'وجوب' },
  '17:109': { number: 4, type: 'وجوب' },
  '19:58': { number: 5, type: 'وجوب' },
  '22:18': { number: 6, type: 'وجوب' },
  '22:77': { number: 7, type: 'وجوب' },
  '25:60': { number: 8, type: 'وجوب' },
  '27:26': { number: 9, type: 'وجوب' },
  '32:15': { number: 10, type: 'وجوب' },
  '38:24': { number: 11, type: 'وجوب' },
  '41:38': { number: 12, type: 'وجوب' },
  '53:62': { number: 13, type: 'وجوب' },
  '84:21': { number: 14, type: 'وجوب' },
  '96:19': { number: 15, type: 'وجوب' }
};

// 4. Manzil mapping (7 Manzils)
export function getManzilForSurah(surahId: number): { manzil: number; label: string } {
  if (surahId <= 4) return { manzil: 1, label: 'منزل ۱' };
  if (surahId <= 9) return { manzil: 2, label: 'منزل ۲' };
  if (surahId <= 16) return { manzil: 3, label: 'منزل ۳' };
  if (surahId <= 25) return { manzil: 4, label: 'منزل ۴' };
  if (surahId <= 36) return { manzil: 5, label: 'منزل ۵' };
  if (surahId <= 49) return { manzil: 6, label: 'منزل ۶' };
  return { manzil: 7, label: 'منزل ۷' };
}
