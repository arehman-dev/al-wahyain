import React, { useState } from 'react';
import { Play, Pause, Sparkles, BookOpen, Layers, ArrowLeft, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Ayah, Word, ScriptMode } from '../types/quran';
import { toArabicDigits } from '../utils/juzMapping';

interface MorphologyViewProps {
  currentAyah: Ayah;
  scriptMode: ScriptMode;
  onPrevAyah: () => void;
  onNextAyah: () => void;
  onSelectWordRoot: (root: string) => void;
  isPlaying: boolean;
  activePlayingWordIndex: number | null;
  onPlayAyah: (ayah: Ayah) => void;
  onPauseAyah: () => void;
  onOpenTafsir: (ayahNumber: number) => void;
}

export const MorphologyView: React.FC<MorphologyViewProps> = ({
  currentAyah,
  scriptMode,
  onPrevAyah,
  onNextAyah,
  onSelectWordRoot,
  isPlaying,
  activePlayingWordIndex,
  onPlayAyah,
  onPauseAyah,
  onOpenTafsir
}) => {
  const [selectedWord, setSelectedWord] = useState<Word | null>(
    currentAyah.words && currentAyah.words.length > 0 ? currentAyah.words[0] : null
  );

  const urduTranslation = currentAyah.translations?.find(t => t.author_id === 'taqi_usmani') || currentAyah.translations?.[0];

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-4 py-4 space-y-5 font-ibm">
      {/* 1. TOP PINNED CARD: Full Ayah, Translation & Stepper (Strict RTL) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs">
        
        {/* Navigation & Controls: Right is Ayah detail, Left is Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
          {/* Right: Verse badge */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl font-mono">
              {currentAyah.verse_key}
            </span>
            <span className="text-slate-400 font-medium">
              صرفی و نحوی تجزیہ
            </span>
          </div>

          {/* Left: Stepper & Tafsir jump */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevAyah}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>پچھلی</span>
            </button>
            <button
              onClick={onNextAyah}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            >
              <span>اگلی</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => isPlaying ? onPauseAyah() : onPlayAyah(currentAyah)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-2xs transition-all"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'روکیں' : 'سنیں'}</span>
            </button>

            <button
              onClick={() => onOpenTafsir(currentAyah.ayah_number)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>تفسیر</span>
            </button>
          </div>
        </div>

        {/* Full Ayah Arabic Text with Clickable Interactive Words */}
        <div className="tajweed-text text-right text-2xl sm:text-3xl leading-[2.8] my-3 font-uthmani text-slate-900 dark:text-white">
          {currentAyah.words?.map((w, wIdx) => {
            const isWordActive = isPlaying && activePlayingWordIndex === wIdx;
            const isWordSelected = selectedWord?.id === w.id;

            return (
              <span
                key={w.id}
                onClick={() => setSelectedWord(w)}
                className={`inline-block mx-1 px-2 py-0.5 rounded-xl cursor-pointer transition-all ${
                  isWordSelected
                    ? 'bg-emerald-600 text-white shadow-md scale-105'
                    : isWordActive
                    ? 'bg-amber-300 dark:bg-amber-600 text-slate-900 dark:text-white scale-105'
                    : 'hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
                }`}
              >
                {w.text_uthmani}
              </span>
            );
          })}
          <span className="ayah-end-num">﴿{toArabicDigits(currentAyah.ayah_number)}﴾</span>
        </div>

        {/* Translation */}
        {urduTranslation && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
            <p className="font-ibm text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-[2.1]">
              {urduTranslation.text}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              — ترجمہ: {urduTranslation.author_name}
            </span>
          </div>
        )}
      </div>

      {/* 2. Word-by-Word Interlinear Grid (Strict RTL) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>لفظ بہ لفظ تجزیہ (Word-by-Word Breakdown)</span>
          </h2>
          <span className="text-slate-400 font-mono">
            مجموعی الفاظ: {toArabicDigits(currentAyah.words?.length || 0)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" dir="rtl">
          {currentAyah.words?.map((w, wIdx) => {
            const isWordActive = isPlaying && activePlayingWordIndex === wIdx;
            const isWordSelected = selectedWord?.id === w.id;

            return (
              <div
                key={w.id}
                onClick={() => setSelectedWord(w)}
                className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                  isWordSelected
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/30'
                    : isWordActive
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                {/* Word in Arabic */}
                <div className="text-2xl font-bold text-slate-900 dark:text-white leading-loose font-uthmani">
                  {w.text_uthmani}
                </div>

                {/* Urdu Meaning */}
                <div className="font-ibm text-xs font-semibold text-emerald-700 dark:text-emerald-400 my-1">
                  {w.translation_ur || '—'}
                </div>

                {/* Root Badge */}
                {w.root && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWordRoot(w.root!);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
                      title="Open Root Concordance"
                    >
                      جذر: {w.root}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Word Deep Grammatical Morphology Inspector (Strict RTL) */}
      {selectedWord && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100 dark:border-slate-800 text-xs">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>تفصیلی صرفی و نحوی تجزیہ</span>
            </h3>
            <span className="text-slate-400 font-mono">
              مقام: {selectedWord.location}
            </span>
          </div>

          {/* 3 Columns strictly RTL: Right is Word/Meaning, Center is Root, Left is Grammar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5" dir="rtl">
            
            {/* Column 1 (Right): Word & Meaning */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
              <span className="text-xs font-semibold text-slate-400">اللفظ والترجمة</span>
              <div className="text-3xl font-bold text-slate-900 dark:text-white font-uthmani">
                {selectedWord.text_uthmani}
              </div>
              <div className="font-ibm text-sm font-bold text-emerald-700 dark:text-emerald-400">
                اردو معنی: {selectedWord.translation_ur || '—'}
              </div>
              <div className="text-xs text-slate-500 font-sans">
                English: {selectedWord.translation_en || '—'}
              </div>
            </div>

            {/* Column 2 (Center): Root & Lemma */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
              <span className="text-xs font-semibold text-slate-400">الجذر والاشتقاق</span>
              {selectedWord.root ? (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">الجذر (Root):</span>
                    <button
                      onClick={() => onSelectWordRoot(selectedWord.root!)}
                      className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-2xs hover:bg-emerald-700 transition-colors"
                    >
                      {selectedWord.root} 🔍
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    کلک کر کے قرآن میں اس مادہ کے تمام مقامات دیکھیں۔
                  </p>
                </div>
              ) : (
                <div className="text-xs text-slate-500">جامد / حرف (No root)</div>
              )}

              {selectedWord.lemma && (
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">الكلمة المعجمية:</span> {selectedWord.lemma}
                </div>
              )}
            </div>

            {/* Column 3 (Left): Grammar Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
              <span className="text-xs font-semibold text-slate-400">الإعراب والتصنيف النحوي</span>
              <div className="inline-block px-2.5 py-0.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold">
                {selectedWord.pos_tag || 'اسم'}
              </div>
              <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                {selectedWord.grammar_details || 'اسم معرف بالإعراب'}
              </div>
              <p className="text-[10px] text-slate-400 pt-1">
                ماخوذ از: The Quranic Arabic Corpus (جامعہ لیڈز)
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
