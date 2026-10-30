import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  ArrowRight, 
  ArrowLeft, 
  Compass, 
  CornerDownLeft,
  Palette,
  SlidersHorizontal,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Surah, AppMode, ScriptMode } from '../types/quran';
import { toArabicDigits } from '../utils/juzMapping';

interface SubHeaderToolbarProps {
  surahs: Surah[];
  currentSurahId: number;
  currentAyahNumber: number;
  onSelectSurah: (id: number) => void;
  onSelectAyah: (num: number) => void;
  onPrevAyah: () => void;
  onNextAyah: () => void;
  activeMode: AppMode;
  scriptMode: ScriptMode;
  onToggleScript: () => void;

  // Quran/Mushaf specific
  activePage?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onPageSelect?: (page: number) => void;
  showTajweed?: boolean;
  onToggleTajweed?: () => void;

  // Translation specific
  showWordByWord?: boolean;
  onToggleWordByWord?: () => void;

  // Tafsir specific
  onOpenTafsirSettings?: () => void;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
  onExpandAllTafasir?: () => void;
  onCollapseAllTafasir?: () => void;
}

export const SubHeaderToolbar: React.FC<SubHeaderToolbarProps> = ({
  surahs,
  currentSurahId,
  currentAyahNumber,
  onSelectSurah,
  onSelectAyah,
  onPrevAyah,
  onNextAyah,
  activeMode,
  scriptMode,
  onToggleScript,
  activePage = 1,
  onPrevPage,
  onNextPage,
  onPageSelect,
  showTajweed = false,
  onToggleTajweed,
  showWordByWord = false,
  onToggleWordByWord,
  onOpenTafsirSettings,
  fontSize = 17,
  onFontSizeChange,
  onExpandAllTafasir,
  onCollapseAllTafasir
}) => {
  const [directJumpInput, setDirectJumpInput] = useState('');
  const [pageJumpInput, setPageJumpInput] = useState('');
  const currentSurah = surahs.find(s => s.id === currentSurahId) || surahs[0];
  const versesCount = currentSurah?.verses_count || 7;

  const handleDirectJump = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = directJumpInput.trim();
    if (!clean) return;

    const match = clean.match(/^(\d+)[:,\s\-\/](\d+)$/);
    if (match) {
      const sId = parseInt(match[1], 10);
      const aNum = parseInt(match[2], 10);
      if (sId >= 1 && sId <= 114) {
        onSelectSurah(sId);
        onSelectAyah(aNum);
        setDirectJumpInput('');
      }
    } else {
      const num = parseInt(clean, 10);
      if (!isNaN(num) && num >= 1 && num <= versesCount) {
        onSelectAyah(num);
        setDirectJumpInput('');
      }
    }
  };

  const handlePageJump = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageJumpInput, 10);
    if (!isNaN(p) && p >= 1 && p <= 604 && onPageSelect) {
      onPageSelect(p);
      setPageJumpInput('');
    }
  };

  return (
    <div 
      dir="rtl"
      className="sticky top-11 z-30 w-full h-10 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between px-4 sm:px-6 font-ibm select-none transition-colors"
    >
      {/* Right Flank: Unified Surah & Ayah Pickers */}
      <div className="flex items-center gap-2">
        {/* Surah Dropdown */}
        <select
          value={currentSurahId}
          onChange={(e) => onSelectSurah(Number(e.target.value))}
          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg px-2 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
        >
          {surahs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id}. {s.name_arabic} ({s.name_simple})
            </option>
          ))}
        </select>

        {/* Ayah Stepper */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-2xs">
          <button 
            onClick={onPrevAyah}
            title="پچھلی آیت"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r-lg text-slate-500 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <select
            value={currentAyahNumber}
            onChange={(e) => onSelectAyah(Number(e.target.value))}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 px-1 py-0.5 border-x border-slate-100 dark:border-slate-800 focus:outline-none cursor-pointer"
          >
            {Array.from({ length: versesCount }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                آیت {num}
              </option>
            ))}
          </select>

          <button 
            onClick={onNextAyah}
            title="اگلی آیت"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-lg text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Verse Jump Form */}
        <form onSubmit={handleDirectJump} className="hidden sm:flex items-center">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg px-2 py-0.5 shadow-2xs focus-within:border-emerald-500">
            <Compass className="w-3 h-3 text-slate-400 shrink-0 ml-1.5" />
            <input
              type="text"
              value={directJumpInput}
              onChange={(e) => setDirectJumpInput(e.target.value)}
              placeholder="55:13"
              className="w-14 bg-transparent outline-none text-[11px] font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
            <button type="submit" title="جمپ کریں (Enter)" className="text-slate-400 hover:text-emerald-600">
              <CornerDownLeft className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>

      {/* Center: Context-Aware Mode Controls (Zero in-content duplicate bars) */}
      <div className="flex items-center gap-2">
        {/* 1. Quran / Mushaf Mode Controls */}
        {(activeMode === 'quran' || activeMode === 'mushaf') && (
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-2xs text-xs">
            {/* Page Navigation Stepper */}
            {onPrevPage && onNextPage && (
              <div className="flex items-center gap-1">
                <button
                  onClick={onPrevPage}
                  disabled={activePage <= 1}
                  title="پچھلا صفحہ"
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <form onSubmit={handlePageJump} className="flex items-center gap-1">
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    صفحہ {toArabicDigits(activePage)} / ۶۰۴
                  </span>
                </form>

                <button
                  onClick={onNextPage}
                  disabled={activePage >= 604}
                  title="اگلا صفحہ"
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tajweed Toggle */}
            {onToggleTajweed && (
              <button
                onClick={onToggleTajweed}
                title="تجوید کے رنگ آن / آف کریں"
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold transition-all ${
                  showTajweed
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Palette className="w-3 h-3" />
                <span>تجوید</span>
              </button>
            )}
          </div>
        )}

        {/* 2. Translation Mode Controls */}
        {activeMode === 'translation' && (
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-2xs text-xs">
            {onToggleWordByWord && (
              <button
                onClick={onToggleWordByWord}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] font-semibold transition-all ${
                  showWordByWord
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {showWordByWord ? <ToggleRight className="w-3.5 h-3.5 text-emerald-600" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                <span>لفظی ترجمہ (Word-by-Word)</span>
              </button>
            )}
          </div>
        )}

        {/* 3. Tafseer Mode Controls */}
        {(activeMode === 'tafseer' || activeMode === 'tafsir') && (
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-2xs text-xs">
            {/* Tafsir Re-ordering & Visibility Dialog Trigger */}
            {onOpenTafsirSettings && (
              <button
                onClick={onOpenTafsirSettings}
                title="تفاسیر کی ترتیب اور انتخاب"
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] hover:bg-emerald-100 transition-colors"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>ترتیب و انتخابِ تفاسیر</span>
              </button>
            )}

            {/* Expand / Collapse All */}
            {onExpandAllTafasir && onCollapseAllTafasir && (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={onExpandAllTafasir}
                  title="تمام تفاسیر کھولیں"
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
                <button
                  onClick={onCollapseAllTafasir}
                  title="تمام تفاسیر سمیٹیں"
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded"
                >
                  <Minimize2 className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Font Scaler for Tafsir */}
            {onFontSizeChange && (
              <div className="flex items-center gap-1 px-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">
                <button
                  onClick={() => onFontSizeChange(Math.max(14, fontSize - 1))}
                  className="p-0.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  title="فونٹ چھوٹا کریں"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold">{fontSize}</span>
                <button
                  onClick={() => onFontSizeChange(Math.min(26, fontSize + 1))}
                  className="p-0.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  title="فونٹ بڑا کریں"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. Sarf / Morphology Mode Controls */}
        {(activeMode === 'sarf' || activeMode === 'morphology') && null}
      </div>

      {/* Left Flank: Surah Details Badge */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
          {currentSurah?.revelation_place === 'makkah' ? 'مکی' : 'مدنی'}
        </span>
        <span>•</span>
        <span>{toArabicDigits(currentSurah?.verses_count || 0)} آیات</span>
      </div>
    </div>
  );
};
