import React, { useEffect, useRef } from 'react';
import { Ayah, Surah, ScriptMode } from '../types/quran';
import { toArabicDigits } from '../utils/juzMapping';
import { RUKU_END_AYAHS, QUARTER_AYAHS, SAJDAH_AYAHS } from '../utils/mushafLayout';
import { InteractiveWord } from './WordTooltip';
import { loadQcfPageFont, getQcfFontFamily } from '../utils/qcfFontLoader';

interface TranslationViewProps {
  ayahs: Ayah[];
  currentSurah?: Surah;
  currentAyahNumber: number;
  scriptMode?: ScriptMode;
  showTajweed?: boolean;
  showWordByWord: boolean;
  selectedTranslationAuthor: string;
  secondaryTranslationAuthor?: string | null;
  wbwLanguage?: 'both' | 'ur' | 'en' | 'ur2' | 'en2';
  onSelectAyah: (num: number) => void;
  onOpenMorphology?: (ayahNumber: number) => void;
  onOpenTafsir?: (ayahNumber: number) => void;
  isPlaying: boolean;
  activePlayingAyah: number | null;
  activePlayingWordIndex: number | null;
  onPlayAyah?: (ayah: Ayah) => void;
  onPauseAyah?: () => void;
  isAyahBookmarked?: (ayahNumber: number) => boolean;
  onToggleBookmark?: (ayah: Ayah) => void;
  onSelectWordRoot?: (root: string) => void;
  fontSize?: number;
}

