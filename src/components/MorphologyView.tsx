import React, { useState } from 'react';
import { Play, Pause, Sparkles, Volume2, ArrowLeft, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { Ayah, Word, ScriptMode } from '../types/quran';

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
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Sticky Ayah Header with Audio & Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        
        {/* Navigation & Controls */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevAyah}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>پچھلی آیت</span>
            </button>
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl font-mono">
              {currentAyah.verse_key}
            </span>
            <button
              onClick={onNextAyah}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span>اگلی آیت</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Play/Pause Recitation */}
            <button
              onClick={() => isPlaying ? onPauseAyah() : onPlayAyah(currentAyah)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-sm transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'تلاوت روکو' : 'آیت سنیں'}</span>
            </button>

            {/* Jump to Tafsir */}
            <button
              onClick={() => onOpenTafsir(currentAyah.ayah_number)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>تقابلی تفاسیر</span>
            </button>
          </div>
        </div>

        {/* Full Ayah Arabic Text with Clickable Interactive Words */}
        <div className="tajweed-text text-right text-2xl sm:text-3xl leading-[2.6] font-arabic my-3">
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
                {scriptMode === 'indopak' ? w.text_indopak : w.text_uthmani}
              </span>
            );
          })}
          <span className="ayah-end-num">﴿{currentAyah.ayah_number}﴾</span>
        </div>

        {/* Translation */}
        {urduTranslation && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
            <p className="urdu-nastaliq text-base sm:text-lg text-slate-700 dark:text-slate-300">
              {urduTranslation.text}
            </p>
            <span className="text-[11px] text-slate-400">
              — ترجمہ: {urduTranslation.author_name}
            </span>
          </div>
        )}

      </div>

      {/* Word-by-Word Interlinear Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-base text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>لفظ بہ لفظ تجزیہ (Word-by-Word Breakdown)</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            مجموعی الفاظ: {currentAyah.words?.length || 0}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5" dir="rtl">
          {currentAyah.words?.map((w, wIdx) => {
            const isWordActive = isPlaying && activePlayingWordIndex === wIdx;
            const isWordSelected = selectedWord?.id === w.id;

            return (
              <div
                key={w.id}
                onClick={() => setSelectedWord(w)}
                className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
                  isWordSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/30'
                    : isWordActive
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                {/* Word in Arabic */}
                <div className="text-2xl font-arabic font-bold text-slate-900 dark:text-white leading-loose">
                  {scriptMode === 'indopak' ? w.text_indopak : w.text_uthmani}
                </div>

                {/* Urdu Meaning */}
                <div className="urdu-nastaliq text-base font-semibold text-emerald-700 dark:text-emerald-400 my-1">
                  {w.translation_ur || '—'}
                </div>

                {/* English Meaning */}
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate font-sans">
                  {w.translation_en || '—'}
                </div>

                {/* Root Badge */}
                {w.root && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWordRoot(w.root!);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
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

      {/* Selected Word Deep Grammatical Morphology Inspector */}
      {selectedWord && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>تفصیلی صرفی و نحوی تجزیہ (Grammar & Morphology Details)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              مقام: {selectedWord.location}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir="rtl">
            
            {/* Column 1: Word & Meaning */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <span className="text-xs font-semibold text-slate-400">اللفظ والترجمة</span>
              <div className="text-3xl font-bold font-arabic text-slate-900 dark:text-white">
                {scriptMode === 'indopak' ? selectedWord.text_indopak : selectedWord.text_uthmani}
              </div>
              <div className="urdu-nastaliq text-lg font-bold text-emerald-700 dark:text-emerald-400">
                اردو معنی: {selectedWord.translation_ur || '—'}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                English: {selectedWord.translation_en || '—'}
              </div>
            </div>

            {/* Column 2: Morphology & Root */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <span className="text-xs font-semibold text-slate-400">الجذر والاشتقاق</span>
              {selectedWord.root ? (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">الجذر (Root):</span>
                    <button
                      onClick={() => onSelectWordRoot(selectedWord.root!)}
                      className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors"
                    >
                      {selectedWord.root} 🔍
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    کلک کر کے قرآن پاک میں اس مادہ کے تمام مقامات دیکھیں۔
                  </p>
                </div>
              ) : (
                <div className="text-sm text-slate-500">جامد / حرف (No root)</div>
              )}

              {selectedWord.lemma && (
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">الكلمة المعجمية (Lemma):</span> {selectedWord.lemma}
                </div>
              )}
            </div>

            {/* Column 3: Traditional Arabic Grammar Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <span className="text-xs font-semibold text-slate-400">الإعراب والتصنيف النحوي</span>
              <div className="inline-block px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold font-arabic">
                {selectedWord.pos_tag || 'اسم'}
              </div>
              <div className="font-arabic text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                {selectedWord.grammar_details || 'اسم معرف بالإعراب'}
              </div>
              <p className="text-xs text-slate-400">
                ماخوذ از: The Quranic Arabic Corpus (جامعہ لیڈز)
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
