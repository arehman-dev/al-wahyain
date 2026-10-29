import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SubHeaderToolbar } from './components/SubHeaderToolbar';
import { BottomDock } from './components/BottomDock';
import { MushafView } from './components/MushafView';
import { MorphologyView } from './components/MorphologyView';
import { TafsirView } from './components/TafsirView';
import { QuickPeekDrawer } from './components/QuickPeekDrawer';
import { RootExplorerModal } from './components/RootExplorerModal';
import { TajweedLegendModal } from './components/TajweedLegendModal';
import { SourcesAttributionModal } from './components/SourcesAttributionModal';
import { SearchModal } from './components/SearchModal';
import { StudySuiteModal } from './components/StudySuiteModal';
import { NoteEditorDrawer } from './components/NoteEditorDrawer';
import { ExportShareModal } from './components/ExportShareModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { Maximize2 } from 'lucide-react';
import { 
  Surah, 
  Ayah, 
  TafsirEntry, 
  AppMode, 
  ScriptMode, 
  MushafDisplayMode,
  Bookmark,
  AyahNote
} from './types/quran';
import { 
  fetchSurahs, 
  fetchAyahs, 
  fetchTafasir,
  fetchBookmarks,
  addBookmark,
  removeBookmark,
  fetchNotes
} from './services/api';

