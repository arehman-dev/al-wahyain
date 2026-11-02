import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Library, 
  Info, 
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
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Compass, 
  CornerDownLeft, 
  Palette, 
  SlidersHorizontal, 
  ZoomIn, 
  ZoomOut, 
  ToggleLeft, 
  ToggleRight, 
  Columns2, 
  Rows3 
} from 'lucide-react';
import { Surah, AppMode, ReadingTheme, TafsirLayoutMode, OverallReadingMode } from '../types/quran';
import { toArabicDigits } from '../utils/juzMapping';

interface HeaderProps {
  // Navigation & Location
  surahs: Surah[];
  currentSurahId: number;
  currentAyahNumber: number;
  onSelectSurah: (id: number) => void;
  onSelectAyah: (num: number) => void;
  onPrevAyah: () => void;
  onNextAyah: () => void;

  // Workspace Mode
  activeMode: AppMode;
  onChangeMode: (mode: AppMode) => void;

  // Quran / Mushaf specific
  activePage?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onPageSelect?: (page: number) => void;
  showTajweed?: boolean;
  onToggleTajweed?: () => void;
  overallReadingMode?: OverallReadingMode;
  onChangeReadingMode?: (mode: OverallReadingMode) => void;

  // Translation specific
  showWordByWord?: boolean;
  onToggleWordByWord?: () => void;
  selectedTranslationAuthor?: string;
  onSelectTranslationAuthor?: (authorId: string) => void;
  secondaryTranslationAuthor?: string | null;
  onSelectSecondaryTranslationAuthor?: (authorId: string | null) => void;
  wbwLanguage?: 'both' | 'ur' | 'en' | 'ur2' | 'en2';
  onSelectWbwLanguage?: (lang: 'both' | 'ur' | 'en' | 'ur2' | 'en2') => void;

  // Tafsir specific
  onOpenTafsirSettings?: () => void;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
  tafsirLayoutMode?: TafsirLayoutMode;
  onSelectTafsirLayoutMode?: (mode: TafsirLayoutMode) => void;

