import React, { useState } from 'react';
import { 
  Ayah, 
  Surah, 
  ScriptMode, 
  TafsirEntry, 
  TafsirHighlight, 
  TafsirLayoutMode 
} from '../types/quran';
import { MushafSinglePage } from './MushafSinglePage';
import { TafsirView } from './TafsirView';
import { TranslationView } from './TranslationView';
import { MorphologyView } from './MorphologyView';
import { 
  BookOpen, 
  Languages, 
  Split, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toArabicDigits } from '../utils/juzMapping';

interface SplitStudyViewProps {
  activePage: number;
  ayahs: Ayah[];
  currentSurah?: Surah;
  currentAyahNumber: number;
  currentAyah: Ayah;
  tafasir: TafsirEntry[];
  scriptMode: ScriptMode;
  showTajweed: boolean;
  showWordByWord: boolean;
  selectedTranslationAuthor: string;
  secondaryTranslationAuthor: string | null;
  wbwLanguage: 'both' | 'ur' | 'en' | 'ur2' | 'en2';
  isPlaying: boolean;
  activePlayingAyah: number | null;
  activePlayingWordIndex: number | null;
  onSelectAyah: (num: number) => void;
  onPrevAyah: () => void;
  onNextAyah: () => void;
  onPlayAyah: (ayah: Ayah) => void;
  onPauseAyah: () => void;
  onSelectWordRoot?: (root: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  hasNote: boolean;
  onOpenNoteDrawer: () => void;
  onOpenExportModal: () => void;
  fontSize: number;
  highlights: TafsirHighlight[];
  onAddHighlight: (highlight: Omit<TafsirHighlight, 'id' | 'created_at'>) => Promise<any>;
  onDeleteHighlight: (id: number) => Promise<any>;
  expandedTafasir: Record<string, boolean>;
  onToggleTafsir: (slug: string) => void;
  tafsirOrder: string[];
  visibleTafasir: Record<string, boolean>;
  tafsirLayoutMode: TafsirLayoutMode;
  onPageChange: (newPage: number) => void;
}

export const SplitStudyView: React.FC<SplitStudyViewProps> = ({
  activePage,
  ayahs,
  currentSurah,
  currentAyahNumber,
  currentAyah,
  tafasir,
  scriptMode,
  showTajweed,
  showWordByWord,
  selectedTranslationAuthor,
  secondaryTranslationAuthor,
  wbwLanguage,
  isPlaying,
  activePlayingAyah,
  activePlayingWordIndex,
  onSelectAyah,
  onPrevAyah,
  onNextAyah,
  onPlayAyah,
  onPauseAyah,
  onSelectWordRoot,
  isBookmarked,
  onToggleBookmark,
  hasNote,
  onOpenNoteDrawer,
  onOpenExportModal,
  fontSize,
  highlights,
  onAddHighlight,
  onDeleteHighlight,
  expandedTafasir,
  onToggleTafsir,
  tafsirOrder,
  visibleTafasir,
  tafsirLayoutMode,
  onPageChange
}) => {
  const [studyTab, setStudyTab] = useState<'tafsir' | 'translation' | 'sarf'>('tafsir');

  const pageVerses = ayahs.filter(a => a.page_madani === activePage);

  return (
    <div dir="rtl" className="max-w-[1700px] mx-auto px-2 sm:px-4 py-2 space-y-3 font-ibm">
      {/* Top Split Controller Bar */}
      <div className="flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-900/10 dark:border-emerald-600/20 shadow-xs text-xs font-semibold">
        <div className="flex items-center gap-2">
          <Split className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-slate-800 dark:text-slate-200">
            مطالعہ تفاسیر مع مصحف شریف (Synchronized Split Study)
          </span>
        </div>

        {/* Study Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setStudyTab('tafsir')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              studyTab === 'tafsir'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>تفاسیر</span>
          </button>

          <button
            onClick={() => setStudyTab('translation')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              studyTab === 'translation'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>تراجم</span>
          </button>

          <button
            onClick={() => setStudyTab('sarf')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              studyTab === 'sarf'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>صرف و نحو</span>
          </button>
        </div>

        {/* Active Ayah Navigation Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevAyah}
            disabled={currentAyahNumber <= 1}
            title="پچھلی آیت"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono">
            آیت {toArabicDigits(currentAyahNumber)}
          </span>

          <button
            onClick={onNextAyah}
            disabled={currentAyahNumber >= (currentSurah?.verses_count || 1)}
            title="اگلی آیت"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => isPlaying ? onPauseAyah() : onPlayAyah(currentAyah)}
            title={isPlaying ? "تلاوت روکیں" : "تلاوت سنیں"}
            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs"
          >
            {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Split Grid (Dual Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* RIGHT COLUMN: Authentic 15-Line Mushaf Page (5 Columns on Desktop) */}
        <div className="lg:col-span-5 xl:col-span-6 sticky top-2">
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

        {/* LEFT COLUMN: Study & Commentary Pane (7 Columns on Desktop) */}
        <div className="lg:col-span-7 xl:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-3 sm:p-5 shadow-xl max-h-[85vh] overflow-y-auto">
          {studyTab === 'tafsir' && (
            <TafsirView
              currentAyah={currentAyah}
              tafasir={tafasir}
              scriptMode={scriptMode}
              onPrevAyah={onPrevAyah}
              onNextAyah={onNextAyah}
              expandedTafasir={expandedTafasir}
              onToggleTafsir={onToggleTafsir}
              isBookmarked={isBookmarked}
              onToggleBookmark={onToggleBookmark}
              hasNote={hasNote}
              onOpenNoteDrawer={onOpenNoteDrawer}
              onOpenExportModal={onOpenExportModal}
              totalVersesInSurah={currentSurah?.verses_count || ayahs.length}
              fontSize={fontSize}
              highlights={highlights}
              onAddHighlight={onAddHighlight}
              onDeleteHighlight={onDeleteHighlight}
              onNavigateToVerse={onSelectAyah}
              onSelectWordRoot={onSelectWordRoot}
              tafsirOrder={tafsirOrder}
              visibleTafasir={visibleTafasir}
              tafsirLayoutMode={tafsirLayoutMode}
            />
          )}

          {studyTab === 'translation' && (
            <TranslationView
              ayahs={ayahs.filter(a => a.ayah_number === currentAyahNumber)}
              currentSurah={currentSurah}
              currentAyahNumber={currentAyahNumber}
              scriptMode={scriptMode}
              showWordByWord={showWordByWord}
              selectedTranslationAuthor={selectedTranslationAuthor}
              secondaryTranslationAuthor={secondaryTranslationAuthor}
              wbwLanguage={wbwLanguage}
              onSelectAyah={onSelectAyah}
              onOpenMorphology={() => setStudyTab('sarf')}
              onOpenTafsir={() => setStudyTab('tafsir')}
              isPlaying={isPlaying}
              activePlayingAyah={activePlayingAyah}
              activePlayingWordIndex={activePlayingWordIndex}
              onPlayAyah={onPlayAyah}
              onPauseAyah={onPauseAyah}
              isAyahBookmarked={() => isBookmarked}
              onToggleBookmark={() => onToggleBookmark()}
              onSelectWordRoot={onSelectWordRoot}
            />
          )}

          {studyTab === 'sarf' && (
            <MorphologyView
              currentAyah={currentAyah}
              scriptMode={scriptMode}
              onPrevAyah={onPrevAyah}
              onNextAyah={onNextAyah}
              onSelectWordRoot={onSelectWordRoot}
              isPlaying={isPlaying && activePlayingAyah === currentAyah.ayah_number}
              activePlayingWordIndex={activePlayingWordIndex}
              onPlayAyah={onPlayAyah}
              onPauseAyah={onPauseAyah}
              onOpenTafsir={() => setStudyTab('tafsir')}
            />
          )}
        </div>

      </div>
    </div>
  );
};
