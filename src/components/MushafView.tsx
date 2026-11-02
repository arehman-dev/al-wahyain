import React, { useState, useEffect } from 'react';
import { Ayah, Surah, ScriptMode } from '../types/quran';
import { MushafSinglePage } from './MushafSinglePage';

interface MushafViewProps {
  ayahs: Ayah[];
  currentSurah?: Surah;
  currentAyahNumber: number;
  scriptMode?: ScriptMode;
  showTajweed: boolean;
  onSelectAyah: (num: number, surahId?: number) => void;
  onOpenMorphology?: (ayahNumber: number) => void;
  onOpenTafsir?: (ayahNumber: number) => void;
  isPlaying: boolean;
  activePlayingAyah: number | null;
  activePlayingWordIndex: number | null;
  onPlayAyah: (ayah: Ayah) => void;
  onPauseAyah: () => void;
  onSelectWordRoot?: (root: string) => void;
  activePage?: number;
  onPageChange?: (newPage: number) => void;
}

export const MushafView: React.FC<MushafViewProps> = ({
  ayahs,
  currentSurah,
  currentAyahNumber,
  showTajweed,
  onSelectAyah,
  isPlaying,
  activePlayingAyah,
  activePlayingWordIndex,
  onSelectWordRoot,
  activePage: externalActivePage,
  onPageChange
}) => {
  const availablePages = Array.from(
    new Set(ayahs.map(a => a.page_madani).filter(Boolean))
  ).sort((a, b) => a - b);

  const currentAyahObj = ayahs.find(a => a.ayah_number === currentAyahNumber) || ayahs[0];
  const initialPage = currentAyahObj?.page_madani || availablePages[0] || 1;
  const [internalPage, setInternalPage] = useState<number>(initialPage);

  const activePage = externalActivePage !== undefined ? externalActivePage : internalPage;
  const setActivePage = onPageChange || setInternalPage;

  useEffect(() => {
    if (currentAyahObj?.page_madani && currentAyahObj.page_madani !== activePage) {
      setActivePage(currentAyahObj.page_madani);
    }
  }, [currentAyahNumber, currentAyahObj?.page_madani]);

  const pageVerses = ayahs.filter(a => a.page_madani === activePage);

  return (
    <div dir="rtl" className="w-full py-4 space-y-4">
      <MushafSinglePage
        pageNumber={activePage}
        pageVerses={pageVerses}
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
  );
};
