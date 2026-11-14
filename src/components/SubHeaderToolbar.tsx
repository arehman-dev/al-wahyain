import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Compass, 
  CornerDownLeft,
  Palette,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  ChevronsDown,
  ChevronsUp,
  Bookmark,
  FileEdit,
  Focus,
  Languages,
  X
} from 'lucide-react';
import { Surah, AppMode, TafsirLayoutMode } from '../types/quran';
import { NavArrowMode } from '../types/shortcuts';

interface SubHeaderToolbarProps {
  surahs: Surah[];
  currentSurahId: number;
  currentAyahNumber: number;
  onSelectSurah: (id: number) => void;
  onSelectAyah: (num: number) => void;
  onPrevSurah: () => void;
  onNextSurah: () => void;
  onPrevAyah: () => void;
  onNextAyah: () => void;
  activeMode: AppMode;
  navArrowMode?: NavArrowMode;

  // Bookmark & Note (Placed at Left of Sub-Header per 3.2 & 3.4)
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  hasNote: boolean;
  onOpenNoteDrawer: () => void;

  // Quran/Mushaf & Tajweed specific
  activePage?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onPageSelect?: (page: number) => void;
  showTajweed?: boolean;
  onToggleTajweed?: () => void;

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
  onExpandAllTafasir?: () => void;
  onCollapseAllTafasir?: () => void;
  tafsirLayoutMode?: TafsirLayoutMode;
  onSelectTafsirLayoutMode?: (mode: TafsirLayoutMode) => void;
}

