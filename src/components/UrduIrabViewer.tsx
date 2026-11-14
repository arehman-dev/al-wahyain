import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UrduIrabResponse } from '../types/quran';
import { fetchUrduIrab } from '../services/api';
import { 
  GraduationCap, 
  Loader2, 
  ExternalLink, 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  BookMarked,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { parseAhmedYarContent } from '../utils/ahmedYarHelper';

interface UrduIrabViewerProps {
  surahId: number;
  ayahNumber: number;
}

export const UrduIrabViewer: React.FC<UrduIrabViewerProps> = ({
  surahId,
  ayahNumber
}) => {
  const [data, setData] = useState<UrduIrabResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<number>(16);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [showFootnotes, setShowFootnotes] = useState<boolean>(true);
  const wordRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchUrduIrab(surahId, ayahNumber)
      .then(res => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [surahId, ayahNumber]);

  const parsedData = useMemo(() => {
    if (!data?.entry?.content_html) return null;
    return parseAhmedYarContent(data.entry.content_html);
  }, [data?.entry?.content_html]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleScrollToWord = (wordId: string) => {
    setActiveWordId(wordId);
    const el = wordRefs.current[wordId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) {
    return (
      <div className="w-full p-12 flex flex-col items-center justify-center gap-3 text-slate-400 font-ibm">
        <Loader2 className="w-6 h-6 animate-spin text-[#2ca4ab]" />
        <span className="text-xs font-semibold">اعراب و لغاتِ پروفیسر حافظ احمد یارؒ لوڈ ہو رہا ہے...</span>
      </div>
    );
  }

  if (!data || !data.has_entry || !data.entry) {
    return (
      <div className="w-full p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-950/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 font-ibm">
        اس آیت کے لیے لغات و اعراب کا کوئی الگ اندراج دستیاب نہیں ہے۔
      </div>
    );
  }

  const { entry } = data;

  return (
    <div 
      dir="rtl"
      className="w-full bg-white dark:bg-slate-900/95 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-7 space-y-6 font-ibm select-text"
    >
      {/* ======================================================== */}
      {/* 1. HEADER & ATTRIBUTION BAR                              */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>{entry.title_ur}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold border border-amber-300/40 dark:border-amber-800/40">
                ترکیب و اعرابِ قرآن
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              پروفیسر حافظ احمد یارؒ • لغات و اعرابِ قرآن کی روشنی میں ترجمۂ قرآن کی لغوی اور نحوی بنیادیں
            </p>
          </div>
        </div>

        {/* Action Controls: Font Scale, Copy, External Link */}
        <div className="flex items-center gap-1.5">
          {/* Font Size Adjusters */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => setFontSize(prev => Math.max(13, prev - 1))}
              disabled={fontSize <= 13}
              title="چھوٹا فونٹ"
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
              {fontSize}px
            </span>
            <button
              onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
              disabled={fontSize >= 22}
              title="بڑا فونٹ"
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copy Entire Commentary */}
          <button
            onClick={() => handleCopy(entry.content_html.replace(/<[^>]+>/g, ''), 'full_irab')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#2ca4ab] dark:hover:text-[#2ca4ab] text-xs transition-colors cursor-pointer"
            title="مکمل اندراج کاپی کریں"
          >
            {copiedId === 'full_irab' ? <Check className="w-3.5 h-3.5 text-[#2ca4ab]" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedId === 'full_irab' ? 'کاپی شدہ' : 'کاپی'}</span>
          </button>

          {/* Source Link */}
          {entry.url && (
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#2ca4ab] dark:hover:text-[#2ca4ab] text-xs transition-colors cursor-pointer"
              title="تنظیم اسلامی ڈیجیٹل لائبریری پر اصل صفحہ دیکھیں"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ڈیجیٹل لائبریری</span>
            </a>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SACRED VERSE BANNER                                   */}
      {/* ======================================================== */}
      {parsedData?.matnVerse && (
        <div className="p-4 sm:p-5 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/40 text-center select-none shadow-xs">
          <p className="font-ibm text-xl sm:text-2xl text-cyan-950 dark:text-[#2ca4ab] leading-[2.4] font-bold">
            {parsedData.matnVerse}
          </p>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. WORD QUICK-JUMP RIBBON                                */}
      {/* ======================================================== */}
      {parsedData && parsedData.words.length > 1 && (
        <div className="space-y-2 select-none">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <Layers className="w-3.5 h-3.5 text-[#2ca4ab]" />
            <span>الفاظِ زیرِ تحقیق (سرسری رسائی کے لیے لفظ پر کلک کریں):</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {parsedData.words.map((w, idx) => {
              const isSelected = activeWordId === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => handleScrollToWord(w.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'border-[#2ca4ab] bg-[#2ca4ab]/15 text-[#0e7490] dark:text-[#2ca4ab] font-bold shadow-xs'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-[#2ca4ab]/40 hover:bg-cyan-50/40 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-60">#{idx + 1}</span>
                  <span className="font-ibm text-sm font-bold">{w.word}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. STRUCTURED WORD-BY-WORD CARDS                         */}
      {/* ======================================================== */}
      {parsedData && parsedData.words.length > 0 ? (
        <div className="space-y-5">
          {parsedData.words.map((w, idx) => {
            const isHighlight = activeWordId === w.id;
            return (
              <div
                key={w.id}
                ref={(el) => { wordRefs.current[w.id] = el; }}
                className={`rounded-2xl border transition-all p-4 sm:p-6 space-y-3.5 ${
                  isHighlight
                    ? 'border-[#2ca4ab]/80 bg-cyan-50/30 dark:bg-cyan-950/15 shadow-sm ring-1 ring-[#2ca4ab]/20'
                    : 'border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Word Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800/80 select-none">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-lg bg-[#2ca4ab]/10 text-[#0e7490] dark:text-[#2ca4ab] flex items-center justify-center font-mono text-[11px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-cyan-100/80 dark:bg-cyan-950/80 text-cyan-950 dark:text-cyan-200 font-ibm text-lg sm:text-xl font-bold border border-[#2ca4ab]/40 dark:border-cyan-800/80 shadow-xs">
                      [ {w.word} ]
                    </span>
                    {w.sectionType && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200/60 dark:border-indigo-800/60">
                        {w.sectionType}
                      </span>
                    )}
                    {w.indexCode && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-xs font-bold">
                        {w.indexCode}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCopy(w.contentHtml.replace(/<[^>]+>/g, ''), w.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-[#2ca4ab] transition-colors cursor-pointer"
                    title="اس لفظ کا تجزیہ کاپی کریں"
                  >
                    {copiedId === w.id ? <Check className="w-3.5 h-3.5 text-[#2ca4ab]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Word Card Analysis Content */}
                <div
                  style={{ fontSize: `${fontSize}px` }}
                  className="ahmedyar-body font-ibm leading-[2.4] text-slate-800 dark:text-slate-200 text-justify space-y-2 [&>p]:mb-3"
                  dangerouslySetInnerHTML={{ __html: w.contentHtml }}
                />
              </div>
            );
          })}
        </div>
      ) : (
        /* Fallback: Direct Enhanced Prose Body */
        <div
          style={{ fontSize: `${fontSize}px` }}
          className="ahmedyar-body font-ibm leading-[2.4] text-slate-800 dark:text-slate-200 text-justify space-y-3"
          dangerouslySetInnerHTML={{ __html: parsedData?.fallbackHtml || entry.content_html }}
        />
      )}

      {/* ======================================================== */}
      {/* 5. FOOTNOTES & SCHOLARLY CROSS-REFERENCES TRAY           */}
      {/* ======================================================== */}
      {parsedData && parsedData.footnotes.length > 0 && (
        <div className="pt-2">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 overflow-hidden">
            <button
              onClick={() => setShowFootnotes(prev => !prev)}
              className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>حواشی و علمی حوالہ جات ({parsedData.footnotes.length})</span>
              </div>
              {showFootnotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFootnotes && (
              <div className="p-4 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2.5 text-xs text-slate-600 dark:text-slate-400 font-ibm leading-relaxed">
                {parsedData.footnotes.map((fn, fIdx) => (
                  <div 
                    key={`fn_${fIdx}`} 
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60"
                    dangerouslySetInnerHTML={{ __html: fn }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
