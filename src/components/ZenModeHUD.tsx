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
  Rows3
} from 'lucide-react';
import { Surah, Ayah, ReadingTheme, OverallReadingMode } from '../types/quran';
import { NavArrowMode } from '../types/shortcuts';
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
  navArrowMode?: NavArrowMode;
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
  navArrowMode = 'rtl',
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
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 px-4 py-2 rounded-2xl bg-slate-900/96 hover:bg-slate-900 text-white backdrop-blur-xl border border-slate-700/80 shadow-2xl transition-all duration-200 font-ibm text-xs"
    >
      {/* 1. Surah & Ayah / Page Pill */}
      <div className="flex items-center gap-1.5 font-bold border-l border-slate-700 pl-3">
        <span className="text-emerald-400">۞ {currentSurah?.name_arabic || 'القرآن'}</span>
        <span className="text-slate-300 font-ibm text-[11px]">
          {currentAyah ? (
            <>آیت <span className="font-app">{currentAyah.ayah_number}</span></>
          ) : (
            <span className="text-emerald-400 font-mono">0-intro</span>
          )}
        </span>
        <span className="text-slate-400 font-ibm text-[10px]">
          • ص <span className="font-app">{activePage}</span>
        </span>
      </div>

      {/* 2. Audio Play / Pause */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={!currentAyah}
        title={!currentAyah ? '0-intro کے لیے تلاوت دستیاب نہیں ہے' : isPlaying ? 'روکیں (Pause / Space)' : 'چلائیں (Play / Space)'}
        aria-label="تلاوت چلائیں یا روکیں"
        className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
          !currentAyah
            ? 'opacity-40 border-slate-700 text-slate-500 cursor-not-allowed'
            : 'border-emerald-500 text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 cursor-pointer'
        }`}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>

      {/* 3. Navigation Controls with orientation-aware tooltips */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrevAyah}
          title={navArrowMode === 'rtl' ? 'پچھلی آیت (دائیں تیر → / K)' : 'پچھلی آیت (بائیں تیر ← / J)'}
          aria-label="پچھلی آیت"
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={onNextAyah}
          title={navArrowMode === 'rtl' ? 'اگلی آیت (بائیں تیر ← / J)' : 'اگلی آیت (دائیں تیر → / K)'}
          aria-label="اگلی آیت"
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Theme Cycle */}
      <button
        onClick={cycleTheme}
        title="تھیم تبدیل کریں (T)"
        aria-label="تھیم تبدیل کریں"
        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        {themeMode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
        {themeMode === 'sepia' && <Coffee className="w-3.5 h-3.5 text-amber-600" />}
        {themeMode === 'dark' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
        {themeMode === 'oled' && <Eye className="w-3.5 h-3.5 text-emerald-400" />}
      </button>

      {/* 5. Font Zoom */}
      <div className="hidden md:flex items-center gap-0.5 border-r border-slate-700 pr-2">
        <button
          onClick={() => onFontSizeChange(Math.max(14, fontSize - 1))}
          title="فونٹ چھوٹا کریں"
          aria-label="فونٹ چھوٹا کریں"
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onFontSizeChange(Math.min(28, fontSize + 1))}
          title="فونٹ بڑا کریں"
          aria-label="فونٹ بڑا کریں"
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 7. Exit Zen Mode */}
      <button
        onClick={onExitZenMode}
        title="نارمل موڈ میں واپس جائیں (Esc / Z)"
        aria-label="نارمل موڈ میں واپس جائیں"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-red-950/80 border border-slate-700 hover:border-red-800 text-slate-300 hover:text-red-200 transition-all font-semibold cursor-pointer"
      >
        <Minimize2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">نارمل موڈ</span>
      </button>
    </div>
  );
};
