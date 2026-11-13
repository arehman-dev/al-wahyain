import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  Check, 
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Surah, 
  TafsirEntry, 
  TafsirHighlight, 
  HighlightColor, 
  TafsirLayoutMode 
} from '../types/quran';
import { TextHighlighterBar } from './TextHighlighterBar';
import { enhanceTafsirHtml } from '../utils/tafsirCrossReference';
import { applyHighlightsToHtml } from '../utils/highlighterHelper';
import { toArabicDigits } from '../utils/juzMapping';

interface SurahIntroViewProps {
  currentSurah: Surah;
  tafasir: TafsirEntry[];
  expandedTafasir: Record<string, boolean>;
  onToggleTafsir: (slug: string) => void;
  tafsirOrder: string[];
  visibleTafasir: Record<string, boolean>;
  tafsirLayoutMode?: TafsirLayoutMode;
  fontSize?: number;
  highlights?: TafsirHighlight[];
  onAddHighlight?: (text: string, color: HighlightColor, tafsirSlug?: string) => void;
  onDeleteHighlight?: (id: string) => void;
  onNavigateToVerse?: (surahId: number, ayahNumber: number) => void;
}

const AUTHOR_METADATA: Record<string, { name: string; author: string }> = {
  tafheem: { name: 'تفہیم القرآن', author: 'مولانا سید ابوالاعلیٰ مودودی' },
  bayan_ul_quran: { name: 'بیان القرآن', author: 'ڈاکٹر اسرار احمد' },
  maarif: { name: 'معارف القرآن', author: 'مفتی محمد شفیع عثمانی' },
  ibn_kathir: { name: 'تفسیر ابنِ کثیر (اردو)', author: 'حافظ عماد الدین ابنِ کثیر' },
  saadi: { name: 'تفسیر السعدی', author: 'شیخ عبدالرحمٰن بن ناصر السعدی' },
  tayseer: { name: 'تیسیر القرآن', author: 'مولانا عبدالرحمٰن کیلانی' },
};

