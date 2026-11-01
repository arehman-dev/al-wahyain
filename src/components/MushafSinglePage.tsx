import React, { useState, useEffect } from 'react';
import { Ayah, Surah, ScriptMode, Word, PageData } from '../types/quran';
import { toArabicDigits, getJuzForPage, JUZ_NAMES_AR } from '../utils/juzMapping';
import { RUKU_END_AYAHS, QUARTER_AYAHS, SAJDAH_AYAHS, getManzilForSurah } from '../utils/mushafLayout';
import { InteractiveWord } from './WordTooltip';
import { fetchPageData } from '../services/api';
import { loadQcfPageFont, getQcfFontFamily } from '../utils/qcfFontLoader';
import { Rows3, AlignJustify } from 'lucide-react';

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
  onSelectWordRoot
}) => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [layoutMode, setLayoutMode] = useState<'lines' | 'flow'>('lines');
  const [loading, setLoading] = useState<boolean>(true);

  // Dynamic QCF V2 Font Loader for active and adjacent pages
  useEffect(() => {
    if (scriptMode === 'madani') {
      loadQcfPageFont(pageNumber);
    }
  }, [pageNumber, scriptMode]);

  // Fetch line-by-line page data whenever pageNumber changes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    fetchPageData(pageNumber)
      .then(res => {
        if (!isCancelled) {
          setPageData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching page data:', err);
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [pageNumber]);

  const activeJuzNum = getJuzForPage(pageNumber);
  const activeJuzName = JUZ_NAMES_AR[activeJuzNum] || `الجزء ${toArabicDigits(activeJuzNum)}`;
  const hasFirstAyah = pageVerses.some(a => a.ayah_number === 1);
  const manzil = currentSurah ? getManzilForSurah(currentSurah.id) : { manzil: 1, label: 'منزل ۱' };

  // Margin ornaments on this page
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

  // Helper to check if a word is the final word of its ayah
  const isEndOfAyah = (word: Word, allWordsOnPage: Word[]) => {
    // A word is the end of the ayah if no subsequent word on this page shares the same surah_id and ayah_number with a higher position
    const subsequent = allWordsOnPage.find(
      w => w.surah_id === word.surah_id && w.ayah_number === word.ayah_number && w.position > word.position
    );
    return !subsequent;
  };

  const allWordsOnPage = pageData ? Object.values(pageData.lines).flat() : [];

  return (
    <div 
      dir="rtl"
      className="relative flex flex-col justify-between bg-[#fdfbf7] dark:bg-[#0b1329] border-[6px] border-emerald-900/30 dark:border-emerald-600/30 rounded-3xl p-5 sm:p-8 shadow-2xl transition-all select-none min-h-[720px]"
    >
      {/* Decorative Traditional Islamic Corner Accents */}
      <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-emerald-800/50 dark:border-emerald-500/50 pointer-events-none" />
      <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-emerald-800/50 dark:border-emerald-500/50 pointer-events-none" />
      <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-emerald-800/50 dark:border-emerald-500/50 pointer-events-none" />
      <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-emerald-800/50 dark:border-emerald-500/50 pointer-events-none" />

      {/* 1. TOP HEADER FRAME: Juz Banner (Right), Surah Name (Center), Page Number & Layout Toggle (Left) */}
      <div className="pb-3 mb-4 border-b-2 border-emerald-800/25 dark:border-emerald-500/25 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 font-ibm">
        <span className="text-emerald-900 dark:text-emerald-300 font-bold">
          {activeJuzName}
        </span>
        <span className="text-base sm:text-lg text-emerald-800 dark:text-emerald-400 font-extrabold tracking-wide">
          ۞ {currentSurah?.name_arabic || 'سورة'} ۞
        </span>
        <div className="flex items-center gap-2">
          {/* 15-Line vs Flow Switcher */}
          <button
            onClick={() => setLayoutMode(prev => prev === 'lines' ? 'flow' : 'lines')}
            title={layoutMode === 'lines' ? 'مسلسل بہاؤ پر تبدیل کریں' : '۱۵ سطری مصحف پر تبدیل کریں'}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
          >
            {layoutMode === 'lines' ? <Rows3 className="w-3 h-3 text-emerald-600" /> : <AlignJustify className="w-3 h-3 text-emerald-600" />}
            <span className="hidden sm:inline">{layoutMode === 'lines' ? '۱۵ سطری' : 'مسلسل'}</span>
          </button>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
            صفحة {toArabicDigits(pageNumber)}
          </span>
        </div>
      </div>

      {/* 2. SURAH ORNAMENTAL BANNER & BISMILLAH (If Ayah 1 is on this page and not in lines layout) */}
      {hasFirstAyah && (layoutMode === 'flow' || showTajweed) && (
        <div className="my-3 select-none text-center">
          <div className="mx-auto max-w-sm border-2 border-emerald-700/50 dark:border-emerald-500/40 rounded-2xl py-2 px-4 bg-emerald-50/80 dark:bg-emerald-950/50 shadow-xs font-ibm">
            <div className="font-bold text-xl sm:text-2xl text-emerald-950 dark:text-emerald-200">
              {currentSurah?.name_arabic || 'سورة'}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              {currentSurah?.revelation_place === 'makkah' ? 'مَكِّيَّةٌ' : 'مَدَنِيَّةٌ'} • {toArabicDigits(currentSurah?.verses_count || 0)} آيَاتٍ
            </div>
          </div>

          {currentSurah?.id !== 9 && (
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2 font-uthmani">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          )}
        </div>
      )}

      {/* 3. MAIN 15-LINE TEXT CANVAS WITH JUSTIFIED FLOW & MARGIN ORNAMENTS */}
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

        {/* ========================================================================= */}
        {/* OPTION A: Authentic 15-Line Grouped Physical Mushaf View (QCF/KFGQPC Layout) */}
        {/* ========================================================================= */}
        {layoutMode === 'lines' && !showTajweed && pageData && Object.keys(pageData.lines).length > 0 ? (
          <div className="flex flex-col justify-between h-full space-y-1.5 sm:space-y-2 py-1">
            {Array.from({ length: 15 }, (_, i) => i + 1).map((lineNum) => {
              const lineWords = pageData.lines[String(lineNum)] || [];

              // Check if this line is empty because it's a Surah Title or Bismillah line
              if (lineWords.length === 0) {
                // If this is page 1 or page 2 opening, or start of surah
                if ((pageNumber === 1 || pageNumber === 2) && lineNum === 1) {
                  return (
                    <div key={`header-${lineNum}`} className="my-2 select-none text-center">
                      <div className="mx-auto max-w-sm border-2 border-emerald-700/60 dark:border-emerald-500/50 rounded-2xl py-1 px-4 bg-emerald-50/90 dark:bg-emerald-950/60 shadow-xs font-ibm">
                        <span className="font-bold text-lg text-emerald-950 dark:text-emerald-200">
                          سُورَةُ {pageNumber === 1 ? 'الفَاتِحَةِ' : 'البَقَرَةِ'}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }

              // Check if any word in this line is Ayah 1 Position 1 of a new Surah (render Surah frame above this line)
              const startsSurah = lineWords.find(w => w.ayah_number === 1 && w.position === 1 && w.surah_id !== 1);

              return (
                <React.Fragment key={`line-${lineNum}`}>
                  {startsSurah && (
                    <div className="my-3 select-none text-center">
                      <div className="mx-auto max-w-sm border-2 border-emerald-700/60 dark:border-emerald-500/50 rounded-2xl py-1 px-4 bg-emerald-50/90 dark:bg-emerald-950/60 shadow-xs font-ibm">
                        <span className="font-bold text-lg text-emerald-950 dark:text-emerald-200">
                          سُورَةُ {startsSurah.surah_name_arabic || 'السورة'}
                        </span>
                      </div>
                      {startsSurah.surah_id !== 9 && (
                        <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mt-2 mb-1 font-uthmani">
                          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                        </div>
                      )}
                    </div>
                  )}

                  <div 
                    className={`flex items-center ${
                      pageNumber === 1 || (lineWords.length <= 4 && lineNum === 15) ? 'justify-center gap-2.5 sm:gap-4' : 'justify-between'
                    } w-full min-h-[44px] sm:min-h-[48px] px-0.5 text-2xl sm:text-[27px] select-text leading-normal`}
                    style={{ 
                      fontFamily: scriptMode === 'madani' ? getQcfFontFamily(pageNumber) : undefined,
                      fontFeatureSettings: '"cv01", "cv02", "calt", "liga"' 
                    }}
                  >
                    {lineWords.map((w, wIdx) => {
                      const isSelected = currentAyahNumber === w.ayah_number && currentSurah?.id === w.surah_id;
                      const isAyahPlaying = isPlaying && activePlayingAyah === w.ayah_number;
                      const isWordActive = isAyahPlaying && activePlayingWordIndex === (w.position - 1);
                      const isAyahEnd = isEndOfAyah(w, allWordsOnPage);

                      return (
                        <span 
                          key={w.id} 
                          className="inline-flex items-center"
                          onClick={() => onSelectAyah(w.ayah_number)}
                        >
                          <span className={`px-0.5 rounded-lg transition-all ${
                            isSelected
                              ? 'bg-emerald-200/90 dark:bg-emerald-950 text-slate-950 dark:text-white ring-1 ring-emerald-500'
                              : isWordActive
                              ? 'bg-amber-100 dark:bg-amber-950/60'
                              : 'hover:bg-emerald-50 dark:hover:bg-slate-800'
                          }`}>
                            <InteractiveWord
                              word={w}
                              scriptMode={scriptMode}
                              onSelectRoot={onSelectWordRoot}
                              isActive={isWordActive}
                              useQcf={scriptMode === 'madani'}
                            />
                          </span>

                          {isAyahEnd && (
                            <span 
                              title={`آیت ${w.ayah_number}`}
                              className="ayah-end-num inline-flex items-center mx-1 cursor-pointer hover:scale-110 transition-transform select-none"
                            >
                              {scriptMode === 'madani' && w.end_code_v2 ? (
                                <span 
                                  style={{ fontFamily: getQcfFontFamily(pageNumber) }} 
                                  className="text-emerald-800 dark:text-emerald-300 text-xl sm:text-2xl"
                                >
                                  {w.end_code_v2}
                                </span>
                              ) : (
                                <span>﴿{toArabicDigits(w.ayah_number)}﴾</span>
                              )}
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          /* ========================================================================= */
          /* OPTION B: Continuous Verse-by-Verse Justified Flow (Classic or Tajweed)   */
          /* ========================================================================= */
          <div 
            className="tajweed-text text-justify text-2xl sm:text-[27px] leading-[3.1] sm:leading-[3.5] select-text text-slate-900 dark:text-slate-100"
            style={{ 
              textJustify: 'inter-word',
              fontFamily: scriptMode === 'madani' ? getQcfFontFamily(pageNumber) : undefined 
            }}
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
                          useQcf={scriptMode === 'madani'}
                        />
                      );
                    })
                  ) : showTajweed ? (
                    <span dangerouslySetInnerHTML={{ __html: ayah.text_tajweed }} />
                  ) : (
                    <span>{displayText}</span>
                  )}

                  <span className="ayah-end-num select-none">
                    {scriptMode === 'madani' && ayah.end_code_v2 ? (
                      <span 
                        style={{ fontFamily: getQcfFontFamily(pageNumber) }} 
                        className="text-emerald-800 dark:text-emerald-300 text-xl sm:text-2xl mx-1"
                      >
                        {ayah.end_code_v2}
                      </span>
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
              );
            })}
          </div>
        )}
      </div>

      {/* 4. BOTTOM FOOTER FRAME: Page Number & Manzil (RTL) */}
      <div className="pt-3 mt-4 border-t-2 border-emerald-800/25 dark:border-emerald-500/25 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 select-none font-ibm">
        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold">
          {manzil.label}
        </span>
        <span className="text-sm text-slate-700 dark:text-slate-300 font-bold">
          ـ ﴿ {toArabicDigits(pageNumber)} ﴾ ـ
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          صفحہ {pageNumber}
        </span>
      </div>
    </div>
  );
};
