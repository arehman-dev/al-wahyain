import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink, 
  Copy, 
  Check, 
  Bookmark, 
  FileText, 
  Share2,
  Columns2,
  BookOpen
} from 'lucide-react';
import { Ayah, TafsirEntry, ScriptMode, TafsirHighlight, HighlightColor, TafsirLayoutMode } from '../types/quran';
import { InteractiveWord } from './WordTooltip';
import { TextHighlighterBar } from './TextHighlighterBar';
import { enhanceTafsirHtml } from '../utils/tafsirCrossReference';
import { applyHighlightsToHtml } from '../utils/highlighterHelper';
import { toArabicDigits } from '../utils/juzMapping';

interface TafsirViewProps {
  currentAyah: Ayah;
  tafasir: TafsirEntry[];
  scriptMode: ScriptMode;
  onPrevAyah: () => void;
  onNextAyah: () => void;
  expandedTafasir: Record<string, boolean>;
  onToggleTafsir: (slug: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  hasNote?: boolean;
  onOpenNoteDrawer?: () => void;
  onOpenExportModal?: () => void;
  totalVersesInSurah?: number;
  fontSize?: number;
  highlights?: TafsirHighlight[];
  onAddHighlight?: (text: string, color: HighlightColor, tafsirSlug?: string) => void;
  onDeleteHighlight?: (id: string) => void;
  onNavigateToVerse?: (surahId: number, ayahNumber: number) => void;
  onSelectWordRoot?: (root: string) => void;
  tafsirOrder: string[];
  visibleTafasir: Record<string, boolean>;
  tafsirLayoutMode?: TafsirLayoutMode;
}

export const TafsirView: React.FC<TafsirViewProps> = ({
  currentAyah,
  tafasir,
  scriptMode,
  onPrevAyah,
  onNextAyah,
  expandedTafasir,
  onToggleTafsir,
  isBookmarked = false,
  onToggleBookmark,
  hasNote = false,
  onOpenNoteDrawer,
  onOpenExportModal,
  totalVersesInSurah = 1,
  fontSize = 17,
  highlights = [],
  onAddHighlight,
  onDeleteHighlight,
  onNavigateToVerse,
  onSelectWordRoot,
  tafsirOrder,
  visibleTafasir,
  tafsirLayoutMode = 'stacked'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [splitSlug1, setSplitSlug1] = useState<string>('bayan_ul_quran');
  const [splitSlug2, setSplitSlug2] = useState<string>('tafheem');
  const [focusSlug, setFocusSlug] = useState<string>('bayan_ul_quran');

  // Auto smooth-scroll to top when navigating to another ayah
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentAyah.surah_id, currentAyah.ayah_number]);

  const urduTranslation = currentAyah.translations?.find(t => t.author_id === 'taqi_usmani') || currentAyah.translations?.[0];

