// Mapping of common Urdu/Arabic Surah names to their Surah IDs
export const SURAH_NAME_TO_ID: Record<string, number> = {
  'فاتحہ': 1, 'الفاتحة': 1, 'الفاتحہ': 1,
  'بقرہ': 2, 'البقرة': 2, 'البقرۃ': 2, 'البقرہ': 2,
  'آل عمران': 3, 'عمران': 3,
  'نساء': 4, 'النساء': 4,
  'مائدہ': 5, 'المائدة': 5, 'المائدۃ': 5,
  'انعام': 6, 'الأنعام': 6, 'الانعام': 6,
  'اعراف': 7, 'الأعراف': 7, 'الاعراف': 7,
  'انفال': 8, 'الأنفال': 8, 'الانفال': 8,
  'توبہ': 9, 'التوبة': 9, 'التوبۃ': 9,
  'یونس': 10,
  'ہود': 11, 'هود': 11,
  'یوسف': 12,
  'رعد': 13, 'الرعد': 13,
  'ابراہیم': 14,
  'حجر': 15, 'الحجر': 15,
  'نحل': 16, 'النحل': 16,
  'اسراء': 17, 'الإسراء': 17, 'بنی اسرائیل': 17,
  'کہف': 18, 'الكهف': 18,
  'مریم': 19, 'مريم': 19,
  'طہ': 20, 'طه': 20,
  'انبیاء': 21, 'الأنبياء': 21,
  'حج': 22, 'الحج': 22,
  'مؤمنون': 23, 'المؤمنون': 23,
  'نور': 24, 'النور': 24,
  'فرقان': 25, 'الفرقان': 25,
  'شعراء': 26, 'الشعراء': 26,
  'نمل': 27, 'النمل': 27,
  'قصص': 28, 'القصص': 28,
  'عنکبوت': 29, 'العنكبوت': 29,
  'روم': 30, 'الروم': 30,
  'لقمان': 31,
  'سجدہ': 32, 'السجدة': 32,
  'احزاب': 33, 'الأحزاب': 33,
  'سبا': 34, 'سبأ': 34,
  'فاطر': 35,
  'یس': 36, 'يس': 36,
  'صافات': 37, 'الصافات': 37,
  'ص': 38,
  'زمر': 39, 'الزمر': 39,
  'مؤمن': 40, 'غافر': 40,
  'فصلت': 41, 'حم السجدہ': 41,
  'شوریٰ': 42, 'الشورى': 42,
  'زخرف': 43, 'الزخرف': 43,
  'دخان': 44, 'الدخان': 44,
  'جاثیہ': 45, 'الجاثية': 45,
  'احقاف': 46, 'الأحقاف': 46,
  'محمد': 47,
  'فتح': 48, 'الفتح': 48,
  'حجرات': 49, 'الحجرات': 49,
  'ق': 50,
  'ذاریات': 51, 'الذاريات': 51,
  'طور': 52, 'الطور': 52,
  'نجم': 53, 'النجم': 53,
  'قمر': 54, 'القمر': 54,
  'رحمٰن': 55, 'الرحمن': 55, 'الرحمٰن': 55,
  'واقعہ': 56, 'الواقعة': 56,
  'حدید': 57, 'الحديد': 57
};

export interface ParsedQuranRef {
  raw: string;
  surahId: number;
  ayahNumber: number;
  displayText: string;
}

/**
 * Detects Quran citations like:
 * - [15-الحجر:49]
 * - [6-الأنعام:165]
 * - (56: 82)
 * - (2:255)
 * - [البقرۃ: 255]
 */
export function enhanceTafsirHtml(
  html: string,
  onNavigateAttr: string = 'data-quran-ref'
): string {
  if (!html) return '';

  let processed = html;

  // 1. Match bracketed numeric references like [15-الحجر:49] or [40-غافر:16] or [114-الناس:1-2]
  // Pattern: \[(\d+)[-–]([^:\]]+):(\d+)(?:-\d+)?\]
  processed = processed.replace(
    /\[(\d+)[-–]([^:\]]+):(\d+)(?:-\d+)?\]/g,
    (match, sId, sName, aNum) => {
      const surahId = parseInt(sId, 10);
      const ayahNum = parseInt(aNum, 10);
      if (surahId >= 1 && surahId <= 114) {
        return `<button type="button" class="quran-ref-btn inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/70 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-semibold font-ibm cursor-pointer transition-all" ${onNavigateAttr}="${surahId}:${ayahNum}">📖 ${sName.trim()} ${surahId}:${ayahNum}</button>`;
      }
      return match;
    }
  );

  // 2. Match parenthesized verse references like (56: 82), (12: 41), (40:60), (2:255)
  // Pattern: \(([1-9]\d{0,2})\s*:\s*(\d{1,3})\)
  processed = processed.replace(
    /\(([1-9]\d{0,2})\s*:\s*(\d{1,3})\)/g,
    (match, sId, aNum) => {
      const surahId = parseInt(sId, 10);
      const ayahNum = parseInt(aNum, 10);
      if (surahId >= 1 && surahId <= 114 && ayahNum >= 1 && ayahNum <= 286) {
        return `<button type="button" class="quran-ref-btn inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/70 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-semibold font-mono cursor-pointer transition-all" ${onNavigateAttr}="${surahId}:${ayahNum}">📖 ${surahId}:${ayahNum}</button>`;
      }
      return match;
    }
  );

  // 3. Match bracketed Hadith references like [صحیح بخاری:4804] or [صحیح مسلم:395]
  processed = processed.replace(
    /\[(صحیح\s*بخاری|صحیح\s*مسلم|مسند\s*احمد|سنن\s*ترمذی|سنن\s*ابن\s*ماجہ|سنن\s*ابوداؤد)[^\]]*\]/g,
    (match) => {
      return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-semibold font-ibm">${match}</span>`;
    }
  );

  return processed;
}
