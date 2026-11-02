import React from 'react';
import { Ayah, Surah, ScriptMode } from '../types/quran';
import { MushafSinglePage } from './MushafSinglePage';

interface MushafBookSpreadProps {
  activePage: number;
  ayahs: Ayah[];
  currentSurah?: Surah;
  currentAyahNumber: number;
  scriptMode?: ScriptMode;
  showTajweed: boolean;
  isPlaying: boolean;
  activePlayingAyah: number | null;
  activePlayingWordIndex: number | null;
  onSelectAyah: (num: number, surahId?: number) => void;
  onSelectWordRoot?: (root: string) => void;
  onPageChange: (newPage: number) => void;
}

export const MushafBookSpread: React.FC<MushafBookSpreadProps> = ({
  activePage,
  ayahs,
  currentSurah,
  currentAyahNumber,
  showTajweed,
  isPlaying,
  activePlayingAyah,
  activePlayingWordIndex,
  onSelectAyah,
  onSelectWordRoot
}) => {
  const spreadIndex = Math.floor((activePage - 1) / 2);
  const rightPage = spreadIndex * 2 + 1;
  const leftPage = rightPage + 1 <= 604 ? rightPage + 1 : null;

  const rightVerses = ayahs.filter(a => a.page_madani === rightPage);
  const leftVerses = leftPage ? ayahs.filter(a => a.page_madani === leftPage) : [];

  return (
    <div dir="rtl" className="w-full py-2">
      <div className="relative rounded-3xl p-2 sm:p-4 bg-gradient-to-b from-[#e8dec8]/30 via-[#dcd2be]/20 to-[#e8dec8]/30 dark:from-[#070b16] dark:via-[#0b1329] dark:to-[#070b16] border border-amber-950/20 dark:border-emerald-900/30 shadow-2xl">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 relative items-start">
          
          {/* RIGHT PAGE (Odd Page) */}
          <div className="w-full">
            <MushafSinglePage
              pageNumber={rightPage}
              pageVerses={rightVerses}
              currentSurah={currentSurah}
              currentAyahNumber={currentAyahNumber}
              showTajweed={showTajweed}
              isPlaying={isPlaying}
              activePlayingAyah={activePlayingAyah}
              activePlayingWordIndex={activePlayingWordIndex}
              onSelectAyah={onSelectAyah}
              onSelectWordRoot={onSelectWordRoot}
            />
          </div>

          {/* Central Book Spine Shadow */}
          <div className="hidden xl:block absolute left-1/2 top-4 bottom-4 w-4 -translate-x-1/2 pointer-events-none bg-gradient-to-r from-black/15 via-black/5 to-black/15 dark:from-black/40 dark:via-black/20 dark:to-black/40 rounded-full blur-[1px]" />

          {/* LEFT PAGE (Even Page) */}
          <div className="w-full">
            {leftPage ? (
              <MushafSinglePage
                pageNumber={leftPage}
                pageVerses={leftVerses}
                currentSurah={currentSurah}
                currentAyahNumber={currentAyahNumber}
                showTajweed={showTajweed}
                isPlaying={isPlaying}
                activePlayingAyah={activePlayingAyah}
                activePlayingWordIndex={activePlayingWordIndex}
                onSelectAyah={onSelectAyah}
                onSelectWordRoot={onSelectWordRoot}
              />
            ) : (
              <div className="flex items-center justify-center min-h-[680px] rounded-3xl bg-[#fdfbf7] dark:bg-[#0b1329] border-[5px] border-emerald-900/20 dark:border-emerald-600/20 p-8 text-center text-slate-400">
                <span>اختتامِ مصحف شریف</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
