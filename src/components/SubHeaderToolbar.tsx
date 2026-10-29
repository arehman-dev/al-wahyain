import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  ArrowRight, 
  ArrowLeft, 
  Bookmark, 
  FileText, 
  Compass, 
  CornerDownLeft,
  Palette,
  HelpCircle,
  BookOpen,
  History,
  Clock
} from 'lucide-react';
import { Surah, AppMode, ScriptMode, MushafDisplayMode, ReadingHistoryEntry } from '../types/quran';

interface SubHeaderToolbarProps {
  surahs: Surah[];
  currentSurahId: number;
  currentAyahNumber: number;
  onSelectSurah: (id: number) => void;
  onSelectAyah: (num: number) => void;
  onPrevAyah: () => void;
  onNextAyah: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  hasNote?: boolean;
  onOpenNoteDrawer?: () => void;

  // Mode & Mushaf-specific controls
  activeMode: AppMode;
  scriptMode?: ScriptMode;
  onToggleScript?: () => void;
  mushafDisplayMode?: MushafDisplayMode;
  onToggleMushafDisplayMode?: () => void;
  showTajweed?: boolean;
  onToggleTajweed?: () => void;
  showInlineTranslation?: boolean;
  onToggleTranslation?: () => void;
  onOpenTajweedLegend?: () => void;

  // Reading history
  history?: ReadingHistoryEntry[];
  onSelectHistoryItem?: (surahId: number, ayahNumber: number) => void;
}

