import React, { useState, useEffect } from 'react';
import { Ayah, Surah, ScriptMode, PageData } from '../types/quran';
import { toArabicDigits, getJuzForPage, JUZ_NAMES_AR } from '../utils/juzMapping';
import { RUKU_END_AYAHS, QUARTER_AYAHS, SAJDAH_AYAHS, getManzilForSurah } from '../utils/mushafLayout';
import { InteractiveWord } from './WordTooltip';
import { fetchPageData } from '../services/api';
import { loadQcfPageFont, getQcfFontFamily } from '../utils/qcfFontLoader';

interface MushafSinglePageProps {
  pageNumber: number;
  pageVerses: Ayah[];
  currentSurah?: Surah;
  currentAyahNumber: number;
  scriptMode?: ScriptMode;
  showTajweed: boolean;
  isPlaying: boolean;
  activePlayingAyah: number | null;
  activePlayingWordIndex: number | null;
  onSelectAyah: (num: number, surahId?: number) => void;
  onSelectWordRoot?: (root: string) => void;
  fontSize?: number;
}

export const MushafSinglePage: React.FC<MushafSinglePageProps> = ({
  pageNumber,
  pageVerses,
  currentSurah,
  currentAyahNumber,
  showTajweed,
  isPlaying,
  activePlayingAyah,
  activePlayingWordIndex,
  onSelectAyah,
  onSelectWordRoot
}) => {
  const [pageData, setPageData] = useState<PageData | null>(null);

  // Dynamic QCF V2 / V4 Tajweed Font Loader for active and adjacent pages
  useEffect(() => {
    loadQcfPageFont(pageNumber, showTajweed);
  }, [pageNumber, showTajweed]);

  // Fetch page verses whenever pageNumber changes so multi-surah pages work seamlessly
  useEffect(() => {
    let isCancelled = false;
    fetchPageData(pageNumber)
      .then(res => {
        if (!isCancelled) {
          setPageData(res);
        }
      })
      .catch(err => {
        console.error('Error fetching page data:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [pageNumber]);

  // Prefer pageData.verses (which includes all Surahs on this physical page with their words)
  // falling back to pageVerses while loading
  const activeVerses: Ayah[] =
    pageData && pageData.verses && pageData.verses.length > 0
      ? pageData.verses
      : pageVerses;

  const activeJuzNum = getJuzForPage(pageNumber);
  const activeJuzName = JUZ_NAMES_AR[activeJuzNum] || `الجزء ${toArabicDigits(activeJuzNum)}`;
  const manzil = currentSurah ? getManzilForSurah(currentSurah.id) : { manzil: 1, label: 'منزل ۱' };

  // Margin ornaments on this page
  const pageRukus = activeVerses
    .map(a => {
      const key = `${a.surah_id}:${a.ayah_number}`;
      const ruku = RUKU_END_AYAHS[key];
      return ruku ? { ayah: a, ruku } : null;
    })
    .filter(Boolean);

  const pageQuarters = activeVerses
    .map(a => {
      const key = `${a.surah_id}:${a.ayah_number}`;
      const q = QUARTER_AYAHS[key];
      return q ? { ayah: a, quarter: q } : null;
    })
    .filter(Boolean);

  const pageSajdahs = activeVerses
    .map(a => {
      const key = `${a.surah_id}:${a.ayah_number}`;
      const s = SAJDAH_AYAHS[key];
      return s ? { ayah: a, sajdah: s } : null;
    })
    .filter(Boolean);

  return (
    <div 
      dir="rtl"
      className="relative flex flex-col justify-between bg-[#fdfbf7] dark:bg-[#0b1329] border-[5px] border-emerald-900/25 dark:border-emerald-600/25 rounded-3xl p-5 sm:p-8 shadow-xl transition-all select-none min-h-[680px]"
    >
      {/* Decorative Traditional Islamic Corner Accents */}
      <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-emerald-800/50 dark:border-emerald-500/50 pointer-events-none" />
      <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-emerald-800/50 dark:border-emerald-500/50 pointer-events-none" />
      <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-emerald-800/50 dark:border-emerald-500/50 pointer-events-none" />
      <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-emerald-800/50 dark:border-emerald-500/50 pointer-events-none" />

      {/* 1. TOP HEADER FRAME: Juz Banner (Right), Surah Name (Center), Page Number (Left) — Zero Controls */}
      <div className="pb-3 mb-4 border-b-2 border-emerald-800/20 dark:border-emerald-500/20 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 font-ibm">
        <span className="text-emerald-900 dark:text-emerald-300 font-bold text-sm">
          {activeJuzName}
        </span>
        <span className="text-base sm:text-lg text-emerald-800 dark:text-emerald-400 font-extrabold tracking-wide">
          ۞ {currentSurah?.name_arabic || 'سورة'} ۞
        </span>
        <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-ibm font-bold">
          صفحہ <span className="font-app font-bold">{pageNumber}</span>
        </span>
      </div>

      {/* 2. CONTINUOUS FLOW CANVAS WITH QCF V2 / V4 TAJWEED GLYPHS */}
      <div className="relative flex-1 my-2">
        
        {/* Margin Ornaments Floating Column (Right Margin) */}
        {(pageRukus.length > 0 || pageQuarters.length > 0 || pageSajdahs.length > 0) && (
          <div className="hidden lg:flex flex-col gap-2.5 absolute top-0 -right-14 z-20">
            {pageRukus.map((item: any, idx) => (
              <div
                key={`ruku-${idx}`}
                title={`رکوع ${item.ruku.surahRuku} • آیات: ${item.ruku.count}`}
                className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/90 border-2 border-emerald-600 dark:border-emerald-400 flex flex-col items-center justify-center text-emerald-900 dark:text-emerald-200 shadow-md cursor-help"
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

        {/* Continuous Justified Mushaf Flow (QCF V2 & QCF V4 Tajweed COLRv1) */}
        <div 
          className="text-justify text-2xl sm:text-[29px] leading-[2.85] sm:leading-[3.1] text-slate-900 dark:text-slate-100 cursor-pointer"
          style={{ 
            textJustify: 'inter-word',
            fontFamily: getQcfFontFamily(pageNumber, showTajweed)
          }}
        >
          {activeVerses.map((ayah: any) => {
            const isSelected = currentAyahNumber === ayah.ayah_number && (!currentSurah || currentSurah.id === ayah.surah_id);
            const isAyahPlaying = isPlaying && activePlayingAyah === ayah.ayah_number;
            const hasSajdah = !!SAJDAH_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];
            const hasRukuEnd = !!RUKU_END_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];
            const isSurahStart = ayah.ayah_number === 1;

            return (
              <React.Fragment key={`${ayah.surah_id}:${ayah.ayah_number}`}>
                {/* Surah Ornamental Header & Bismillah before Ayah 1 */}
                {isSurahStart && (
                  <div className="my-4 select-none text-center block w-full">
                    <div className="mx-auto max-w-sm border-2 border-emerald-700/50 dark:border-emerald-500/40 rounded-2xl py-2 px-4 bg-emerald-50/80 dark:bg-emerald-950/50 shadow-xs font-ibm">
                      <div className="font-bold text-lg sm:text-xl text-emerald-950 dark:text-emerald-200">
                        سُورَةُ {ayah.surah_name_arabic || currentSurah?.name_arabic || 'السورة'}
                      </div>
                    </div>

                    {ayah.surah_id !== 1 && ayah.surah_id !== 9 && (
                      <div className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mt-3 mb-2 font-uthmani">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </div>
                    )}
                  </div>
                )}

                {/* Continuous Inline Verse — Zero Boxed Appearance, Pure Color Highlight */}
                <span
                  onClick={() => onSelectAyah(ayah.ayah_number, ayah.surah_id)}
                  className={`cursor-pointer transition-colors duration-150 inline ${
                    isSelected
                      ? showTajweed
                        ? 'qcf-tajweed-verse-selected'
                        : 'text-emerald-700 dark:text-emerald-400'
                      : isAyahPlaying
                      ? 'text-amber-600 dark:text-amber-400'
                      : ''
                  } ${hasSajdah ? 'underline decoration-purple-500 decoration-2 underline-offset-8' : ''}`}
                >
                  {ayah.words && ayah.words.length > 0 ? (
                    ayah.words.map((w: any, wIdx: number) => {
                      const isWordActive = isAyahPlaying && activePlayingWordIndex === wIdx;
                      return (
                        <InteractiveWord
                          key={w.id || `${ayah.verse_key}:${wIdx}`}
                          word={w}
                          showTajweed={showTajweed}
                          onSelectRoot={onSelectWordRoot}
                          isActive={isWordActive}
                          isVerseSelected={isSelected || isAyahPlaying}
                        />
                      );
                    })
                  ) : (
                    <span className="cursor-pointer hover:text-[#2ca4ab]">{ayah.text_uthmani}</span>
                  )}

                  {/* Ayah End Medallion (QCF V2 / V4 Glyph) */}
                  <span className="ayah-end-num cursor-pointer select-none mx-1">
                    {ayah.end_code_v2 ? (
                      <span 
                        style={{ fontFamily: getQcfFontFamily(pageNumber, showTajweed) }} 
                        className={`text-xl sm:text-2xl transition-colors ${
                          isSelected
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-800 dark:text-emerald-300 hover:text-[#2ca4ab]'
                        }`}
                        dangerouslySetInnerHTML={{ __html: ayah.end_code_v2 }}
                      />
                    ) : (
                      <span>﴿{toArabicDigits(ayah.ayah_number)}﴾</span>
                    )}
                  </span>

                  {hasRukuEnd && (
                    <span 
                      title="ختم رکوع"
                      className="inline-flex items-center justify-center w-5 h-5 mx-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40 select-none align-middle font-ibm"
                    >
                      ع
                    </span>
                  )}

                  {hasSajdah && (
                    <span 
                      title="سجدہ تلاوت"
                      className="inline-flex items-center justify-center px-1.5 mx-0.5 rounded bg-purple-100 dark:bg-purple-950 text-[10px] text-purple-800 dark:text-purple-300 font-bold border border-purple-500/40 select-none align-middle font-ibm"
                    >
                      ۩ سجدہ
                    </span>
                  )}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. BOTTOM FOOTER FRAME: Page Number & Manzil (RTL) */}
      <div className="pt-3 mt-4 border-t-2 border-emerald-800/20 dark:border-emerald-500/20 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 select-none font-ibm">
        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold">
          {manzil.label}
        </span>
        <span className="px-3.5 py-1 rounded-full bg-emerald-950/5 dark:bg-emerald-500/10 text-sm sm:text-base text-slate-800 dark:text-slate-100 font-app font-bold tracking-wide">
          {pageNumber}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-ibm font-semibold">
          صفحہ <span className="font-app font-bold">{pageNumber}</span> از <span className="font-app">604</span>
        </span>
      </div>
    </div>
  );
};