  // Intercept clicks inside commentary for cross-reference jumps and highlight deletion
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // 1. Cross reference jump
    const refBtn = target.closest('[data-quran-ref]') as HTMLElement;
    if (refBtn && refBtn.dataset.quranRef && onNavigateToVerse) {
      e.preventDefault();
      const parts = refBtn.dataset.quranRef.split(':').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        onNavigateToVerse(parts[0], parts[1]);
        return;
      }
    }

    // 2. Click existing highlight to delete
    const mark = target.closest('[data-highlight-id]') as HTMLElement;
    if (mark && mark.dataset.highlightId && onDeleteHighlight) {
      e.preventDefault();
      const hlId = mark.dataset.highlightId;
      if (window.confirm('کیا آپ اس تفسیری ہائی لائٹ کو حذف کرنا چاہتے ہیں؟')) {
        onDeleteHighlight(hlId);
      }
      return;
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const progressPercent = Math.min(100, Math.round((currentAyah.ayah_number / Math.max(1, totalVersesInSurah)) * 100));

  // Sort and filter entries based on user's order and visibility preferences
  const displayTafasir = [...tafasir]
    .filter(entry => visibleTafasir[entry.tafsir_slug] !== false)
    .sort((a, b) => {
      const idxA = tafsirOrder.indexOf(a.tafsir_slug);
      const idxB = tafsirOrder.indexOf(b.tafsir_slug);
      const posA = idxA === -1 ? 999 : idxA;
      const posB = idxB === -1 ? 999 : idxB;
      return posA - posB;
    });

  const badgeStyles: Record<string, { bg: string; text: string; border: string; accent: string }> = {
    bayan_ul_quran: {
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      text: 'text-purple-800 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800/80',
      accent: 'border-r-purple-600'
    },
    tafheem: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
      text: 'text-indigo-800 dark:text-indigo-300',
      border: 'border-indigo-200 dark:border-indigo-800/80',
      accent: 'border-r-indigo-500'
    },
    maarif: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      text: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800/80',
      accent: 'border-r-emerald-500'
    },
    ibn_kathir: {
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800/80',
      accent: 'border-r-amber-500'
    },
    tayseer: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/50',
      text: 'text-cyan-800 dark:text-cyan-300',
      border: 'border-cyan-200 dark:border-cyan-800/80',
      accent: 'border-r-cyan-500'
    }
  };

  const renderSingleTafsirCard = (entry: TafsirEntry, isCollapsible: boolean = true) => {
    const isExpanded = isCollapsible ? expandedTafasir[entry.tafsir_slug] !== false : true;
    const theme = badgeStyles[entry.tafsir_slug] || badgeStyles.maarif;

    const entryHighlights = highlights.filter(
      h => h.surah_id === currentAyah.surah_id &&
           h.ayah_number === currentAyah.ayah_number &&
           (h.tafsir_slug === entry.tafsir_slug || h.tafsir_slug === 'general')
    );
    const withHighlights = applyHighlightsToHtml(entry.content_html, entryHighlights);
    const enhancedHtml = enhanceTafsirHtml(withHighlights);

    return (
      <div
        key={entry.id}
        className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs transition-all border-r-4 ${theme.accent}`}
      >
        {/* Header */}
        <div
          onClick={() => isCollapsible && onToggleTafsir(entry.tafsir_slug)}
          className={`px-5 sm:px-6 py-4 flex items-center justify-between ${
            isCollapsible ? 'cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40' : ''
          } transition-colors select-none font-ibm`}
        >
          {/* Right Side: Tafsir Name & Author */}
          <div className="flex items-center gap-2.5">
            {isCollapsible && (
              <button
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                {entry.tafsir_name}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${theme.bg} ${theme.text} ${theme.border}`}>
                {entry.author_name}
              </span>
              {entry.ayah_from !== entry.ayah_to && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  (آیات: {toArabicDigits(entry.ayah_from)} تا {toArabicDigits(entry.ayah_to)})
                </span>
              )}
            </div>
          </div>

          {/* Left Side: Copy action */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(entry.content_html.replace(/<[^>]+>/g, ''), `tafsir-${entry.id}`);
              }}
              title="متن کاپی کریں"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copiedId === `tafsir-${entry.id}` ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            {isCollapsible && (
              <span className="text-xs text-slate-400 hidden sm:inline">
                {isExpanded ? 'سمیٹیں' : 'پھیلائیں'}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        {isExpanded && (
          <div className="px-6 sm:px-8 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-right">
            <div 
              data-tafsir-slug={entry.tafsir_slug}
              style={{ fontSize: `${fontSize}px` }}
              className="tafsir-prose font-ibm leading-[2.3] text-slate-800 dark:text-slate-100 max-w-none select-text"
              dangerouslySetInnerHTML={{ __html: enhancedHtml }}
            />

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-ibm">
              <span>ماخذ: {entry.source_attribution}</span>
              {entry.source_url && (
                <a
                  href={entry.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                >
                  <span>مکمل ماخذ دیکھیں</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleContainerClick}
      dir="rtl" 
      className="max-w-5xl mx-auto px-4 py-4 space-y-5 relative"
    >
      {/* Floating Text Highlighter Bar */}
      {onAddHighlight && (
        <TextHighlighterBar
          containerRef={containerRef}
          onAddHighlight={onAddHighlight}
        />
      )}
      
      {/* 1. TOP PINNED CARD: AYAH & TRANSLATION (Clean RTL, Title Right, Actions Left) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        {/* Progress Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Header Bar: Right side is Verse Details, Left side is Stepper & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800/80 text-xs font-ibm">
          {/* Right: Verse info */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl font-mono">
              {currentAyah.verse_key}
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              (آیت {toArabicDigits(currentAyah.ayah_number)} / {toArabicDigits(totalVersesInSurah)})
            </span>
          </div>

          {/* Left: Stepper & Bookmark/Note/Share */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevAyah}
              title="پچھلی آیت"
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>پچھلی</span>
            </button>
            <button
              onClick={onNextAyah}
              title="اگلی آیت"
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span>اگلی</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            {onToggleBookmark && (
              <button
                onClick={onToggleBookmark}
                title={isBookmarked ? 'محفوظ فہرست سے نکالیں' : 'محفوظ کریں'}
                className={`p-1.5 rounded-xl border transition-all ${
                  isBookmarked
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/50 text-amber-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            )}

            {onOpenNoteDrawer && (
              <button
                onClick={onOpenNoteDrawer}
                title="ذاتی تفسیری نوٹ لکھیں"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all ${
                  hasNote
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{hasNote ? 'نوٹ ✓' : 'نوٹ'}</span>
              </button>
            )}

            {onOpenExportModal && (
              <button
                onClick={onOpenExportModal}
                title="اقتباس شیئر کریں"
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Arabic Ayah with Interactive Word Tooltips */}
        <div className="tajweed-text text-right text-3xl sm:text-4xl leading-[2.8] my-3 text-slate-900 dark:text-white font-uthmani">
          {currentAyah.words && currentAyah.words.length > 0 ? (
            currentAyah.words.map((w) => (
              <InteractiveWord
                key={w.id}
                word={w}
                scriptMode={scriptMode}
                onSelectRoot={onSelectWordRoot}
              />
            ))
          ) : (
            <span>{currentAyah.text_uthmani}</span>
          )}
          <span className="ayah-end-num">﴿{toArabicDigits(currentAyah.ayah_number)}﴾</span>
        </div>

        {/* Taqi Usmani Urdu Translation */}
        {urduTranslation && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
            <p className="font-ibm text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-[2.1] font-medium">
              {urduTranslation.text}
            </p>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-ibm mt-1.5 block">
              — ترجمہ: {urduTranslation.author_name}
            </span>
          </div>
        )}
      </div>

      {/* 2. TAFASIR CONTENT VIEW (Based on Reading Layout Mode: Stacked vs Split vs Focus) */}
      <div className="space-y-4">
        {displayTafasir.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 font-ibm">
            <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">
              اس آیت کے لیے فی الحال کوئی تفسیر منتخب نہیں ہے
            </p>
            <p className="text-xs">
              سب ہیڈر بار میں &quot;ترتیب و انتخابِ تفاسیر&quot; سے تفاسیر کو فعال کریں۔
            </p>
          </div>
        ) : tafsirLayoutMode === 'split' ? (
          /* Side-by-Side Comparative Mode (Dual Parallel Columns) */
          <div className="space-y-3">
            {/* Split Column Commentator Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-100/70 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-ibm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">پہلی تفسیر:</span>
                <select
                  value={splitSlug1}
                  onChange={(e) => setSplitSlug1(e.target.value)}
                  className="flex-1 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-slate-800 dark:text-slate-200 font-medium outline-none"
                >
                  {displayTafasir.map(t => (
                    <option key={`split1-${t.tafsir_slug}`} value={t.tafsir_slug}>
                      {t.tafsir_name} ({t.author_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">دوسری تفسیر:</span>
                <select
                  value={splitSlug2}
                  onChange={(e) => setSplitSlug2(e.target.value)}
                  className="flex-1 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-slate-800 dark:text-slate-200 font-medium outline-none"
                >
                  {displayTafasir.map(t => (
                    <option key={`split2-${t.tafsir_slug}`} value={t.tafsir_slug}>
                      {t.tafsir_name} ({t.author_name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parallel Columns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {/* Column 1 */}
              <div>
                {(() => {
                  const entry = displayTafasir.find(t => t.tafsir_slug === splitSlug1) || displayTafasir[0];
                  return entry ? renderSingleTafsirCard(entry, false) : null;
                })()}
              </div>

              {/* Column 2 */}
              <div>
                {(() => {
                  const entry = displayTafasir.find(t => t.tafsir_slug === splitSlug2) || displayTafasir[1] || displayTafasir[0];
                  return entry ? renderSingleTafsirCard(entry, false) : null;
                })()}
              </div>
            </div>
          </div>
        ) : tafsirLayoutMode === 'focus' ? (
          /* Single Commentary Focus Reader Mode */
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-100/70 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-ibm">
              <span className="font-bold text-slate-700 dark:text-slate-300">منتخب تفسیر برائے فوکس ریڈنگ:</span>
              <select
                value={focusSlug}
                onChange={(e) => setFocusSlug(e.target.value)}
                className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-slate-800 dark:text-slate-200 font-semibold outline-none"
              >
                {displayTafasir.map(t => (
                  <option key={`focus-${t.tafsir_slug}`} value={t.tafsir_slug}>
                    {t.tafsir_name} — {t.author_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              {(() => {
                const entry = displayTafasir.find(t => t.tafsir_slug === focusSlug) || displayTafasir[0];
                return entry ? renderSingleTafsirCard(entry, false) : null;
              })()}
            </div>
          </div>
        ) : (
          /* Default Stacked Accordion Stream */
          displayTafasir.map(entry => renderSingleTafsirCard(entry, true))
        )}
      </div>
    </div>
  );
};
