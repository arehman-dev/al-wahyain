import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Sparkles, 
  BookOpen, 
  Eye, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { Ayah, Surah, ScriptMode, MushafDisplayMode } from '../types/quran';
import { JUZ_NAMES_AR, getJuzForPage, toArabicDigits } from '../utils/juzMapping';

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
  onPauseAyah
}) => {
  // Extract all distinct page numbers present in the current Surah's loaded ayahs
  const availablePages = Array.from(
    new Set(ayahs.map(a => a.page_madani).filter(Boolean))
  ).sort((a, b) => a - b);

  // Active page state (defaults to page of currentAyahNumber)
  const currentAyahObj = ayahs.find(a => a.ayah_number === currentAyahNumber) || ayahs[0];
  const initialPage = currentAyahObj?.page_madani || availablePages[0] || 1;
  const [activePage, setActivePage] = useState<number>(initialPage);

  // Sync active page whenever the selected Ayah changes
  useEffect(() => {
    if (currentAyahObj?.page_madani && currentAyahObj.page_madani !== activePage) {
      setActivePage(currentAyahObj.page_madani);
    }
  }, [currentAyahNumber, currentAyahObj?.page_madani]);

  // Verses belonging strictly to the active page
  const pageVerses = ayahs.filter(a => a.page_madani === activePage);

  // Check if first ayah of surah is on this page (to show ornate Surah banner)
  const hasFirstAyah = pageVerses.some(a => a.ayah_number === 1);

  // Page navigation handlers
  const handlePrevPage = () => {
    const currentIndex = availablePages.indexOf(activePage);
    if (currentIndex > 0) {
      const prevP = availablePages[currentIndex - 1];
      setActivePage(prevP);
      const firstOnPrev = ayahs.find(a => a.page_madani === prevP);
      if (firstOnPrev) onSelectAyah(firstOnPrev.ayah_number);
    }
  };

  const handleNextPage = () => {
    const currentIndex = availablePages.indexOf(activePage);
    if (currentIndex < availablePages.length - 1) {
      const nextP = availablePages[currentIndex + 1];
      setActivePage(nextP);
      const firstOnNext = ayahs.find(a => a.page_madani === nextP);
      if (firstOnNext) onSelectAyah(firstOnNext.ayah_number);
    }
  };

  const activeJuzNum = getJuzForPage(activePage);
  const activeJuzName = JUZ_NAMES_AR[activeJuzNum] || `الجزء ${toArabicDigits(activeJuzNum)}`;

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-4 py-4 space-y-4">
      
      {/* Main Mushaf Content: Clean, Unobstructed, Full-Height */}
      {mushafDisplayMode === 'page' ? (
        /* ============================================================ */
        /* TRUE 15-LINE AUTHENTIC MUSHAF PAGE VIEW                      */
        /* ============================================================ */
        <div className="space-y-4">
          
          {/* Authentic Mushaf Page Outer Ornamental Border */}
          <div className="relative mx-auto max-w-3xl bg-[#fffefc] dark:bg-slate-900 border-8 border-emerald-800/20 dark:border-emerald-500/20 rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
            
            {/* Top Frame Header: Juz, Surah Name, Page Number */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-emerald-800/20 dark:border-emerald-500/20 text-xs sm:text-sm font-arabic text-slate-700 dark:text-slate-300 font-bold select-none">
              <span>{activeJuzName}</span>
              <span className="text-emerald-800 dark:text-emerald-400 text-base sm:text-lg">
                {currentSurah?.name_arabic || 'سورة'}
              </span>
              <span>صفحة {toArabicDigits(activePage)}</span>
            </div>

            {/* Surah Ornamental Banner (rendered if Verse 1 is on this page) */}
            {hasFirstAyah && (
              <div className="my-5 select-none">
                <div className="mx-auto max-w-md border-2 border-emerald-700/40 dark:border-emerald-500/30 rounded-xl p-3 bg-emerald-50/60 dark:bg-emerald-950/40 text-center shadow-sm">
                  <div className="font-arabic text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-300 tracking-wide">
                    ۞ {currentSurah?.name_arabic || 'سورة'} ۞
                  </div>
                  <div className="text-xs font-arabic text-slate-600 dark:text-slate-400 mt-1">
                    {currentSurah?.revelation_place === 'makkah' ? 'مَكِّيَّةٌ' : 'مَدَنِيَّةٌ'} • {toArabicDigits(currentSurah?.verses_count || 0)} آيَاتٍ
                  </div>
                </div>

                {/* Bismillah Calligraphy (except Surah 9) */}
                {currentSurah?.id !== 9 && (
                  <div className="text-center font-arabic text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mt-6 mb-4">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                )}
              </div>
            )}

            {/* Justified Page Text Body with Authentic Spacing */}
            <div className="tajweed-text text-justify text-2xl sm:text-[27px] leading-[2.8] sm:leading-[3.1] font-arabic space-x-reverse space-x-1 my-3 select-text">
              {pageVerses.map((ayah) => {
                const isSelected = currentAyahNumber === ayah.ayah_number;
                const isAyahPlaying = isPlaying && activePlayingAyah === ayah.ayah_number;

                // When ayah 1 starts on page and Bismillah is separate, avoid duplicate bismillah if already in text
                let displayText = ayah.text_uthmani;
                if (ayah.ayah_number === 1 && currentSurah?.id !== 1 && currentSurah?.id !== 9) {
                  displayText = displayText.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, '');
                }

                return (
                  <span
                    key={ayah.id}
                    onClick={() => onSelectAyah(ayah.ayah_number)}
                    className={`cursor-pointer transition-all duration-150 px-1 py-0.5 rounded-lg inline-block ${
                      isSelected
                        ? 'bg-emerald-200/80 dark:bg-emerald-950 text-slate-950 dark:text-white ring-2 ring-emerald-500 shadow-sm'
                        : isAyahPlaying
                        ? 'bg-amber-200/90 dark:bg-amber-950 text-slate-950 dark:text-white'
                        : 'hover:bg-emerald-100/60 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    {showTajweed ? (
                      <span dangerouslySetInnerHTML={{ __html: ayah.text_tajweed }} />
                    ) : scriptMode === 'indopak' ? (
                      <span className="font-indopak">{ayah.text_indopak}</span>
                    ) : (
                      <span>{displayText}</span>
                    )}
                    <span className="ayah-end-num">﴿{ayah.ayah_number}﴾</span>
                  </span>
                );
              })}
            </div>

            {/* Page Bottom Number Frame */}
            <div className="text-center pt-6 mt-6 border-t-2 border-emerald-800/20 dark:border-emerald-500/20 text-xs font-arabic text-slate-500 select-none">
              <span>{toArabicDigits(activePage)}</span>
            </div>

          </div>

          {/* Minimalist Page Stepper Beneath Page Frame */}
          <div className="max-w-3xl mx-auto flex items-center justify-between font-ibm text-xs py-2 px-2">
            <button
              onClick={handlePrevPage}
              disabled={availablePages.indexOf(activePage) === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
              <span>پچھلا صفحہ</span>
            </button>

            <span className="text-slate-400 font-mono text-[11px]">
              صفحہ {activePage} از ۶۰۴
            </span>

            <button
              onClick={handleNextPage}
              disabled={availablePages.indexOf(activePage) === availablePages.length - 1}
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
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs font-mono">
                      {ayah.verse_key}
                    </span>
                    <span className="text-xs text-slate-400">
                      صفحہ {ayah.page_madani}
                    </span>
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

                {/* Arabic Text with Real-Time Word Highlighting */}
                <div className="tajweed-text text-right text-2xl sm:text-3xl leading-[2.6] font-arabic my-3 text-slate-900 dark:text-white">
                  {ayah.words && ayah.words.length > 0 ? (
                    ayah.words.map((w, wIdx) => {
                      const isWordActive = isAyahPlaying && activePlayingWordIndex === wIdx;
                      return (
                        <span
                          key={w.id}
                          className={`inline-block mx-0.5 px-1 rounded transition-all duration-150 ${
                            isWordActive
                              ? 'bg-amber-300 dark:bg-amber-600 text-slate-950 dark:text-white scale-105 shadow-sm'
                              : ''
                          }`}
                        >
                          {scriptMode === 'indopak' ? w.text_indopak : w.text_uthmani}
                        </span>
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
