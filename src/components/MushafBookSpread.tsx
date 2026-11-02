import React from 'react';
import { Ayah, Surah, ScriptMode } from '../types/quran';
import { MushafSinglePage } from './MushafSinglePage';
import { ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import { toArabicDigits } from '../utils/juzMapping';

interface MushafBookSpreadProps {
  activePage: number;
  ayahs: Ayah[];
  currentSurah?: Surah;
  currentAyahNumber: number;
  scriptMode: ScriptMode;
  showTajweed: boolean;
  isPlaying: boolean;
  activePlayingAyah: number | null;
  activePlayingWordIndex: number | null;
  onSelectAyah: (num: number) => void;
  onSelectWordRoot?: (root: string) => void;
  onPageChange: (newPage: number) => void;
}

export const MushafBookSpread: React.FC<MushafBookSpreadProps> = ({
  activePage,
  ayahs,
  currentSurah,
  currentAyahNumber,
  scriptMode,
  showTajweed,
  isPlaying,
  activePlayingAyah,
  activePlayingWordIndex,
  onSelectAyah,
  onSelectWordRoot,
  onPageChange
}) => {
  // In RTL Arabic bookbinding:
  // Right Page = Odd (1, 3, 5, 7...)
  // Left Page  = Even (2, 4, 6, 8...)
  const spreadIndex = Math.floor((activePage - 1) / 2);
  const rightPage = spreadIndex * 2 + 1;
  const leftPage = rightPage + 1 <= 604 ? rightPage + 1 : null;

  const handlePrevSpread = () => {
    if (rightPage > 1) {
      onPageChange(Math.max(1, rightPage - 2));
    }
  };

  const handleNextSpread = () => {
    if (rightPage < 603) {
      onPageChange(Math.min(604, rightPage + 2));
    }
  };

  const rightVerses = ayahs.filter(a => a.page_madani === rightPage);
  const leftVerses = leftPage ? ayahs.filter(a => a.page_madani === leftPage) : [];

  return (
    <div dir="rtl" className="max-w-[1600px] mx-auto px-2 sm:px-4 py-2 space-y-3 font-ibm">
      {/* Spread Navigation Bar */}
      <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-900/10 dark:border-emerald-600/20 shadow-xs text-xs font-semibold">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-slate-800 dark:text-slate-200">
            المصحف الشريف — دو ورقی کھلا مَطْلع (Book Spread)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleNextSpread}
            disabled={rightPage >= 603}
            title="اگلے دو صفحات (Next Spread)"
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="hidden sm:inline">اگلے صفحات</span>
          </button>

          <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
            صفحہ {toArabicDigits(rightPage)} {leftPage ? `و ${toArabicDigits(leftPage)}` : ''} / {toArabicDigits(604)}
          </span>

          <button
            onClick={handlePrevSpread}
            disabled={rightPage <= 1}
            title="پچھلے دو صفحات (Previous Spread)"
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <span className="hidden sm:inline">پچھلے صفحات</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Book Container with Central Leather Spine Shadow */}
      <div className="relative rounded-3xl p-2 sm:p-4 bg-gradient-to-b from-[#e8dec8]/30 via-[#dcd2be]/20 to-[#e8dec8]/30 dark:from-[#070b16] dark:via-[#0b1329] dark:to-[#070b16] border border-amber-950/20 dark:border-emerald-900/30 shadow-2xl">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 relative items-start">
          
          {/* RIGHT PAGE (Odd Page) */}
          <div className="w-full">
            <MushafSinglePage
              pageNumber={rightPage}
              pageVerses={rightVerses}
              currentSurah={currentSurah}
              currentAyahNumber={currentAyahNumber}
              scriptMode={scriptMode}
              showTajweed={showTajweed}
              isPlaying={isPlaying}
              activePlayingAyah={activePlayingAyah}
              activePlayingWordIndex={activePlayingWordIndex}
              onSelectAyah={onSelectAyah}
              onSelectWordRoot={onSelectWordRoot}
            />
          </div>

          {/* Central Book Spine Shadow (Visible on large screens) */}
          <div className="hidden xl:block absolute left-1/2 top-4 bottom-4 w-4 -translate-x-1/2 pointer-events-none bg-gradient-to-r from-black/15 via-black/5 to-black/15 dark:from-black/40 dark:via-black/20 dark:to-black/40 rounded-full blur-[1px]" />

          {/* LEFT PAGE (Even Page) */}
          <div className="w-full">
            {leftPage ? (
              <MushafSinglePage
                pageNumber={leftPage}
                pageVerses={leftVerses}
                currentSurah={currentSurah}
                currentAyahNumber={currentAyahNumber}
                scriptMode={scriptMode}
                showTajweed={showTajweed}
                isPlaying={isPlaying}
                activePlayingAyah={activePlayingAyah}
                activePlayingWordIndex={activePlayingWordIndex}
                onSelectAyah={onSelectAyah}
                onSelectWordRoot={onSelectWordRoot}
              />
            ) : (
              <div className="flex items-center justify-center min-h-[720px] rounded-3xl bg-[#fdfbf7] dark:bg-[#0b1329] border-[6px] border-emerald-900/20 dark:border-emerald-600/20 p-8 text-center text-slate-400">
                <span>اختتامِ مصحف شریف</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
