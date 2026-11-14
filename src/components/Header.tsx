import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Library, 
  Moon, 
  Sun, 
  Search, 
  Bookmark, 
  Keyboard, 
  Maximize2, 
  Minimize2, 
  Languages, 
  Coffee, 
  Eye, 
  Menu,
  SlidersHorizontal,
  ShieldCheck
} from 'lucide-react';
import { AppMode, ReadingTheme } from '../types/quran';

export type SidebarTab = 'about' | 'verification' | 'preferences' | 'references' | 'docs';

interface HeaderProps {
  activeMode: AppMode;
  onChangeMode: (mode: AppMode) => void;
  onOpenSearch: () => void;
  onOpenStudySuite: () => void;
  onOpenShortcuts: () => void;
  onOpenSidebar: (tab?: SidebarTab) => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  bookmarksCount?: number;
  themeMode: ReadingTheme;
  onChangeThemeMode: (theme: ReadingTheme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeMode,
  onChangeMode,
  onOpenSearch,
  onOpenStudySuite,
  onOpenShortcuts,
  onOpenSidebar,
  isZenMode,
  onToggleZenMode,
  bookmarksCount = 0,
  themeMode,
  onChangeThemeMode
}) => {
  const cycleTheme = () => {
    const cycle: Record<ReadingTheme, ReadingTheme> = {
      light: 'sepia',
      sepia: 'dark',
      dark: 'oled',
      oled: 'light'
    };
    onChangeThemeMode(cycle[themeMode] || 'dark');
  };

  const themeLabels: Record<ReadingTheme, string> = {
    light: 'تھیم: دن (Light)',
    sepia: 'تھیم: قدیم اوراق (Sepia)',
    dark: 'تھیم: نائٹ (Dark Slate)',
    oled: 'تھیم: مڈ نائٹ (OLED Black)'
  };

  return (
    <header 
      dir="ltr" 
      className="sticky top-0 z-40 w-full h-10 glass-bar border-b transition-all font-ibm select-none px-3 sm:px-6 flex items-center"
    >
      <div className="w-full h-full grid grid-cols-3 items-center">
        
        {/* ======================================================== */}
        {/* LEFT SIDE (Left -> Right): Zen -> Theme | Bookmarks -> Search */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1.5 justify-self-start">
          {/* 1. Zen Mode */}
          <button
            onClick={onToggleZenMode}
            title={isZenMode ? "Exit Zen Mode [Z / Esc]" : "Zen Mode [Z]"}
            aria-label="Zen Mode"
            className={`w-[26px] h-[26px] rounded-md flex items-center justify-center cursor-pointer relative ${
              isZenMode ? 'btn-bar btn-bar-active' : 'btn-bar'
            }`}
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.75} />}
            {isZenMode && <span className="micro-dot" />}
          </button>

          {/* 2. Theme Toggler */}
          <button
            onClick={cycleTheme}
            title={`${themeLabels[themeMode]} [T]`}
            aria-label="Change Theme"
            className="w-[26px] h-[26px] rounded-md flex items-center justify-center btn-bar cursor-pointer"
          >
            {themeMode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.75} />}
            {themeMode === 'sepia' && <Coffee className="w-3.5 h-3.5 text-amber-700" strokeWidth={1.75} />}
            {themeMode === 'dark' && <Moon className="w-3.5 h-3.5 text-indigo-400" strokeWidth={1.75} />}
            {themeMode === 'oled' && <Eye className="w-3.5 h-3.5 text-[#2ca4ab]" strokeWidth={1.75} />}
          </button>

          {/* Logical Cluster Divider */}
          <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* 3. All Bookmarks (Study Suite) — With Badge */}
          <button
            onClick={onOpenStudySuite}
            title="Saved Verses & Study Suite [B]"
            aria-label="Bookmarks & Study Suite"
            className="h-[26px] px-2 rounded-md flex items-center gap-1.5 btn-bar hover:border-amber-500/70 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-medium cursor-pointer"
          >
            <Bookmark 
              className="w-3.5 h-3.5 text-amber-500 shrink-0" 
              strokeWidth={1.75} 
              fill={bookmarksCount > 0 ? 'currentColor' : 'none'} 
            />
            <span className="hidden sm:inline">بک مارکس</span>
            {bookmarksCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded text-[10px] font-bold font-app leading-tight">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* 4. Search (Ctrl+K) */}
          <button
            onClick={onOpenSearch}
            title="Fast Search [Ctrl+K]"
            aria-label="Quran Search"
            className="h-[26px] px-2 rounded-md flex items-center gap-1.5 btn-bar hover:border-[#2ca4ab] hover:text-[#0e7490] dark:hover:text-[#2ca4ab] text-xs font-medium cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#2ca4ab] shrink-0" strokeWidth={1.75} />
            <span className="hidden sm:inline">تلاش</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* CENTER (Screen-Centered): 4 Primary Study Modes          */}
        {/* ======================================================== */}
        <nav 
          dir="rtl"
          className="justify-self-center flex items-center h-[26px] p-0.5 rounded-md border border-slate-300/80 dark:border-slate-700/80 bg-slate-200/50 dark:bg-slate-800/50 shrink-0"
        >
          <button
            onClick={() => onChangeMode('quran')}
            title="Mushaf Mode [1]"
            aria-label="Mushaf Mode"
            className={`flex items-center gap-1 px-2.5 h-[22px] rounded text-xs transition-colors cursor-pointer border ${
              activeMode === 'quran' || activeMode === 'mushaf'
                ? 'bg-white dark:bg-slate-900 text-[#0e7490] dark:text-[#2ca4ab] font-bold border-[#2ca4ab]/40 shadow-none'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium hover:bg-white/50 dark:hover:bg-slate-700/50 border-transparent'
            }`}
          >
            <BookOpen className="w-3 h-3" strokeWidth={1.75} />
            <span>قرآن</span>
          </button>

          <button
            onClick={() => onChangeMode('translation')}
            title="Translation Mode [2]"
            aria-label="Translation Mode"
            className={`flex items-center gap-1 px-2.5 h-[22px] rounded text-xs transition-colors cursor-pointer border ${
              activeMode === 'translation'
                ? 'bg-white dark:bg-slate-900 text-[#0e7490] dark:text-[#2ca4ab] font-bold border-[#2ca4ab]/40 shadow-none'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium hover:bg-white/50 dark:hover:bg-slate-700/50 border-transparent'
            }`}
          >
            <Languages className="w-3 h-3" strokeWidth={1.75} />
            <span>ترجمہ</span>
          </button>

          <button
            onClick={() => onChangeMode('sarf')}
            title="Grammar & Morphology Mode [3]"
            aria-label="Morphology Mode"
            className={`flex items-center gap-1 px-2.5 h-[22px] rounded text-xs transition-colors cursor-pointer border ${
              activeMode === 'sarf' || activeMode === 'morphology'
                ? 'bg-white dark:bg-slate-900 text-[#0e7490] dark:text-[#2ca4ab] font-bold border-[#2ca4ab]/40 shadow-none'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium hover:bg-white/50 dark:hover:bg-slate-700/50 border-transparent'
            }`}
          >
            <Sparkles className="w-3 h-3" strokeWidth={1.75} />
            <span>صرف</span>
          </button>

          <button
            onClick={() => onChangeMode('tafseer')}
            title="Comparative Tafsir Mode [4]"
            aria-label="Tafsir Mode"
            className={`flex items-center gap-1 px-2.5 h-[22px] rounded text-xs transition-colors cursor-pointer border ${
              activeMode === 'tafseer' || activeMode === 'tafsir'
                ? 'bg-white dark:bg-slate-900 text-[#0e7490] dark:text-[#2ca4ab] font-bold border-[#2ca4ab]/40 shadow-none'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium hover:bg-white/50 dark:hover:bg-slate-700/50 border-transparent'
            }`}
          >
            <Library className="w-3 h-3" strokeWidth={1.75} />
            <span>تفسیر</span>
          </button>
        </nav>

        {/* ======================================================== */}
        {/* RIGHT SIDE: Reference, Preferences, Shortcuts + Brand & Menu */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1.5 justify-self-end">
          {/* Text Verification / Authenticity */}
          <button
            onClick={() => onOpenSidebar('verification')}
            title="Text Verification & Authenticity"
            aria-label="Text Verification"
            className="w-[26px] h-[26px] rounded-md flex items-center justify-center btn-bar cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>

          {/* Preferences */}
          <button
            onClick={() => onOpenSidebar('preferences')}
            title="Preferences & Settings"
            aria-label="Preferences"
            className="w-[26px] h-[26px] rounded-md flex items-center justify-center btn-bar cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>

          {/* Keyboard Shortcuts */}
          <button
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts [? / /]"
            aria-label="Keyboard Shortcuts"
            className="hidden sm:flex w-[26px] h-[26px] rounded-md items-center justify-center btn-bar cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>

          <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 mx-0.5 hidden sm:block" />

          {/* Minimalist Brand Emblem & Title */}
          <div 
            onClick={() => onOpenSidebar('about')}
            title="Al-Wahyain — About & Documentation"
            className="hidden sm:flex items-center gap-1.5 cursor-pointer group h-[26px] px-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-white group-hover:text-[#2ca4ab] transition-colors">
              الوحيين
            </span>
            {/* Minimalist 2D Geometric Open Mushaf & Rehal Icon in Quran Foundation Blue */}
            <div className="w-5 h-5 rounded border border-[#2ca4ab]/30 bg-[#2ca4ab]/10 text-[#2ca4ab] flex items-center justify-center group-hover:border-[#2ca4ab]/60 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <path d="M12 4.5C9.5 3 5.5 3 3 4.5v13c2.5-1.5 6.5-1.5 9 0 2.5-1.5 6.5-1.5 9 0v-13c-2.5-1.5-6.5-1.5-9 0z" />
                <path d="M12 4.5v13" />
                <path d="M5 20.5l7-2.5 7 2.5" />
              </svg>
            </div>
          </div>

          {/* Sidebar Drawer Menu Button */}
          <button
            onClick={() => onOpenSidebar('about')}
            title="Open Menu (Sidebar)"
            aria-label="Open Menu"
            className="w-[26px] h-[26px] rounded-md flex items-center justify-center btn-bar cursor-pointer"
          >
            <Menu className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>

      </div>
    </header>
  );
};