export const SubHeaderToolbar: React.FC<SubHeaderToolbarProps> = ({
  surahs,
  currentSurahId,
  currentAyahNumber,
  onSelectSurah,
  onSelectAyah,
  onPrevAyah,
  onNextAyah,
  isBookmarked = false,
  onToggleBookmark,
  hasNote = false,
  onOpenNoteDrawer,
  activeMode,
  scriptMode = 'indopak',
  onToggleScript,
  mushafDisplayMode = 'page',
  onToggleMushafDisplayMode,
  showTajweed = false,
  onToggleTajweed,
  showInlineTranslation = true,
  onToggleTranslation,
  onOpenTajweedLegend,
  history = [],
  onSelectHistoryItem
}) => {
  const [directJumpInput, setDirectJumpInput] = useState('');
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const historyMenuRef = useRef<HTMLDivElement>(null);

  // Close history menu when clicking outside
  useEffect(() => {
    if (!showHistoryMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (historyMenuRef.current && !historyMenuRef.current.contains(e.target as Node)) {
        setShowHistoryMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHistoryMenu]);
  const currentSurah = surahs.find(s => s.id === currentSurahId) || surahs[0];
  const versesCount = currentSurah?.verses_count || 7;
  const seededSurahIds = [1, 2, 3, 4, 55, 56, 57];

  const handleDirectJump = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = directJumpInput.trim();
    if (!clean) return;

    // Check if format is "surah:ayah" like "2:255" or "55:13"
    const match = clean.match(/^(\d+)[:,\s\-\/](\d+)$/);
    if (match) {
      const sId = parseInt(match[1], 10);
      const aNum = parseInt(match[2], 10);
      if (sId >= 1 && sId <= 114) {
        onSelectSurah(sId);
        onSelectAyah(aNum);
        setDirectJumpInput('');
        return;
      }
    }

    // Check if format is just ayah number
    const singleNum = parseInt(clean, 10);
    if (!isNaN(singleNum) && singleNum >= 1 && singleNum <= versesCount) {
      onSelectAyah(singleNum);
      setDirectJumpInput('');
      return;
    }
  };

  const handlePrevSurah = () => {
    if (currentSurahId > 1) {
      onSelectSurah(currentSurahId - 1);
    }
  };

  const handleNextSurah = () => {
    if (currentSurahId < 114) {
      onSelectSurah(currentSurahId + 1);
    }
  };

  const progressPercent = Math.min(100, Math.round((currentAyahNumber / Math.max(1, versesCount)) * 100));

  return (
    <div 
      dir="rtl" 
      className="sticky top-11 z-30 w-full h-10 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between text-xs font-ibm select-none transition-colors"
    >
      {/* Right Side: Chapter & Verse Steppers + Direct Jump */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 shrink-0">
        
        {/* Surah Stepper & Dropdown */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-2xs">
          <button 
            onClick={handlePrevSurah}
            disabled={currentSurahId <= 1}
            title="پچھلی سورت"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded-r-lg text-slate-500 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          
          <select
            value={currentSurahId}
            onChange={(e) => onSelectSurah(Number(e.target.value))}
            className="bg-transparent text-slate-800 dark:text-slate-100 font-bold px-2 py-1 outline-none cursor-pointer text-xs"
          >
            {surahs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id}. {s.name_urdu} ({s.name_simple}) {seededSurahIds.includes(s.id) ? '✓' : ''}
              </option>
            ))}
          </select>

          <button 
            onClick={handleNextSurah}
            disabled={currentSurahId >= 114}
            title="اگلی سورت"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded-l-lg text-slate-500 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ayah Stepper & Dropdown */}
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
            className="bg-transparent text-slate-800 dark:text-slate-100 font-bold px-2 py-1 outline-none cursor-pointer text-xs"
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

        {/* Power-User Direct Jump Input */}
        <form onSubmit={handleDirectJump} className="hidden sm:flex items-center">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg px-2 py-0.5 shadow-2xs focus-within:border-emerald-500">
            <Compass className="w-3 h-3 text-slate-400 shrink-0 ml-1.5" />
            <input
              type="text"
              value={directJumpInput}
              onChange={(e) => setDirectJumpInput(e.target.value)}
              placeholder="2:255"
              className="w-16 bg-transparent outline-none text-[11px] font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
            <button type="submit" title="جمپ کریں (Enter)" className="text-slate-400 hover:text-emerald-600">
              <CornerDownLeft className="w-3 h-3" />
            </button>
          </div>
        </form>

        {/* Surah Metadata Badge */}
        {currentSurah && (
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-200/70 dark:border-slate-800/70">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {currentSurah.revelation_place === 'makkah' ? 'مکی' : 'مدنی'}
            </span>
            <span>•</span>
            <span>{currentSurah.verses_count} آیات</span>
          </div>
        )}

      </div>

      {/* Center: Mushaf Controls (Only visible in Mushaf Mode) */}
      {activeMode === 'mushaf' && (
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          
          {/* Display Mode: Page vs Continuous */}
          {onToggleMushafDisplayMode && (
            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-[11px]">
              <button
                onClick={onToggleMushafDisplayMode}
                className={`px-2 py-0.5 rounded font-semibold transition-all ${
                  mushafDisplayMode === 'page'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                صفحہ وار (15-Line)
              </button>
              <button
                onClick={onToggleMushafDisplayMode}
                className={`px-2 py-0.5 rounded font-semibold transition-all ${
                  mushafDisplayMode === 'continuous'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                مسلسل
              </button>
            </div>
          )}

          {/* Script Mode: Indo-Pak vs Madani */}
          {onToggleScript && (
            <button
              onClick={onToggleScript}
              title="رسم الخط تبدیل کریں"
              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] rounded-md transition-colors"
            >
              {scriptMode === 'indopak' ? 'پاک و ہند' : 'عثمانی / مدنی'}
            </button>
          )}

          {/* Tajweed Color Toggle */}
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

          {/* Tajweed Legend Modal */}
          {onOpenTajweedLegend && (
            <button
              onClick={onOpenTajweedLegend}
              title="تجوید کے قواعد"
              className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Inline Translation Toggle */}
          {onToggleTranslation && (
            <button
              onClick={onToggleTranslation}
              title="آیات کے نیچے ترجمہ دکھائیں / چھپائیں"
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold transition-all ${
                showInlineTranslation
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>ترجمہ</span>
            </button>
          )}

        </div>
      )}

      {/* Left Side: Scrubber Progress Track + Quick Action Icons */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        {/* Visual Reading Progress Bar */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-slate-400 font-semibold min-w-8 text-left">
            {progressPercent}%
          </span>
        </div>

        {/* Quick Ayah Action: Reading History Dropdown */}
        {history.length > 0 && onSelectHistoryItem && (
          <div className="relative" ref={historyMenuRef}>
            <button
              onClick={() => setShowHistoryMenu(prev => !prev)}
              title="تاریخ مطالعہ (حال ہی میں پڑھی گئی آیات)"
              className={`p-1 rounded-md transition-colors ${
                showHistoryMenu
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
            </button>

            {showHistoryMenu && (
              <div 
                dir="rtl"
                className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 font-ibm"
              >
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-500" />
                    <span>حالیہ مطالعہ</span>
                  </span>
                  <span>{history.length} آیات</span>
                </div>

                <div className="max-h-56 overflow-y-auto py-1 divide-y divide-slate-100/60 dark:divide-slate-800/60">
                  {history.map((item, idx) => (
                    <button
                      key={`${item.surah_id}-${item.ayah_number}-${idx}`}
                      onClick={() => {
                        onSelectHistoryItem(item.surah_id, item.ayah_number);
                        setShowHistoryMenu(false);
                      }}
                      className="w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.surah_name_urdu || `سورہ ${item.surah_id}`}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        {item.verse_key}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Ayah Action: Bookmark */}
        {onToggleBookmark && (
          <button
            onClick={onToggleBookmark}
            title={isBookmarked ? 'محفوظ فہرست سے نکالیں (B)' : 'آیت محفوظ کریں (B)'}
            className={`p-1 rounded-md transition-colors ${
              isBookmarked
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                : 'text-slate-400 hover:text-amber-500'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Quick Ayah Action: Note */}
        {onOpenNoteDrawer && (
          <button
            onClick={onOpenNoteDrawer}
            title="ذاتی تفسیری نوٹ لکھیں (N)"
            className={`p-1 rounded-md transition-colors ${
              hasNote
                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60'
                : 'text-slate-400 hover:text-emerald-600'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
        )}

      </div>
    </div>
  );
};