  // Global Utilities
  onOpenSearch: () => void;
  onOpenStudySuite: () => void;
  onOpenShortcuts: () => void;
  onOpenAttributions: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  bookmarksCount?: number;
  themeMode: ReadingTheme;
  onChangeThemeMode: (theme: ReadingTheme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  surahs,
  currentSurahId,
  currentAyahNumber,
  onSelectSurah,
  onSelectAyah,
  onPrevAyah,
  onNextAyah,
  activeMode,
  onChangeMode,
  activePage = 1,
  onPrevPage,
  onNextPage,
  onPageSelect,
  showTajweed = false,
  onToggleTajweed,
  overallReadingMode = 'standard',
  onChangeReadingMode,
  showWordByWord = false,
  onToggleWordByWord,
  selectedTranslationAuthor = 'taqi_usmani',
  onSelectTranslationAuthor,
  secondaryTranslationAuthor = null,
  onSelectSecondaryTranslationAuthor,
  wbwLanguage = 'both',
  onSelectWbwLanguage,
  onOpenTafsirSettings,
  fontSize = 17,
  onFontSizeChange,
  tafsirLayoutMode = 'stacked',
  onSelectTafsirLayoutMode,
  onOpenSearch,
  onOpenStudySuite,
  onOpenShortcuts,
  onOpenAttributions,
  isZenMode,
  onToggleZenMode,
  bookmarksCount = 0,
  themeMode,
  onChangeThemeMode
}) => {
  const [showNavPopover, setShowNavPopover] = useState(false);
  const [directJumpInput, setDirectJumpInput] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const currentSurah = surahs.find(s => s.id === currentSurahId) || surahs[0];
  const versesCount = currentSurah?.verses_count || 7;

  // Close nav popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowNavPopover(false);
      }
    };
    if (showNavPopover) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showNavPopover]);

  const handleDirectJump = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = directJumpInput.trim();
    if (!trimmed) return;

    // Pattern: "55:13" or "55 13"
    const match = trimmed.match(/^(\d+)[:\s]+(\d+)$/);
    if (match) {
      const sId = parseInt(match[1], 10);
      const aNum = parseInt(match[2], 10);
      if (sId >= 1 && sId <= 114) {
        onSelectSurah(sId);
        onSelectAyah(aNum);
        setDirectJumpInput('');
        setShowNavPopover(false);
        return;
      }
    }

    // Pattern: Single Ayah number in current Surah
    const singleNum = parseInt(trimmed, 10);
    if (!isNaN(singleNum) && singleNum >= 1 && singleNum <= versesCount) {
      onSelectAyah(singleNum);
      setDirectJumpInput('');
      setShowNavPopover(false);
    }
  };

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
      dir="rtl" 
      className="sticky top-0 z-40 w-full h-11 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors font-ibm select-none px-3 sm:px-5"
    >
      <div className="w-full h-full flex items-center justify-between gap-2 sm:gap-4">
        
        {/* ======================================================== */}
        {/* RIGHT FLANK: Brand & Fast Location Breadcrumb Navigator   */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Brand Mark */}
          <div className="flex items-center gap-1.5 pl-1.5 sm:border-l sm:border-slate-200 dark:sm:border-slate-800">
            <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white hidden md:inline">
              الوحيين
            </span>
          </div>

          {/* Location Breadcrumb Trigger */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setShowNavPopover(prev => !prev)}
              title="سورۃ و آیت تبدیل کریں یا جمپ کریں"
              className="flex items-center gap-1.5 h-7 px-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-colors"
            >
              <span className="text-emerald-700 dark:text-emerald-400">
                سورة {currentSurah?.name_arabic}
              </span>
              <span className="text-slate-400 text-[10px]">۞</span>
              <span>آیت {toArabicDigits(currentAyahNumber)}</span>
              {(activeMode === 'quran' || activeMode === 'mushaf') && (
                <span className="hidden lg:inline text-[11px] text-slate-400 font-normal">
                  • ص {toArabicDigits(activePage)}
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Quick Ayah Stepper Arrows */}
            <div className="hidden sm:inline-flex items-center gap-0.5 mr-1">
              <button
                onClick={onPrevAyah}
                title="پچھلی آیت"
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={onNextAyah}
                title="اگلی آیت"
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            </div>

            {/* Floating Navigation Popover */}
            {showNavPopover && (
              <div 
                className="absolute top-9 right-0 z-50 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 space-y-3 animate-fadeIn text-xs"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">سورۃ منتخب کریں</label>
                  <select
                    value={currentSurahId}
                    onChange={(e) => {
                      onSelectSurah(Number(e.target.value));
                      onSelectAyah(1);
                    }}
                    className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {surahs.map((s) => (
                      <option key={s.id} value={s.id} className="dark:bg-slate-900">
                        {s.id}. {s.name_arabic} ({s.name_simple})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">آیت</label>
                    <select
                      value={currentAyahNumber}
                      onChange={(e) => onSelectAyah(Number(e.target.value))}
                      className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      {Array.from({ length: versesCount }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num} className="dark:bg-slate-900">
                          آیت {toArabicDigits(num)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">فاسٹ جمپ</label>
                    <form onSubmit={handleDirectJump} className="flex items-center h-8 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 focus-within:ring-1 focus-within:ring-emerald-500">
                      <input
                        type="text"
                        value={directJumpInput}
                        onChange={(e) => setDirectJumpInput(e.target.value)}
                        placeholder="55:13"
                        className="w-full bg-transparent outline-none text-[11px] font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400"
                      />
                      <button type="submit" title="جمپ کریں (Enter)" className="text-slate-400 hover:text-emerald-600">
                        <CornerDownLeft className="w-3 h-3" />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{currentSurah?.revelation_place === 'makkah' ? 'مکی سورۃ' : 'مدنی سورۃ'}</span>
                  <span>{toArabicDigits(currentSurah?.verses_count || 0)} کل آیات</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CENTER: Workspace 4-Mode Switcher                         */}
        {/* ======================================================== */}
        <nav className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200/70 dark:border-slate-700/70 shrink-0">
          <button
            onClick={() => onChangeMode('quran')}
            title="خالص عثمانی مصحف و تلاوت (1)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
              activeMode === 'quran' || activeMode === 'mushaf'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>قرآن</span>
            <kbd className="hidden lg:inline-block px-1 py-0.2 text-[9px] font-mono opacity-60 bg-slate-200/60 dark:bg-slate-800 rounded">
              1
            </kbd>
          </button>

          <button
            onClick={() => onChangeMode('translation')}
            title="بامحاورہ و لفظی ترجمہ (2)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
              activeMode === 'translation'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>ترجمہ</span>
            <kbd className="hidden lg:inline-block px-1 py-0.2 text-[9px] font-mono opacity-60 bg-slate-200/60 dark:bg-slate-800 rounded">
              2
            </kbd>
          </button>

          <button
            onClick={() => onChangeMode('sarf')}
            title="صرف، نحو و لغت (3)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
              activeMode === 'sarf' || activeMode === 'morphology'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>صرف</span>
            <kbd className="hidden lg:inline-block px-1 py-0.2 text-[9px] font-mono opacity-60 bg-slate-200/60 dark:bg-slate-800 rounded">
              3
            </kbd>
          </button>

          <button
            onClick={() => onChangeMode('tafseer')}
            title="تقابلی تفاسیر (4)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
              activeMode === 'tafseer' || activeMode === 'tafsir'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>تفسیر</span>
            <kbd className="hidden lg:inline-block px-1 py-0.2 text-[9px] font-mono opacity-60 bg-slate-200/60 dark:bg-slate-800 rounded">
              4
            </kbd>
          </button>
        </nav>

        {/* ======================================================== */}
        {/* LEFT FLANK: Mode-Specific Context Controls & Utilities    */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Mode Context Controls: Quran/Mushaf Mode */}
          {(activeMode === 'quran' || activeMode === 'mushaf') && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Page Stepper */}
              {onPrevPage && onNextPage && (
                <div className="flex items-center gap-0.5 h-7 px-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                  <button
                    onClick={onPrevPage}
                    disabled={activePage <= 1}
                    title="پچھلا صفحہ"
                    className="p-0.5 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono px-1">
                    ص {toArabicDigits(activePage)}
                  </span>
                  <button
                    onClick={onNextPage}
                    disabled={activePage >= 604}
                    title="اگلا صفحہ"
                    className="p-0.5 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Mushaf Reading Mode (Single Page vs Book Spread) */}
              {onChangeReadingMode && (
                <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg">
                  <button
                    onClick={() => onChangeReadingMode('standard')}
                    title="۱۵ سطری واحد صفحہ"
                    className={`p-1 rounded-md transition-all ${
                      overallReadingMode === 'standard'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    <Rows3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onChangeReadingMode('book')}
                    title="دو ورقی کھلا مصحف (Book Spread)"
                    className={`p-1 rounded-md transition-all ${
                      overallReadingMode === 'book'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    <BookOpen className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Tajweed Color Toggle */}
              {onToggleTajweed && (
                <button
                  onClick={onToggleTajweed}
                  title="تجوید کے رنگ آن / آف کریں"
                  className={`flex items-center gap-1 h-7 px-2 rounded-lg text-xs font-semibold transition-all ${
                    showTajweed
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">تجوید</span>
                </button>
              )}
            </div>
          )}

          {/* Mode Context Controls: Translation Mode */}
          {activeMode === 'translation' && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Primary Translation Author Dropdown */}
              {onSelectTranslationAuthor && (
                <select
                  value={selectedTranslationAuthor}
                  onChange={(e) => onSelectTranslationAuthor(e.target.value)}
                  className="h-7 text-xs bg-slate-100 dark:bg-slate-800/80 rounded-lg px-2 text-slate-800 dark:text-slate-100 outline-none font-semibold cursor-pointer max-w-[130px] truncate"
                  title="مترجم کا انتخاب"
                >
                  <optgroup label="اردو تراجم" className="dark:bg-slate-900">
                    <option value="taqi_usmani">مفتی تقی عثمانی</option>
                    <option value="maududi">مولانا مودودی</option>
                    <option value="junagarhi">مولانا جوناگڑھی</option>
                    <option value="mahmud_hasan">محمود الحسن</option>
                    <option value="israr_ahmad">ڈاکٹر اسرار احمد</option>
                    <option value="jalandhari">فتح محمد جالندھری</option>
                  </optgroup>
                  <optgroup label="English Translations" className="dark:bg-slate-900">
                    <option value="sahih_intl">Saheeh Intl (EN)</option>
                    <option value="taqi_usmani_en">Taqi Usmani (EN)</option>
                    <option value="abdel_haleem">Abdel Haleem (EN)</option>
                  </optgroup>
                </select>
              )}

              {/* Word-by-Word Toggle */}
              {onToggleWordByWord && (
                <button
                  onClick={onToggleWordByWord}
                  title="لفظی ترجمہ اور اعراب آن / آف کریں"
                  className={`flex items-center gap-1 h-7 px-2 rounded-lg text-xs font-semibold transition-all ${
                    showWordByWord
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {showWordByWord ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5 opacity-60" />}
                  <span className="hidden lg:inline">لفظی ترجمہ</span>
                </button>
              )}
            </div>
          )}

          {/* Mode Context Controls: Tafsir Mode */}
          {(activeMode === 'tafseer' || activeMode === 'tafsir') && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Tafsir Layout Switcher */}
              {onSelectTafsirLayoutMode && (
                <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg">
                  <button
                    onClick={() => onSelectTafsirLayoutMode('focus')}
                    title="مطالعہ فوکس ریڈر (Single Focus)"
                    className={`px-1.5 py-1 rounded text-[11px] font-semibold transition-all ${
                      tafsirLayoutMode === 'focus'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    فوکس
                  </button>
                  <button
                    onClick={() => onSelectTafsirLayoutMode('split')}
                    title="دو رخی تقابلی اسپلٹ (Comparative)"
                    className={`px-1.5 py-1 rounded text-[11px] font-semibold transition-all ${
                      tafsirLayoutMode === 'split'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    اسپلٹ
                  </button>
                </div>
              )}

              {/* Font Size Scaler */}
              {onFontSizeChange && (
                <div className="hidden sm:flex items-center gap-0.5 h-7 px-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs">
                  <button
                    onClick={() => onFontSizeChange(Math.max(14, fontSize - 1))}
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    title="فونٹ چھوٹا کریں"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                  <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 px-0.5">{fontSize}</span>
                  <button
                    onClick={() => onFontSizeChange(Math.min(26, fontSize + 1))}
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    title="فونٹ بڑا کریں"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Tafsir Select / Reorder Modal Trigger */}
              {onOpenTafsirSettings && (
                <button
                  onClick={onOpenTafsirSettings}
                  title="تفاسیر کی ترتیب اور انتخاب"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Omnibar / Search Trigger (Ctrl+K) */}
          <button
            onClick={onOpenSearch}
            title="کمانڈ پیلیٹ و تلاش (Ctrl + K)"
            className="flex items-center gap-1.5 h-7 px-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">تلاش</span>
            <kbd className="hidden lg:inline-block px-1 py-0.2 text-[9px] font-mono bg-slate-200/70 dark:bg-slate-800 rounded text-slate-500">
              Ctrl K
            </kbd>
          </button>

          {/* Study Suite Notebook (Bookmarks) */}
          <button
            onClick={onOpenStudySuite}
            title="محفوظ آیات و نوٹس"
            className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            {bookmarksCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* Zen / Focus Mode Toggle */}
          <button
            onClick={onToggleZenMode}
            title={isZenMode ? "نارمل موڈ پر واپس آئیں (Z)" : "زین / فوکس موڈ (Z)"}
            className={`p-1.5 rounded-lg transition-colors ${
              isZenMode 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Reading Atmosphere Theme Switcher */}
          <button
            onClick={cycleTheme}
            title={themeLabels[themeMode] + ' (تبدیل کرنے کے لیے کلک کریں)'}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {themeMode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
            {themeMode === 'sepia' && <Coffee className="w-3.5 h-3.5 text-amber-700" />}
            {themeMode === 'dark' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            {themeMode === 'oled' && <Eye className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>

      </div>
    </header>
  );
};
