import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Copy, 
  Check, 
  Share2, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  ScrollText, 
  Info,
  ExternalLink
} from 'lucide-react';
import { HadithBook, HadithChapter, HadithItem } from '../types/quran';

interface HadithViewProps {
  book: HadithBook | null;
  chapters: HadithChapter[];
  currentChapterId: number | 'all';
  hadiths: HadithItem[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
  onSelectChapter: (chapterId: number | 'all') => void;
  hadithViewLang: 'all' | 'ur' | 'ar' | 'en';
  fontSize: number;
  highlightHadithNumber?: number | null;
}

export const HadithView: React.FC<HadithViewProps> = ({
  book,
  chapters,
  currentChapterId,
  hadiths,
  loading,
  pagination,
  onPageChange,
  onSelectChapter,
  hadithViewLang = 'all',
  fontSize = 18,
  highlightHadithNumber = null
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to highlighted hadith if jumping to a specific number
  useEffect(() => {
    if (highlightHadithNumber && hadiths.length > 0) {
      const el = document.getElementById(`hadith-${highlightHadithNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightHadithNumber, hadiths]);

  // Copy Hadith Text with scholarly citation
  const handleCopyHadith = (h: HadithItem) => {
    const lines: string[] = [];
    lines.push(`【 ${book?.name_urdu || 'حدیث'} — حدیث نمبر ${h.hadith_number} 】`);
    if (h.chapter_title_arabic || h.chapter_title_english) {
      lines.push(`باب: ${h.chapter_title_arabic || ''} (${h.chapter_title_english || ''})`);
    }
    lines.push('');
    if (h.arabic_text) {
      lines.push(h.arabic_text);
      lines.push('');
    }
    if (h.urdu_text) {
      lines.push('اردو ترجمہ:');
      lines.push(h.urdu_text);
      lines.push('');
    }
    if (h.english_text) {
      lines.push('English Translation:');
      if (h.english_narrator) lines.push(h.english_narrator);
      lines.push(h.english_text);
      lines.push('');
    }
    lines.push('— بحوالہ: الوحیین (Al-Wahyain Quran & Hadith Suite)');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedId(h.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Native share or clipboard fallback
  const handleShareHadith = async (h: HadithItem) => {
    const title = `${book?.name_urdu || 'حدیث'} #${h.hadith_number}`;
    const text = `${h.arabic_text}\n\n${h.urdu_text || h.english_text || ''}\n— الوحیین`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
      } catch {
        handleCopyHadith(h);
      }
    } else {
      handleCopyHadith(h);
    }
  };

  const currentChapter = chapters.find(c => c.chapter_number === currentChapterId);

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 pb-28 font-ibm select-text">
      
      {/* 1. BOOK & CHAPTER BANNER */}
      {book && (
        <div className="mb-6 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Book Titles */}
            <div dir="rtl" className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  مجموعۂ حدیث
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  کل احادیث: {book.total_hadiths?.toLocaleString('ur-PK') || book.total_hadiths}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-nastaliq text-slate-900 dark:text-white pt-1">
                {book.name_urdu}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                مؤلف: {book.author_urdu} ({book.author_english})
              </p>
            </div>

            {/* Chapter Indicator if selected */}
            {currentChapter && currentChapterId !== 'all' && (
              <div dir="rtl" className="bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 sm:max-w-xs text-right">
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block mb-0.5">
                  کتاب / باب نمبر {currentChapter.chapter_number}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                  {currentChapter.title_arabic}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {currentChapter.title_english}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. LOADING STATE */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">احادیث مبارکہ لوڈ کی جا رہی ہیں...</p>
        </div>
      )}

      {/* 3. EMPTY STATE */}
      {!loading && hadiths.length === 0 && (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400 space-y-2">
          <ScrollText className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
          <p className="text-base font-semibold">اس باب میں کوئی حدیث دستیاب نہیں</p>
          <p className="text-xs">براہ کرم کوئی دوسرا باب یا صفحہ منتخب فرمائیں۔</p>
        </div>
      )}

      {/* 4. HADITH CARDS LIST */}
      {!loading && hadiths.length > 0 && (
        <div className="space-y-6">
          {hadiths.map((h) => {
            const isHighlighted = highlightHadithNumber === h.hadith_number;
            return (
              <article
                key={h.id}
                id={`hadith-${h.hadith_number}`}
                className={`relative rounded-2xl border transition-all duration-300 p-5 sm:p-7 shadow-xs ${
                  isHighlighted 
                    ? 'ring-2 ring-emerald-500 bg-emerald-500/5 border-emerald-500/40' 
                    : 'bg-white/90 dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                }`}
              >
                
                {/* CARD HEADER BAR */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                  
                  {/* Left: Book & Hadith Number Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      حدیث #{h.hadith_number}
                    </span>
                    {h.chapter_title_arabic && (
                      <span dir="rtl" className="hidden sm:inline-block text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {h.chapter_title_arabic}
                      </span>
                    )}
                  </div>

                  {/* Right: Actions (Copy, Share) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyHadith(h)}
                      title="مکمل متن اور حوالہ کاپی کریں"
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedId === h.id ? (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleShareHadith(h)}
                      title="شیئر کریں"
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ARABIC MATN */}
                {(hadithViewLang === 'all' || hadithViewLang === 'ar') && h.arabic_text && (
                  <div dir="rtl" className="mb-6">
                    <p 
                      className="font-amiri text-slate-900 dark:text-slate-100 text-right leading-[2.2] select-text"
                      style={{ fontSize: `${fontSize * 1.3}px` }}
                    >
                      {h.arabic_text}
                    </p>
                  </div>
                )}

                {/* URDU TRANSLATION */}
                {(hadithViewLang === 'all' || hadithViewLang === 'ur') && (
                  <div dir="rtl" className={`${(hadithViewLang === 'all' && h.arabic_text) ? 'pt-4 border-t border-slate-100 dark:border-slate-800/80' : ''}`}>
                    {h.urdu_text ? (
                      <p 
                        className="font-nastaliq text-slate-800 dark:text-slate-200 text-right leading-[2.4] select-text"
                        style={{ fontSize: `${fontSize * 1.12}px` }}
                      >
                        {h.urdu_text}
                      </p>
                    ) : (
                      <div className="py-2 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span>اس مجموعے کے لیے اردو نسخہ فی الوقت دستیاب نہیں۔ برائے مہربانی عربی متن یا انگریزی ترجمہ ملاحظہ فرمائیں۔</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ENGLISH TRANSLATION */}
                {(hadithViewLang === 'all' || hadithViewLang === 'en') && h.english_text && (
                  <div dir="ltr" className={`${(hadithViewLang === 'all' || hadithViewLang === 'en') ? 'mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80' : ''}`}>
                    {h.english_narrator && (
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                        {h.english_narrator}
                      </p>
                    )}
                    <p 
                      className="font-app text-slate-700 dark:text-slate-300 leading-relaxed select-text"
                      style={{ fontSize: `${fontSize * 0.95}px` }}
                    >
                      {h.english_text}
                    </p>
                  </div>
                )}

              </article>
            );
          })}
        </div>
      )}

      {/* 5. BOTTOM PAGINATION CONTROLS */}
      {!loading && pagination.totalPages > 1 && (
        <nav 
          dir="rtl" 
          aria-label="حدیث صفحات" 
          className="mt-8 flex items-center justify-between bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl"
        >
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
            <span>پچھلا صفحہ</span>
          </button>

          <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
            صفحہ {pagination.page} از {pagination.totalPages}
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-2">
              (کل {pagination.total} احادیث)
            </span>
          </div>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <span>اگلا صفحہ</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </nav>
      )}

    </div>
  );
};