export const TranslationView: React.FC<TranslationViewProps> = ({
  ayahs,
  currentSurah,
  currentAyahNumber,
  showTajweed = false,
  showWordByWord,
  selectedTranslationAuthor,
  secondaryTranslationAuthor = null,
  wbwLanguage = 'both',
  onSelectAyah,
  isPlaying,
  activePlayingAyah,
  activePlayingWordIndex,
  onSelectWordRoot,
  fontSize = 18
}) => {
  const isInitialOrSurahChange = useRef(true);
  const prevSurahIdRef = useRef<number | undefined>(currentSurah?.id);

  // Auto smooth-scroll to active Ayah section on verse selection or initial load
  useEffect(() => {
    if (prevSurahIdRef.current !== currentSurah?.id) {
      prevSurahIdRef.current = currentSurah?.id;
      isInitialOrSurahChange.current = true;
    }

    const timer = setTimeout(() => {
      const el = document.getElementById(`ayah-${currentAyahNumber}`);
      if (el) {
        el.scrollIntoView({
          behavior: isInitialOrSurahChange.current ? 'auto' : 'smooth',
          block: 'center'
        });
        isInitialOrSurahChange.current = false;
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [currentAyahNumber, currentSurah?.id]);

  // Preload King Fahd Complex QCF V2 / V4 Tajweed page fonts for all visible verses
  useEffect(() => {
    const pageSet = new Set<number>();
    ayahs.forEach(a => {
      if (a.page_madani) pageSet.add(a.page_madani);
      if (a.words) {
        a.words.forEach(w => {
          if (w.page_number) pageSet.add(w.page_number);
        });
      }
    });
    pageSet.forEach(p => loadQcfPageFont(p, showTajweed));
  }, [ayahs, showTajweed]);

  return (
    <div dir="rtl" className="w-full py-4">
      {/* Editorial Continuous Verses Stream — Zero Boxed Cards, Zero Extra Toolbars */}
      <div className="divide-y divide-emerald-950/10 dark:divide-emerald-500/10">
        {ayahs.map((ayah) => {
          const isSelected = currentAyahNumber === ayah.ayah_number;
          const isAyahPlaying = isPlaying && activePlayingAyah === ayah.ayah_number;
          const activeTr = ayah.translations?.find(t => t.author_id === selectedTranslationAuthor) || ayah.translations?.[0];
          const secondaryTr = secondaryTranslationAuthor ? ayah.translations?.find(t => t.author_id === secondaryTranslationAuthor) : null;
          const rukuEnd = RUKU_END_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];
          const quarter = QUARTER_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];
          const sajdah = SAJDAH_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];

          return (
            <article
              key={ayah.id}
              id={`ayah-${ayah.ayah_number}`}
              onClick={() => onSelectAyah(ayah.ayah_number)}
              className="relative py-7 sm:py-8 transition-colors duration-200"
            >
              {/* Top Verse Reference & Manuscript Ornaments (Zero Extra Action Controls) */}
              <div className="flex items-center justify-between gap-3 mb-3 text-xs font-ibm select-none">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-app font-bold text-xs transition-colors ${
                    isSelected
                      ? 'text-emerald-600 dark:text-emerald-400 scale-105'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {ayah.verse_key}
                  </span>

                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-ibm font-semibold">
                    • صفحہ <span className="font-app">{ayah.page_madani}</span>
                  </span>

                  {rukuEnd && (
                    <span 
                      className="px-2 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]"
                    >
                      ع {toArabicDigits(rukuEnd.surahRuku)}
                    </span>
                  )}

                  {quarter && (
                    <span 
                      className="px-2 py-0.5 rounded-md bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px]"
                    >
                      ۞ {quarter.labelUrdu.split(':')[0]}
                    </span>
                  )}

                  {sajdah && (
                    <span 
                      className="px-2 py-0.5 rounded-md bg-purple-100/70 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold text-[10px]"
                    >
                      ۩ سجدہ
                    </span>
                  )}
                </div>
              </div>

              {/* ======================================================== */}
              {/* ARABIC QCF V2 / V4 SCRIPT & CLASSICAL INTERLINEAR FLOW    */}
              {/* ======================================================== */}
              {showWordByWord && ayah.words && ayah.words.length > 0 ? (
                /* True Classical Interlinear (الترجمة السطرية) - Zero Boxes, Pure Text Color Highlight */
                <div className="flex flex-wrap items-baseline gap-x-4 sm:gap-x-6 gap-y-4 my-3 text-right cursor-pointer" dir="rtl">
                  {ayah.words.map((w, wIdx) => {
                    const isWordActive = isAyahPlaying && activePlayingWordIndex === wIdx;
                    const hasQcf = !!w.code_v2 && !!w.page_number;
                    const displayText = hasQcf ? w.code_v2 : w.text_uthmani;
                    const fontStyle = hasQcf ? { fontFamily: getQcfFontFamily(w.page_number, showTajweed) } : undefined;

                    const wordColorClass = showTajweed
                      ? isWordActive
                        ? 'qcf-tajweed-word-active'
                        : 'qcf-tajweed-word'
                      : isWordActive
                      ? 'text-amber-600 dark:text-amber-400'
                      : isSelected || isAyahPlaying
                      ? 'text-emerald-700 dark:text-emerald-400 group-hover/word:text-amber-600 dark:group-hover/word:text-amber-300'
                      : 'text-slate-900 dark:text-slate-100 group-hover/word:text-[#2ca4ab] dark:group-hover/word:text-[#2ca4ab]';

                    return (
                      <div
                        key={w.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAyah(ayah.ayah_number);
                          if (w.root && onSelectWordRoot) onSelectWordRoot(w.root);
                        }}
                        className="group/word inline-flex flex-col items-center cursor-pointer transition-colors duration-150"
                      >
                        {/* Arabic QCF V2 / V4 Token (Hand Icon on Hover, Color Change Only) */}
                        <span 
                          className={`leading-normal transition-colors font-qcf cursor-pointer ${wordColorClass}`}
                          style={{ ...fontStyle, fontSize: `${Math.round(fontSize * 1.65)}px` }}
                          dangerouslySetInnerHTML={{ __html: displayText || '' }}
                        />

                        {/* Interlinear Muted Meanings Stack */}
                        <div className="flex flex-col items-center text-center mt-1 space-y-0.5">
                          {(wbwLanguage === 'both' || wbwLanguage === 'ur' || wbwLanguage === 'ur2') && (
                            <span className={`font-ibm text-xs font-semibold leading-tight transition-colors ${
                              isWordActive
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-850 dark:text-emerald-300 group-hover/word:text-[#2ca4ab]'
                            }`}>
                              {wbwLanguage === 'ur2' ? (w.translation_ur_2 || w.translation_ur || '—') : (w.translation_ur || '—')}
                            </span>
                          )}
                          {(wbwLanguage === 'both' || wbwLanguage === 'en' || wbwLanguage === 'en2') && (
                            <span dir="ltr" className="font-app text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight leading-tight group-hover/word:text-[#2ca4ab] transition-colors">
                              {wbwLanguage === 'en2' ? (w.translation_en_2 || w.translation_en || '—') : (w.translation_en || '—')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Classical Ayah End Medallion (QCF V2 / V4 Glyph) */}
                  {ayah.end_code_v2 ? (
                    <span 
                      className={`ayah-end-num inline-flex items-center text-2xl select-none align-middle mr-1 font-qcf cursor-pointer transition-colors ${
                        isSelected
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-800 dark:text-emerald-400 hover:text-[#2ca4ab]'
                      }`}
                      style={{ fontFamily: getQcfFontFamily(ayah.page_madani, showTajweed) }}
                      dangerouslySetInnerHTML={{ __html: ayah.end_code_v2 }}
                    />
                  ) : (
                    <span className="ayah-end-num inline-flex items-center text-2xl text-emerald-800 dark:text-emerald-400 select-none align-middle mr-1 cursor-pointer">
                      ﴿{toArabicDigits(ayah.ayah_number)}﴾
                    </span>
                  )}
                </div>
              ) : (
                /* Continuous Majestic Flow (When Word-by-Word is Off) — Pure QCF V2 / V4, No Boxes */
                <div 
                  style={{ fontSize: `${Math.round(fontSize * 1.65)}px` }}
                  className={`text-right leading-[2.6] sm:leading-[2.85] my-3 cursor-pointer transition-colors ${
                    isSelected || isAyahPlaying
                      ? showTajweed
                        ? 'qcf-tajweed-verse-selected'
                        : 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {ayah.words && ayah.words.length > 0 ? (
                    ayah.words.map((w, wIdx) => {
                      const isWordActive = isAyahPlaying && activePlayingWordIndex === wIdx;
                      return (
                        <InteractiveWord
                          key={w.id}
                          word={w}
                          showTajweed={showTajweed}
                          onSelectRoot={onSelectWordRoot}
                          isActive={isWordActive}
                          isVerseSelected={isSelected || isAyahPlaying}
                        />
                      );
                    })
                  ) : (
                    <span className="font-qcf cursor-pointer hover:text-[#2ca4ab]">{ayah.text_uthmani}</span>
                  )}
                  {ayah.end_code_v2 ? (
                    <span 
                      className={`ayah-end-num select-none mr-1.5 font-qcf inline-block align-middle cursor-pointer transition-colors ${
                        isSelected
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-800 dark:text-emerald-400 hover:text-[#2ca4ab]'
                      }`}
                      style={{ fontFamily: getQcfFontFamily(ayah.page_madani, showTajweed) }}
                      dangerouslySetInnerHTML={{ __html: ayah.end_code_v2 }}
                    />
                  ) : (
                    <span className="ayah-end-num select-none mr-1.5 cursor-pointer">﴿{toArabicDigits(ayah.ayah_number)}﴾</span>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* PRIMARY TRANSLATION (Fluid Editorial Manuscript Flow)    */}
              {/* ======================================================== */}
              {activeTr && (
                <div className="mt-3.5 pt-2 text-right">
                  <p 
                    style={{ fontSize: `${fontSize}px` }}
                    className={`select-text transition-colors ${
                      isSelected
                        ? 'text-slate-950 dark:text-white'
                        : 'text-slate-800 dark:text-slate-200'
                    } ${
                      activeTr.language === 'en' 
                        ? 'font-app leading-relaxed text-left' 
                        : 'urdu-nastaliq leading-[2.3]'
                    }`}
                    dir={activeTr.language === 'en' ? 'ltr' : 'rtl'}
                  >
                    {activeTr.text}
                  </p>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-ibm mt-1 block">
                    — {activeTr.author_name}
                  </span>
                </div>
              )}

              {/* ======================================================== */}
              {/* SECONDARY TRANSLATION (Subtle Indent Margin)             */}
              {/* ======================================================== */}
              {secondaryTr && secondaryTr.author_id !== activeTr?.author_id && (
                <div className="mt-3.5 pr-4 border-r-2 border-emerald-500/30 dark:border-emerald-500/40">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 font-ibm block mb-0.5">
                    {secondaryTr.author_name}:
                  </span>
                  <p 
                    style={{ fontSize: `${Math.max(13, fontSize - 1)}px` }}
                    className={`text-slate-700 dark:text-slate-300 select-text ${
                      secondaryTr.language === 'en' 
                        ? 'font-app leading-relaxed text-left' 
                        : 'urdu-nastaliq leading-[2.2]'
                    }`}
                    dir={secondaryTr.language === 'en' ? 'ltr' : 'rtl'}
                  >
                    {secondaryTr.text}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
