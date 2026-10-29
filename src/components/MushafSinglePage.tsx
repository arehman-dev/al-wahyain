import React from 'react';
import { Ayah, Surah, ScriptMode } from '../types/quran';
import { toArabicDigits, getJuzForPage, JUZ_NAMES_AR } from '../utils/juzMapping';
import { RUKU_END_AYAHS, QUARTER_AYAHS, SAJDAH_AYAHS, getManzilForSurah } from '../utils/mushafLayout';
import { InteractiveWord } from './WordTooltip';

interface MushafSinglePageProps {
  pageNumber: number;
  pageVerses: Ayah[];
  currentSurah?: Surah;
  currentAyahNumber: number;
  scriptMode: ScriptMode;
  showTajweed: boolean;
  isPlaying: boolean;
  activePlayingAyah: number | null;
  activePlayingWordIndex: number | null;
  onSelectAyah: (num: number) => void;
  onSelectWordRoot?: (root: string) => void;
  isLeftSpreadPage?: boolean;
}

export const MushafSinglePage: React.FC<MushafSinglePageProps> = ({
  pageNumber,
  pageVerses,
  currentSurah,
  currentAyahNumber,
  scriptMode,
  showTajweed,
  isPlaying,
  activePlayingAyah,
  activePlayingWordIndex,
  onSelectAyah,
  onSelectWordRoot,
  isLeftSpreadPage = false
}) => {
  const activeJuzNum = getJuzForPage(pageNumber);
  const activeJuzName = JUZ_NAMES_AR[activeJuzNum] || `الجزء ${toArabicDigits(activeJuzNum)}`;
  const hasFirstAyah = pageVerses.some(a => a.ayah_number === 1);
  const manzil = currentSurah ? getManzilForSurah(currentSurah.id) : { manzil: 1, label: 'منزل ۱' };

  // Collect margin ornaments on this page
  const pageRukus = pageVerses
    .map(a => {
      const key = `${a.surah_id}:${a.ayah_number}`;
      const ruku = RUKU_END_AYAHS[key];
      return ruku ? { ayah: a, ruku } : null;
    })
    .filter(Boolean);

  const pageQuarters = pageVerses
    .map(a => {
      const key = `${a.surah_id}:${a.ayah_number}`;
      const q = QUARTER_AYAHS[key];
      return q ? { ayah: a, quarter: q } : null;
    })
    .filter(Boolean);

  const pageSajdahs = pageVerses
    .map(a => {
      const key = `${a.surah_id}:${a.ayah_number}`;
      const s = SAJDAH_AYAHS[key];
      return s ? { ayah: a, sajdah: s } : null;
    })
    .filter(Boolean);

  return (
    <div className="relative flex flex-col justify-between bg-[#fdfbf7] dark:bg-[#0b1329] border-[6px] border-emerald-900/30 dark:border-emerald-600/30 rounded-3xl p-4 sm:p-7 shadow-2xl transition-all select-none font-arabic min-h-[640px]">
      
      {/* Decorative Traditional Islamic Corner Accents */}
      <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-emerald-800/50 dark:border-emerald-500/50 pointer-events-none" />
      <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-emerald-800/50 dark:border-emerald-500/50 pointer-events-none" />
      <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-emerald-800/50 dark:border-emerald-500/50 pointer-events-none" />
      <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-emerald-800/50 dark:border-emerald-500/50 pointer-events-none" />

      {/* 1. TOP HEADER FRAME: Juz Banner, Surah Name, Page Number */}
      <div className="pb-3 mb-4 border-b-2 border-emerald-800/25 dark:border-emerald-500/25 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
        <span className="text-emerald-900 dark:text-emerald-300 font-bold">
          {activeJuzName}
        </span>
        <span className="text-base sm:text-lg text-emerald-800 dark:text-emerald-400 font-extrabold tracking-wide">
          ۞ {currentSurah?.name_arabic || 'سورة'} ۞
        </span>
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
          صفحة {toArabicDigits(pageNumber)}
        </span>
      </div>

      {/* 2. SURAH ORNAMENTAL BANNER & BISMILLAH (If Ayah 1 is on this page) */}
      {hasFirstAyah && (
        <div className="my-3 select-none text-center">
          <div className="mx-auto max-w-sm border-2 border-emerald-700/50 dark:border-emerald-500/40 rounded-2xl py-2 px-4 bg-emerald-50/80 dark:bg-emerald-950/50 shadow-xs">
            <div className="font-bold text-xl sm:text-2xl text-emerald-950 dark:text-emerald-200">
              {currentSurah?.name_arabic || 'سورة'}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              {currentSurah?.revelation_place === 'makkah' ? 'مَكِّيَّةٌ' : 'مَدَنِيَّةٌ'} • {toArabicDigits(currentSurah?.verses_count || 0)} آيَاتٍ
            </div>
          </div>

          {/* Bismillah Calligraphy (except Surah 9) */}
          {currentSurah?.id !== 9 && (
            <div className="font-arabic text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          )}
        </div>
      )}

      {/* 3. MAIN 15-LINE TEXT CANVAS WITH JUSTIFIED FLOW & MARGIN ORNAMENTS */}
      <div className="relative flex-1 my-2">
        
        {/* Margin Ornaments Floating Column (Rukus, Quarters, Sajdahs) */}
        {(pageRukus.length > 0 || pageQuarters.length > 0 || pageSajdahs.length > 0) && (
          <div className={`hidden md:flex flex-col gap-2 absolute top-0 ${isLeftSpreadPage ? '-left-12' : '-right-12'} z-20`}>
            {/* Ruku Ornaments */}
            {pageRukus.map((item: any, idx) => (
              <div
                key={`ruku-${idx}`}
                title={`رکوع ${item.ruku.surahRuku} • آیات: ${item.ruku.count}`}
                className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-600 dark:border-emerald-400 flex flex-col items-center justify-center text-emerald-900 dark:text-emerald-200 shadow-md cursor-help animate-in fade-in"
              >
                <span className="text-[8px] font-mono font-bold leading-none -mb-0.5">
                  {toArabicDigits(item.ruku.surahRuku)}
                </span>
                <span className="text-xs font-bold leading-none font-arabic">
                  ع
                </span>
                <span className="text-[8px] font-mono leading-none -mt-0.5 opacity-80">
                  {toArabicDigits(item.ruku.count)}
                </span>
              </div>
            ))}

            {/* Quarters (Rub' al-Hizb) */}
            {pageQuarters.map((item: any, idx) => (
              <div
                key={`quarter-${idx}`}
                title={item.quarter.labelUrdu}
                className="px-2 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-500 text-amber-900 dark:text-amber-200 text-[10px] font-bold text-center shadow-xs flex items-center gap-1 font-ibm"
              >
                <span>۞</span>
                <span>{item.quarter.labelUrdu.split(':')[0]}</span>
              </div>
            ))}

            {/* Sajdah Tilawat Banner */}
            {pageSajdahs.map((item: any, idx) => (
              <div
                key={`sajdah-${idx}`}
                title="سجدہ تلاوت"
                className="px-2 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/80 border border-purple-500 text-purple-900 dark:text-purple-200 text-[10px] font-bold text-center shadow-xs flex items-center gap-1 font-ibm"
              >
                <span>۩</span>
                <span>سجدہ</span>
              </div>
            ))}
          </div>
        )}

        {/* 15-Line Body Text with Authentic Justification */}
        <div 
          className="tajweed-text text-justify text-2xl sm:text-[27px] leading-[3.1] sm:leading-[3.4] font-arabic space-x-reverse space-x-1 select-text text-slate-900 dark:text-slate-100"
          style={{ textJustify: 'inter-word' }}
        >
          {pageVerses.map((ayah) => {
            const isSelected = currentAyahNumber === ayah.ayah_number;
            const isAyahPlaying = isPlaying && activePlayingAyah === ayah.ayah_number;
            const hasSajdah = !!SAJDAH_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];
            const hasRukuEnd = !!RUKU_END_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];

            let displayText = ayah.text_uthmani;
            if (ayah.ayah_number === 1 && currentSurah?.id !== 1 && currentSurah?.id !== 9) {
              displayText = displayText.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, '');
            }

            return (
              <span
                key={ayah.id}
                onClick={() => onSelectAyah(ayah.ayah_number)}
                className={`cursor-pointer transition-all duration-150 px-1 py-0.5 rounded-lg inline ${
                  isSelected
                    ? 'bg-emerald-200/90 dark:bg-emerald-950 text-slate-950 dark:text-white ring-2 ring-emerald-500 shadow-sm'
                    : isAyahPlaying
                    ? 'bg-amber-200/90 dark:bg-amber-950 text-slate-950 dark:text-white ring-1 ring-amber-400'
                    : 'hover:bg-emerald-100/60 dark:hover:bg-slate-800/80'
                } ${hasSajdah ? 'border-b-2 border-purple-500' : ''}`}
              >
                {/* Words with Tooltip Support */}
                {ayah.words && ayah.words.length > 0 && !showTajweed ? (
                  ayah.words.map((w, wIdx) => {
                    const isWordActive = isAyahPlaying && activePlayingWordIndex === wIdx;
                    return (
                      <InteractiveWord
                        key={w.id}
                        word={w}
                        scriptMode={scriptMode}
                        onSelectRoot={onSelectWordRoot}
                        isActive={isWordActive}
                      />
                    );
                  })
                ) : showTajweed ? (
                  <span dangerouslySetInnerHTML={{ __html: ayah.text_tajweed }} />
                ) : scriptMode === 'indopak' ? (
                  <span className="font-indopak">{ayah.text_indopak}</span>
                ) : (
                  <span>{displayText}</span>
                )}

                {/* Ayah End Number Marker */}
                <span className="ayah-end-num select-none">
                  ﴿{toArabicDigits(ayah.ayah_number)}﴾
                </span>

                {/* Inline Ruku Ayn Indicator for mobile or inline visibility */}
                {hasRukuEnd && (
                  <span 
                    title="ختم رکوع"
                    className="inline-flex items-center justify-center w-5 h-5 mx-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40 select-none align-middle"
                  >
                    ع
                  </span>
                )}

                {/* Inline Sajdah Indicator */}
                {hasSajdah && (
                  <span 
                    title="سجدہ تلاوت"
                    className="inline-flex items-center justify-center px-1 mx-0.5 rounded bg-purple-100 dark:bg-purple-950 text-[10px] text-purple-800 dark:text-purple-300 font-bold border border-purple-500/40 select-none align-middle"
                  >
                    ۩ سجدہ
                  </span>
                )}
              </span>
            );
          })}
        </div>

      </div>

      {/* 4. BOTTOM FOOTER FRAME: Page Number & Manzil */}
      <div className="pt-3 mt-4 border-t-2 border-emerald-800/25 dark:border-emerald-500/25 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 select-none font-ibm">
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold">
          {manzil.label}
        </span>
        <span className="font-arabic text-sm text-slate-700 dark:text-slate-300 font-bold">
          ـ ﴿ {toArabicDigits(pageNumber)} ﴾ ـ
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          صفحہ {pageNumber}
        </span>
      </div>

    </div>
  );
};
