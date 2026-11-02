import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Sparkles, BookOpen, Bookmark, Copy, Check } from 'lucide-react';
import { Ayah, Surah, ScriptMode } from '../types/quran';
import { toArabicDigits } from '../utils/juzMapping';
import { RUKU_END_AYAHS, QUARTER_AYAHS, SAJDAH_AYAHS } from '../utils/mushafLayout';
import { InteractiveWord } from './WordTooltip';

interface TranslationViewProps {
  ayahs: Ayah[];
  currentSurah?: Surah;
  currentAyahNumber: number;
  scriptMode: ScriptMode;
  showWordByWord: boolean;
  selectedTranslationAuthor: string;
  secondaryTranslationAuthor?: string | null;
  wbwLanguage?: 'both' | 'ur' | 'en' | 'ur2' | 'en2';
  onSelectAyah: (num: number) => void;
  onOpenMorphology: (ayahNumber: number) => void;
  onOpenTafsir: (ayahNumber: number) => void;
  isPlaying: boolean;
  activePlayingAyah: number | null;
  activePlayingWordIndex: number | null;
  onPlayAyah: (ayah: Ayah) => void;
  onPauseAyah: () => void;
  isAyahBookmarked?: (ayahNumber: number) => boolean;
  onToggleBookmark?: (ayah: Ayah) => void;
  onSelectWordRoot?: (root: string) => void;
}

