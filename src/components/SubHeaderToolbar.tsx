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
  ScrollText
} from 'lucide-react';
import { Surah, AppMode, TafsirLayoutMode, HadithBook, HadithChapter } from '../types/quran';

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

  // Hadith Mode Specific
  hadithBooks?: HadithBook[];
  currentHadithBook?: string;
  onSelectHadithBook?: (slug: string) => void;
  hadithChapters?: HadithChapter[];
  currentHadithChapterId?: number | 'all';
  onSelectHadithChapter?: (chapterId: number | 'all') => void;
  onPrevHadithChapter?: () => void;
  onNextHadithChapter?: () => void;
  onJumpToHadithNumber?: (num: number) => void;
  hadithViewLang?: 'all' | 'ur' | 'ar' | 'en';
  onSelectHadithViewLang?: (lang: 'all' | 'ur' | 'ar' | 'en') => void;

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
  hadithBooks = [],
  currentHadithBook = 'bukhari',
  onSelectHadithBook,
  hadithChapters = [],
  currentHadithChapterId = 'all',
  onSelectHadithChapter,
  onPrevHadithChapter,
  onNextHadithChapter,
  onJumpToHadithNumber,
  hadithViewLang = 'all',
  onSelectHadithViewLang,
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

  const [fastJumpText, setFastJumpText] = useState('');
  const [fastJumpError, setFastJumpError] = useState(false);

  const hadithChapIdx = currentHadithChapterId === 'all'
    ? -1
    : hadithChapters.findIndex(c => c.chapter_number === currentHadithChapterId);
  const isHadithPrevDisabled = currentHadithChapterId === 'all' || hadithChapIdx <= 0;
  const isHadithNextDisabled = currentHadithChapterId === 'all' || hadithChapIdx < 0 || hadithChapIdx >= hadithChapters.length - 1;

  const handleFastJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = fastJumpText.trim();
    if (!raw) return;

    if (activeMode === 'hadith') {
      const bookPrefixMatch = raw.match(/^([a-zA-Z\u0600-\u06FF\s]+?)\s*#?(\d+)$/);
      if (bookPrefixMatch) {
        const bookStr = bookPrefixMatch[1].trim().toLowerCase();
        const num = parseInt(bookPrefixMatch[2], 10);
        const foundBook = hadithBooks.find(b => 
          b.slug.toLowerCase() === bookStr || 
          b.name_english.toLowerCase().includes(bookStr) ||
          b.name_urdu.includes(bookStr) ||
          b.name_arabic.includes(bookStr)
        );
        if (foundBook) {
          onSelectHadithBook?.(foundBook.slug);
        }
        if (!isNaN(num) && num > 0) {
          onJumpToHadithNumber?.(num);
          setFastJumpText('');
          setFastJumpError(false);
          return;
        }
      }

      const numOnly = parseInt(raw.replace(/^#/, ''), 10);
      if (!isNaN(numOnly) && numOnly > 0) {
        onJumpToHadithNumber?.(numOnly);
        setFastJumpText('');
        setFastJumpError(false);
        return;
      }
      setFastJumpError(true);
      setTimeout(() => setFastJumpError(false), 1500);
      return;
    }

    const matchKey = raw.match(/^(\d{1,3})[:\-/.\s](\d{1,3})$/);
    if (matchKey) {
      const sId = parseInt(matchKey[1], 10);
      const aNum = parseInt(matchKey[2], 10);
      const targetSurah = surahs.find(s => s.id === sId);
      if (targetSurah && aNum >= 1 && aNum <= targetSurah.verses_count) {
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
      if (numOnly >= 1 && numOnly <= versesCount) {
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
      className="sticky top-12 z-30 w-full h-10 glass-bar border-b px-3 sm:px-6 font-ibm select-none transition-all flex items-center"
    >
      <div className="w-full h-full grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        
        {/* ======================================================== */}
        {/* LEFT SIDE: Only Bookmark & Note (Icon-Only, 2D Outline/Filled) */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1.5 justify-self-start">
          {activeMode !== 'hadith' ? (
            <>
              {/* Bookmark Icon Button (No Label per 3.4) */}
              <button
                onClick={onToggleBookmark}
                title={isBookmarked ? "بک مارک ہٹائیں" : "بک مارک کریں"}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/70'
                }`}
              >
                <Bookmark 
                  className="w-4 h-4" 
                  strokeWidth={1.85} 
                  fill={isBookmarked ? 'currentColor' : 'none'} 
                />
              </button>

              {/* Note Icon Button (No Label per 3.4) */}
              <button
                onClick={onOpenNoteDrawer}
                title={hasNote ? "نوٹ دیکھیں یا ترمیم کریں" : "نوٹ تحریر کریں"}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  hasNote
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/70'
                }`}
              >
                <FileEdit 
                  className="w-4 h-4" 
                  strokeWidth={1.85} 
                  fill={hasNote ? 'currentColor' : 'none'} 
                />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50">
              <ScrollText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">کتبِ حدیث</span>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* CENTER (Screen-Centered): Surah / Hadith Selectors + Fast Jump */}
        {/* ======================================================== */}
        {activeMode === 'hadith' ? (
          <div dir="rtl" className="flex items-center justify-center gap-1.5 sm:gap-2 justify-self-center">
            
            {/* 1. Hadith Book Selector with Prev/Next Book Icons */}
            <div className="flex items-center bg-slate-200/65 dark:bg-slate-800/75 rounded-xl p-0.5 border border-slate-300/60 dark:border-slate-700/60">
              <button
                onClick={() => {
                  const idx = hadithBooks.findIndex(b => b.slug === currentHadithBook);
                  if (idx > 0) onSelectHadithBook?.(hadithBooks[idx - 1].slug);
                }}
                disabled={hadithBooks.findIndex(b => b.slug === currentHadithBook) <= 0}
                title="پچھلی کتاب"
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.85} />
              </button>

              <select
                value={currentHadithBook}
                onChange={(e) => onSelectHadithBook?.(e.target.value)}
                aria-label="حدیث کی کتاب منتخب کریں"
                className="bg-transparent text-slate-800 dark:text-slate-100 font-bold text-xs px-1.5 py-0.5 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[170px] truncate"
              >
                {hadithBooks.map((b) => (
                  <option key={b.slug} value={b.slug} className="dark:bg-slate-900">
                    {b.name_urdu} ({b.name_english})
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  const idx = hadithBooks.findIndex(b => b.slug === currentHadithBook);
                  if (idx >= 0 && idx < hadithBooks.length - 1) onSelectHadithBook?.(hadithBooks[idx + 1].slug);
                }}
                disabled={hadithBooks.findIndex(b => b.slug === currentHadithBook) >= hadithBooks.length - 1}
                title="اگلی کتاب"
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.85} />
              </button>
            </div>

            {/* 2. Chapter Selector with Prev/Next Chapter Icons */}
            <div className="flex items-center bg-slate-200/65 dark:bg-slate-800/75 rounded-xl p-0.5 border border-slate-300/60 dark:border-slate-700/60">
              <button
                onClick={onPrevHadithChapter}
                disabled={isHadithPrevDisabled}
                title="پچھلا باب"
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.85} />
              </button>

              <select
                value={currentHadithChapterId ?? 'all'}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  onSelectHadithChapter?.(val);
                }}
                aria-label="باب منتخب کریں"
                className="bg-transparent text-slate-800 dark:text-slate-100 font-bold text-xs px-1.5 py-0.5 focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
              >
                <option value="all" className="dark:bg-slate-900">تمام ابواب (All Chapters)</option>
                {hadithChapters.map((c) => (
                  <option key={c.id} value={c.chapter_number} className="dark:bg-slate-900">
                    {c.chapter_number}. {c.title_arabic || c.title_english}
                  </option>
                ))}
              </select>

              <button
                onClick={onNextHadithChapter}
                disabled={isHadithNextDisabled}
                title="اگلا باب"
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.85} />
              </button>
            </div>

            {/* 3. Hadith Fast Jump Input */}
            <form onSubmit={handleFastJumpSubmit} className="relative hidden xl:flex items-center">
              <Compass className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" strokeWidth={1.85} />
              <input
                type="text"
                value={fastJumpText}
                onChange={(e) => setFastJumpText(e.target.value)}
                placeholder="حدیث #"
                className={`w-20 bg-slate-200/65 dark:bg-slate-800/75 text-slate-800 dark:text-slate-100 text-xs rounded-xl pr-7 pl-5 py-1 border transition-all focus:w-24 focus:outline-none focus:bg-white dark:focus:bg-slate-900 font-app ${
                  fastJumpError
                    ? 'border-rose-500 ring-1 ring-rose-500/30'
                    : 'border-slate-300/60 dark:border-slate-700/60 focus:border-emerald-500'
                }`}
              />
              {fastJumpText && (
                <button
                  type="submit"
                  className="absolute left-1.5 text-emerald-600 hover:text-emerald-700"
                >
                  <CornerDownLeft className="w-3 h-3" strokeWidth={1.85} />
                </button>
              )}
            </form>

          </div>
        ) : (
          <div dir="rtl" className="flex items-center justify-center gap-2 justify-self-center">
            
            {/* 1. Surah Selector with Prev/Next Surah Icons */}
            <div className="flex items-center bg-slate-200/65 dark:bg-slate-800/75 rounded-xl p-0.5 border border-slate-300/60 dark:border-slate-700/60">
              <button
                onClick={onPrevSurah}
                disabled={currentSurahId <= 1}
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.85} />
              </button>

              <select
                value={currentSurahId}
                onChange={(e) => onSelectSurah(Number(e.target.value))}
                aria-label="سورت منتخب کریں"
                className="bg-transparent text-slate-800 dark:text-slate-100 font-bold text-xs px-1.5 py-0.5 focus:outline-none cursor-pointer"
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
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.85} />
              </button>
            </div>

            {/* 2. Ayah Selector with Prev/Next Ayah Icons */}
            <div className="flex items-center bg-slate-200/65 dark:bg-slate-800/75 rounded-xl p-0.5 border border-slate-300/60 dark:border-slate-700/60">
              <button
                onClick={onPrevAyah}
                disabled={currentSurahId === 1 && currentAyahNumber <= 1}
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.85} />
              </button>

              <select
                value={currentAyahNumber}
                onChange={(e) => onSelectAyah(Number(e.target.value))}
                aria-label="آیت منتخب کریں"
                className="bg-transparent text-slate-800 dark:text-slate-100 text-xs font-bold px-1.5 py-0.5 focus:outline-none cursor-pointer"
              >
                {ayahNumbers.map((num) => (
                  <option key={num} value={num} className="dark:bg-slate-900">
                    آیت {num}
                  </option>
                ))}
              </select>

              <button
                onClick={onNextAyah}
                disabled={currentSurahId === 114 && currentAyahNumber >= versesCount}
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.85} />
              </button>
            </div>

            {/* 3. Fast Jump Input (e.g. 2:255) */}
            <form onSubmit={handleFastJumpSubmit} className="relative hidden xl:flex items-center">
              <Compass className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" strokeWidth={1.85} />
              <input
                type="text"
                value={fastJumpText}
                onChange={(e) => setFastJumpText(e.target.value)}
                placeholder="2:255"
                className={`w-20 bg-slate-200/65 dark:bg-slate-800/75 text-slate-800 dark:text-slate-100 text-xs rounded-xl pr-7 pl-5 py-1 border transition-all focus:w-28 focus:outline-none focus:bg-white dark:focus:bg-slate-900 font-app ${
                  fastJumpError
                    ? 'border-rose-500 ring-1 ring-rose-500/30'
                    : 'border-slate-300/60 dark:border-slate-700/60 focus:border-emerald-500'
                }`}
              />
              {fastJumpText && (
                <button
                  type="submit"
                  className="absolute left-1.5 text-emerald-600 hover:text-emerald-700"
                >
                  <CornerDownLeft className="w-3 h-3" strokeWidth={1.85} />
                </button>
              )}
            </form>

            {/* 4. Left-Most in Center Group: Global Tajweed V4 COLRv1 Icon Toggle */}
            {onToggleTajweed && (
              <button
                onClick={onToggleTajweed}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  showTajweed
                    ? 'border border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border border-transparent text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/70'
                }`}
              >
                <Palette className="w-4 h-4" strokeWidth={1.85} />
              </button>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* RIGHT SIDE: Mode-Specific Controls                       */}
        {/* ======================================================== */}
        <div dir="rtl" className="flex items-center gap-1.5 justify-self-end flex-nowrap">
          
          {/* 1. Mushaf Mode: Single Continuous Page Stepper (2-page mode removed per 2.1) */}
          {(activeMode === 'quran' || activeMode === 'mushaf') && (
            <div className="flex items-center bg-slate-200/65 dark:bg-slate-800/75 rounded-xl p-0.5 border border-slate-300/60 dark:border-slate-700/60">
              <button
                onClick={onPrevPage}
                disabled={activePage <= 1}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.85} />
              </button>
              <div className="flex items-center gap-1 px-2 text-xs">
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
                  className="w-8 text-center font-bold font-app text-xs bg-transparent text-slate-700 dark:text-slate-200 py-0.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs text-slate-700 dark:text-slate-200 font-app font-bold">/ 604</span>
              </div>
              <button
                onClick={onNextPage}
                disabled={activePage >= 604}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.85} />
              </button>
            </div>
          )}

          {/* 2. Translation Mode Controls */}
          {activeMode === 'translation' && (
            <div className="flex items-center gap-1.5 flex-nowrap">
              {onSelectTranslationAuthor && (
                <div className="flex items-center bg-slate-200/65 dark:bg-slate-800/75 rounded-xl px-2 py-1 border border-slate-300/60 dark:border-slate-700/60">
                  <select
                    value={selectedTranslationAuthor}
                    onChange={(e) => onSelectTranslationAuthor(e.target.value)}
                    aria-label="Primary Translation"
                    className="max-w-[115px] xl:max-w-[135px] truncate bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
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
                <div className="hidden md:flex items-center bg-slate-200/65 dark:bg-slate-800/75 rounded-xl px-2 py-1 border border-slate-300/60 dark:border-slate-700/60">
                  <select
                    value={secondaryTranslationAuthor || ''}
                    onChange={(e) => onSelectSecondaryTranslationAuthor(e.target.value || null)}
                    aria-label="Secondary Translation"
                    className="max-w-[105px] xl:max-w-[125px] truncate bg-transparent text-[11px] font-semibold text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
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
                  className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    showWordByWord
                      ? 'border border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border border-transparent text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-slate-200/60 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Languages className="w-4 h-4" strokeWidth={1.85} />
                </button>
              )}
            </div>
          )}

          {/* 3. Tafsir Mode Controls: Focus Toggle Icon (Requirement 4), Expand/Collapse, Font Size, Settings */}
          {(activeMode === 'tafseer' || activeMode === 'tafsir') && (
            <div className="flex items-center gap-1.5">
              {/* Single Focus Mode Toggle Icon (ON = Focus Tafseer, OFF = All Tafseer Stacked) */}
              {onSelectTafsirLayoutMode && (
                <button
                  onClick={() => onSelectTafsirLayoutMode(isFocusTafsir ? 'stacked' : 'focus')}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isFocusTafsir
                      ? 'border border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border border-transparent text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-slate-200/60 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Focus className="w-4 h-4" strokeWidth={1.85} />
                </button>
              )}

              {/* Expand All / Collapse All Icons (Only when in Stacked / All mode) */}
              {!isFocusTafsir && (
                <div className="flex items-center bg-slate-200/65 dark:bg-slate-800/75 rounded-xl p-0.5 border border-slate-300/60 dark:border-slate-700/60">
                  <button
                    onClick={onExpandAllTafasir}
                    className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <ChevronsDown className="w-4 h-4" strokeWidth={1.85} />
                  </button>
                  <button
                    onClick={onCollapseAllTafasir}
                    className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <ChevronsUp className="w-4 h-4" strokeWidth={1.85} />
                  </button>
                </div>
              )}

              {/* Font Size Stepper */}
              {onFontSizeChange && (
                <div className="hidden sm:flex items-center bg-slate-200/65 dark:bg-slate-800/75 rounded-xl p-0.5 border border-slate-300/60 dark:border-slate-700/60">
                  <button
                    onClick={() => onFontSizeChange(Math.max(14, fontSize - 1))}
                    className="p-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" strokeWidth={1.85} />
                  </button>
                  <span className="px-1.5 text-[11px] font-app font-bold text-slate-700 dark:text-slate-300">
                    {fontSize}
                  </span>
                  <button
                    onClick={() => onFontSizeChange(Math.min(28, fontSize + 1))}
                    className="p-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" strokeWidth={1.85} />
                  </button>
                </div>
              )}

              {/* Tafsir Order & Selection Settings Icon (No Label per 3.4) */}
              {onOpenTafsirSettings && (
                <button
                  onClick={onOpenTafsirSettings}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" strokeWidth={1.85} />
                </button>
              )}
            </div>
          )}

          {/* 4. Hadith Mode Controls: Language Filter (All / Urdu / Arabic / English) & Font Zoom */}
          {activeMode === 'hadith' && (
            <div className="flex items-center gap-1.5 flex-nowrap">
              {onSelectHadithViewLang && (
                <div className="flex items-center bg-slate-200/65 dark:bg-slate-800/75 rounded-xl p-0.5 border border-slate-300/60 dark:border-slate-700/60">
                  <button
                    onClick={() => onSelectHadithViewLang('all')}
                    title="تمام زبانیں دکھائیں"
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      hadithViewLang === 'all'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    سب
                  </button>
                  <button
                    onClick={() => onSelectHadithViewLang('ur')}
                    title="صرف اردو ترجمہ"
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      hadithViewLang === 'ur'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    اردو
                  </button>
                  <button
                    onClick={() => onSelectHadithViewLang('ar')}
                    title="صرف عربی متن"
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      hadithViewLang === 'ar'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    عربی
                  </button>
                  <button
                    onClick={() => onSelectHadithViewLang('en')}
                    title="English Translation Only"
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      hadithViewLang === 'en'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    EN
                  </button>
                </div>
              )}

              {/* Font Size Stepper */}
              {onFontSizeChange && (
                <div className="hidden sm:flex items-center bg-slate-200/65 dark:bg-slate-800/75 rounded-xl p-0.5 border border-slate-300/60 dark:border-slate-700/60">
                  <button
                    onClick={() => onFontSizeChange(Math.max(14, fontSize - 1))}
                    title="چھوٹا فونٹ"
                    className="p-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" strokeWidth={1.85} />
                  </button>
                  <span className="px-1.5 text-[11px] font-app font-bold text-slate-700 dark:text-slate-300">
                    {fontSize}
                  </span>
                  <button
                    onClick={() => onFontSizeChange(Math.min(28, fontSize + 1))}
                    title="بڑا فونٹ"
                    className="p-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" strokeWidth={1.85} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
