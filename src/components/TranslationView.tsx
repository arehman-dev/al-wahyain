import React, { useState } from 'react';
import { Play, Pause, Sparkles, BookOpen, Bookmark, FileText, ToggleLeft, ToggleRight, Type } from 'lucide-react';
import { Ayah, Surah, ScriptMode } from '../types/quran';
import { toArabicDigits } from '../utils/juzMapping';
import { RUKU_END_AYAHS, QUARTER_AYAHS, SAJDAH_AYAHS } from '../utils/mushafLayout';
import { InteractiveWord } from './WordTooltip';

interface TranslationViewProps {
  ayahs: Ayah[];
  currentSurah?: Surah;
  currentAyahNumber: number;
  scriptMode: ScriptMode;
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
  const [showWordByWord, setShowWordByWord] = useState<boolean>(() => {
    return localStorage.getItem('qs_show_wbw') === 'true';
  });
  const [useIbmFont, setUseIbmFont] = useState<boolean>(true);

  const toggleWordByWord = () => {
    setShowWordByWord(prev => {
      const next = !prev;
      localStorage.setItem('qs_show_wbw', String(next));
      return next;
    });
  };

  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-4 py-4 space-y-5">
      
      {/* Top Controls Toolbar: Word-by-Word Toggle & Typography */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs font-ibm text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            طرزِ ترجمہ:
          </span>
          <button
            onClick={toggleWordByWord}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showWordByWord
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {showWordByWord ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
            <span>لفظی ترجمہ (Word-by-Word) {showWordByWord ? 'فعال ہے' : 'بند ہے'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
          <button
            onClick={() => setUseIbmFont(prev => !prev)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
            title="ترجمے کا رسم الخط تبدیل کریں"
          >
            <Type className="w-3.5 h-3.5" />
            <span>{useIbmFont ? 'آئی بی ایم رسم الخط' : 'نستعلیق رسم الخط'}</span>
          </button>
          <span className="hidden sm:inline">
            ترجمہ: مفتی تقی عثمانی
          </span>
        </div>
      </div>

      {/* Continuous Verses Stream with Translations */}
      <div className="space-y-5">
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
              {/* Header Info & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800/80 font-ibm">
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

                <div className="flex items-center gap-1.5">
                  {/* Recitation */}
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

                  {/* Bookmark */}
                  {onToggleBookmark && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(ayah);
                      }}
                      title="آیت محفوظ کریں"
                      className={`p-1.5 rounded-lg transition-colors ${
                        bookmarked ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' : 'text-slate-400 hover:text-amber-500'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                    </button>
                  )}

                  {/* Jump to Sarf */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAyah(ayah.ayah_number);
                      onOpenMorphology(ayah.ayah_number);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-medium text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>صرف</span>
                  </button>

                  {/* Jump to Tafsir */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAyah(ayah.ayah_number);
                      onOpenTafsir(ayah.ayah_number);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-medium text-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>تفسیر</span>
                  </button>
                </div>
              </div>

              {/* 1. Full Arabic Text (Rendered when Word-by-Word is Off) */}
              {!showWordByWord && (
                <div className="tajweed-text text-right text-2xl sm:text-3xl leading-[2.6] font-arabic my-3 text-slate-900 dark:text-white">
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
                  ) : scriptMode === 'indopak' ? (
                    <span className="font-indopak">{ayah.text_indopak}</span>
                  ) : (
                    <span>{ayah.text_uthmani}</span>
                  )}
                  <span className="ayah-end-num">﴿{ayah.ayah_number}﴾</span>
                </div>
              )}

              {/* 2. Interlinear Word-by-Word Urdu Grid (When Word-by-Word is ON) */}
              {showWordByWord && ayah.words && ayah.words.length > 0 && (
                <div className="my-4">
                  <div className="flex flex-wrap items-start justify-start gap-2.5">
                    {ayah.words.map((w, wIdx) => {
                      const isWordActive = isAyahPlaying && activePlayingWordIndex === wIdx;
                      const displayText = scriptMode === 'indopak' ? (w.text_indopak || w.text_uthmani) : w.text_uthmani;
                      return (
                        <div
                          key={w.id}
                          className={`flex flex-col items-center justify-between px-3 py-2 rounded-2xl border transition-all ${
                            isWordActive
                              ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 shadow-sm'
                              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600'
                          }`}
                        >
                          {/* Arabic Word */}
                          <span className={`text-xl sm:text-2xl font-arabic text-slate-900 dark:text-white ${scriptMode === 'indopak' ? 'font-indopak' : ''}`}>
                            {displayText}
                          </span>
                          
                          {/* Urdu Word Meaning */}
                          <span className="text-xs sm:text-sm urdu-nastaliq text-emerald-800 dark:text-emerald-300 font-bold mt-1 text-center">
                            {w.translation_ur || '—'}
                          </span>
                        </div>
                      );
                    })}
                    <span className="ayah-end-num self-center text-xl">﴿{ayah.ayah_number}﴾</span>
                  </div>
                </div>
              )}

              {/* 3. Primary Continuous Urdu Translation */}
              {activeTr && (
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-right">
                  <p className={`${useIbmFont ? 'font-ibm leading-[2.1] text-base sm:text-lg' : 'urdu-nastaliq leading-[2.4] text-lg sm:text-xl'} text-slate-800 dark:text-slate-100 font-medium`}>
                    {activeTr.text}
                  </p>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-ibm mt-2 block">
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