export const TranslationView: React.FC<TranslationViewProps> = ({
  ayahs,
  currentSurah,
  currentAyahNumber,
  scriptMode,
  showWordByWord,
  selectedTranslationAuthor,
  secondaryTranslationAuthor = null,
  wbwLanguage = 'both',
  onSelectAyah,
  onOpenMorphology,
  onOpenTafsir,
  isPlaying,
  activePlayingAyah,
  activePlayingWordIndex,
  onPlayAyah,
  onPauseAyah,
  isAyahBookmarked,
  onToggleBookmark,
  onSelectWordRoot
}) => {
  const [copiedAyahId, setCopiedAyahId] = useState<number | null>(null);
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

  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
      {/* Editorial Continuous Verses Stream (Zero Card Clutter) */}
      <div className="divide-y divide-emerald-950/10 dark:divide-emerald-500/10">
        {ayahs.map((ayah) => {
          const isSelected = currentAyahNumber === ayah.ayah_number;
          const isAyahPlaying = isPlaying && activePlayingAyah === ayah.ayah_number;
          const activeTr = ayah.translations?.find(t => t.author_id === selectedTranslationAuthor) || ayah.translations?.[0];
          const secondaryTr = secondaryTranslationAuthor ? ayah.translations?.find(t => t.author_id === secondaryTranslationAuthor) : null;
          const rukuEnd = RUKU_END_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];
          const quarter = QUARTER_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];
          const sajdah = SAJDAH_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];
          const bookmarked = isAyahBookmarked ? isAyahBookmarked(ayah.ayah_number) : false;

          return (
            <article
              key={ayah.id}
              id={`ayah-${ayah.ayah_number}`}
              onClick={() => onSelectAyah(ayah.ayah_number)}
              className={`group relative py-7 sm:py-9 px-3 sm:px-5 transition-all duration-200 rounded-2xl ${
                isSelected
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30'
                  : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/40'
              }`}
            >
              {/* Active Ayah Delicate Right Margin Indicator */}
              {isSelected && (
                <div className="absolute right-0 top-6 bottom-6 w-1 rounded-l-full bg-emerald-600 dark:bg-emerald-400" />
              )}

              {/* Top Verse Marginal Metadata & Contextual Action Ribbon */}
              <div className="flex items-center justify-between gap-3 mb-3 text-xs font-ibm select-none">
                {/* Right: Verse Reference & Manuscript Ornaments */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-emerald-850 dark:text-emerald-300 text-xs">
                    {ayah.verse_key}
                  </span>

                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    • ص {toArabicDigits(ayah.page_madani)}
                  </span>

                  {rukuEnd && (
                    <span 
                      title={`رکوع ${rukuEnd.surahRuku}`}
                      className="px-2 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]"
                    >
                      ع {toArabicDigits(rukuEnd.surahRuku)}
                    </span>
                  )}

                  {quarter && (
                    <span 
                      title={quarter.labelUrdu}
                      className="px-2 py-0.5 rounded-md bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px]"
                    >
                      ۞ {quarter.labelUrdu.split(':')[0]}
                    </span>
                  )}

                  {sajdah && (
                    <span 
                      title="سجدہ تلاوت"
                      className="px-2 py-0.5 rounded-md bg-purple-100/70 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold text-[10px]"
                    >
                      ۩ سجدہ
                    </span>
                  )}
                </div>

                {/* Left: Floating Contextual Micro-Toolbar (Progressive Disclosure) */}
                <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isAyahPlaying ? onPauseAyah() : onPlayAyah(ayah);
                    }}
                    title={isAyahPlaying ? "تلاوت موقوف کریں" : "تلاوت سنیں"}
                    className="p-1 rounded-full text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {isAyahPlaying ? <Pause className="w-3.5 h-3.5 text-emerald-600" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>

                  {onToggleBookmark && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(ayah);
                      }}
                      title={bookmarked ? "محفوظ فہرست سے نکالیں" : "محفوظ کریں"}
                      className={`p-1 rounded-full transition-colors ${
                        bookmarked 
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' 
                          : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const transText = primaryTranslation?.translation_text || '';
                      const fullCopy = `${ayah.text_madani || ayah.text_uthmani}\n\n${transText}\n\n[سورة ${currentSurah?.name_arabic || ''} : ${ayah.ayah_number}]`;
                      navigator.clipboard.writeText(fullCopy);
                      setCopiedAyahId(ayah.ayah_number);
                      setTimeout(() => setCopiedAyahId(null), 1800);
                    }}
                    title="آیت اور ترجمہ کاپی کریں"
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {copiedAyahId === ayah.ayah_number ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="w-px h-3 bg-slate-200 dark:bg-slate-700 mx-0.5" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMorphology(ayah.ayah_number);
                    }}
                    title="صرف، اعراب و نحو"
                    className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>صرف</span>
                    </span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTafsir(ayah.ayah_number);
                    }}
                    title="تفاسیر کا مطالعہ"
                    className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-emerald-600" />
                      <span>تفسیر</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* ======================================================== */}
              {/* ARABIC SCRIPT & CLASSICAL INTERLINEAR FLOW                */}
              {/* ======================================================== */}
              {showWordByWord && ayah.words && ayah.words.length > 0 ? (
                /* True Classical Interlinear (الترجمة السطرية) - Zero Boxes */
                <div className="flex flex-wrap items-baseline gap-x-3.5 sm:gap-x-5 gap-y-4 my-3 text-right select-text" dir="rtl">
                  {ayah.words.map((w, wIdx) => {
                    const isWordActive = isAyahPlaying && activePlayingWordIndex === wIdx;
                    return (
                      <div
                        key={w.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (w.root && onSelectWordRoot) onSelectWordRoot(w.root);
                        }}
                        className={`group/word inline-flex flex-col items-center cursor-pointer px-1 py-0.5 rounded-lg transition-all duration-150 ${
                          isWordActive
                            ? 'bg-amber-300/90 dark:bg-amber-500/90 ring-2 ring-amber-400 scale-105 shadow-xs'
                            : 'hover:bg-emerald-500/10 dark:hover:bg-emerald-400/10'
                        }`}
                      >
                        {/* Arabic Token */}
                        <span className={`text-2xl sm:text-[27px] font-uthmani leading-normal transition-colors ${
                          isWordActive ? 'text-slate-950 font-bold' : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {scriptMode === 'indopak' ? (w.text_indopak || w.text_uthmani) : w.text_uthmani}
                        </span>

                        {/* Interlinear Muted Meanings Stack */}
                        <div className="flex flex-col items-center text-center mt-1 space-y-0.5 select-text">
                          {(wbwLanguage === 'both' || wbwLanguage === 'ur' || wbwLanguage === 'ur2') && (
                            <span className="font-ibm text-xs text-emerald-850 dark:text-emerald-300 font-semibold leading-tight">
                              {wbwLanguage === 'ur2' ? (w.translation_ur_2 || w.translation_ur || '—') : (w.translation_ur || '—')}
                            </span>
                          )}
                          {(wbwLanguage === 'both' || wbwLanguage === 'en' || wbwLanguage === 'en2') && (
                            <span dir="ltr" className="font-app text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight leading-tight">
                              {wbwLanguage === 'en2' ? (w.translation_en_2 || w.translation_en || '—') : (w.translation_en || '—')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Classical Ayah End Medallion */}
                  <span className="ayah-end-num inline-flex items-center text-2xl text-emerald-800 dark:text-emerald-400 select-none align-middle mr-1">
                    ﴿{toArabicDigits(ayah.ayah_number)}﴾
                  </span>
                </div>
              ) : (
                /* Continuous Majestic Flow (When Word-by-Word is Off) */
                <div className="text-right text-2xl sm:text-3xl leading-[2.6] sm:leading-[2.8] my-3 text-slate-900 dark:text-slate-100 font-uthmani select-text">
                  {ayah.words && ayah.words.length > 0 ? (
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
                  ) : (
                    <span>{ayah.text_uthmani}</span>
                  )}
                  <span className="ayah-end-num select-none mr-1.5">﴿{toArabicDigits(ayah.ayah_number)}﴾</span>
                </div>
              )}

              {/* ======================================================== */}
              {/* PRIMARY TRANSLATION (Fluid Editorial Manuscript Flow)    */}
              {/* ======================================================== */}
              {activeTr && (
                <div className="mt-3.5 pt-2 text-right">
                  <p 
                    className={`text-slate-800 dark:text-slate-200 select-text ${
                      activeTr.language === 'en' 
                        ? 'font-serif text-base sm:text-lg leading-relaxed text-left' 
                        : 'urdu-nastaliq text-xl sm:text-2xl leading-[2.3]'
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
                    className={`text-slate-700 dark:text-slate-300 select-text ${
                      secondaryTr.language === 'en' 
                        ? 'font-serif text-sm sm:text-base leading-relaxed text-left' 
                        : 'urdu-nastaliq text-lg sm:text-xl leading-[2.2]'
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
