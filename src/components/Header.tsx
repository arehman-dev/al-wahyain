import React from 'react';
import { BookOpen, Sparkles, Library, Info, Moon, Sun, Search, Bookmark, Keyboard, Maximize2, Minimize2 } from 'lucide-react';
import { AppMode } from '../types/quran';

interface HeaderProps {
  activeMode: AppMode;
  onChangeMode: (mode: AppMode) => void;
  onOpenAttributions: () => void;
  onOpenSearch: () => void;
  onOpenStudySuite: () => void;
  onOpenShortcuts: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  bookmarksCount?: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeMode,
  onChangeMode,
  onOpenAttributions,
  onOpenSearch,
  onOpenStudySuite,
  onOpenShortcuts,
  isZenMode,
  onToggleZenMode,
  bookmarksCount = 0,
  darkMode,
  onToggleDarkMode
}) => {
  return (
    <header 
      dir="rtl" 
      className="sticky top-0 z-40 w-full h-11 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors font-ibm select-none px-4 sm:px-6"
    >
      <div className="w-full h-full flex items-center justify-between gap-4">
        
        {/* Right Side: Brand & Logo (Ultra-Compact) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              مطالعہ قرآن
            </span>
            <span className="text-[10px] text-slate-400 font-sans hidden md:inline">
              Quran Study Station
            </span>
          </div>
        </div>

        {/* Center: Primary Workspace Mode Switcher */}
        <nav className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200/70 dark:border-slate-700/70">
          <button
            onClick={() => onChangeMode('tafsir')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-all ${
              activeMode === 'tafsir'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>تقابلی تفاسیر</span>
          </button>

          <button
            onClick={() => onChangeMode('mushaf')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-all ${
              activeMode === 'mushaf'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>مصحف</span>
          </button>

          <button
            onClick={() => onChangeMode('morphology')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-all ${
              activeMode === 'morphology'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>صرف و لغت</span>
          </button>
        </nav>

        {/* Left Side: Global Utilities & Power-User Triggers */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Search (Ctrl+K) */}
          <button
            onClick={onOpenSearch}
            title="قرآن و تفاسیر میں تلاش کریں (Ctrl + K)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">تلاش</span>
            <kbd className="hidden lg:inline-block px-1 py-0.2 text-[9px] font-mono bg-slate-200/70 dark:bg-slate-800 rounded text-slate-500">
              Ctrl K
            </kbd>
          </button>

          {/* Study Suite Notebook */}
          <button
            onClick={onOpenStudySuite}
            title="محفوظ آیات و نوٹس"
            className="relative p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            {bookmarksCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* Hotkeys Cheat Sheet */}
          <button
            onClick={onOpenShortcuts}
            title="کی بورڈ شارٹ کٹس (?)"
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>

          {/* Focus / Zen Mode */}
          <button
            onClick={onToggleZenMode}
            title={isZenMode ? "نارمل موڈ پر واپس آئیں (Z)" : "زین / فوکس موڈ (Z)"}
            className={`p-1.5 rounded-lg transition-colors ${
              isZenMode 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Sources */}
          <button
            onClick={onOpenAttributions}
            title="مآخذ اور سرکاری روابط"
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Dark Mode */}
          <button
            onClick={onToggleDarkMode}
            title="تھیم تبدیل کریں"
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>
    </header>
  );
};
