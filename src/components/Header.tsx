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
      className="sticky top-0 z-40 w-full h-12 glass-bar border-b transition-all font-ibm select-none px-3 sm:px-6"
    >
      <div className="w-full h-full grid grid-cols-3 items-center">
        
        {/* ======================================================== */}
        {/* LEFT SIDE (Left -> Right): Zen -> Theme -> Bookmarks -> Search */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1.5 justify-self-start">
          {/* 1. Zen Mode */}
          <button
            onClick={onToggleZenMode}
            title={isZenMode ? "نارمل موڈ میں واپس جائیں (Z / Esc)" : "زین موڈ (مکمل یکسوئی) (Z)"}
            aria-label="زین موڈ"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer ${
              isZenMode 
                ? 'border border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs' 
                : 'border border-slate-300/40 dark:border-slate-700/50 hover:border-emerald-500/40 bg-slate-200/40 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            {isZenMode ? <Minimize2 className="w-4 h-4" strokeWidth={1.85} /> : <Maximize2 className="w-4 h-4" strokeWidth={1.85} />}
          </button>

          {/* 2. Theme Toggler */}
          <button
            onClick={cycleTheme}
            title={themeLabels[themeMode] + ' (T)'}
            aria-label="تھیم تبدیل کریں"
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-300/40 dark:border-slate-700/50 hover:border-emerald-500/40 bg-slate-200/40 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            {themeMode === 'light' && <Sun className="w-4 h-4 text-amber-500" strokeWidth={1.85} />}
            {themeMode === 'sepia' && <Coffee className="w-4 h-4 text-amber-700" strokeWidth={1.85} />}
            {themeMode === 'dark' && <Moon className="w-4 h-4 text-indigo-400" strokeWidth={1.85} />}
            {themeMode === 'oled' && <Eye className="w-4 h-4 text-emerald-400" strokeWidth={1.85} />}
          </button>

          {/* 3. All Bookmarks (Study Suite) — With Badge */}
          <button
            onClick={onOpenStudySuite}
            title="محفوظ شدہ آیات و مطالعہ گاہ (B)"
            aria-label="بک مارکس و مطالعہ گاہ"
            className="h-8 px-2.5 rounded-xl flex items-center gap-1.5 bg-slate-200/50 dark:bg-slate-800/60 hover:bg-amber-500/15 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-300/50 dark:border-slate-700/60 hover:border-amber-500/40 text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Bookmark 
              className="w-3.5 h-3.5 text-amber-500 shrink-0" 
              strokeWidth={1.85} 
              fill={bookmarksCount > 0 ? 'currentColor' : 'none'} 
            />
            <span className="hidden sm:inline">بک مارکس</span>
            {bookmarksCount > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold font-app leading-none shadow-xs">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* 4. Search (Ctrl+K) */}
          <button
            onClick={onOpenSearch}
            title="فوری تلاش (Ctrl+K)"
            aria-label="قرآنی تلاش"
            className="h-8 px-2.5 rounded-xl flex items-center gap-1.5 bg-slate-200/50 dark:bg-slate-800/60 hover:bg-emerald-500/15 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-300/50 dark:border-slate-700/60 hover:border-emerald-500/40 text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={1.85} />
            <span className="hidden sm:inline">تلاش</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* CENTER (Screen-Centered): 4 Primary Study Modes          */}
        {/* ======================================================== */}
        <nav 
          dir="rtl"
          className="justify-self-center flex items-center bg-slate-200/70 dark:bg-slate-800/80 p-0.5 rounded-2xl border border-slate-300/50 dark:border-slate-700/60 shadow-xs shrink-0"
        >
          <button
            onClick={() => onChangeMode('quran')}
            title="مصحف موڈ (1)"
            aria-label="مصحف موڈ"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
              activeMode === 'quran' || activeMode === 'mushaf'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs border border-slate-200/70 dark:border-slate-700/70'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium hover:bg-white/40 dark:hover:bg-slate-700/40 border border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" strokeWidth={1.85} />
            <span>قرآن</span>
          </button>

          <button
            onClick={() => onChangeMode('translation')}
            title="ترجمہ و لفظی ترجمہ موڈ (2)"
            aria-label="ترجمہ موڈ"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
              activeMode === 'translation'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs border border-slate-200/70 dark:border-slate-700/70'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium hover:bg-white/40 dark:hover:bg-slate-700/40 border border-transparent'
            }`}
          >
            <Languages className="w-3.5 h-3.5" strokeWidth={1.85} />
            <span>ترجمہ</span>
          </button>

          <button
            onClick={() => onChangeMode('sarf')}
            title="صرف و نحو و شجرہ موڈ (3)"
            aria-label="صرف و نحو موڈ"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
              activeMode === 'sarf' || activeMode === 'morphology'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs border border-slate-200/70 dark:border-slate-700/70'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium hover:bg-white/40 dark:hover:bg-slate-700/40 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.85} />
            <span>صرف</span>
          </button>

          <button
            onClick={() => onChangeMode('tafseer')}
            title="تقابلی تفاسیر موڈ (4)"
            aria-label="تفسیر موڈ"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
              activeMode === 'tafseer' || activeMode === 'tafsir'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs border border-slate-200/70 dark:border-slate-700/70'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium hover:bg-white/40 dark:hover:bg-slate-700/40 border border-transparent'
            }`}
          >
            <Library className="w-3.5 h-3.5" strokeWidth={1.85} />
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
            title="توثیق و تحقیقِ متن (Text Verification)"
            aria-label="توثیق و تحقیقِ متن"
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-300/40 dark:border-slate-700/50 hover:border-emerald-500/40 bg-slate-200/40 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" strokeWidth={1.85} />
          </button>

          {/* Preferences */}
          <button
            onClick={() => onOpenSidebar('preferences')}
            title="ترجیحات و ترتیبات (Preferences)"
            aria-label="ترجیحات و ترتیبات"
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-300/40 dark:border-slate-700/50 hover:border-emerald-500/40 bg-slate-200/40 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.85} />
          </button>

          {/* Keyboard Shortcuts */}
          <button
            onClick={onOpenShortcuts}
            title="کی بورڈ شارٹ کٹس (? / /)"
            aria-label="کی بورڈ شارٹ کٹس"
            className="hidden sm:flex w-8 h-8 rounded-xl items-center justify-center border border-slate-300/40 dark:border-slate-700/50 hover:border-emerald-500/40 bg-slate-200/40 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Keyboard className="w-4 h-4" strokeWidth={1.85} />
          </button>

          <div className="h-4 w-px bg-slate-300/70 dark:bg-slate-700/70 mx-1 hidden sm:block" />

          {/* Minimalist Brand Emblem & Title */}
          <div 
            onClick={() => onOpenSidebar('about')}
            title="الوحيين — تعارف و تکنیکی دستاویزات"
            className="hidden sm:flex items-center gap-2 cursor-pointer group px-2 py-1 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              الوحيين
            </span>
            {/* Minimalist 2D Geometric Open Mushaf & Rehal Icon */}
            <div className="w-7 h-7 rounded-lg bg-emerald-600/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:border-emerald-500/60 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M12 4.5C9.5 3 5.5 3 3 4.5v13c2.5-1.5 6.5-1.5 9 0 2.5-1.5 6.5-1.5 9 0v-13c-2.5-1.5-6.5-1.5-9 0z" />
                <path d="M12 4.5v13" />
                <path d="M5 20.5l7-2.5 7 2.5" />
              </svg>
            </div>
          </div>

          {/* Sidebar Drawer Menu Button */}
          <button
            onClick={() => onOpenSidebar('about')}
            title="مینیو کھولیں (Sidebar)"
            aria-label="مینیو کھولیں"
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-300/40 dark:border-slate-700/50 hover:border-emerald-500/40 bg-slate-200/40 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Menu className="w-4 h-4" strokeWidth={1.85} />
          </button>
        </div>

      </div>
    </header>
  );
};
