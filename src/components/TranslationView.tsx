import React from 'react';
import { Play, Pause, Sparkles, BookOpen, Bookmark } from 'lucide-react';
import { Ayah, Surah, ScriptMode } from '../types/quran';
import { toArabicDigits } from '../utils/juzMapping';
import { RUKU_END_AYAHS, QUARTER_AYAHS, SAJDAH_AYAHS } from '../utils/mushafLayout';
import { InteractiveWord } from './WordTooltip';

interface TranslationViewProps {
  ayahs: Ayah[];
  currentSurah?: Surah;
  currentAyahNumber: number;
  scriptMode: ScriptMode;
  showWordByWord: boolean;
  selectedTranslationAuthor: string;
  onSelectAyah: (num: number) => void;
  onOpenMorphology: (ayahNumber: number) => void;
  onOpenTafsir: (ayahNumber: number) => void;
  isPlaying: boolean;
  activePlayingAyah: number | null;
  activePlayingWordIndex: number | null;
  onPlayAyah: (ayah: Ayah) => void;
  onPauseAyah: () => void;
  isAyahBookmarked?: (ayahNumber: number) => boolean;
  onToggleBookmark?: (ayah: Ayah) => void;
  onSelectWordRoot?: (root: string) => void;
}

export const TranslationView: React.FC<TranslationViewProps> = ({
  ayahs,
  currentSurah,
  currentAyahNumber,
  scriptMode,
  showWordByWord,
  selectedTranslationAuthor,
  onSelectAyah,
  onOpenMorphology,
  onOpenTafsir,
  isPlaying,
  activePlayingAyah,
  activePlayingWordIndex,
  onPlayAyah,
  onPauseAyah,
  isAyahBookmarked,
  onToggleBookmark,
  onSelectWordRoot
}) => {
  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      {/* Continuous Verses Stream with Translations (Zero In-Page Bars) */}
      <div className="space-y-4">
        {ayahs.map((ayah) => {
          const isSelected = currentAyahNumber === ayah.ayah_number;
          const isAyahPlaying = isPlaying && activePlayingAyah === ayah.ayah_number;
          const activeTr = ayah.translations?.find(t => t.author_id === selectedTranslationAuthor) || ayah.translations?.[0];
          const rukuEnd = RUKU_END_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];
          const quarter = QUARTER_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];
          const sajdah = SAJDAH_AYAHS[`${ayah.surah_id}:${ayah.ayah_number}`];
          const bookmarked = isAyahBookmarked ? isAyahBookmarked(ayah.ayah_number) : false;

          return (
            <div
              key={ayah.id}
              id={`ayah-${ayah.ayah_number}`}
              onClick={() => onSelectAyah(ayah.ayah_number)}
              className={`p-6 sm:p-7 rounded-3xl border transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/25 dark:bg-emerald-950/30 shadow-md ring-1 ring-emerald-500/40'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              {/* Header Info & Actions: Title at Right, Actions at Left (Strict RTL) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800/80 font-ibm">
                {/* Right Side: Verse Key & Ornaments */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs font-mono">
                    {ayah.verse_key}
                  </span>
                  <span className="text-xs text-slate-400">
                    صفحہ {ayah.page_madani}
                  </span>

                  {rukuEnd && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1">
                      <span>ع</span>
                      <span>رکوع {rukuEnd.surahRuku}</span>
                    </span>
                  )}

                  {quarter && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1">
                      <span>۞</span>
                      <span>{quarter.labelUrdu.split(':')[0]}</span>
                    </span>
                  )}

                  {sajdah && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold text-xs flex items-center gap-1">
                      <span>۩</span>
                      <span>سجدہ تلاوت</span>
                    </span>
                  )}
                </div>

                {/* Left Side: Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isAyahPlaying ? onPauseAyah() : onPlayAyah(ayah);
                    }}
                    title={isAyahPlaying ? "تلاوت موقوف کریں" : "تلاوت سنیں"}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {isAyahPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  {onToggleBookmark && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(ayah);
                      }}
                      title={bookmarked ? "محفوظ فہرست سے نکالیں" : "محفوظ کریں"}
                      className={`p-1.5 rounded-lg transition-colors ${
                        bookmarked 
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' 
                          : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMorphology(ayah.ayah_number);
                    }}
                    title="صرف و اعراب"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-700/80"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>صرف</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTafsir(ayah.ayah_number);
                    }}
                    title="تقابلی تفاسیر"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-700/80"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تفسیر</span>
                  </button>
                </div>
              </div>

              {/* Arabic Verse Text: Pure or Word-by-Word Interlinear */}
              {showWordByWord && ayah.words && ayah.words.length > 0 ? (
                <div className="py-2 mb-4">
                  <div className="flex flex-wrap gap-2.5 items-stretch justify-start" dir="rtl">
                    {ayah.words.map((w, wIdx) => {
                      const isWordActive = isAyahPlaying && activePlayingWordIndex === wIdx;
                      return (
                        <div
                          key={w.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (w.root && onSelectWordRoot) onSelectWordRoot(w.root);
                          }}
                          className={`flex flex-col items-center justify-between p-2 rounded-2xl border transition-all cursor-pointer ${
                            isWordActive
                              ? 'border-emerald-500 bg-emerald-100/90 dark:bg-emerald-950/80 ring-2 ring-emerald-500 scale-105'
                              : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 bg-slate-50/70 dark:bg-slate-800/40'
                          }`}
                        >
                          {/* Arabic Token */}
                          <span className="text-2xl font-bold leading-loose font-uthmani text-slate-900 dark:text-white">
                            {w.text_uthmani}
                          </span>
                          
                          {/* Urdu Word-by-Word Meaning */}
                          <span className="font-ibm text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                            {w.translation_ur || '—'}
                          </span>

                          {/* English Word-by-Word Meaning */}
                          <span dir="ltr" className="text-[11px] font-sans text-slate-500 dark:text-slate-400 font-medium text-center leading-tight mt-0.5">
                            {w.translation_en || '—'}
                          </span>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-center px-2">
                      <span className="ayah-end-num">﴿{toArabicDigits(ayah.ayah_number)}﴾</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="tajweed-text text-right text-2xl sm:text-3xl leading-[2.8] my-3 text-slate-900 dark:text-white font-uthmani">
                  {ayah.words && ayah.words.length > 0 ? (
                    ayah.words.map((w, wIdx) => {
                      const isWordActive = isAyahPlaying && activePlayingWordIndex === wIdx;
                      return (
                        <InteractiveWord
                          key={w.id}
                          word={w}
                          scriptMode={scriptMode}
                          onSelectRoot={onSelectWordRoot}
                          isActive={isWordActive}
                        />
                      );
                    })
                  ) : (
                    <span>{ayah.text_uthmani}</span>
                  )}
                  <span className="ayah-end-num">﴿{toArabicDigits(ayah.ayah_number)}﴾</span>
                </div>
              )}

              {/* Translation Text Under Ayah */}
              {activeTr && (
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-right">
                  <p className="font-ibm text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-[2.2] font-medium">
                    {activeTr.text}
                  </p>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-ibm mt-1.5 block">
                    — ترجمہ: {activeTr.author_name}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
