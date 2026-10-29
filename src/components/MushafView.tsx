import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Sparkles, 
  BookOpen, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Book,
  Columns
} from 'lucide-react';
import { Ayah, Surah, ScriptMode, MushafDisplayMode } from '../types/quran';
import { toArabicDigits } from '../utils/juzMapping';
import { RUKU_END_AYAHS, QUARTER_AYAHS, SAJDAH_AYAHS } from '../utils/mushafLayout';
import { InteractiveWord } from './WordTooltip';
import { MushafSinglePage } from './MushafSinglePage';

interface MushafViewProps {
  ayahs: Ayah[];
  currentSurah?: Surah;
  currentAyahNumber: number;
  scriptMode: ScriptMode;
  mushafDisplayMode: MushafDisplayMode;
  showTajweed: boolean;
  showInlineTranslation: boolean;
  selectedTranslationAuthor: string;
  onSelectAyah: (num: number) => void;
  onOpenMorphology: (ayahNumber: number) => void;
  onOpenTafsir: (ayahNumber: number) => void;
  onQuickPeek: (ayah: Ayah) => void;
  isPlaying: boolean;
  activePlayingAyah: number | null;
  activePlayingWordIndex: number | null;
  onPlayAyah: (ayah: Ayah) => void;
  onPauseAyah: () => void;
  onSelectWordRoot?: (root: string) => void;
}

