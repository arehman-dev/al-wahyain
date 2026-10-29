import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink, 
  Maximize2, 
  Minimize2,
  Copy,
  Check,
  Type,
  Bookmark,
  FileText,
  Share2,
  LayoutGrid,
  List,
  ZoomIn,
  ZoomOut,
  Highlighter
} from 'lucide-react';
import { Ayah, TafsirEntry, ScriptMode, TafsirHighlight, HighlightColor } from '../types/quran';
import { InteractiveWord } from './WordTooltip';
import { TextHighlighterBar } from './TextHighlighterBar';
import { enhanceTafsirHtml } from '../utils/tafsirCrossReference';
import { applyHighlightsToHtml } from '../utils/highlighterHelper';

interface TafsirViewProps {
  currentAyah: Ayah;
  tafasir: TafsirEntry[];
  scriptMode: ScriptMode;
  onPrevAyah: () => void;
  onNextAyah: () => void;
  expandedTafasir: Record<string, boolean>;
  onToggleTafsir: (slug: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  hasNote?: boolean;
  onOpenNoteDrawer?: () => void;
  onOpenExportModal?: () => void;
  totalVersesInSurah?: number;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
  layoutMode?: 'stacked' | 'grid';
  onToggleLayoutMode?: () => void;
  highlights?: TafsirHighlight[];
  onAddHighlight?: (text: string, color: HighlightColor, tafsirSlug?: string) => void;
  onDeleteHighlight?: (id: string) => void;
  onNavigateToVerse?: (surahId: number, ayahNumber: number) => void;
  onSelectWordRoot?: (root: string) => void;
}

export const TafsirView: React.FC<TafsirViewProps> = ({
  currentAyah,
  tafasir,
  scriptMode,
  onPrevAyah,
  onNextAyah,
  expandedTafasir,
  onToggleTafsir,
  onExpandAll,
  onCollapseAll,
  isBookmarked = false,
  onToggleBookmark,
  hasNote = false,
  onOpenNoteDrawer,
  onOpenExportModal,
  totalVersesInSurah = 1,
  fontSize: propFontSize,
  onFontSizeChange,
  layoutMode: propLayoutMode,
  onToggleLayoutMode,
  highlights = [],
  onAddHighlight,
  onDeleteHighlight,
  onNavigateToVerse,
  onSelectWordRoot
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [useIbmFont, setUseIbmFont] = useState<boolean>(true);
  const [localFontSize, setLocalFontSize] = useState<number>(17);
  const [localLayoutMode, setLocalLayoutMode] = useState<'stacked' | 'grid'>('stacked');

  const fontSize = propFontSize !== undefined ? propFontSize : localFontSize;
  const setFontSize = onFontSizeChange || setLocalFontSize;
  const layoutMode = propLayoutMode !== undefined ? propLayoutMode : localLayoutMode;
  const setLayoutMode = onToggleLayoutMode 
    ? (val: 'stacked' | 'grid') => { if (val !== layoutMode) onToggleLayoutMode(); } 
    : setLocalLayoutMode;

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

  // Global arrow keys listener for Ayah navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowLeft') {
        onNextAyah();
      } else if (e.key === 'ArrowRight') {
        onPrevAyah();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextAyah, onPrevAyah]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const progressPercent = Math.min(100, Math.round((currentAyah.ayah_number / Math.max(1, totalVersesInSurah)) * 100));

  return (
    <div 
      ref={containerRef}
      onClick={handleContainerClick}
      dir="rtl" 
      className="max-w-6xl mx-auto px-4 py-6 space-y-6 relative"
    >
      {/* Floating Text Highlighter Bar */}
      {onAddHighlight && (
        <TextHighlighterBar
          containerRef={containerRef}
          onAddHighlight={onAddHighlight}
        />
      )}
      
      {/* 1. TOP PINNED CARD: AYAH & TRANSLATION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors relative overflow-hidden">
        
        {/* Progress Bar Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800/80 text-xs font-ibm">
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevAyah}
              title="پچھلی آیت (یا دائیں تیر کا نشان دبائیں)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>پچھلی آیت</span>
            </button>
            <span className="px-3.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl font-mono">
              {currentAyah.verse_key}
            </span>
            <button
              onClick={onNextAyah}
              title="اگلی آیت (یا بائیں تیر کا نشان دبائیں)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span>اگلی آیت</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline mr-2">
              (آیت {currentAyah.ayah_number} / {totalVersesInSurah} • {progressPercent}%)
            </span>
          </div>

          {/* Quick Action Badges: Bookmark, Note, Share */}
          <div className="flex items-center gap-2">
            {onToggleBookmark && (
              <button
                onClick={onToggleBookmark}
                title={isBookmarked ? 'محفوظ فہرست سے نکالیں' : 'آیت محفوظ کریں (Bookmark)'}
                className={`p-2 rounded-xl border transition-all ${
                  isBookmarked
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/50 text-amber-500 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            )}

            {onOpenNoteDrawer && (
              <button
                onClick={onOpenNoteDrawer}
                title="ذاتی تفسیری نوٹ درج کریں"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  hasNote
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{hasNote ? 'نوٹ درج ہے ✓' : 'نوٹ لکھیں'}</span>
              </button>
            )}

            {onOpenExportModal && (
              <button
                onClick={onOpenExportModal}
                title="آیت اور تفسیری اقتباس شیئر کریں"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">برآمد / شیئر</span>
              </button>
            )}
          </div>
        </div>

        {/* Arabic Ayah with Interactive Word Tooltips */}
        <div className="tajweed-text text-right text-3xl sm:text-4xl leading-[2.7] font-arabic my-4 text-slate-900 dark:text-white">
          {currentAyah.words && currentAyah.words.length > 0 ? (
            currentAyah.words.map((w) => (
              <InteractiveWord
                key={w.id}
                word={w}
                scriptMode={scriptMode}
                onSelectRoot={onSelectWordRoot}
              />
            ))
          ) : scriptMode === 'indopak' ? (
            <span className="font-indopak">{currentAyah.text_indopak}</span>
          ) : (
            <span>{currentAyah.text_uthmani}</span>
          )}
          <span className="ayah-end-num">﴿{currentAyah.ayah_number}﴾</span>
        </div>

        {/* Primary Urdu Translation */}
        {urduTranslation && (
          <div 
            data-tafsir-slug="translation"
            className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-right select-text"
          >
            <p 
              style={{ fontSize: `${fontSize + 1}px` }}
              className={`${useIbmFont ? 'font-ibm leading-[2.1]' : 'urdu-nastaliq leading-[2.3]'} text-slate-800 dark:text-slate-200 font-medium`}
              dangerouslySetInnerHTML={{
                __html: applyHighlightsToHtml(
                  urduTranslation.text, 
                  highlights.filter(h => h.surah_id === currentAyah.surah_id && h.ayah_number === currentAyah.ayah_number && h.tafsir_slug === 'translation')
                )
              }}
            />
            <span className="text-xs text-slate-400 dark:text-slate-500 font-ibm font-medium mt-2 block">
              — ترجمہ: {urduTranslation.author_name}
            </span>
          </div>
        )}

      </div>

      {/* 2. ACTIONS BAR: EXPAND/COLLAPSE ALL + FONT SIZE + FONT SWITCHER + LAYOUT SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 font-ibm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExpandAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>تمام کھولیں</span>
          </button>
          <button
            onClick={onCollapseAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>تمام سمیٹیں</span>
          </button>

          {/* Desktop 2-Column Grid vs 1-Column Stack Toggle */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setLayoutMode('stacked')}
              title="عمودی اسٹیکڈ منظر (1 Column)"
              className={`p-1.5 rounded-lg transition-all ${
                layoutMode === 'stacked'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              title="تقابلی ۲-کالم منظر (Side-by-Side Comparison)"
              className={`p-1.5 rounded-lg transition-all ${
                layoutMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side Controls: Font Scaler & Font Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Font Scaler */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-mono">
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 1))}
              title="فونٹ کا سائز چھوٹا کریں"
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-slate-600 dark:text-slate-300 font-semibold">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(26, fontSize + 1))}
              title="فونٹ کا سائز بڑا کریں"
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Toggle: IBM Plex Sans Arabic vs Nastaliq */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setUseIbmFont(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                useIbmFont
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>IBM Plex Sans Arabic</span>
            </button>
            <button
              onClick={() => setUseIbmFont(false)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                !useIbmFont
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>نستعلیق</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. TAFASIR CARDS (Stacked or 2-Column Grid) */}
      <div className={layoutMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-5 items-start' : 'space-y-5'}>
        {tafasir.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 font-ibm">
            اس آیت کے لیے فی الحال تفاسیر درج نہیں ہیں۔
          </div>
        ) : (
          tafasir.map((entry) => {
            const isExpanded = expandedTafasir[entry.tafsir_slug] !== false; // Default true

            // Distinct theme badges for the 4 authors
            const badgeStyles: Record<string, { bg: string; text: string; border: string; accent: string }> = {
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

            const theme = badgeStyles[entry.tafsir_slug] || badgeStyles.maarif;

            return (
              <div
                key={entry.id}
                className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-all border-r-4 ${theme.accent}`}
              >
                
                {/* Header (Accordion Title) */}
                <div
                  onClick={() => onToggleTafsir(entry.tafsir_slug)}
                  className="px-6 py-4 sm:py-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors select-none font-ibm"
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                          {entry.tafsir_name}
                        </span>
                        <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${theme.bg} ${theme.text} ${theme.border}`}>
                          {entry.author_name}
                        </span>
                      </div>
                      
                      {entry.ayah_from !== entry.ayah_to && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5 block">
                          مشتمل بر آیات: {entry.ayah_from} تا {entry.ayah_to}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="hidden sm:inline">
                      {isExpanded ? 'سمیٹیں' : 'پھیلائیں'}
                    </span>
                  </div>
                </div>

                {/* Expanded Content Section */}
                {isExpanded && (() => {
                  const entryHighlights = highlights.filter(
                    h => h.surah_id === currentAyah.surah_id &&
                         h.ayah_number === currentAyah.ayah_number &&
                         (h.tafsir_slug === entry.tafsir_slug || h.tafsir_slug === 'general')
                  );
                  const withHighlights = applyHighlightsToHtml(entry.content_html, entryHighlights);
                  const enhancedHtml = enhanceTafsirHtml(withHighlights);

                  return (
                    <div className="px-6 sm:px-8 pb-7 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-right">
                      
                      {/* Commentary Body with dynamic font size */}
                      <div 
                        data-tafsir-slug={entry.tafsir_slug}
                        style={{ fontSize: `${fontSize}px` }}
                        className={`tafsir-prose ${
                          useIbmFont 
                            ? 'font-ibm leading-[2.2] tracking-normal font-normal' 
                            : 'urdu-nastaliq leading-[2.4] font-medium'
                        } text-slate-800 dark:text-slate-100 max-w-none select-text`}
                        dangerouslySetInnerHTML={{ __html: enhancedHtml }}
                      />

                      {/* Footer Attribution & Copy Button */}
                      <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-ibm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(entry.content_html.replace(/<[^>]+>/g, ''), `tafsir-${entry.id}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors font-medium"
                          >
                            {copiedId === `tafsir-${entry.id}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">کاپی ہو گیا!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>متن کاپی کریں</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Official Source Linkback */}
                        <div className="flex items-center gap-1.5 font-sans">
                          <span>ماخذ: {entry.source_attribution}</span>
                          {entry.source_url && (
                            <a
                              href={entry.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-emerald-600 hover:underline"
                              title="Open Official Source"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })()}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