export const App: React.FC = () => {
  // 1. Persistent State
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [currentSurahId, setCurrentSurahId] = useState<number>(() => {
    return Number(localStorage.getItem('qs_surah_id')) || 1;
  });
  const [currentAyahNumber, setCurrentAyahNumber] = useState<number>(() => {
    return Number(localStorage.getItem('qs_ayah_number')) || 1;
  });
  const [activeMode, setActiveMode] = useState<AppMode>(() => {
    return (localStorage.getItem('qs_active_mode') as AppMode) || 'tafsir';
  });
  const [scriptMode, setScriptMode] = useState<ScriptMode>(() => {
    return (localStorage.getItem('qs_script_mode') as ScriptMode) || 'indopak';
  });
  const [mushafDisplayMode, setMushafDisplayMode] = useState<MushafDisplayMode>(() => {
    return (localStorage.getItem('qs_mushaf_display') as MushafDisplayMode) || 'continuous';
  });
  const [showTajweed, setShowTajweed] = useState<boolean>(() => {
    return localStorage.getItem('qs_show_tajweed') === 'true';
  });
  const [showInlineTranslation, setShowInlineTranslation] = useState<boolean>(true);
  const [selectedTranslationAuthor, setSelectedTranslationAuthor] = useState<string>('taqi_usmani');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('qs_dark_mode') === 'true';
  });

  // Power User Customization State
  const [fontSize, setFontSize] = useState<number>(() => {
    return Number(localStorage.getItem('qs_font_size')) || 17;
  });
  const [tafsirLayout, setTafsirLayout] = useState<'stacked' | 'grid'>(() => {
    return (localStorage.getItem('qs_tafsir_layout') as 'stacked' | 'grid') || 'stacked';
  });
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Stacked Tafsir Collapsible State
  const [expandedTafasir, setExpandedTafasir] = useState<Record<string, boolean>>({
    tafheem: true,
    maarif: true,
    ibn_kathir: true,
    tayseer: true,
  });

  // 2. Data State
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [tafasir, setTafasir] = useState<TafsirEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 3. Audio & Synchronization State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activePlayingAyah, setActivePlayingAyah] = useState<number | null>(null);
  const [activePlayingWordIndex, setActivePlayingWordIndex] = useState<number | null>(null);

  // 4. Modals & Drawers State
  const [quickPeekAyah, setQuickPeekAyah] = useState<Ayah | null>(null);
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const [showTajweedLegend, setShowTajweedLegend] = useState<boolean>(false);
  const [showAttributions, setShowAttributions] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showStudySuiteModal, setShowStudySuiteModal] = useState<boolean>(false);
  const [showNoteDrawer, setShowNoteDrawer] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  // 5. Bookmarks & Notes State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<AyahNote[]>([]);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('qs_dark_mode', String(darkMode));
  }, [darkMode]);

  // Persist study position & settings
  useEffect(() => {
    localStorage.setItem('qs_surah_id', String(currentSurahId));
    localStorage.setItem('qs_ayah_number', String(currentAyahNumber));
    localStorage.setItem('qs_active_mode', activeMode);
    localStorage.setItem('qs_script_mode', scriptMode);
    localStorage.setItem('qs_mushaf_display', mushafDisplayMode);
    localStorage.setItem('qs_show_tajweed', String(showTajweed));
    localStorage.setItem('qs_font_size', String(fontSize));
    localStorage.setItem('qs_tafsir_layout', tafsirLayout);
  }, [currentSurahId, currentAyahNumber, activeMode, scriptMode, mushafDisplayMode, showTajweed, fontSize, tafsirLayout]);

  // Load bookmarks & notes
  const reloadStudyData = useCallback(() => {
    fetchBookmarks().then(setBookmarks).catch(console.error);
    fetchNotes().then(setNotes).catch(console.error);
  }, []);

  useEffect(() => {
    reloadStudyData();
  }, [reloadStudyData]);

  // Load initial Surahs
  useEffect(() => {
    fetchSurahs()
      .then(res => setSurahs(res))
      .catch(console.error);
  }, []);

  // Load Ayahs when Surah changes
  useEffect(() => {
    setLoading(true);
    fetchAyahs(currentSurahId)
      .then(res => {
        setAyahs(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [currentSurahId]);

  // Load Tafasir when current Surah or Ayah changes
  useEffect(() => {
    fetchTafasir(currentSurahId, currentAyahNumber)
      .then(res => setTafasir(res))
      .catch(console.error);
  }, [currentSurahId, currentAyahNumber]);

  // Current Surah & Ayah Objects
  const currentSurah = surahs.find(s => s.id === currentSurahId);
  const currentAyah = ayahs.find(a => a.ayah_number === currentAyahNumber) || ayahs[0] || null;

  // Check if current Ayah is bookmarked
  const isCurrentAyahBookmarked = !!bookmarks.find(
    b => b.surah_id === currentSurahId && b.ayah_number === currentAyahNumber
  );

  // Check if current Ayah has a note
  const hasCurrentAyahNote = !!notes.find(
    n => n.surah_id === currentSurahId && n.ayah_number === currentAyahNumber
  );

  // Bookmark toggle handler
  const handleToggleBookmark = async () => {
    if (!currentAyah) return;
    try {
      if (isCurrentAyahBookmarked) {
        await removeBookmark(currentSurahId, currentAyahNumber);
        setBookmarks(prev => prev.filter(b => !(b.surah_id === currentSurahId && b.ayah_number === currentAyahNumber)));
      } else {
        await addBookmark(currentSurahId, currentAyahNumber, currentAyah.verse_key);
        reloadStudyData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Navigation handlers
  const handleSelectSurah = (id: number) => {
    setCurrentSurahId(id);
    setCurrentAyahNumber(1);
  };

  const handleSelectAyah = (num: number) => {
    setCurrentAyahNumber(num);
  };

  const handlePrevAyah = useCallback(() => {
    if (currentAyahNumber > 1) {
      setCurrentAyahNumber(prev => prev - 1);
    } else if (currentSurahId > 1) {
      const prevSurah = surahs.find(s => s.id === currentSurahId - 1);
      setCurrentSurahId(prev => prev - 1);
      setCurrentAyahNumber(prevSurah?.verses_count || 1);
    }
  }, [currentAyahNumber, currentSurahId, surahs]);

  const handleNextAyah = useCallback(() => {
    if (currentSurah && currentAyahNumber < currentSurah.verses_count) {
      setCurrentAyahNumber(prev => prev + 1);
    } else if (currentSurahId < 114) {
      setCurrentSurahId(prev => prev + 1);
      setCurrentAyahNumber(1);
    }
  }, [currentSurah, currentAyahNumber, currentSurahId]);

  // Audio Playback Handlers
  const handlePlayAyah = (ayah: Ayah) => {
    setCurrentAyahNumber(ayah.ayah_number);
    setActivePlayingAyah(ayah.ayah_number);
    setIsPlaying(true);
  };

  const handlePauseAyah = () => {
    setIsPlaying(false);
  };

  // Global Power-User Hotkeys Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing inside input, textarea, or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Search: Ctrl+K / Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
        return;
      }

      // Space: Play/Pause audio
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
        return;
      }

      // Arrow navigation / J & K
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'j') {
        handleNextAyah();
        return;
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'k') {
        handlePrevAyah();
        return;
      }

      // B: Toggle Bookmark
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleBookmark();
        return;
      }

      // N: Toggle Note Drawer
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setShowNoteDrawer(prev => !prev);
        return;
      }

      // Z: Toggle Zen / Focus Mode
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setIsZenMode(prev => !prev);
        return;
      }

      // ?: Open Shortcuts modal
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      // Numbers 1, 2, 3: Switch Workspace Mode
      if (e.key === '1') {
        setActiveMode('tafsir');
      } else if (e.key === '2') {
        setActiveMode('mushaf');
      } else if (e.key === '3') {
        setActiveMode('morphology');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextAyah, handlePrevAyah, handleToggleBookmark]);

  // Stacked Tafsir Handlers
  const handleToggleTafsir = (slug: string) => {
    setExpandedTafasir(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  const handleExpandAll = () => {
    setExpandedTafasir({
      tafheem: true,
      maarif: true,
      ibn_kathir: true,
      tayseer: true
    });
  };

  const handleCollapseAll = () => {
    setExpandedTafasir({
      tafheem: false,
      maarif: false,
      ibn_kathir: false,
      tayseer: false
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-emerald-500/20">
      
      {/* ======================================================== */}
      {/* 1. TOP BAR: Primary App Bar (Full Width, h-11 / 44px)   */}
      {/* ======================================================== */}
      {!isZenMode && (
        <Header
          activeMode={activeMode}
          onChangeMode={setActiveMode}
          onOpenAttributions={() => setShowAttributions(true)}
          onOpenSearch={() => setShowSearchModal(true)}
          onOpenStudySuite={() => setShowStudySuiteModal(true)}
          onOpenShortcuts={() => setShowShortcutsModal(true)}
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode(prev => !prev)}
          bookmarksCount={bookmarks.length}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      )}

      {/* ======================================================== */}
      {/* 2. SUB-HEADER BAR: Navigation & Context Toolbar (h-10)   */}
      {/* ======================================================== */}
      {!isZenMode && (
        <SubHeaderToolbar
          surahs={surahs}
          currentSurahId={currentSurahId}
          currentAyahNumber={currentAyahNumber}
          onSelectSurah={handleSelectSurah}
          onSelectAyah={handleSelectAyah}
          onPrevAyah={handlePrevAyah}
          onNextAyah={handleNextAyah}
          isBookmarked={isCurrentAyahBookmarked}
          onToggleBookmark={handleToggleBookmark}
          hasNote={hasCurrentAyahNote}
          onOpenNoteDrawer={() => setShowNoteDrawer(true)}
          activeMode={activeMode}
          scriptMode={scriptMode}
          onToggleScript={() => setScriptMode(prev => prev === 'madani' ? 'indopak' : 'madani')}
          mushafDisplayMode={mushafDisplayMode}
          onToggleMushafDisplayMode={() => setMushafDisplayMode(prev => prev === 'page' ? 'continuous' : 'page')}
          showTajweed={showTajweed}
          onToggleTajweed={() => setShowTajweed(prev => !prev)}
          showInlineTranslation={showInlineTranslation}
          onToggleTranslation={() => setShowInlineTranslation(prev => !prev)}
          onOpenTajweedLegend={() => setShowTajweedLegend(true)}
        />
      )}

      {/* Zen Mode Exit Floater */}
      {isZenMode && (
        <button
          onClick={() => setIsZenMode(false)}
          title="فوکس موڈ سے باہر نکلیں (Z)"
          className="fixed top-3 left-4 z-50 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-md border border-slate-700 shadow-xl flex items-center gap-1.5 transition-all font-ibm"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>فوکس موڈ بند کریں</span>
        </button>
      )}

      {/* ======================================================== */}
      {/* MAIN WORKSPACE CONTENT AREA                              */}
      {/* ======================================================== */}
      <main className={`flex-1 ${isZenMode ? 'pt-4' : 'pt-2'} pb-16`}>
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-3 font-ibm">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto"></div>
              <p className="text-slate-500 font-semibold">متن اور تفاسیر لوڈ کی جا رہی ہیں...</p>
            </div>
          </div>
        ) : ayahs.length === 0 ? (
          <div dir="rtl" className="max-w-2xl mx-auto my-14 p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm font-ibm">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl">
              📖
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
              اس سورت کا ڈیٹا لوڈ نہیں ہے
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              فی الوقت درج ذیل سورتیں مکمل متن اور تمام ۴ تفاسیر کے ساتھ ڈیٹا بیس میں دستیاب ہیں:
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {[
                { id: 1, name: '1. الفاتحہ' },
                { id: 2, name: '2. البقرۃ (286 آیات)' },
                { id: 3, name: '3. آل عمران (200 آیات)' },
                { id: 4, name: '4. النساء (176 آیات)' },
                { id: 55, name: '55. الرحمن (78 آیات)' },
                { id: 56, name: '56. الواقعہ (96 آیات)' },
                { id: 57, name: '57. الحدید (29 آیات)' },
              ].map(s => (
                <button 
                  key={s.id}
                  onClick={() => handleSelectSurah(s.id)} 
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Mode 1: Mushaf View */}
            {activeMode === 'mushaf' && (
              <MushafView
                ayahs={ayahs}
                currentSurah={currentSurah}
                currentAyahNumber={currentAyahNumber}
                scriptMode={scriptMode}
                mushafDisplayMode={mushafDisplayMode}
                showTajweed={showTajweed}
                showInlineTranslation={showInlineTranslation}
                selectedTranslationAuthor={selectedTranslationAuthor}
                onSelectAyah={handleSelectAyah}
                onOpenMorphology={(num) => {
                  setCurrentAyahNumber(num);
                  setActiveMode('morphology');
                }}
                onOpenTafsir={(num) => {
                  setCurrentAyahNumber(num);
                  setActiveMode('tafsir');
                }}
                onQuickPeek={(ayah) => setQuickPeekAyah(ayah)}
                isPlaying={isPlaying}
                activePlayingAyah={activePlayingAyah}
                activePlayingWordIndex={activePlayingWordIndex}
                onPlayAyah={handlePlayAyah}
                onPauseAyah={handlePauseAyah}
              />
            )}

            {/* Mode 2: Word-by-Word & Deep Morphology View */}
            {activeMode === 'morphology' && currentAyah && (
              <MorphologyView
                currentAyah={currentAyah}
                scriptMode={scriptMode}
                onPrevAyah={handlePrevAyah}
                onNextAyah={handleNextAyah}
                onSelectWordRoot={(root) => setSelectedRoot(root)}
                isPlaying={isPlaying && activePlayingAyah === currentAyah.ayah_number}
                activePlayingWordIndex={activePlayingWordIndex}
                onPlayAyah={handlePlayAyah}
                onPauseAyah={handlePauseAyah}
                onOpenTafsir={(num) => {
                  setCurrentAyahNumber(num);
                  setActiveMode('tafsir');
                }}
              />
            )}

            {/* Mode 3: Stacked & Comparative Multi-Tafsir View */}
            {activeMode === 'tafsir' && currentAyah && (
              <TafsirView
                currentAyah={currentAyah}
                tafasir={tafasir}
                scriptMode={scriptMode}
                onPrevAyah={handlePrevAyah}
                onNextAyah={handleNextAyah}
                expandedTafasir={expandedTafasir}
                onToggleTafsir={handleToggleTafsir}
                onExpandAll={handleExpandAll}
                onCollapseAll={handleCollapseAll}
                isBookmarked={isCurrentAyahBookmarked}
                onToggleBookmark={handleToggleBookmark}
                hasNote={hasCurrentAyahNote}
                onOpenNoteDrawer={() => setShowNoteDrawer(true)}
                onOpenExportModal={() => setShowExportModal(true)}
                totalVersesInSurah={currentSurah?.verses_count || ayahs.length}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                layoutMode={tafsirLayout}
                onToggleLayoutMode={() => setTafsirLayout(prev => prev === 'stacked' ? 'grid' : 'stacked')}
              />
            )}
          </>
        )}
      </main>

      {/* ======================================================== */}
      {/* 3. BOTTOM BAR: Power-User Dock & Unified Audio (h-11)    */}
      {/* ======================================================== */}
      <BottomDock
        currentSurah={currentSurah}
        currentAyah={currentAyah}
        isPlaying={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onNextAyah={handleNextAyah}
        onPrevAyah={handlePrevAyah}
        onWordTimeUpdate={setActivePlayingWordIndex}
        activeMode={activeMode}
        scriptMode={scriptMode}
        onToggleScript={() => setScriptMode(prev => prev === 'madani' ? 'indopak' : 'madani')}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        tafsirLayout={tafsirLayout}
        onToggleTafsirLayout={() => setTafsirLayout(prev => prev === 'stacked' ? 'grid' : 'stacked')}
        mushafDisplayMode={mushafDisplayMode}
        onToggleMushafDisplayMode={() => setMushafDisplayMode(prev => prev === 'page' ? 'continuous' : 'page')}
        onOpenExportModal={() => setShowExportModal(true)}
      />

      {/* ======================================================== */}
      {/* MODALS & DRAWERS                                         */}
      {/* ======================================================== */}

      {/* Quick Peek Ayah Drawer */}
      <QuickPeekDrawer
        ayah={quickPeekAyah}
        tafasir={tafasir}
        onClose={() => setQuickPeekAyah(null)}
        onOpenFullTafsir={() => {
          if (quickPeekAyah) setCurrentAyahNumber(quickPeekAyah.ayah_number);
          setQuickPeekAyah(null);
          setActiveMode('tafsir');
        }}
        onOpenFullMorphology={() => {
          if (quickPeekAyah) setCurrentAyahNumber(quickPeekAyah.ayah_number);
          setQuickPeekAyah(null);
          setActiveMode('morphology');
        }}
      />

      {/* Root Concordance Explorer Modal */}
      <RootExplorerModal
        root={selectedRoot}
        onClose={() => setSelectedRoot(null)}
        onJumpToAyah={(surahId, ayahNumber) => {
          setCurrentSurahId(surahId);
          setCurrentAyahNumber(ayahNumber);
        }}
      />

      {/* Tajweed Rules Legend Modal */}
      {showTajweedLegend && (
        <TajweedLegendModal onClose={() => setShowTajweedLegend(false)} />
      )}

      {/* Official Sources & Citations Modal */}
      {showAttributions && (
        <SourcesAttributionModal onClose={() => setShowAttributions(false)} />
      )}

      {/* Global Quran & Tafasir Search Modal (Ctrl+K) */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectResult={(surahId, ayahNumber) => {
          setCurrentSurahId(surahId);
          setCurrentAyahNumber(ayahNumber);
          setActiveMode('tafsir');
        }}
      />

      {/* Personal Study Suite: Bookmarks & Reflections Modal */}
      <StudySuiteModal
        isOpen={showStudySuiteModal}
        onClose={() => setShowStudySuiteModal(false)}
        onJumpToAyah={(surahId, ayahNumber) => {
          setCurrentSurahId(surahId);
          setCurrentAyahNumber(ayahNumber);
        }}
      />

      {/* Study Note Editor Drawer */}
      <NoteEditorDrawer
        isOpen={showNoteDrawer}
        onClose={() => setShowNoteDrawer(false)}
        ayah={currentAyah}
        onNoteSaved={reloadStudyData}
      />

      {/* Export & Sharing Modal */}
      <ExportShareModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        ayah={currentAyah}
        tafasir={tafasir}
      />

      {/* Keyboard Shortcuts Sheet Modal (?) */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

    </div>
  );
};

export default App;
