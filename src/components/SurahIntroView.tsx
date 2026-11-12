import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  ChevronLeft
} from 'lucide-react';
import { Surah, SurahIntro } from '../types/quran';
import { fetchSurahIntro } from '../services/api';
import { toArabicDigits } from '../utils/juzMapping';

interface SurahIntroViewProps {
  currentSurah: Surah;
  fontSize?: number;
  onStartSurah: (ayahNumber: number) => void;
}

export const SurahIntroView: React.FC<SurahIntroViewProps> = ({
  currentSurah,
  fontSize = 17,
  onStartSurah
}) => {
  const [intro, setIntro] = useState<SurahIntro | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lang, setLang] = useState<'ur' | 'en'>('ur');
  const [copied, setCopied] = useState<boolean>(false);

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

  const handleCopy = () => {
    if (!intro) return;
    const rawHtml = lang === 'ur' ? intro.text_html_ur : intro.text_html_en;
    const cleanText = rawHtml.replace(/<[^>]+>/g, '').trim();
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMakki = currentSurah.revelation_place === 'makkah';

  return (
    <div dir="rtl" className="w-full py-4 space-y-6 relative font-ibm">
      
      {/* ======================================================== */}
      {/* 1. SACRED SURAH MATN & HEADPIECE (Zero Boxed Cards)      */}
      {/* ======================================================== */}
      <section className="relative pb-6 border-b border-emerald-950/10 dark:border-emerald-500/15 select-none">
        
        {/* Subtle Surah Progress Line */}
        <div className="w-full h-0.5 bg-slate-200/50 dark:bg-slate-800 mb-4 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-600 transition-all duration-300 w-full" />
        </div>

        {/* Metadata Header Row */}
        <div className="flex items-center justify-between gap-3 mb-3 text-xs font-ibm">
          <div className="flex items-center gap-2">
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
            مقدمہ، زمانہٴ نزول و تاریخی پس منظر
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
      {/* 2. SCHOLARLY SHARH (تعارف و پس منظر) — Editorial Flow    */}
      {/* ======================================================== */}
      <section className="space-y-4">
        
        {/* Editorial Subheader: Source, Language Tabs & Copy Button */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-950/8 dark:border-white/5 text-xs font-ibm select-none">
          <div className="flex items-center gap-3">
            <span className="font-bold text-base text-slate-900 dark:text-white">
              {lang === 'ur' ? 'مقدمہ و پس منظرِ سورت' : 'Surah Introduction & Context'}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs hidden sm:inline">
              — {lang === 'ur' ? (intro?.source_ur || 'سید ابو اعلیٰ مودودیؒ - تفہیم القرآن') : (intro?.source_en || 'Sayyid Abul Ala Maududi - Tafhim al-Qur\'an')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle Pill matching Al-Wahyain's Author Tabs style */}
            <div className="flex items-center bg-slate-200/60 dark:bg-slate-800/80 rounded-xl p-0.5 border border-slate-300/60 dark:border-slate-700/60">
              <button
                onClick={() => setLang('ur')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === 'ur'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                اردو
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Copy Action */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="text-[11px]">{copied ? 'کاپی شدہ' : 'کاپی'}</span>
            </button>
          </div>
        </div>

        {/* Introduction Text Body — Matches Tafsir-Prose font-ibm leading-[2.4] exactly */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">سورت کا مقدمہ لوڈ ہو رہا ہے...</p>
          </div>
        ) : intro ? (
          <div
            dir={lang === 'ur' ? 'rtl' : 'ltr'}
            style={{ fontSize: `${fontSize}px` }}
            className={`tafsir-prose font-ibm leading-[2.4] text-slate-800 dark:text-slate-200 max-w-none cursor-text select-text ${
              lang === 'ur' ? 'text-right' : 'text-left'
            } [&>h2]:text-base sm:[&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-emerald-700 dark:[&>h2]:text-emerald-400 [&>h2]:border-b [&>h2]:border-emerald-950/8 dark:[&>h2]:border-white/5 [&>h2]:pb-2 [&>h2]:mt-6 [&>h2]:mb-3 [&>h2:first-child]:mt-0 [&>p]:mb-4 [&>p]:text-justify`}
            dangerouslySetInnerHTML={{ 
              __html: lang === 'ur' ? intro.text_html_ur : intro.text_html_en 
            }}
          />
        ) : (
          <div className="py-16 text-center text-slate-400 font-ibm text-sm">
            اس سورت کے لیے مقدمہ دستیاب نہیں ہے۔
          </div>
        )}

        {/* Editorial Bottom Divider & Next Action */}
        <div className="pt-8 mt-10 border-t border-emerald-950/10 dark:border-emerald-500/10 flex items-center justify-between text-xs font-ibm select-none">
          <span className="text-slate-500 dark:text-slate-400">
            سورت کا ابتدائی پس منظر مکمل ہوا۔
          </span>
          <button
            onClick={() => onStartSurah(1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <span>پہلی آیت کا مطالعہ شروع کریں (آیت ۱)</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

      </section>

    </div>
  );
};
