import React from 'react';
import { 
  Maximize2, 
  Minimize2, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  Sun, 
  Coffee, 
  Moon, 
  Eye, 
  ZoomIn, 
  ZoomOut,
  BookOpen,
  Split,
  Rows3
} from 'lucide-react';
import { Surah, Ayah, ReadingTheme, OverallReadingMode } from '../types/quran';
import { toArabicDigits } from '../utils/juzMapping';

interface ZenModeHUDProps {
  currentSurah?: Surah;
  currentAyah?: Ayah | null;
  activePage: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPrevAyah: () => void;
  onNextAyah: () => void;
  themeMode: ReadingTheme;
  onChangeThemeMode: (theme: ReadingTheme) => void;
  readingMode: OverallReadingMode;
  onChangeReadingMode: (mode: OverallReadingMode) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onExitZenMode: () => void;
}

export const ZenModeHUD: React.FC<ZenModeHUDProps> = ({
  currentSurah,
  currentAyah,
  activePage,
  isPlaying,
  onPlay,
  onPause,
  onPrevAyah,
  onNextAyah,
  themeMode,
  onChangeThemeMode,
  readingMode,
  onChangeReadingMode,
  fontSize,
  onFontSizeChange,
  onExitZenMode
}) => {
  const cycleTheme = () => {
    const cycle: Record<ReadingTheme, ReadingTheme> = {
      light: 'sepia',
      sepia: 'dark',
      dark: 'oled',
      oled: 'light'
    };
    onChangeThemeMode(cycle[themeMode]);
  };

  return (
    <div 
      dir="rtl"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 px-4 py-2 rounded-2xl bg-slate-900/85 hover:bg-slate-900 text-white backdrop-blur-xl border border-slate-700/80 shadow-2xl transition-all duration-200 font-ibm text-xs"
    >
      {/* 1. Surah & Ayah / Page Pill */}
      <div className="flex items-center gap-1.5 font-bold border-l border-slate-700 pl-3">
        <span className="text-emerald-400">۞ {currentSurah?.name_arabic || 'القرآن'}</span>
        <span className="text-slate-300 font-mono text-[11px]">
          آیت {toArabicDigits(currentAyah?.ayah_number || 1)}
        </span>
        <span className="text-slate-400 font-mono text-[10px]">
          • ص {toArabicDigits(activePage)}
        </span>
      </div>

      {/* 2. Audio Play / Pause */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        title={isPlaying ? "تلاوت روکیں (Space)" : "تلاوت شروع کریں (Space)"}
        className="w-7 h-7 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-sm"
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>

      {/* 3. Navigation Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrevAyah}
          title="پچھلی آیت (Left Arrow)"
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={onNextAyah}
          title="اگلی آیت (Right Arrow)"
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Reading Mode Switcher */}
      <div className="hidden sm:flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60">
        <button
          onClick={() => onChangeReadingMode('standard')}
          title="معیاری واحد صفحہ"
          className={`p-1.5 rounded-lg transition-all ${
            readingMode === 'standard' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Rows3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChangeReadingMode('book')}
          title="دو ورقی کھلا مصحف (Book Spread)"
          className={`p-1.5 rounded-lg transition-all ${
            readingMode === 'book' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChangeReadingMode('split')}
          title="مصحف مع تفسیر (Split Study)"
          className={`p-1.5 rounded-lg transition-all ${
            readingMode === 'split' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Split className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. Theme Cycle */}
      <button
        onClick={cycleTheme}
        title="تھیم تبدیل کریں"
        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
      >
        {themeMode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
        {themeMode === 'sepia' && <Coffee className="w-3.5 h-3.5 text-amber-600" />}
        {themeMode === 'dark' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
        {themeMode === 'oled' && <Eye className="w-3.5 h-3.5 text-emerald-400" />}
      </button>

      {/* 6. Font Zoom */}
      <div className="hidden md:flex items-center gap-0.5 border-r border-slate-700 pr-2">
        <button
          onClick={() => onFontSizeChange(Math.max(14, fontSize - 1))}
          title="فونٹ چھوٹا کریں"
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onFontSizeChange(Math.min(26, fontSize + 1))}
          title="فونٹ بڑا کریں"
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 7. Exit Zen Mode */}
      <button
        onClick={onExitZenMode}
        title="فوکس موڈ سے باہر نکلیں (Z / Esc)"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-red-950/80 border border-slate-700 hover:border-red-800 text-slate-300 hover:text-red-200 transition-all font-semibold"
      >
        <Minimize2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">نارمل موڈ</span>
      </button>
    </div>
  );
};
