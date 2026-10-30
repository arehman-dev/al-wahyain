import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Ayah, Surah, ScriptMode } from '../types/quran';
import { MushafSinglePage } from './MushafSinglePage';

interface MushafViewProps {
  ayahs: Ayah[];
  currentSurah?: Surah;
  currentAyahNumber: number;
  scriptMode: ScriptMode;
  showTajweed: boolean;
  onSelectAyah: (num: number) => void;
  onOpenMorphology: (ayahNumber: number) => void;
  onOpenTafsir: (ayahNumber: number) => void;
  isPlaying: boolean;
  activePlayingAyah: number | null;
  activePlayingWordIndex: number | null;
  onPlayAyah: (ayah: Ayah) => void;
  onPauseAyah: () => void;
  onSelectWordRoot?: (root: string) => void;
  // External Page controls passed from SubHeader
  activePage?: number;
  onPageChange?: (newPage: number) => void;
}

export const MushafView: React.FC<MushafViewProps> = ({
  ayahs,
  currentSurah,
  currentAyahNumber,
  scriptMode,
  showTajweed,
  onSelectAyah,
  onOpenMorphology,
  onOpenTafsir,
  isPlaying,
  activePlayingAyah,
  activePlayingWordIndex,
  onPlayAyah,
  onPauseAyah,
  onSelectWordRoot,
  activePage: externalActivePage,
  onPageChange
}) => {
  // Extract all distinct page numbers present in the current Surah's loaded ayahs
  const availablePages = Array.from(
    new Set(ayahs.map(a => a.page_madani).filter(Boolean))
  ).sort((a, b) => a - b);

  const currentAyahObj = ayahs.find(a => a.ayah_number === currentAyahNumber) || ayahs[0];
  const initialPage = currentAyahObj?.page_madani || availablePages[0] || 1;
  const [internalPage, setInternalPage] = useState<number>(initialPage);

  const activePage = externalActivePage !== undefined ? externalActivePage : internalPage;
  const setActivePage = onPageChange || setInternalPage;

  // Sync active page whenever the selected Ayah changes
  useEffect(() => {
    if (currentAyahObj?.page_madani && currentAyahObj.page_madani !== activePage) {
      setActivePage(currentAyahObj.page_madani);
    }
  }, [currentAyahNumber, currentAyahObj?.page_madani]);

  // Verses belonging strictly to the active page
  const pageVerses = ayahs.filter(a => a.page_madani === activePage);

  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      {/* Pure 15-Line Mushaf Page View - Zero Extra In-Page Floating Bars */}
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
      />
    </div>
  );
};