export const SubHeaderToolbar: React.FC<SubHeaderToolbarProps> = ({
  surahs,
  currentSurahId,
  currentAyahNumber,
  onSelectSurah,
  onSelectAyah,
  onPrevSurah,
  onNextSurah,
  onPrevAyah,
  onNextAyah,
  activeMode,
  navArrowMode = 'rtl',
  isBookmarked,
  onToggleBookmark,
  hasNote,
  onOpenNoteDrawer,
  activePage = 1,
  onPrevPage,
  onNextPage,
  onPageSelect,
  showTajweed = false,
  onToggleTajweed,
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
  onExpandAllTafasir,
  onCollapseAllTafasir,
  tafsirLayoutMode = 'stacked',
  onSelectTafsirLayoutMode
}) => {
  const currentSurah = surahs.find(s => s.id === currentSurahId);
  const versesCount = currentSurah?.verses_count || 1;
  const ayahNumbers = Array.from({ length: versesCount }, (_, i) => i + 1);
  const isQuranOrSarf = activeMode === 'quran' || activeMode === 'mushaf' || activeMode === 'sarf' || activeMode === 'morphology';

  const [fastJumpText, setFastJumpText] = useState('');
  const [fastJumpError, setFastJumpError] = useState(false);
  const [showMobileFastJump, setShowMobileFastJump] = useState(false);

  const handleFastJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = fastJumpText.trim();
    if (!raw) return;

    // Direct intro jump (e.g. "0-intro", "0", "intro", "تعارف", "مقدمہ") - only allowed in translation and tafsir modes
    if (!isQuranOrSarf && (raw.toLowerCase() === '0-intro' || raw === '0' || raw.toLowerCase() === 'intro' || raw === 'تعارف' || raw === 'مقدمہ')) {
      onSelectAyah(0);
      setFastJumpText('');
      setFastJumpError(false);
      return;
    }

    const minAyah = isQuranOrSarf ? 1 : 0;

    // Check for e.g. 2:0-intro or 2:0
    const matchIntro = raw.match(/^(\d{1,3})[:\-/.\s](?:0-intro|0|intro|تعارف|مقدمہ)$/i);
    if (matchIntro && !isQuranOrSarf) {
      const sId = parseInt(matchIntro[1], 10);
      if (sId >= 1 && sId <= 114) {
        onSelectSurah(sId);
        setTimeout(() => onSelectAyah(0), 30);
        setFastJumpText('');
        setFastJumpError(false);
        return;
      }
    }

    const matchKey = raw.match(/^(\d{1,3})[:\-/.\s](\d{1,3})$/);
    if (matchKey) {
      const sId = parseInt(matchKey[1], 10);
      const aNum = parseInt(matchKey[2], 10);
      const targetSurah = surahs.find(s => s.id === sId);
      if (targetSurah && aNum >= minAyah && aNum <= targetSurah.verses_count) {
        onSelectSurah(sId);
        setTimeout(() => onSelectAyah(aNum), 30);
        setFastJumpText('');
        setFastJumpError(false);
        return;
      }
    }

    const numOnly = parseInt(raw, 10);
    if (!isNaN(numOnly)) {
      if ((activeMode === 'quran' || activeMode === 'mushaf') && onPageSelect && numOnly >= 1 && numOnly <= 604) {
        onPageSelect(numOnly);
        setFastJumpText('');
        setFastJumpError(false);
        return;
      }
      if (numOnly >= minAyah && numOnly <= versesCount) {
        onSelectAyah(numOnly);
        setFastJumpText('');
        setFastJumpError(false);
        return;
      }
    }

    const foundSurah = surahs.find(
      s => s.name_arabic.includes(raw) || s.name_simple.toLowerCase().includes(raw.toLowerCase())
    );
    if (foundSurah) {
      onSelectSurah(foundSurah.id);
      setFastJumpText('');
      setFastJumpError(false);
      return;
    }

    setFastJumpError(true);
    setTimeout(() => setFastJumpError(false), 1500);
  };

  const isFocusTafsir = tafsirLayoutMode === 'focus';

  return (
    <div 
      dir="ltr" 
      className="sticky top-10 z-30 w-full h-10 glass-bar border-b px-3 sm:px-6 font-ibm select-none transition-all flex items-center"
    >
      <div className="w-full h-full grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        
        {/* ======================================================== */}
        {/* LEFT SIDE: Only Bookmark & Note (Icon-Only, 2D Outlined) */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1.5 justify-self-start">
          {/* Bookmark Icon Button */}
          <button
            onClick={onToggleBookmark}
            title={isBookmarked ? 'Remove Bookmark [B]' : 'Add Bookmark [B]'}
            aria-label="Bookmark"
            className={`w-[26px] h-[26px] rounded-md flex items-center justify-center cursor-pointer relative ${
              isBookmarked ? 'btn-bar btn-bar-bookmark-active' : 'btn-bar hover:border-amber-500/70 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            <Bookmark 
              className="w-3.5 h-3.5" 
              strokeWidth={1.75} 
              fill={isBookmarked ? 'currentColor' : 'none'} 
            />
            {isBookmarked && <span className="micro-dot micro-dot-amber" />}
          </button>

          {/* Note Icon Button */}
          <button
            onClick={onOpenNoteDrawer}
            title={hasNote ? 'View/Edit Note [N]' : 'Write Study Note [N]'}
            aria-label="Study Note"
            className={`w-[26px] h-[26px] rounded-md flex items-center justify-center cursor-pointer relative ${
              hasNote ? 'btn-bar btn-bar-active' : 'btn-bar hover:border-[#2ca4ab] hover:text-[#0e7490] dark:hover:text-[#2ca4ab]'
            }`}
          >
            <FileEdit 
              className="w-3.5 h-3.5" 
              strokeWidth={1.75} 
              fill={hasNote ? 'currentColor' : 'none'} 
            />
            {hasNote && <span className="micro-dot" />}
          </button>
        </div>

        {/* ======================================================== */}
        {/* CENTER (Screen-Centered): Surah + Ayah + Fast Jump + Tajweed */}
        {/* ======================================================== */}
        <div dir="rtl" className="flex items-center justify-center gap-2 justify-self-center">
          
          {/* 1. Surah Selector with Prev/Next Surah Icons */}
          <div className="btn-bar h-[26px] flex items-center rounded-md p-0.5">
            <button
              onClick={onPrevSurah}
              disabled={currentSurahId <= 1}
              title={navArrowMode === 'rtl' ? 'پچھلی سورت [Shift + → / }]' : 'پچھلی سورت [Shift + ← / {]'}
              aria-label="Previous Surah"
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" strokeWidth={1.75} />
            </button>

            <select
              value={currentSurahId}
              onChange={(e) => onSelectSurah(Number(e.target.value))}
              aria-label="Select Surah"
              className="bg-transparent text-slate-800 dark:text-slate-100 font-bold text-xs px-1.5 focus:outline-none cursor-pointer hover:text-[#0e7490] dark:hover:text-[#2ca4ab] transition-colors"
            >
              {surahs.map((s) => (
                <option key={s.id} value={s.id} className="dark:bg-slate-900">
                  {s.id}. سورة {s.name_arabic}
                </option>
              ))}
            </select>

            <button
              onClick={onNextSurah}
              disabled={currentSurahId >= 114}
              title={navArrowMode === 'rtl' ? 'اگلی سورت [Shift + ← / {]' : 'اگلی سورت [Shift + → / }]'}
              aria-label="Next Surah"
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" strokeWidth={1.75} />
            </button>
          </div>

          {/* 2. Ayah Selector with Prev/Next Ayah Icons */}
          <div className="btn-bar h-[26px] flex items-center rounded-md p-0.5">
            <button
              onClick={onPrevAyah}
              disabled={currentSurahId === 1 && currentAyahNumber <= (isQuranOrSarf ? 1 : 0)}
              title={navArrowMode === 'rtl' ? 'پچھلی آیت [→ / K]' : 'پچھلی آیت [← / J]'}
              aria-label="Previous Ayah"
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" strokeWidth={1.75} />
            </button>

            <select
              dir="rtl"
              value={currentAyahNumber}
              onChange={(e) => onSelectAyah(Number(e.target.value))}
              aria-label="Select Ayah"
              className="bg-transparent text-slate-800 dark:text-slate-100 text-xs font-bold px-1.5 focus:outline-none cursor-pointer hover:text-[#0e7490] dark:hover:text-[#2ca4ab] transition-colors"
            >
              {!isQuranOrSarf && (
                <option value={0} dir="rtl" className="dark:bg-slate-900 font-bold text-[#0e7490] dark:text-[#2ca4ab] font-mono">
                  0-intro
                </option>
              )}
              {ayahNumbers.map((num) => (
                <option key={num} value={num} className="dark:bg-slate-900">
                  {num}
                </option>
              ))}
            </select>

            <button
              onClick={onNextAyah}
              disabled={currentSurahId === 114 && currentAyahNumber >= versesCount}
              title={navArrowMode === 'rtl' ? 'اگلی آیت [← / J]' : 'اگلی آیت [→ / K]'}
              aria-label="Next Ayah"
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" strokeWidth={1.75} />
            </button>
          </div>

          {/* 3. Fast Jump Input (Desktop xl:flex) */}
          <form onSubmit={handleFastJumpSubmit} className="relative hidden xl:flex items-center h-[26px]">
            <Compass className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" strokeWidth={1.75} />
            <input
              type="text"
              value={fastJumpText}
              onChange={(e) => setFastJumpText(e.target.value)}
              placeholder="2:255"
              className={`h-[26px] w-20 text-slate-800 dark:text-slate-100 text-xs rounded-md pr-7 pl-5 border transition-all focus:w-28 focus:outline-none font-app ${
                fastJumpError
                  ? 'border-rose-500 bg-rose-50/50'
                  : 'btn-bar focus:border-[#2ca4ab] focus:bg-white dark:focus:bg-slate-900'
              }`}
            />
            {fastJumpText && (
              <button
                type="submit"
                className="absolute left-1 text-[#2ca4ab] hover:text-[#0e7490] p-0.5 cursor-pointer"
              >
                <CornerDownLeft className="w-3 h-3" strokeWidth={1.75} />
              </button>
            )}
          </form>

          {/* 3b. Mobile Fast Jump Trigger (< xl) */}
          <div className="relative xl:hidden">
            <button
              onClick={() => setShowMobileFastJump(prev => !prev)}
              title="Fast Jump (Surah:Ayah)"
              aria-label="Fast Jump"
              className={`w-[26px] h-[26px] rounded-md flex items-center justify-center cursor-pointer ${
                showMobileFastJump ? 'btn-bar btn-bar-active' : 'btn-bar hover:border-[#2ca4ab]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>

            {/* Mobile Dropdown Popover */}
            {showMobileFastJump && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-300 dark:border-slate-800 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                <form 
                  onSubmit={(e) => {
                    handleFastJumpSubmit(e);
                    setShowMobileFastJump(false);
                  }} 
                  className="relative flex items-center"
                >
                  <Compass className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" strokeWidth={1.75} />
                  <input
                    type="text"
                    value={fastJumpText}
                    onChange={(e) => setFastJumpText(e.target.value)}
                    placeholder="2:255"
                    autoFocus
                    className="w-32 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs rounded-md pr-7 pl-5 py-1 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-[#2ca4ab] font-app"
                  />
                  {fastJumpText && (
                    <button type="submit" className="absolute left-1 text-[#2ca4ab] p-0.5">
                      <CornerDownLeft className="w-3 h-3" />
                    </button>
                  )}
                </form>
                <button 
                  onClick={() => setShowMobileFastJump(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 4. Left-Most in Center Group: Global Tajweed V4 COLRv1 Icon Toggle */}
          {onToggleTajweed && (
            <button
              onClick={onToggleTajweed}
              title={showTajweed ? 'Disable Tajweed' : 'Enable Tajweed (QCF V4 COLRv1)'}
              aria-label="Tajweed Mode"
              className={`w-[26px] h-[26px] rounded-md flex items-center justify-center cursor-pointer relative ${
                showTajweed ? 'btn-bar btn-bar-active' : 'btn-bar hover:border-[#2ca4ab] hover:text-[#2ca4ab]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" strokeWidth={1.75} />
              {showTajweed && <span className="micro-dot" />}
            </button>
          )}

        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE: Mode-Specific Controls                       */}
        {/* ======================================================== */}
        <div dir="rtl" className="flex items-center gap-1.5 justify-self-end flex-nowrap">
          
          {/* 1. Mushaf Mode: Single Continuous Page Stepper */}
          {(activeMode === 'quran' || activeMode === 'mushaf') && (
            <div className="btn-bar h-[26px] flex items-center rounded-md p-0.5">
              <button
                onClick={onPrevPage}
                disabled={activePage <= 1}
                title="Previous Page"
                aria-label="Previous Page"
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#2ca4ab] disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3 h-3" strokeWidth={1.75} />
              </button>
              <div className="flex items-center gap-1 px-1.5 text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">صفحہ</span>
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={activePage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= 604 && onPageSelect) {
                      onPageSelect(val);
                    }
                  }}
                  className="w-7 text-center font-bold font-app text-xs bg-transparent text-slate-700 dark:text-slate-200 py-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs text-slate-700 dark:text-slate-200 font-app font-bold">/ 604</span>
              </div>
              <button
                onClick={onNextPage}
                disabled={activePage >= 604}
                title="Next Page"
                aria-label="Next Page"
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#2ca4ab] disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3 h-3" strokeWidth={1.75} />
              </button>
            </div>
          )}

          {/* 2. Translation Mode Controls */}
          {activeMode === 'translation' && (
            <div className="flex items-center gap-1.5 flex-nowrap">
              {onSelectTranslationAuthor && (
                <div className="btn-bar h-[26px] flex items-center rounded-md px-2">
                  <select
                    value={selectedTranslationAuthor}
                    onChange={(e) => onSelectTranslationAuthor(e.target.value)}
                    aria-label="Primary Translation"
                    className="max-w-[115px] xl:max-w-[135px] truncate bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer hover:text-[#0e7490] dark:hover:text-[#2ca4ab] transition-colors"
                  >
                    <option value="taqi_usmani" className="dark:bg-slate-900">مفتی تقی عثمانی</option>
                    <option value="maududi" className="dark:bg-slate-900">سید مودودی</option>
                    <option value="junagarhi" className="dark:bg-slate-900">محمد جوناگڑھی</option>
                    <option value="mahmud_hasan" className="dark:bg-slate-900">محمود الحسن</option>
                    <option value="israr_ahmad" className="dark:bg-slate-900">ڈاکٹر اسرار احمد</option>
                    <option value="jalandhari" className="dark:bg-slate-900">فتح محمد جالندھری</option>
                    <option value="sahih_intl" className="dark:bg-slate-900">Saheeh Intl (EN)</option>
                    <option value="taqi_usmani_en" className="dark:bg-slate-900">Taqi Usmani (EN)</option>
                    <option value="abdel_haleem" className="dark:bg-slate-900">Abdel Haleem (EN)</option>
                  </select>
                </div>
              )}

              {onSelectSecondaryTranslationAuthor && (
                <div className="btn-bar h-[26px] hidden md:flex items-center rounded-md px-2">
                  <select
                    value={secondaryTranslationAuthor || ''}
                    onChange={(e) => onSelectSecondaryTranslationAuthor(e.target.value || null)}
                    aria-label="Secondary Translation"
                    className="max-w-[105px] xl:max-w-[125px] truncate bg-transparent text-[11px] font-semibold text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:text-[#0e7490] dark:hover:text-[#2ca4ab] transition-colors"
                  >
                    <option value="" className="dark:bg-slate-900">+ تقابلی ترجمہ</option>
                    <option value="taqi_usmani" className="dark:bg-slate-900">مفتی تقی عثمانی</option>
                    <option value="maududi" className="dark:bg-slate-900">سید مودودی</option>
                    <option value="junagarhi" className="dark:bg-slate-900">محمد جوناگڑھی</option>
                    <option value="mahmud_hasan" className="dark:bg-slate-900">محمود الحسن</option>
                    <option value="israr_ahmad" className="dark:bg-slate-900">ڈاکٹر اسرار احمد</option>
                    <option value="jalandhari" className="dark:bg-slate-900">فتح محمد جالندھری</option>
                    <option value="sahih_intl" className="dark:bg-slate-900">Saheeh Intl (EN)</option>
                    <option value="taqi_usmani_en" className="dark:bg-slate-900">Taqi Usmani (EN)</option>
                    <option value="abdel_haleem" className="dark:bg-slate-900">Abdel Haleem (EN)</option>
                  </select>
                </div>
              )}

              {onToggleWordByWord && (
                <button
                  onClick={onToggleWordByWord}
                  title={showWordByWord ? 'Hide Word-by-Word' : 'Show Word-by-Word'}
                  aria-label="Word-by-Word Translation"
                  className={`w-[26px] h-[26px] shrink-0 rounded-md flex items-center justify-center cursor-pointer relative ${
                    showWordByWord ? 'btn-bar btn-bar-active' : 'btn-bar hover:border-[#2ca4ab] hover:text-[#2ca4ab]'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" strokeWidth={1.75} />
                  {showWordByWord && <span className="micro-dot" />}
                </button>
              )}
            </div>
          )}

          {/* 3. Tafsir Mode Controls: Focus Toggle, Expand/Collapse, Font Size, Settings */}
          {(activeMode === 'tafseer' || activeMode === 'tafsir') && (
            <div className="flex items-center gap-1.5">
              {/* Single Focus Mode Toggle Icon */}
              {onSelectTafsirLayoutMode && (
                <button
                  onClick={() => onSelectTafsirLayoutMode(isFocusTafsir ? 'stacked' : 'focus')}
                  title={isFocusTafsir ? 'Show All Tafasir (Stacked)' : 'Focus on Selected Mufassir (Focus)'}
                  aria-label="Tafsir Layout Mode"
                  className={`w-[26px] h-[26px] rounded-md flex items-center justify-center cursor-pointer relative ${
                    isFocusTafsir ? 'btn-bar btn-bar-active' : 'btn-bar hover:border-[#2ca4ab] hover:text-[#2ca4ab]'
                  }`}
                >
                  <Focus className="w-3.5 h-3.5" strokeWidth={1.75} />
                  {isFocusTafsir && <span className="micro-dot" />}
                </button>
              )}

              {/* Expand All / Collapse All Icons */}
              {!isFocusTafsir && (
                <div className="btn-bar h-[26px] flex items-center rounded-md p-0.5">
                  <button
                    onClick={onExpandAllTafasir}
                    title="Expand All Tafasir"
                    aria-label="Expand All Tafasir"
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#2ca4ab] transition-colors cursor-pointer"
                  >
                    <ChevronsDown className="w-3 h-3" strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={onCollapseAllTafasir}
                    title="Collapse All Tafasir"
                    aria-label="Collapse All Tafasir"
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#2ca4ab] transition-colors cursor-pointer"
                  >
                    <ChevronsUp className="w-3 h-3" strokeWidth={1.75} />
                  </button>
                </div>
              )}

              {/* Font Size Stepper */}
              {onFontSizeChange && (
                <div className="btn-bar h-[26px] hidden sm:flex items-center rounded-md p-0.5">
                  <button
                    onClick={() => onFontSizeChange(Math.max(14, fontSize - 1))}
                    title="Decrease Font Size"
                    aria-label="Decrease Font Size"
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#2ca4ab] transition-colors cursor-pointer"
                  >
                    <ZoomOut className="w-3 h-3" strokeWidth={1.75} />
                  </button>
                  <span className="px-1 text-[11px] font-app font-bold text-slate-700 dark:text-slate-300 min-w-[18px] text-center">
                    {fontSize}
                  </span>
                  <button
                    onClick={() => onFontSizeChange(Math.min(28, fontSize + 1))}
                    title="Increase Font Size"
                    aria-label="Increase Font Size"
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#2ca4ab] transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-3 h-3" strokeWidth={1.75} />
                  </button>
                </div>
              )}

              {/* Tafsir Order & Selection Settings Icon */}
              {onOpenTafsirSettings && (
                <button
                  onClick={onOpenTafsirSettings}
                  title="Tafsir Selection & Ordering"
                  aria-label="Tafsir Selection & Ordering"
                  className="w-[26px] h-[26px] rounded-md flex items-center justify-center btn-bar hover:border-[#2ca4ab] hover:text-[#2ca4ab] transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
