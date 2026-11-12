import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ScrollText, 
  ArrowLeft, 
  Languages, 
  MapPin, 
  Hash, 
  Layers, 
  FileText,
  Clock,
  Compass
} from 'lucide-react';
import { Surah, SurahIntro } from '../types/quran';
import { fetchSurahIntro } from '../services/api';

interface SurahIntroViewProps {
  currentSurah: Surah;
  fontSize?: number;
  onStartSurah: (ayahNumber: number) => void;
}

export const SurahIntroView: React.FC<SurahIntroViewProps> = ({
  currentSurah,
  fontSize = 18,
  onStartSurah
}) => {
  const [intro, setIntro] = useState<SurahIntro | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lang, setLang] = useState<'ur' | 'en'>('ur');

  useEffect(() => {
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
  }, [currentSurah.id]);

  const isMakki = currentSurah.revelation_place === 'makkah';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32 font-ibm select-text animate-fadeIn">
      
      {/* ======================================================== */}
      {/* 1. ORNATE SURAH FRONTISPIECE BANNER                      */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-slate-50/90 to-white dark:from-slate-900/90 dark:to-slate-950 p-6 sm:p-8 shadow-xs text-center mb-8">
        
        {/* Subtle Ornamental Geometric Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Small Intro Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>مقدمہ و تعارفِ سورت • Introduction & Historical Context</span>
        </div>

        {/* Surah Title in Authentic Arabic Calligraphy */}
        <h1 className="text-3xl sm:text-5xl font-qcf font-normal text-slate-900 dark:text-white mb-2 tracking-wide" dir="rtl">
          سُورَةُ {currentSurah.name_arabic}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium mb-4">
          Surah {currentSurah.name_simple} • {currentSurah.name_urdu}
        </p>

        {/* Metadata Chips (Makki/Madani, Ayahs, Pages) */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span className={`px-2.5 py-1 rounded-xl flex items-center gap-1 border ${
            isMakki 
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' 
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
          }`}>
            <MapPin className="w-3.5 h-3.5" />
            <span>{isMakki ? 'مکی سورت (Makkah)' : 'مدنی سورت (Madinah)'}</span>
          </span>

          <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentSurah.verses_count} آیات مبارکہ</span>
          </span>

          <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>صفحات: {currentSurah.page_start} تا {currentSurah.page_end}</span>
          </span>

          <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>سورت نمبر {currentSurah.id} از 114</span>
          </span>
        </div>

        {/* Bismillah Banner (All Surahs except Surah 9 At-Tawbah) */}
        {currentSurah.id !== 9 && (
          <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/80">
            <p className="text-xl sm:text-2xl font-qcf text-slate-800 dark:text-slate-200" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. CONTROLS BAR: LANGUAGE SWITCHER & SOURCE BADGE        */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 mb-6 bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl">
        
        {/* Source Attribution */}
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <ScrollText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">
            {lang === 'ur' ? (intro?.source_ur || 'سید ابو اعلیٰ مودودیؒ - تفہیم القرآن') : (intro?.source_en || 'Sayyid Abul Ala Maududi - Tafhim al-Qur\'an')}
          </span>
        </div>

        {/* Language Switcher Pill */}
        <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <button
            onClick={() => setLang('ur')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              lang === 'ur'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            اردو (تفہیم القرآن)
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            English (Tafhim)
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. INTRODUCTION CONTENT BODY                             */}
      {/* ======================================================== */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">سورت کا مقدمہ لوڈ ہو رہا ہے...</p>
        </div>
      ) : intro ? (
        <article className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-9 shadow-xs">
          
          {/* Formatted HTML Introduction Body */}
          <div 
            dir={lang === 'ur' ? 'rtl' : 'ltr'}
            className={`prose dark:prose-invert max-w-none ${
              lang === 'ur' 
                ? 'font-nastaliq leading-[2.6] text-slate-800 dark:text-slate-200 text-right' 
                : 'font-app leading-relaxed text-slate-700 dark:text-slate-300 text-left'
            } [&>h2]:text-lg sm:[&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-emerald-700 dark:[&>h2]:text-emerald-400 [&>h2]:border-b [&>h2]:border-slate-100 dark:[&>h2]:border-slate-800/80 [&>h2]:pb-2 [&>h2]:mt-6 [&>h2]:mb-3 [&>h2:first-child]:mt-0 [&>p]:mb-4 [&>p]:text-justify`}
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{ 
              __html: lang === 'ur' ? intro.text_html_ur : intro.text_html_en 
            }}
          />

          {/* ======================================================== */}
          {/* 4. PROCEED TO AYAH 1 CALL TO ACTION                      */}
          {/* ======================================================== */}
          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span>ابتدائی پس منظر کے مطالعے کے بعد پہلی آیت کا تلاوت و مطالعہ شروع فرمائیں۔</span>
            </div>

            <button
              onClick={() => onStartSurah(1)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>پہلی آیت کا مطالعہ شروع کریں (آیت ۱)</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

        </article>
      ) : (
        <div className="py-16 text-center text-slate-400">
          اس سورت کے لیے مقدمہ دستیاب نہیں ہے۔
        </div>
      )}

    </div>
  );
};