export const MushafView: React.FC<MushafViewProps> = ({
  ayahs,
  currentSurah,
  currentAyahNumber,
  scriptMode,
  mushafDisplayMode,
  showTajweed,
  showInlineTranslation,
  selectedTranslationAuthor,
  onSelectAyah,
  onOpenMorphology,
  onOpenTafsir,
  onQuickPeek,
  isPlaying,
  activePlayingAyah,
  activePlayingWordIndex,
  onPlayAyah,
  onPauseAyah,
  onSelectWordRoot
}) => {
  // Extract all distinct page numbers present in the current Surah's loaded ayahs
  const availablePages = Array.from(
    new Set(ayahs.map(a => a.page_madani).filter(Boolean))
  ).sort((a, b) => a - b);

  // Active page state (defaults to page of currentAyahNumber)
  const currentAyahObj = ayahs.find(a => a.ayah_number === currentAyahNumber) || ayahs[0];
  const initialPage = currentAyahObj?.page_madani || availablePages[0] || 1;
  const [activePage, setActivePage] = useState<number>(initialPage);
  const [spreadMode, setSpreadMode] = useState<'single' | 'dual'>(() => {
    return (localStorage.getItem('qs_mushaf_spread') as 'single' | 'dual') || 'single';
  });
  const [pageJumpInput, setPageJumpInput] = useState('');

  // Save spread preference
  const toggleSpreadMode = () => {
    setSpreadMode(prev => {
      const next = prev === 'single' ? 'dual' : 'single';
      localStorage.setItem('qs_mushaf_spread', next);
      return next;
    });
  };

  // Sync active page whenever the selected Ayah changes
  useEffect(() => {
    if (currentAyahObj?.page_madani && currentAyahObj.page_madani !== activePage) {
      setActivePage(currentAyahObj.page_madani);
    }
  }, [currentAyahNumber, currentAyahObj?.page_madani]);

  // Verses belonging strictly to the active page
  const pageVerses = ayahs.filter(a => a.page_madani === activePage);

  // Dual Page Spread: Next page for spread
  const activePageIndex = availablePages.indexOf(activePage);
  const secondPageIndex = activePageIndex + 1;
  const secondPage = spreadMode === 'dual' && secondPageIndex < availablePages.length 
    ? availablePages[secondPageIndex] 
    : null;
  const secondPageVerses = secondPage ? ayahs.filter(a => a.page_madani === secondPage) : [];

  // Page navigation handlers
  const handlePrevPage = useCallback(() => {
    const currentIndex = availablePages.indexOf(activePage);
    const step = spreadMode === 'dual' ? 2 : 1;
    const targetIndex = Math.max(0, currentIndex - step);
    if (currentIndex > 0) {
      const prevP = availablePages[targetIndex];
      setActivePage(prevP);
      const firstOnPrev = ayahs.find(a => a.page_madani === prevP);
      if (firstOnPrev) onSelectAyah(firstOnPrev.ayah_number);
    }
  }, [availablePages, activePage, spreadMode, ayahs, onSelectAyah]);

  const handleNextPage = useCallback(() => {
    const currentIndex = availablePages.indexOf(activePage);
    const step = spreadMode === 'dual' ? 2 : 1;
    const targetIndex = Math.min(availablePages.length - 1, currentIndex + step);
    if (currentIndex < availablePages.length - 1) {
      const nextP = availablePages[targetIndex];
      setActivePage(nextP);
      const firstOnNext = ayahs.find(a => a.page_madani === nextP);
      if (firstOnNext) onSelectAyah(firstOnNext.ayah_number);
    }
  }, [availablePages, activePage, spreadMode, ayahs, onSelectAyah]);

  // Keyboard Page Steppers: PageUp, PageDown, [, ]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'PageDown' || e.key === ']') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'PageUp' || e.key === '[') {
        e.preventDefault();
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage]);

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pNum = parseInt(pageJumpInput.trim(), 10);
    if (!isNaN(pNum) && availablePages.includes(pNum)) {
      setActivePage(pNum);
      const firstOnPage = ayahs.find(a => a.page_madani === pNum);
      if (firstOnPage) onSelectAyah(firstOnPage.ayah_number);
      setPageJumpInput('');
    }
  };

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      
      {/* Main Mushaf Content: Clean, Unobstructed, Full-Height */}
      {mushafDisplayMode === 'page' ? (
        /* ============================================================ */
        /* TRUE 15-LINE AUTHENTIC MUSHAF PAGE VIEW                      */
        /* ============================================================ */
        <div className="space-y-4">
          
          {/* Dual Page Spread Grid or Single Page Canvas */}
          {spreadMode === 'dual' && secondPage ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Right Page (First Page) */}
              <MushafSinglePage
                pageNumber={activePage}
                pageVerses={pageVerses}
                currentSurah={currentSurah}
                currentAyahNumber={currentAyahNumber}
                scriptMode={scriptMode}
                showTajweed={showTajweed}
                isPlaying={isPlaying}
                activePlayingAyah={activePlayingAyah}
                activePlayingWordIndex={activePlayingWordIndex}
                onSelectAyah={onSelectAyah}
                onSelectWordRoot={onSelectWordRoot}
                isLeftSpreadPage={false}
              />

              {/* Left Page (Second Page) */}
              <MushafSinglePage
                pageNumber={secondPage}
                pageVerses={secondPageVerses}
                currentSurah={currentSurah}
                currentAyahNumber={currentAyahNumber}
                scriptMode={scriptMode}
                showTajweed={showTajweed}
                isPlaying={isPlaying}
                activePlayingAyah={activePlayingAyah}
                activePlayingWordIndex={activePlayingWordIndex}
                onSelectAyah={onSelectAyah}
                onSelectWordRoot={onSelectWordRoot}
                isLeftSpreadPage={true}
              />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <MushafSinglePage
                pageNumber={activePage}
                pageVerses={pageVerses}
                currentSurah={currentSurah}
                currentAyahNumber={currentAyahNumber}
                scriptMode={scriptMode}
                showTajweed={showTajweed}
                isPlaying={isPlaying}
                activePlayingAyah={activePlayingAyah}
                activePlayingWordIndex={activePlayingWordIndex}
                onSelectAyah={onSelectAyah}
                onSelectWordRoot={onSelectWordRoot}
                isLeftSpreadPage={false}
              />
            </div>
          )}

          {/* Minimalist Page Stepper Beneath Page Frame */}
          <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3 font-ibm text-xs py-3 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={availablePages.indexOf(activePage) === 0}
                title="پچھلا صفحہ (یا [ / PageUp)"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
                <span>پچھلا صفحہ</span>
              </button>

              {/* Dual Page Toggle Button on Desktop */}
              <button
                onClick={toggleSpreadMode}
                title="دو طرفہ کھلا مصحف / ایک صفحہ"
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  spreadMode === 'dual'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{spreadMode === 'dual' ? 'کھلا مصحف (Dual) ✓' : 'دو طرفہ مصحف'}</span>
              </button>
            </div>

            {/* Direct Page Jump Form */}
            <form onSubmit={handlePageJumpSubmit} className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-[11px]">
                صفحہ {activePage} {secondPage ? `تا ${secondPage}` : ''} از ۶۰۴
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="604"
                  value={pageJumpInput}
                  onChange={(e) => setPageJumpInput(e.target.value)}
                  placeholder="صفحہ..."
                  className="w-16 px-2 py-1 text-xs text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </form>

            <button
              onClick={handleNextPage}
              disabled={availablePages.indexOf(activePage) === availablePages.length - 1}
              title="اگلا صفحہ (یا ] / PageDown)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
            >
              <span>اگلا صفحہ</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        /* ============================================================ */
        /* CONTINUOUS READING MODE WITH VERSE CARDS                     */
        /* ============================================================ */
        <div className="space-y-4">
          {ayahs.map((ayah) => {
            const isSelected = currentAyahNumber === ayah.ayah_number;
            const isAyahPlaying = isPlaying && activePlayingAyah === ayah.ayah_number;
            const activeTr = ayah.translations?.find(t => t.author_id === selectedTranslationAuthor) || ayah.translations?.[0];
            const rukuEnd = RUKU_END_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];
            const quarter = QUARTER_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];
            const sajdah = SAJDAH_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];

            return (
              <div
                key={ayah.id}
                id={`ayah-${ayah.ayah_number}`}
                className={`p-6 sm:p-7 rounded-3xl border transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/25 dark:bg-emerald-950/30 shadow-md ring-1 ring-emerald-500/40'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                {/* Verse Header Info & Action Controls */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4 font-ibm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs font-mono">
                      {ayah.verse_key}
                    </span>
                    <span className="text-xs text-slate-400">
                      صفحہ {ayah.page_madani}
                    </span>

                    {/* Margin Badges in Continuous Mode */}
                    {rukuEnd && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 font-ibm">
                        <span>ع</span>
                        <span>رکوع {rukuEnd.surahRuku}</span>
                      </span>
                    )}

                    {quarter && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1 font-ibm">
                        <span>۞</span>
                        <span>{quarter.labelUrdu.split(':')[0]}</span>
                      </span>
                    )}

                    {sajdah && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold text-xs flex items-center gap-1 font-ibm">
                        <span>۩</span>
                        <span>سجدہ تلاوت</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Audio Recitation Button */}
                    <button
                      onClick={() => isAyahPlaying ? onPauseAyah() : onPlayAyah(ayah)}
                      title={isAyahPlaying ? "تلاوت موقوف کریں" : "تلاوت سنیں"}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      {isAyahPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    {/* Quick Peek Drawer */}
                    <button
                      onClick={() => onQuickPeek(ayah)}
                      title="سرسری جائزہ (Quick Peek)"
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Jump to Morphology Mode */}
                    <button
                      onClick={() => {
                        onSelectAyah(ayah.ayah_number);
                        onOpenMorphology(ayah.ayah_number);
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-medium text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>صرف</span>
                    </button>

                    {/* Jump to Tafsir Mode */}
                    <button
                      onClick={() => {
                        onSelectAyah(ayah.ayah_number);
                        onOpenTafsir(ayah.ayah_number);
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-medium text-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>تفاسیر</span>
                    </button>
                  </div>
                </div>

                {/* Arabic Text with Real-Time Word Highlighting and Hover Inspection */}
                <div className="tajweed-text text-right text-2xl sm:text-3xl leading-[2.6] font-arabic my-3 text-slate-900 dark:text-white">
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
                  ) : showTajweed ? (
                    <span dangerouslySetInnerHTML={{ __html: ayah.text_tajweed }} />
                  ) : scriptMode === 'indopak' ? (
                    <span className="font-indopak">{ayah.text_indopak}</span>
                  ) : (
                    <span>{ayah.text_uthmani}</span>
                  )}
                  <span className="ayah-end-num">﴿{ayah.ayah_number}﴾</span>
                </div>

                {/* Inline Translation */}
                {showInlineTranslation && activeTr && (
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-right">
                    <p className="font-ibm text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-[2.1] font-medium">
                      {activeTr.text}
                    </p>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-ibm mt-1.5 block">
                      — ترجمہ: {activeTr.author_name}
                    </span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
