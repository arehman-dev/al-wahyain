import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  ScrollText, 
  Languages, 
  MapPin, 
  Hash, 
  Layers, 
  ExternalLink,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Surah, SurahIntro } from '../types/quran';
import { fetchSurahIntro } from '../services/api';

interface SurahIntroDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSurah: Surah;
  onJumpToAyah0?: () => void;
  fontSize?: number;
}

export const SurahIntroDrawer: React.FC<SurahIntroDrawerProps> = ({
  isOpen,
  onClose,
  currentSurah,
  onJumpToAyah0,
  fontSize: initialFontSize = 17
}) => {
  const [intro, setIntro] = useState<SurahIntro | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lang, setLang] = useState<'ur' | 'en'>('ur');
  const [fontSize, setFontSize] = useState<number>(initialFontSize);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);
    fetchSurahIntro(currentSurah.id)
      .then(res => {
        if (isMounted) {
          setIntro(res.intro);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load surah intro:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [isOpen, currentSurah.id]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isMakki = currentSurah.revelation_place === 'makkah';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn select-text">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div
        dir="rtl"
        className="absolute inset-y-0 right-0 max-w-2xl w-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col font-ibm"
      >
        {/* ======================================================== */}
        {/* DRAWER HEADER                                            */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              title="بند کریں (Esc)"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>مقدمہ و پس منظر</span>
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                سورة {currentSurah.name_arabic} ({currentSurah.name_simple})
              </h2>
            </div>
          </div>

          {/* Quick Actions: Language Toggle & Font Stepper */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Font Zoom */}
            <div className="hidden sm:flex items-center bg-slate-200/60 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-300/60 dark:border-slate-700/60">
              <button
                onClick={() => setFontSize(prev => Math.max(14, prev - 1))}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                title="چھوٹا فونٹ"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-[11px] font-bold font-app">{fontSize}</span>
              <button
                onClick={() => setFontSize(prev => Math.min(26, prev + 1))}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                title="بڑا فونٹ"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center bg-slate-200/60 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-300/60 dark:border-slate-700/60 text-xs font-semibold">
              <button
                onClick={() => setLang('ur')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  lang === 'ur'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                اردو
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SURAH SUMMARY METADATA STRIP                            */}
        {/* ======================================================== */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30 flex items-center justify-between gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${
              isMakki 
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
            }`}>
              {isMakki ? 'مکی سورت' : 'مدنی سورت'}
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {currentSurah.verses_count} آیات • صفحات {currentSurah.page_start}-{currentSurah.page_end}
            </span>
          </div>

          {onJumpToAyah0 && (
            <button
              onClick={() => {
                onJumpToAyah0();
                onClose();
              }}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>مکمل اسکرین تعارف (آیت 0)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* ======================================================== */}
        {/* DRAWER BODY: FORMATTED INTRODUCTION TEXT                */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
              <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">مقدمہ لوڈ ہو رہا ہے...</p>
            </div>
          ) : intro ? (
            <>
              {/* Attribution */}
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-4 flex items-center gap-1.5">
                <ScrollText className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'ur' ? intro.source_ur : intro.source_en}</span>
              </div>

              {/* Text Body */}
              <div
                dir={lang === 'ur' ? 'rtl' : 'ltr'}
                className={`prose dark:prose-invert max-w-none ${
                  lang === 'ur' 
                    ? 'font-nastaliq leading-[2.6] text-slate-800 dark:text-slate-200 text-right' 
                    : 'font-app leading-relaxed text-slate-700 dark:text-slate-300 text-left'
                } [&>h2]:text-base sm:[&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-emerald-700 dark:[&>h2]:text-emerald-400 [&>h2]:border-b [&>h2]:border-slate-100 dark:[&>h2]:border-slate-800/80 [&>h2]:pb-1.5 [&>h2]:mt-5 [&>h2]:mb-2.5 [&>h2:first-child]:mt-0 [&>p]:mb-3.5 [&>p]:text-justify`}
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{ 
                  __html: lang === 'ur' ? intro.text_html_ur : intro.text_html_en 
                }}
              />
            </>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              اس سورت کا مقدمہ دستیاب نہیں ہے۔
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
