import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Header, SidebarTab } from './components/Header';
import { SubHeaderToolbar } from './components/SubHeaderToolbar';
import { BottomDock } from './components/BottomDock';
import { SidebarDrawer } from './components/SidebarDrawer';
import { MushafView } from './components/MushafView';
import { ZenModeHUD } from './components/ZenModeHUD';
import { TranslationView } from './components/TranslationView';
import { MorphologyView } from './components/MorphologyView';
import { TafsirView } from './components/TafsirView';
import { QuickPeekDrawer } from './components/QuickPeekDrawer';
import { NoteEditorDrawer } from './components/NoteEditorDrawer';
import { SurahIntroView } from './components/SurahIntroView';
import { NavArrowMode, CustomShortcutsMap } from './types/shortcuts';

// Lazy-loaded secondary study modals for optimized initial payload
const TafsirSettingsModal = lazy(() => import('./components/TafsirSettingsModal').then(m => ({ default: m.TafsirSettingsModal })));
const RootExplorerModal = lazy(() => import('./components/RootExplorerModal').then(m => ({ default: m.RootExplorerModal })));
const TajweedLegendModal = lazy(() => import('./components/TajweedLegendModal').then(m => ({ default: m.TajweedLegendModal })));
const SourcesAttributionModal = lazy(() => import('./components/SourcesAttributionModal').then(m => ({ default: m.SourcesAttributionModal })));
const StudySuiteModal = lazy(() => import('./components/StudySuiteModal').then(m => ({ default: m.StudySuiteModal })));
const ExportShareModal = lazy(() => import('./components/ExportShareModal').then(m => ({ default: m.ExportShareModal })));
const OmnibarModal = lazy(() => import('./components/OmnibarModal').then(m => ({ default: m.OmnibarModal })));
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));
import { 
  getStoredNavArrowMode, 
  setStoredNavArrowMode, 
  getStoredCustomShortcuts, 
  setStoredCustomShortcuts, 
  getEffectiveShortcut, 
  eventMatchesShortcut 
} from './utils/shortcutsHelper';
import { 
  Surah, 
  Ayah, 
  TafsirEntry, 
  AppMode, 
  ScriptMode, 
  ReadingTheme,
  TafsirLayoutMode,
  OverallReadingMode,
  Bookmark, 
  AyahNote, 
  TafsirHighlight, 
  HighlightColor,
  DEFAULT_TAFSIR_ORDER
} from './types/quran';
import { 
  fetchSurahs, 
  fetchAyahs, 
  fetchTafasir,
  fetchBookmarks,
  addBookmark,
  removeBookmark,
  fetchNotes,
  fetchHighlights,
  saveHighlight,
  deleteHighlight
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
    const saved = localStorage.getItem('qs_active_mode');
    if (saved === 'mushaf' || saved === 'quran') return 'quran';
    if (saved === 'translation') return 'translation';
    if (saved === 'morphology' || saved === 'sarf') return 'sarf';
    if (saved === 'tafsir' || saved === 'tafseer') return 'tafseer';
    return 'quran';
  });
  // Strictly QCF V2 ('madani') everywhere
  const [scriptMode] = useState<ScriptMode>('madani');
  const [showTajweed, setShowTajweed] = useState<boolean>(() => {
    return localStorage.getItem('qs_show_tajweed') === 'true';
  });
  const [showWordByWord, setShowWordByWord] = useState<boolean>(() => {
    return localStorage.getItem('qs_show_wbw') === 'true';
  });
  const [selectedTranslationAuthor, setSelectedTranslationAuthor] = useState<string>(() => {
    return localStorage.getItem('qs_translation_author') || 'taqi_usmani';
  });
  const [secondaryTranslationAuthor, setSecondaryTranslationAuthor] = useState<string | null>(() => {
    return localStorage.getItem('qs_secondary_translation_author') || null;
  });
  const [wbwLanguage, setWbwLanguage] = useState<'both' | 'ur' | 'en' | 'ur2' | 'en2'>(() => {
    return (localStorage.getItem('qs_wbw_lang') as any) || 'both';
  });
  const [themeMode, setThemeMode] = useState<ReadingTheme>(() => {
    const saved = localStorage.getItem('qs_theme_mode');
    if (saved === 'light' || saved === 'sepia' || saved === 'dark' || saved === 'oled') return saved as ReadingTheme;
    return localStorage.getItem('qs_dark_mode') === 'true' ? 'dark' : 'light';
  });
  const [tafsirLayoutMode, setTafsirLayoutMode] = useState<TafsirLayoutMode>(() => {
    const saved = localStorage.getItem('qs_tafsir_layout');
    if (saved === 'focus') return 'focus';
    return 'stacked';
  });
  const [overallReadingMode, setOverallReadingMode] = useState<OverallReadingMode>('standard');

  // Left & Right Horizontal Padding Percentage (1% to 24%)
  const [horizontalPadding, setHorizontalPadding] = useState<number>(() => {
    const saved = localStorage.getItem('qs_horizontal_padding');
    if (saved !== null && !isNaN(Number(saved))) {
      return Math.min(24, Math.max(1, Number(saved)));
    }
    return 8;
  });

  // Sidebar Drawer State (About, Preferences, References & Data Sources)
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('about');

  // Navigation Direction & Custom Shortcuts
  const [navArrowMode, setNavArrowMode] = useState<NavArrowMode>(getStoredNavArrowMode);
  const [customShortcuts, setCustomShortcuts] = useState<CustomShortcutsMap>(getStoredCustomShortcuts);

  const handleChangeNavArrowMode = (mode: NavArrowMode) => {
    setNavArrowMode(mode);
    setStoredNavArrowMode(mode);
  };

  const handleUpdateShortcut = (id: string, key: string) => {
    setCustomShortcuts(prev => {
      const next = { ...prev };
      if (!key) {
        delete next[id];
      } else {
        next[id] = key;
      }
      setStoredCustomShortcuts(next);
      return next;
    });
  };

  const handleResetShortcuts = () => {
    setCustomShortcuts({});
    setStoredCustomShortcuts({});
  };

  useEffect(() => {
    localStorage.setItem('qs_reading_mode', overallReadingMode);
  }, [overallReadingMode]);

  useEffect(() => {
    localStorage.setItem('qs_horizontal_padding', String(horizontalPadding));
  }, [horizontalPadding]);

  // Power User Customization State
  const [fontSize, setFontSizeState] = useState<number>(() => {
    return Number(localStorage.getItem('qs_font_size')) || 18;
  });
  const setFontSize = (size: number) => {
    setFontSizeState(size);
    localStorage.setItem('qs_font_size', String(size));
  };
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Active Mushaf Page (604 page standard)
  const [activeMushafPage, setActiveMushafPage] = useState<number>(1);

  // Tafsir Order & Visibility preferences
  const [tafsirOrder, setTafsirOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('qs_tafsir_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure 'saadi' is included if user had an older saved order
          if (!parsed.includes('saadi')) {
            return [...parsed, 'saadi'];
          }
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_TAFSIR_ORDER;
  });

  const [visibleTafasir, setVisibleTafasir] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('qs_tafsir_visibility');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { saadi: true, ...parsed };
      }
    } catch {}
    return {
      bayan_ul_quran: true,
      tafheem: true,
      maarif: true,
      ibn_kathir: true,
      saadi: true,
      tayseer: true
    };
  });

  const [showTafsirSettingsModal, setShowTafsirSettingsModal] = useState<boolean>(false);

  // Stacked Tafsir Collapsible State
  const [expandedTafasir, setExpandedTafasir] = useState<Record<string, boolean>>({
    bayan_ul_quran: true,
    tafheem: true,
    maarif: true,
    ibn_kathir: true,
    saadi: true,
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

  // 5. Bookmarks, Notes & Highlights State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<AyahNote[]>([]);
  const [highlights, setHighlights] = useState<TafsirHighlight[]>([]);

  // Sync reading atmosphere theme (light, sepia, dark, oled)
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('dark', 'theme-sepia', 'theme-oled');

    if (themeMode === 'dark') {
      html.classList.add('dark');
    } else if (themeMode === 'oled') {
      html.classList.add('dark', 'theme-oled');
    } else if (themeMode === 'sepia') {
      html.classList.add('theme-sepia');
    }

    localStorage.setItem('qs_theme_mode', themeMode);
    localStorage.setItem('qs_dark_mode', String(themeMode === 'dark' || themeMode === 'oled'));
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('qs_tafsir_layout', tafsirLayoutMode);
  }, [tafsirLayoutMode]);

  // Persist study position & settings
  useEffect(() => {
    localStorage.setItem('qs_surah_id', String(currentSurahId));
    localStorage.setItem('qs_ayah_number', String(currentAyahNumber));
    localStorage.setItem('qs_active_mode', activeMode);
    localStorage.setItem('qs_script_mode', 'madani');
    localStorage.setItem('qs_show_tajweed', String(showTajweed));
    localStorage.setItem('qs_show_wbw', String(showWordByWord));
    localStorage.setItem('qs_font_size', String(fontSize));
  }, [currentSurahId, currentAyahNumber, activeMode, showTajweed, showWordByWord, fontSize]);

  // Load bookmarks, notes & highlights
  const reloadStudyData = useCallback(() => {
    fetchBookmarks().then(setBookmarks).catch(console.error);
    fetchNotes().then(setNotes).catch(console.error);
    fetchHighlights().then(setHighlights).catch(console.error);
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

  // Load Tafasir when current Surah or Ayah changes (including Ayah 0 / Surah Introductions)
  useEffect(() => {
    fetchTafasir(currentSurahId, currentAyahNumber)
      .then(res => setTafasir(res))
      .catch(console.error);
  }, [currentSurahId, currentAyahNumber]);

  // Current Surah & Ayah Objects
  const isQuranOrSarf = activeMode === 'quran' || activeMode === 'mushaf' || activeMode === 'sarf' || activeMode === 'morphology';
  const currentSurah = surahs.find(s => s.id === currentSurahId);
  const currentAyah = ayahs.find(a => a.ayah_number === currentAyahNumber) || (currentAyahNumber === 0 ? null : (ayahs[0] || null));
  const effectiveAyah: Ayah | null = currentAyah || (currentAyahNumber === 0 && currentSurah ? {
    id: 0,
    surah_id: currentSurahId,
    ayah_number: 0,
    verse_key: `${currentSurahId}:0-intro`,
    text_uthmani: `مقدمة سورة ${currentSurah.name_arabic}`,
    text_indopak: `مقدمہ سورت ${currentSurah.name_urdu}`,
    page_madani: 1,
    juz_number: 1,
    hizb_number: 1,
    rub_el_hizb: 1,
    sajdah: false,
    translations: [],
    words: []
  } : null);

  // In Quran and Sarf mode, ensure verse 0 is never selected
  useEffect(() => {
    if (isQuranOrSarf && currentAyahNumber === 0) {
      setCurrentAyahNumber(1);
    }
  }, [isQuranOrSarf, currentAyahNumber]);

  // Sync active page with current Ayah
  useEffect(() => {
    if (currentAyah?.page_madani) {
      setActiveMushafPage(currentAyah.page_madani);
    }
  }, [currentAyah]);

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
    if (!currentAyah && currentAyahNumber !== 0) return;
    const verseKey = currentAyahNumber === 0 
      ? `${currentSurahId}:0-intro` 
      : currentAyah?.verse_key || `${currentSurahId}:${currentAyahNumber}`;
    try {
      if (isCurrentAyahBookmarked) {
        await removeBookmark(currentSurahId, currentAyahNumber);
        setBookmarks(prev => prev.filter(b => !(b.surah_id === currentSurahId && b.ayah_number === currentAyahNumber)));
      } else {
        await addBookmark(currentSurahId, currentAyahNumber, verseKey);
        reloadStudyData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Highlight Handlers
  const handleAddHighlight = async (text: string, color: HighlightColor, tafsirSlug: string = 'general') => {
    if (!currentAyah && currentAyahNumber !== 0) return;
    const newHl: Omit<TafsirHighlight, 'created_at'> = {
      id: `hl_${Date.now()}`,
      surah_id: currentSurahId,
      ayah_number: currentAyahNumber,
      verse_key: currentAyahNumber === 0 ? `${currentSurahId}:0-intro` : currentAyah?.verse_key || `${currentSurahId}:${currentAyahNumber}`,
      tafsir_slug: tafsirSlug,
      text: text.trim(),
      color
    };
    try {
      await saveHighlight(newHl);
      reloadStudyData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    try {
      await deleteHighlight(id);
      setHighlights(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Cross-reference jump handler
  const handleNavigateToVerse = (surahId: number, ayahNumber: number) => {
    setCurrentSurahId(surahId);
    setCurrentAyahNumber(ayahNumber);
  };

  // Surah & Ayah Selectors
  const handleSelectSurah = (id: number) => {
    setCurrentSurahId(id);
    setCurrentAyahNumber(1);
    setIsPlaying(false);
  };

  const handleSelectAyah = (num: number, surahId?: number) => {
    if (surahId && surahId !== currentSurahId) {
      setCurrentSurahId(surahId);
    }
    const isQuranOrSarfMode = activeMode === 'quran' || activeMode === 'mushaf' || activeMode === 'sarf' || activeMode === 'morphology';
    setCurrentAyahNumber(isQuranOrSarfMode && num === 0 ? 1 : num);
  };

  // Navigation: Next / Prev Ayah
  const handleNextAyah = useCallback(() => {
    if (!currentSurah) return;
    const isQuranOrSarfMode = activeMode === 'quran' || activeMode === 'mushaf' || activeMode === 'sarf' || activeMode === 'morphology';
    if (currentAyahNumber < currentSurah.verses_count) {
      setCurrentAyahNumber(prev => prev + 1);
    } else if (currentSurahId < 114) {
      setCurrentSurahId(prev => prev + 1);
      setCurrentAyahNumber(isQuranOrSarfMode ? 1 : 0);
    }
  }, [currentSurah, currentAyahNumber, currentSurahId, activeMode]);

  const handlePrevAyah = useCallback(() => {
    const isQuranOrSarfMode = activeMode === 'quran' || activeMode === 'mushaf' || activeMode === 'sarf' || activeMode === 'morphology';
    const minAyah = isQuranOrSarfMode ? 1 : 0;
    if (currentAyahNumber > minAyah) {
      setCurrentAyahNumber(prev => prev - 1);
    } else if (currentSurahId > 1) {
      const prevSurah = surahs.find(s => s.id === currentSurahId - 1);
      if (prevSurah) {
        setCurrentSurahId(prevSurah.id);
        setCurrentAyahNumber(prevSurah.verses_count);
      }
    }
  }, [currentAyahNumber, currentSurahId, surahs, activeMode]);

  // Navigation: Next / Prev Surah
  const handlePrevSurah = useCallback(() => {
    if (currentSurahId > 1) {
      setCurrentSurahId(prev => prev - 1);
      setCurrentAyahNumber(1);
      setIsPlaying(false);
    }
  }, [currentSurahId]);

  const handleNextSurah = useCallback(() => {
    if (currentSurahId < 114) {
      setCurrentSurahId(prev => prev + 1);
      setCurrentAyahNumber(1);
      setIsPlaying(false);
    }
  }, [currentSurahId]);

  // Audio Handlers
  const handlePlayAyah = (ayah: Ayah) => {
    setCurrentAyahNumber(ayah.ayah_number);
    setActivePlayingAyah(ayah.ayah_number);
    setIsPlaying(true);
  };

  const handlePauseAyah = () => {
    setIsPlaying(false);
  };

  // Power-User Hotkeys Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Next Surah
      const nextSurahKey = getEffectiveShortcut('nav_next_surah', customShortcuts, navArrowMode);
      if (
        eventMatchesShortcut(e, nextSurahKey) ||
        (!customShortcuts['nav_next_surah'] && (navArrowMode === 'rtl' ? e.key === '{' : e.key === '}'))
      ) {
        e.preventDefault();
        handleNextSurah();
        return;
      }

      // Prev Surah
      const prevSurahKey = getEffectiveShortcut('nav_prev_surah', customShortcuts, navArrowMode);
      if (
        eventMatchesShortcut(e, prevSurahKey) ||
        (!customShortcuts['nav_prev_surah'] && (navArrowMode === 'rtl' ? e.key === '}' : e.key === '{'))
      ) {
        e.preventDefault();
        handlePrevSurah();
        return;
      }

      // Next Ayah
      const nextKey = getEffectiveShortcut('nav_next_ayah', customShortcuts, navArrowMode);
      if (
        eventMatchesShortcut(e, nextKey) || 
        (!customShortcuts['nav_next_ayah'] && (navArrowMode === 'rtl' ? e.key.toLowerCase() === 'j' : e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'l'))
      ) {
        handleNextAyah();
        return;
      }

      // Prev Ayah
      const prevKey = getEffectiveShortcut('nav_prev_ayah', customShortcuts, navArrowMode);
      if (
        eventMatchesShortcut(e, prevKey) || 
        (!customShortcuts['nav_prev_ayah'] && (navArrowMode === 'rtl' ? e.key.toLowerCase() === 'k' : e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'h'))
      ) {
        handlePrevAyah();
        return;
      }

      // Search: Omnibar (Ctrl+K / custom key)
      const searchKey = getEffectiveShortcut('search_omnibar', customShortcuts, navArrowMode);
      if (eventMatchesShortcut(e, searchKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
        return;
      }

      // Audio: Play/Pause (Space / custom key)
      const audioKey = getEffectiveShortcut('audio_play_pause', customShortcuts, navArrowMode);
      if (eventMatchesShortcut(e, audioKey)) {
        e.preventDefault();
        if (currentAyahNumber === 0) {
          setCurrentAyahNumber(1);
          setIsPlaying(true);
        } else {
          setIsPlaying(prev => !prev);
        }
        return;
      }

      // Page Navigation ([ and ] or PageUp/PageDown)
      const nextPageKey = getEffectiveShortcut('nav_next_page', customShortcuts, navArrowMode);
      if (eventMatchesShortcut(e, nextPageKey) || e.key === ']') {
        setActiveMushafPage(p => Math.min(604, p + 1));
        return;
      }
      const prevPageKey = getEffectiveShortcut('nav_prev_page', customShortcuts, navArrowMode);
      if (eventMatchesShortcut(e, prevPageKey) || e.key === '[') {
        setActiveMushafPage(p => Math.max(1, p - 1));
        return;
      }

      // Bookmark
      const bookmarkKey = getEffectiveShortcut('study_bookmark', customShortcuts, navArrowMode);
      if (eventMatchesShortcut(e, bookmarkKey)) {
        e.preventDefault();
        handleToggleBookmark();
        return;
      }

      // Notes Drawer
      const noteKey = getEffectiveShortcut('study_note', customShortcuts, navArrowMode);
      if (eventMatchesShortcut(e, noteKey)) {
        e.preventDefault();
        setShowNoteDrawer(prev => !prev);
        return;
      }

      // Zen Mode
      const zenKey = getEffectiveShortcut('view_zen', customShortcuts, navArrowMode);
      if (eventMatchesShortcut(e, zenKey)) {
        e.preventDefault();
        setIsZenMode(prev => !prev);
        return;
      }

      // Shortcuts Modal
      const helpKey = getEffectiveShortcut('help_shortcuts', customShortcuts, navArrowMode);
      if (eventMatchesShortcut(e, helpKey)) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      // Modes (1, 2, 3, 4)
      const m1Key = getEffectiveShortcut('mode_mushaf', customShortcuts, navArrowMode);
      if (eventMatchesShortcut(e, m1Key)) {
        e.preventDefault();
        setActiveMode('quran');
        return;
      }
      const m2Key = getEffectiveShortcut('mode_translation', customShortcuts, navArrowMode);
      if (eventMatchesShortcut(e, m2Key)) {
        e.preventDefault();
        setActiveMode('translation');
        return;
      }
      const m3Key = getEffectiveShortcut('mode_sarf', customShortcuts, navArrowMode);
      if (eventMatchesShortcut(e, m3Key)) {
        e.preventDefault();
        setActiveMode('sarf');
        return;
      }
      const m4Key = getEffectiveShortcut('mode_tafsir', customShortcuts, navArrowMode);
      if (eventMatchesShortcut(e, m4Key)) {
        e.preventDefault();
        setActiveMode('tafseer');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextAyah, handlePrevAyah, handleNextSurah, handlePrevSurah, handleToggleBookmark, activeMode, customShortcuts, navArrowMode]);

  // Stacked Tafsir Handlers
  const handleToggleTafsir = (slug: string) => {
    setExpandedTafasir(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  const handleExpandAll = () => {
    setExpandedTafasir({
      bayan_ul_quran: true,
      tafheem: true,
      maarif: true,
      ibn_kathir: true,
      saadi: true,
      tayseer: true
    });
  };

  const handleCollapseAll = () => {
    setExpandedTafasir({
      bayan_ul_quran: false,
      tafheem: false,
      maarif: false,
      ibn_kathir: false,
      saadi: false,
      tayseer: false
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-emerald-500/25 selection:text-emerald-950 dark:selection:bg-emerald-500/35 dark:selection:text-emerald-100 font-app">
      
      {/* ======================================================== */}
      {/* BAR 1: TOP HEADER BAR (Header.tsx)                       */}
      {/* ======================================================== */}
      {!isZenMode && (
        <Header
          activeMode={activeMode}
          onChangeMode={setActiveMode}
          onOpenSidebar={(tab) => {
            if (tab) setSidebarTab(tab);
            setShowSidebar(true);
          }}
          onOpenSearch={() => setShowSearchModal(true)}
          onOpenStudySuite={() => setShowStudySuiteModal(true)}
          onOpenShortcuts={() => setShowShortcutsModal(true)}
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode(prev => !prev)}
          bookmarksCount={bookmarks.length}
          themeMode={themeMode}
          onChangeThemeMode={setThemeMode}
        />
      )}

      {/* ======================================================== */}
      {/* BAR 2: SUB-HEADER BAR (SubHeaderToolbar.tsx)             */}
      {/* ======================================================== */}
      {!isZenMode && (
        <SubHeaderToolbar
          surahs={surahs}
          currentSurahId={currentSurahId}
          currentAyahNumber={currentAyahNumber}
          onSelectSurah={handleSelectSurah}
          onSelectAyah={handleSelectAyah}
          onPrevSurah={handlePrevSurah}
          onNextSurah={handleNextSurah}
          onPrevAyah={handlePrevAyah}
          onNextAyah={handleNextAyah}
          activeMode={activeMode}
          navArrowMode={navArrowMode}
          isBookmarked={isCurrentAyahBookmarked}
          onToggleBookmark={handleToggleBookmark}
          hasNote={hasCurrentAyahNote}
          onOpenNoteDrawer={() => setShowNoteDrawer(true)}
          activePage={activeMushafPage}
          onPrevPage={() => setActiveMushafPage(p => Math.max(1, p - 1))}
          onNextPage={() => setActiveMushafPage(p => Math.min(604, p + 1))}
          onPageSelect={setActiveMushafPage}
          showTajweed={showTajweed}
          onToggleTajweed={() => setShowTajweed(prev => !prev)}
          showWordByWord={showWordByWord}
          onToggleWordByWord={() => setShowWordByWord(prev => !prev)}
          selectedTranslationAuthor={selectedTranslationAuthor}
          onSelectTranslationAuthor={(authorId) => {
            setSelectedTranslationAuthor(authorId);
            localStorage.setItem('qs_translation_author', authorId);
          }}
          secondaryTranslationAuthor={secondaryTranslationAuthor}
          onSelectSecondaryTranslationAuthor={(authorId) => {
            setSecondaryTranslationAuthor(authorId);
            if (authorId) {
              localStorage.setItem('qs_secondary_translation_author', authorId);
            } else {
              localStorage.removeItem('qs_secondary_translation_author');
            }
          }}
          wbwLanguage={wbwLanguage}
          onSelectWbwLanguage={(lang) => {
            setWbwLanguage(lang);
            localStorage.setItem('qs_wbw_lang', lang);
          }}
          onOpenTafsirSettings={() => setShowTafsirSettingsModal(true)}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          tafsirLayoutMode={tafsirLayoutMode}
          onSelectTafsirLayoutMode={setTafsirLayoutMode}
          onExpandAllTafasir={handleExpandAll}
          onCollapseAllTafasir={handleCollapseAll}
        />
      )}

      {/* Zen Mode Ambient HUD Controller */}
      {isZenMode && (
        <ZenModeHUD
          currentSurah={currentSurah}
          currentAyah={currentAyah}
          activePage={activeMushafPage}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onPrevAyah={handlePrevAyah}
          onNextAyah={handleNextAyah}
          navArrowMode={navArrowMode}
          themeMode={themeMode}
          onChangeThemeMode={setThemeMode}
          readingMode={overallReadingMode}
          onChangeReadingMode={setOverallReadingMode}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          onExitZenMode={() => setIsZenMode(false)}
        />
      )}

      {/* ======================================================== */}
      {/* MAIN WORKSPACE CONTENT AREA (With Dynamic Padding)       */}
      {/* ======================================================== */}
      <main
        className={`flex-1 transition-all duration-150 ${isZenMode ? 'pt-3 pb-24' : 'pt-3 pb-16'}`}
        style={{
          paddingLeft: `${horizontalPadding}%`,
          paddingRight: `${horizontalPadding}%`,
        }}
      >
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
              فی الوقت درج ذیل سورتیں مکمل متن اور تمام تفاسیر کے ساتھ دستیاب ہیں:
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {[
                { id: 1, name: '1. الفاتحہ' },
                { id: 2, name: '2. البقرۃ' },
                { id: 3, name: '3. آل عمران' },
                { id: 4, name: '4. النساء' },
                { id: 55, name: '55. الرحمن' },
                { id: 56, name: '56. الواقعہ' },
                { id: 57, name: '57. الحدید' },
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
        ) : currentAyahNumber === 0 && currentSurah && !isQuranOrSarf ? (
          /* ======================================================== */
          /* NATIVE SURAH FRONTISPIECE & INTRODUCTION (Multi-Author)  */
          /* ======================================================== */
          <SurahIntroView
            currentSurah={currentSurah}
            tafasir={tafasir}
            expandedTafasir={expandedTafasir}
            onToggleTafsir={handleToggleTafsir}
            tafsirOrder={tafsirOrder}
            visibleTafasir={visibleTafasir}
            tafsirLayoutMode={tafsirLayoutMode}
            fontSize={fontSize}
            highlights={highlights}
            onAddHighlight={handleAddHighlight}
            onDeleteHighlight={handleDeleteHighlight}
            onNavigateToVerse={handleNavigateToVerse}
          />
        ) : (
          /* ======================================================== */
          /* STANDARD PRIMARY MODES (Mushaf, Translation, Sarf, Tafsir) */
          /* ======================================================== */
          <>
            {/* Mode 1: Pure Mushaf View (Single Continuous Page Mode Only per 2.1) */}
            {(activeMode === 'quran' || activeMode === 'mushaf') && (
              <MushafView
                ayahs={ayahs}
                currentSurah={currentSurah}
                currentAyahNumber={currentAyahNumber}
                scriptMode={scriptMode}
                showTajweed={showTajweed}
                onSelectAyah={handleSelectAyah}
                onOpenMorphology={(num) => {
                  setCurrentAyahNumber(num);
                  setActiveMode('sarf');
                }}
                onOpenTafsir={(num) => {
                  setCurrentAyahNumber(num);
                  setActiveMode('tafseer');
                }}
                isPlaying={isPlaying}
                activePlayingAyah={activePlayingAyah}
                activePlayingWordIndex={activePlayingWordIndex}
                onPlayAyah={handlePlayAyah}
                onPauseAyah={handlePauseAyah}
                onSelectWordRoot={(root) => setSelectedRoot(root)}
                activePage={activeMushafPage}
                onPageChange={setActiveMushafPage}
                fontSize={fontSize}
              />
            )}

            {/* Mode 2: Dedicated Translation View (بامحاورہ و لفظی اردو ترجمہ) */}
            {activeMode === 'translation' && (
              <TranslationView
                ayahs={ayahs}
                currentSurah={currentSurah}
                currentAyahNumber={currentAyahNumber}
                scriptMode={scriptMode}
                showTajweed={showTajweed}
                showWordByWord={showWordByWord}
                selectedTranslationAuthor={selectedTranslationAuthor}
                secondaryTranslationAuthor={secondaryTranslationAuthor}
                wbwLanguage={wbwLanguage}
                fontSize={fontSize}
                onSelectAyah={handleSelectAyah}
                onOpenMorphology={(num) => {
                  setCurrentAyahNumber(num);
                  setActiveMode('sarf');
                }}
                onOpenTafsir={(num) => {
                  setCurrentAyahNumber(num);
                  setActiveMode('tafseer');
                }}
                isPlaying={isPlaying}
                activePlayingAyah={activePlayingAyah}
                activePlayingWordIndex={activePlayingWordIndex}
                onPlayAyah={handlePlayAyah}
                onPauseAyah={handlePauseAyah}
                isAyahBookmarked={(num) => !!bookmarks.find(b => b.surah_id === currentSurahId && b.ayah_number === num)}
                onToggleBookmark={async (ayah) => {
                  const isBm = !!bookmarks.find(b => b.surah_id === currentSurahId && b.ayah_number === ayah.ayah_number);
                  if (isBm) {
                    await removeBookmark(currentSurahId, ayah.ayah_number);
                    setBookmarks(prev => prev.filter(b => !(b.surah_id === currentSurahId && b.ayah_number === ayah.ayah_number)));
                  } else {
                    await addBookmark(currentSurahId, ayah.ayah_number, ayah.verse_key);
                    reloadStudyData();
                  }
                }}
                onSelectWordRoot={(root) => setSelectedRoot(root)}
              />
            )}

            {/* Mode 3: Word-by-Word & Deep Morphology View (صرف، نحو و لغت) */}
            {(activeMode === 'sarf' || activeMode === 'morphology') && currentAyah && (
              <MorphologyView
                currentAyah={currentAyah}
                scriptMode={scriptMode}
                showTajweed={showTajweed}
                fontSize={fontSize}
                onPrevAyah={handlePrevAyah}
                onNextAyah={handleNextAyah}
                onSelectWordRoot={(root) => setSelectedRoot(root)}
                isPlaying={isPlaying && activePlayingAyah === currentAyah.ayah_number}
                activePlayingWordIndex={activePlayingWordIndex}
                onPlayAyah={handlePlayAyah}
                onPauseAyah={handlePauseAyah}
                onOpenTafsir={(num) => {
                  setCurrentAyahNumber(num);
                  setActiveMode('tafseer');
                }}
              />
            )}

            {/* Mode 4: Stacked & Comparative Multi-Tafsir View (تقابلی تفاسیر) */}
            {(activeMode === 'tafseer' || activeMode === 'tafsir') && currentAyah && (
              <TafsirView
                currentAyah={currentAyah}
                tafasir={tafasir}
                scriptMode={scriptMode}
                showTajweed={showTajweed}
                onPrevAyah={handlePrevAyah}
                onNextAyah={handleNextAyah}
                expandedTafasir={expandedTafasir}
                onToggleTafsir={handleToggleTafsir}
                isBookmarked={isCurrentAyahBookmarked}
                onToggleBookmark={handleToggleBookmark}
                hasNote={hasCurrentAyahNote}
                onOpenNoteDrawer={() => setShowNoteDrawer(true)}
                onOpenExportModal={() => setShowExportModal(true)}
                totalVersesInSurah={currentSurah?.verses_count || ayahs.length}
                fontSize={fontSize}
                highlights={highlights}
                onAddHighlight={handleAddHighlight}
                onDeleteHighlight={handleDeleteHighlight}
                onNavigateToVerse={handleNavigateToVerse}
                onSelectWordRoot={(root) => setSelectedRoot(root)}
                tafsirOrder={tafsirOrder}
                visibleTafasir={visibleTafasir}
                tafsirLayoutMode={tafsirLayoutMode}
              />
            )}
          </>
        )}
      </main>

      {/* ======================================================== */}
      {/* BAR 3: BOTTOM BAR (BottomDock.tsx)                       */}
      {/* ======================================================== */}
      {!isZenMode && (
        <BottomDock
          currentSurah={currentSurah}
          currentAyah={currentAyah}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onNextAyah={handleNextAyah}
          onPrevAyah={handlePrevAyah}
          navArrowMode={navArrowMode}
          onWordTimeUpdate={setActivePlayingWordIndex}
          onOpenExportModal={() => setShowExportModal(true)}
          onOpenSearch={() => setShowSearchModal(true)}
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode(prev => !prev)}
          horizontalPadding={horizontalPadding}
          onChangeHorizontalPadding={setHorizontalPadding}
        />
      )}

      {/* ======================================================== */}
      {/* SIDEBAR DRAWER (About, Preferences, References)          */}
      {/* ======================================================== */}
      <SidebarDrawer
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        activeTab={sidebarTab}
        onSelectTab={setSidebarTab}
        themeMode={themeMode}
        onChangeThemeMode={setThemeMode}
        navArrowMode={navArrowMode}
        onChangeNavArrowMode={handleChangeNavArrowMode}
        customShortcuts={customShortcuts}
        onUpdateShortcut={handleUpdateShortcut}
        onResetShortcuts={handleResetShortcuts}
        showTajweed={showTajweed}
        onToggleTajweed={() => setShowTajweed(prev => !prev)}
        showWordByWord={showWordByWord}
        onToggleWordByWord={() => setShowWordByWord(prev => !prev)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        horizontalPadding={horizontalPadding}
        onChangeHorizontalPadding={setHorizontalPadding}
        selectedTranslationAuthor={selectedTranslationAuthor}
        onSelectTranslationAuthor={(authorId) => {
          setSelectedTranslationAuthor(authorId);
          localStorage.setItem('qs_translation_author', authorId);
        }}
        secondaryTranslationAuthor={secondaryTranslationAuthor}
        onSelectSecondaryTranslationAuthor={(authorId) => {
          setSecondaryTranslationAuthor(authorId);
          if (authorId) {
            localStorage.setItem('qs_secondary_translation_author', authorId);
          } else {
            localStorage.removeItem('qs_secondary_translation_author');
          }
        }}
        wbwLanguage={wbwLanguage}
        onSelectWbwLanguage={(lang) => {
          setWbwLanguage(lang);
          localStorage.setItem('qs_wbw_lang', lang);
        }}
        tafsirLayoutMode={tafsirLayoutMode}
        onSelectTafsirLayoutMode={setTafsirLayoutMode}
        overallReadingMode={overallReadingMode}
        onChangeReadingMode={setOverallReadingMode}
        onOpenTafsirSettings={() => setShowTafsirSettingsModal(true)}
      />

      {/* ======================================================== */}
      {/* MODALS & DRAWERS                                         */}
      {/* ======================================================== */}

      {/* ======================================================== */}
      {/* MODALS & DRAWERS (Lazy Loaded with Suspense)             */}
      {/* ======================================================== */}
      <Suspense fallback={null}>
        {/* Tafsir Order & Selection Settings Modal */}
        {showTafsirSettingsModal && (
          <TafsirSettingsModal
            isOpen={showTafsirSettingsModal}
            onClose={() => setShowTafsirSettingsModal(false)}
            tafsirOrder={tafsirOrder}
            onChangeOrder={(newOrder) => {
              setTafsirOrder(newOrder);
              localStorage.setItem('qs_tafsir_order', JSON.stringify(newOrder));
            }}
            visibleTafasir={visibleTafasir}
            onToggleVisibility={(slug) => {
              setVisibleTafasir(prev => {
                const updated = { ...prev, [slug]: !prev[slug] };
                localStorage.setItem('qs_tafsir_visibility', JSON.stringify(updated));
                return updated;
              });
            }}
            onResetDefaults={() => {
              setTafsirOrder(DEFAULT_TAFSIR_ORDER);
              localStorage.setItem('qs_tafsir_order', JSON.stringify(DEFAULT_TAFSIR_ORDER));
              const allVisible = {
                bayan_ul_quran: true,
                tafheem: true,
                maarif: true,
                ibn_kathir: true,
                saadi: true,
                tayseer: true
              };
              setVisibleTafasir(allVisible);
              localStorage.setItem('qs_tafsir_visibility', JSON.stringify(allVisible));
            }}
          />
        )}

        {/* Root Concordance Explorer Modal */}
        {selectedRoot && (
          <RootExplorerModal
            root={selectedRoot}
            onClose={() => setSelectedRoot(null)}
            onJumpToAyah={(surahId: number, ayahNumber: number) => {
              setCurrentSurahId(surahId);
              setCurrentAyahNumber(ayahNumber);
              setSelectedRoot(null);
            }}
          />
        )}

        {/* Tajweed Legend Modal */}
        {showTajweedLegend && (
          <TajweedLegendModal
            isOpen={showTajweedLegend}
            onClose={() => setShowTajweedLegend(false)}
          />
        )}

        {/* Sources & Scholarly Attribution Modal */}
        {showAttributions && (
          <SourcesAttributionModal
            isOpen={showAttributions}
            onClose={() => setShowAttributions(false)}
          />
        )}

        {/* Study Suite & Bookmarks Drawer */}
        {showStudySuiteModal && (
          <StudySuiteModal
            isOpen={showStudySuiteModal}
            onClose={() => setShowStudySuiteModal(false)}
            onJumpToAyah={(sId: number, aNum: number) => {
              setCurrentSurahId(sId);
              setCurrentAyahNumber(aNum);
              setShowStudySuiteModal(false);
            }}
          />
        )}

        {/* Export / Share Modal (Available on Ayah 0 through 286) */}
        {showExportModal && effectiveAyah && (
          <ExportShareModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            ayah={effectiveAyah}
            tafasir={tafasir}
          />
        )}

        {/* Global Omnibar Command Palette */}
        {showSearchModal && (
          <OmnibarModal
            isOpen={showSearchModal}
            onClose={() => setShowSearchModal(false)}
            surahs={surahs}
            onSelectSurahAyah={(surahId, ayahNumber) => {
              handleSelectSurah(surahId);
              handleSelectAyah(ayahNumber);
            }}
            onSelectPage={(page) => setActiveMushafPage(page)}
            onChangeMode={(mode) => setActiveMode(mode)}
            onChangeTheme={(theme) => setThemeMode(theme)}
            onToggleZenMode={() => setIsZenMode(prev => !prev)}
            onToggleTajweed={() => setShowTajweed(prev => !prev)}
            onToggleScript={() => {}}
            onSelectReadingMode={(mode) => setOverallReadingMode(mode)}
          />
        )}

        {/* Keyboard Shortcuts Modal */}
        {showShortcutsModal && (
          <KeyboardShortcutsModal
            isOpen={showShortcutsModal}
            onClose={() => setShowShortcutsModal(false)}
            navArrowMode={navArrowMode}
            customShortcuts={customShortcuts}
            onOpenPreferences={() => {
              setSidebarTab('preferences');
              setShowSidebar(true);
            }}
          />
        )}
      </Suspense>

      {/* Quick Peek Ayah Drawer */}
      <QuickPeekDrawer
        ayah={quickPeekAyah}
        tafasir={tafasir}
        onClose={() => setQuickPeekAyah(null)}
        onOpenFullTafsir={() => {
          if (quickPeekAyah) setCurrentAyahNumber(quickPeekAyah.ayah_number);
          setQuickPeekAyah(null);
          setActiveMode('tafseer');
        }}
        onOpenFullMorphology={() => {
          if (quickPeekAyah) setCurrentAyahNumber(quickPeekAyah.ayah_number);
          setQuickPeekAyah(null);
          setActiveMode('sarf');
        }}
      />

      {/* Note Editor Drawer (Available on Ayah 0 through 286) */}
      {effectiveAyah && (
        <NoteEditorDrawer
          isOpen={showNoteDrawer}
          onClose={() => setShowNoteDrawer(false)}
          ayah={effectiveAyah}
          onNoteSaved={reloadStudyData}
        />
      )}

    </div>
  );
};
