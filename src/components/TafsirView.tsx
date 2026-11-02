import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink, 
  Copy, 
  Check, 
  Bookmark, 
  FileText, 
  Share2,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Ayah, TafsirEntry, ScriptMode, TafsirHighlight, HighlightColor, TafsirLayoutMode } from '../types/quran';
import { InteractiveWord } from './WordTooltip';
import { TextHighlighterBar } from './TextHighlighterBar';
import { enhanceTafsirHtml } from '../utils/tafsirCrossReference';
import { applyHighlightsToHtml } from '../utils/highlighterHelper';
import { toArabicDigits } from '../utils/juzMapping';
import { loadQcfPageFont, getQcfFontFamily } from '../utils/qcfFontLoader';

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
  tafsirLayoutMode = 'focus'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [splitSlug1, setSplitSlug1] = useState<string>('bayan_ul_quran');
  const [splitSlug2, setSplitSlug2] = useState<string>('tafheem');
  const [selectedAuthorTab, setSelectedAuthorTab] = useState<string>('bayan_ul_quran');

  // Auto smooth-scroll to top when navigating to another ayah
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentAyah.surah_id, currentAyah.ayah_number]);

  // Preload King Fahd Complex QCF page font for active verse
  useEffect(() => {
    if (scriptMode === 'madani' && currentAyah.page_madani) {
      loadQcfPageFont(currentAyah.page_madani);
    }
  }, [currentAyah.page_madani, scriptMode]);

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
    const markEl = target.closest('mark[data-highlight-id]') as HTMLElement;
    if (markEl && markEl.dataset.highlightId && onDeleteHighlight) {
      e.preventDefault();
      e.stopPropagation();
      if (window.confirm('کیا آپ اس ہائی لائٹ کو حذف کرنا چاہتے ہیں؟')) {
        onDeleteHighlight(markEl.dataset.highlightId);
      }
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

  // Ensure selected author exists in display list
  useEffect(() => {
    if (displayTafasir.length > 0 && !displayTafasir.some(t => t.tafsir_slug === selectedAuthorTab)) {
      setSelectedAuthorTab(displayTafasir[0].tafsir_slug);
    }
  }, [displayTafasir, selectedAuthorTab]);

  const renderEditorialCommentary = (entry: TafsirEntry) => {
    const entryHighlights = highlights.filter(
      h => h.surah_id === currentAyah.surah_id &&
           h.ayah_number === currentAyah.ayah_number &&
           (h.tafsir_slug === entry.tafsir_slug || h.tafsir_slug === 'general')
    );
    const withHighlights = applyHighlightsToHtml(entry.content_html, entryHighlights);
    const enhancedHtml = enhanceTafsirHtml(withHighlights);

    return (
      <div key={entry.id} className="py-5 select-text">
        {/* Commentary Meta Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-950/8 dark:border-white/5 text-xs font-ibm select-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-slate-900 dark:text-white">
              {entry.tafsir_name}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              — {entry.author_name}
            </span>
            {entry.ayah_from !== entry.ayah_to && (
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                (آیات {toArabicDigits(entry.ayah_from)} تا {toArabicDigits(entry.ayah_to)})
              </span>
            )}
          </div>

          <button
            onClick={() => handleCopy(entry.content_html.replace(/<[^>]+>/g, ''), `tafsir-${entry.id}`)}
            title="متن کاپی کریں"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
          >
            {copiedId === `tafsir-${entry.id}` ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="text-[11px]">{copiedId === `tafsir-${entry.id}` ? 'کاپی شدہ' : 'کاپی'}</span>
          </button>
        </div>

        {/* Prose Body */}
        <div 
          data-tafsir-slug={entry.tafsir_slug}
          style={{ fontSize: `${fontSize}px` }}
          className="tafsir-prose font-ibm leading-[2.4] text-slate-800 dark:text-slate-200 max-w-none text-right"
          dangerouslySetInnerHTML={{ __html: enhancedHtml }}
        />

        {/* Source Citation */}
        <div className="mt-6 pt-3 border-t border-emerald-950/5 dark:border-white/5 flex items-center justify-between text-xs text-slate-400 font-ibm">
          <span>ماخذ: {entry.source_attribution}</span>
          {entry.source_url && (
            <a
              href={entry.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>مکمل ماخذ</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleContainerClick}
      dir="rtl" 
      className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-6 relative"
    >
      {/* Floating Text Highlighter Bar */}
      {onAddHighlight && (
        <TextHighlighterBar
          containerRef={containerRef}
          onAddHighlight={onAddHighlight}
        />
      )}
      
      {/* ======================================================== */}
      {/* 1. SACRED MATN (متنِ مبارک مع اردو ترجمہ) — Zero Box Card  */}
      {/* ======================================================== */}
      <section className="relative pb-6 border-b border-emerald-950/10 dark:border-emerald-500/15">
        {/* Subtle Surah Progress Line */}
        <div className="w-full h-0.5 bg-slate-200/50 dark:bg-slate-800 mb-4 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-600 transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Ayah Header Metadata & Quick Navigation */}
        <div className="flex items-center justify-between gap-3 mb-4 text-xs font-ibm select-none">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-emerald-850 dark:text-emerald-300">
              ۞ {currentAyah.verse_key}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              (آیت {toArabicDigits(currentAyah.ayah_number)} / {toArabicDigits(totalVersesInSurah)})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onPrevAyah}
              title="پچھلی آیت"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>پچھلی</span>
            </button>
            <button
              onClick={onNextAyah}
              title="اگلی آیت"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span>اگلی</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            {onToggleBookmark && (
              <button
                onClick={onToggleBookmark}
                title={isBookmarked ? 'محفوظ فہرست سے نکالیں' : 'محفوظ کریں'}
                className={`p-1.5 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            )}

            {onOpenNoteDrawer && (
              <button
                onClick={onOpenNoteDrawer}
                title="ذاتی تفسیری نوٹ لکھیں"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  hasNote
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Majestic Matn Verse Script */}
        <div className={`tajweed-text text-right text-2xl sm:text-3xl leading-[2.6] sm:leading-[2.8] my-3 text-slate-900 dark:text-white select-text ${scriptMode === 'indopak' ? 'font-indopak' : 'font-uthmani'}`}>
          {currentAyah.words && currentAyah.words.length > 0 ? (
            currentAyah.words.map((w, wIdx) => (
              <InteractiveWord
                key={w.id}
                word={w}
                scriptMode={scriptMode}
                onSelectRoot={onSelectWordRoot}
                useQcf={scriptMode === 'madani'}
              />
            ))
          ) : (
            <span>{scriptMode === 'indopak' ? (currentAyah.text_indopak || currentAyah.text_uthmani) : currentAyah.text_uthmani}</span>
          )}
          {scriptMode === 'madani' && currentAyah.end_code_v2 ? (
            <span 
              className="ayah-end-num select-none mr-2 font-qcf inline-block align-middle"
              style={{ fontFamily: getQcfFontFamily(currentAyah.page_madani) }}
            >
              {currentAyah.end_code_v2}
            </span>
          ) : (
            <span className="ayah-end-num select-none mr-2">﴿{toArabicDigits(currentAyah.ayah_number)}﴾</span>
          )}
        </div>

        {/* Flowing Translation */}
        {urduTranslation && (
          <div className="mt-3 text-right">
            <p className="urdu-nastaliq text-xl sm:text-2xl leading-[2.4] text-slate-800 dark:text-slate-200 select-text">
              {urduTranslation.text}
            </p>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-ibm mt-1 block">
              — {urduTranslation.author_name}
            </span>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 2. SCHOLARLY SHARH (شرح و تفاسیر) — Clean Editorial Flow  */}
      {/* ======================================================== */}
      {displayTafasir.length === 0 ? (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 font-ibm space-y-2">
          <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="font-bold">اس آیت کے لیے فی الحال کوئی تفسیر منتخب نہیں ہے</p>
          <p className="text-xs">سب ہیڈر بار میں &quot;ترتیب و انتخابِ تفاسیر&quot; سے تفاسیر کو فعال کریں۔</p>
        </div>
      ) : tafsirLayoutMode === 'stacked' ? (
        /* Stacked Editorial List (All Tafasir with Expand/Collapse Controls) */
        <div className="space-y-6">
          {displayTafasir.map((entry) => {
            const isExpanded = expandedTafasir[entry.tafsir_slug] !== false;
            return (
              <div 
                key={`stacked-${entry.tafsir_slug}`} 
                className="pb-6 border-b border-emerald-950/8 dark:border-white/5 space-y-3"
              >
                {/* Author & Tafsir Header */}
                <div 
                  onClick={() => onToggleTafsir(entry.tafsir_slug)}
                  className="flex items-center justify-between cursor-pointer py-1.5 px-2 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100 font-ibm">
                      {entry.tafsir_name}
                    </span>
                    <span className="text-xs text-slate-400 font-ibm">
                      — {entry.author_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-ibm">
                    <span className="hidden sm:inline text-[11px]">
                      {isExpanded ? 'سمیٹیں' : 'پڑھیں'}
                    </span>
                  </div>
                </div>

                {/* Commentary Body */}
                {isExpanded ? (
                  <div className="pr-2 sm:pr-4">
                    {renderEditorialCommentary(entry)}
                  </div>
                ) : (
                  <p 
                    onClick={() => onToggleTafsir(entry.tafsir_slug)}
                    className="text-xs text-slate-400 dark:text-slate-500 font-ibm pr-7 cursor-pointer hover:text-emerald-600 transition-colors line-clamp-1 italic"
                  >
                    {entry.content_html.replace(/<[^>]*>/g, '').slice(0, 120)}... (پڑھنے کے لیے کلک کریں)
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : tafsirLayoutMode === 'split' ? (
        /* Side-by-Side Comparative Mode (Dual Parallel Columns) */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b border-emerald-950/8 dark:border-white/5 text-xs font-ibm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600 dark:text-slate-400 shrink-0">پہلی تفسیر:</span>
              <select
                value={splitSlug1}
                onChange={(e) => setSplitSlug1(e.target.value)}
                className="flex-1 bg-transparent border-b border-emerald-500/40 text-slate-800 dark:text-slate-200 font-semibold outline-none py-1"
              >
                {displayTafasir.map(t => (
                  <option key={`split1-${t.tafsir_slug}`} value={t.tafsir_slug} className="dark:bg-slate-900">
                    {t.tafsir_name} ({t.author_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600 dark:text-slate-400 shrink-0">دوسری تفسیر:</span>
              <select
                value={splitSlug2}
                onChange={(e) => setSplitSlug2(e.target.value)}
                className="flex-1 bg-transparent border-b border-emerald-500/40 text-slate-800 dark:text-slate-200 font-semibold outline-none py-1"
              >
                {displayTafasir.map(t => (
                  <option key={`split2-${t.tafsir_slug}`} value={t.tafsir_slug} className="dark:bg-slate-900">
                    {t.tafsir_name} ({t.author_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-emerald-950/10 dark:divide-white/10">
            <div>
              {(() => {
                const entry = displayTafasir.find(t => t.tafsir_slug === splitSlug1) || displayTafasir[0];
                return entry ? renderEditorialCommentary(entry) : null;
              })()}
            </div>
            <div className="lg:pr-8">
              {(() => {
                const entry = displayTafasir.find(t => t.tafsir_slug === splitSlug2) || displayTafasir[1] || displayTafasir[0];
                return entry ? renderEditorialCommentary(entry) : null;
              })()}
            </div>
          </div>
        </div>
      ) : (
        /* Focus / Author Ribbon Editorial Stream */
        <div className="space-y-4">
          {/* Author Ribbon (شريط المفسرين) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-emerald-950/10 dark:border-white/10 text-xs font-ibm select-none scrollbar-none">
            {displayTafasir.map((entry) => {
              const isSelected = selectedAuthorTab === entry.tafsir_slug;
              return (
                <button
                  key={`ribbon-${entry.tafsir_slug}`}
                  onClick={() => setSelectedAuthorTab(entry.tafsir_slug)}
                  className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap font-medium ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {entry.author_name}
                </button>
              );
            })}
          </div>

          {/* Active Commentary Stream */}
          <div>
            {(() => {
              const activeEntry = displayTafasir.find(t => t.tafsir_slug === selectedAuthorTab) || displayTafasir[0];
              return activeEntry ? renderEditorialCommentary(activeEntry) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