export const SurahIntroView: React.FC<SurahIntroViewProps> = ({
  currentSurah,
  tafasir = [],
  expandedTafasir,
  onToggleTafsir,
  tafsirOrder = ['tafheem', 'bayan_ul_quran', 'maarif', 'ibn_kathir', 'saadi', 'tayseer'],
  visibleTafasir = {},
  tafsirLayoutMode = 'focus',
  fontSize = 17,
  highlights = [],
  onAddHighlight,
  onDeleteHighlight,
  onNavigateToVerse
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAuthorTab, setSelectedAuthorTab] = useState<string>('tafheem');

  // Auto smooth-scroll to top when navigating surahs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSurah.id]);

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

  const isMakki = currentSurah.revelation_place === 'makkah';

  // Authors active according to user visibility preferences
  const activeSlugs = tafsirOrder.filter(slug => visibleTafasir[slug] !== false);

  // Filter available authentic tafasir
  const availableTafasirMap = new Map<string, TafsirEntry>();
  for (const t of tafasir) {
    if (t.content_html && t.content_html.trim().length > 0) {
      availableTafasirMap.set(t.tafsir_slug, t);
    }
  }

  // Ensure default author tab is valid and has authentic text if available
  useEffect(() => {
    if (!availableTafasirMap.has(selectedAuthorTab)) {
      if (availableTafasirMap.has('tafheem')) {
        setSelectedAuthorTab('tafheem');
      } else if (availableTafasirMap.size > 0) {
        setSelectedAuthorTab(Array.from(availableTafasirMap.keys())[0]);
      }
    }
  }, [currentSurah.id, tafasir]);

  const renderEditorialCommentary = (entry: TafsirEntry, showHeader: boolean = true) => {
    const entryHighlights = highlights.filter(
      h => h.surah_id === currentSurah.id &&
           h.ayah_number === 0 &&
           (h.tafsir_slug === entry.tafsir_slug || h.tafsir_slug === 'general')
    );
    const withHighlights = applyHighlightsToHtml(entry.content_html, entryHighlights);
    const enhancedHtml = enhanceTafsirHtml(withHighlights);

    return (
      <div key={`intro-commentary-${entry.id}`} className="pt-2 pb-4">
        {showHeader && (
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-950/8 dark:border-white/5 text-xs font-ibm select-none">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900 dark:text-white">
                {entry.tafsir_name}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                — {entry.author_name}
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
                (0-intro • مقدمہ و تعارفِ سورت)
              </span>
            </div>

            <button
              onClick={() => handleCopy(entry.content_html.replace(/<[^>]+>/g, ''), `tafsir-intro-${entry.id}`)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {copiedId === `tafsir-intro-${entry.id}` ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="text-[11px]">{copiedId === `tafsir-intro-${entry.id}` ? 'کاپی شدہ' : 'کاپی'}</span>
            </button>
          </div>
        )}

        {/* Prose Body — Strictly I-Beam Text Cursor & Selectable, 100% Authentic Text */}
        <div 
          data-tafsir-slug={entry.tafsir_slug}
          style={{ fontSize: `${fontSize}px` }}
          className="tafsir-prose font-ibm leading-[2.4] text-slate-800 dark:text-slate-200 max-w-none text-right cursor-text select-text [&>h2]:text-base sm:[&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-emerald-700 dark:[&>h2]:text-emerald-400 [&>h2]:border-b [&>h2]:border-emerald-950/8 dark:[&>h2]:border-white/5 [&>h2]:pb-2 [&>h2]:mt-6 [&>h2]:mb-3 [&>h2:first-child]:mt-0 [&>p]:mb-4 [&>p]:text-justify"
          dangerouslySetInnerHTML={{ __html: enhancedHtml }}
        />
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleContainerClick}
      dir="rtl" 
      className="w-full py-4 space-y-6 relative font-ibm"
    >
      {/* Floating Text Highlighter Bar */}
      {onAddHighlight && (
        <TextHighlighterBar
          containerRef={containerRef}
          onAddHighlight={onAddHighlight}
        />
      )}

      {/* ======================================================== */}
      {/* 1. SACRED SURAH MATN & FRONTISPIECE (Zero Boxed Cards)   */}
      {/* ======================================================== */}
      <section className="relative pb-6 border-b border-emerald-950/10 dark:border-emerald-500/15 select-none">
        
        {/* Subtle Surah Progress Line (0% at introduction / frontispiece) */}
        <div className="w-full h-0.5 bg-slate-200/50 dark:bg-slate-800 mb-4 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-600 transition-all duration-300 w-0" />
        </div>

        {/* Metadata Header Row */}
        <div className="flex items-center justify-between gap-3 mb-3 text-xs font-ibm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-mono font-bold text-xs">
              0-intro
            </span>
            <span className="font-app font-bold text-sm text-emerald-700 dark:text-emerald-400">
              ۞ سورة {currentSurah.name_arabic}
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-ibm text-xs font-medium">
              ({currentSurah.name_simple} • {currentSurah.name_urdu})
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${
              isMakki 
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
            }`}>
              {isMakki ? 'مکی سورت' : 'مدنی سورت'}
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-ibm text-xs">
              {currentSurah.verses_count} آیات • صفحات {toArabicDigits(currentSurah.page_start)} تا {toArabicDigits(currentSurah.page_end)}
            </span>
          </div>
        </div>

        {/* Majestic Calligraphic Surah Name */}
        <div className="text-center my-6">
          <h1 className="text-4xl sm:text-5xl font-qcf text-slate-900 dark:text-white mb-2 tracking-wide">
            سُورَةُ {currentSurah.name_arabic}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-ibm">
            مقدمہ، فضائل، زمانہٴ نزول و خلاصہ مضامین
          </p>
        </div>

        {/* Bismillah Calligraphy (Omitted for Surah 9 At-Tawbah) */}
        {currentSurah.id !== 9 && (
          <div className="text-center mt-4">
            <p className="text-2xl sm:text-3xl font-qcf text-slate-800 dark:text-slate-200">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 2. SCHOLARLY SHARH (تعارف و تفاسیر) — Editorial Flow    */}
      {/* ======================================================== */}
      {activeSlugs.length === 0 ? (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 font-ibm space-y-2">
          <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="font-bold">اس سورت کے لیے فی الحال کوئی تفسیر منتخب نہیں ہے</p>
          <p className="text-xs">سب ہیڈر بار میں &quot;ترتیب و انتخابِ تفاسیر&quot; سے تفاسیر کو فعال کریں۔</p>
        </div>
      ) : tafsirLayoutMode === 'focus' ? (
        /* Focus Mode: Author Tabs Ribbon */
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 border-b border-emerald-950/10 dark:border-white/10 text-xs font-ibm select-none scrollbar-none">
            {activeSlugs.map((slug) => {
              const meta = AUTHOR_METADATA[slug] || { name: slug, author: '' };
              const isSelected = selectedAuthorTab === slug;
              const hasIntro = availableTafasirMap.has(slug);

              return (
                <button
                  key={`intro-ribbon-${slug}`}
                  onClick={() => setSelectedAuthorTab(slug)}
                  className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap font-medium cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{meta.name}</span>
                  <span className={`text-[11px] ${isSelected ? 'text-emerald-600/80 dark:text-emerald-300/80' : 'text-slate-400 dark:text-slate-500'}`}>
                    ({meta.author})
                  </span>
                  {!hasIntro && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" title="مقدمہ دستیاب نہیں" />
                  )}
                </button>
              );
            })}
          </div>

          <div>
            {(() => {
              const activeEntry = availableTafasirMap.get(selectedAuthorTab);
              if (activeEntry) {
                return renderEditorialCommentary(activeEntry);
              }
              const meta = AUTHOR_METADATA[selectedAuthorTab] || { name: selectedAuthorTab, author: '' };
              return (
                <div className="py-16 px-4 text-center rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70 space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                    اس سورت کے لیے {meta.name} ({meta.author}) کا مستقل مقدمہ فی الحال ڈیجیٹائز نہیں ہے
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    صرف مصنف کا براہِ راست تصنیف کردہ مستند متنی مواد ہی پیش کیا جاتا ہے۔
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        /* Stacked Editorial List (Only Authentic Ingested Introductions) */
        <div className="space-y-4">
          {activeSlugs.map((slug) => {
            const entry = availableTafasirMap.get(slug);
            const meta = AUTHOR_METADATA[slug] || { name: slug, author: '' };
            const isExpanded = expandedTafasir[slug] !== false;

            if (!entry) {
              return null; // In stacked mode, only display commentaries that have authentic intros
            }

            return (
              <div 
                key={`intro-stacked-${slug}`} 
                className="pb-3 border-b border-emerald-950/8 dark:border-white/5 space-y-2"
              >
                {/* Header Row */}
                <div 
                  onClick={() => onToggleTafsir(slug)}
                  className="flex items-center justify-between cursor-pointer py-2 px-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {entry.tafsir_name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                      — {entry.author_name}
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold hidden sm:inline">
                      (مقدمہ و تعارف)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(entry.content_html.replace(/<[^>]+>/g, ''), `intro-stacked-copy-${entry.id}`);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedId === `intro-stacked-copy-${entry.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[10px]">{copiedId === `intro-stacked-copy-${entry.id}` ? 'کاپی شدہ' : 'کاپی'}</span>
                    </button>

                    <button 
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                      aria-label="تفسیر کا احاطہ کھولیں یا بند کریں"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible Body */}
                {isExpanded && (
                  <div className="px-1 pt-1 pb-3">
                    {renderEditorialCommentary(entry, false)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Editorial Bottom Divider */}
      <div className="pt-8 mt-10 border-t border-emerald-950/10 dark:border-emerald-500/10" />

    </div>
  );
};
