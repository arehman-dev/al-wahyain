import React, { useState, useEffect } from 'react';
import { Play, Pause, Sparkles, BookOpen, Layers, ArrowLeft, ArrowRight } from 'lucide-react';
import { Ayah, Word, ScriptMode } from '../types/quran';
import { toArabicDigits } from '../utils/juzMapping';
import { MorphologyGraph } from './MorphologyGraph';

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

  // Sync selected word and reset scroll to top on verse change
  useEffect(() => {
    if (currentAyah.words && currentAyah.words.length > 0) {
      setSelectedWord(currentAyah.words[0]);
    } else {
      setSelectedWord(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentAyah.id, currentAyah.surah_id, currentAyah.ayah_number]);

  const urduTranslation = currentAyah.translations?.find(t => t.author_id === 'taqi_usmani') || currentAyah.translations?.[0];

  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-6 font-ibm select-text">
      {/* ======================================================== */}
      {/* 1. TOP MATN SECTION (متن و ترجمہ) — Zero Box Card        */}
      {/* ======================================================== */}
      <section className="relative pb-6 border-b border-emerald-950/10 dark:border-white/10">
        
        {/* Navigation & Controls Ribbon */}
        <div className="flex items-center justify-between gap-3 mb-4 text-xs select-none">
          {/* Right: Verse badge */}
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-emerald-850 dark:text-emerald-300">
              ۞ {currentAyah.verse_key}
            </span>
            <span className="text-slate-400 font-medium">
              • صرفی و نحوی تجزیہ
            </span>
          </div>

          {/* Left: Stepper & Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevAyah}
              title="پچھلی آیت"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>پچھلی</span>
            </button>
            <button
              onClick={onNextAyah}
              title="اگلی آیت"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span>اگلی</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => isPlaying ? onPauseAyah() : onPlayAyah(currentAyah)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'روکیں' : 'سنیں'}</span>
            </button>

            <button
              onClick={() => onOpenTafsir(currentAyah.ayah_number)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>تفسیر</span>
            </button>
          </div>
        </div>

        {/* Full Ayah Arabic Text with Clickable Interactive Words */}
        <div className="text-right text-2xl sm:text-3xl leading-[2.6] sm:leading-[2.8] my-3 font-uthmani text-slate-900 dark:text-white">
          {currentAyah.words?.map((w, wIdx) => {
            const isWordActive = isPlaying && activePlayingWordIndex === wIdx;
            const isWordSelected = selectedWord?.id === w.id;

            return (
              <span
                key={w.id}
                onClick={() => setSelectedWord(w)}
                className={`inline-block mx-1 px-2 py-0.5 rounded-lg cursor-pointer transition-all ${
                  isWordSelected
                    ? 'bg-emerald-700 text-white shadow-xs font-bold scale-105'
                    : isWordActive
                    ? 'bg-amber-300 dark:bg-amber-600 text-slate-900 dark:text-white scale-105'
                    : 'hover:bg-emerald-500/15 dark:hover:bg-emerald-400/15'
                }`}
              >
                {scriptMode === 'indopak' ? (w.text_indopak || w.text_uthmani) : w.text_uthmani}
              </span>
            );
          })}
          <span className="ayah-end-num select-none mr-2">﴿{toArabicDigits(currentAyah.ayah_number)}﴾</span>
        </div>

        {/* Translation */}
        {urduTranslation && (
          <div className="mt-3 text-right">
            <p className="urdu-nastaliq text-xl sm:text-2xl leading-[2.4] text-slate-800 dark:text-slate-200">
              {urduTranslation.text}
            </p>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-ibm mt-1 block">
              — {urduTranslation.author_name}
            </span>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 2. SELECTED WORD DEEP GRAMMATICAL INSPECTOR              */}
      {/* ======================================================== */}
      {selectedWord && (
        <section className="space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-950/8 dark:border-white/5 text-xs select-none">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>تجزیہ برائے لفظ: <span className="font-uthmani text-base text-emerald-800 dark:text-emerald-300">«{selectedWord.text_uthmani}»</span></span>
            </h3>
            <span className="text-slate-400 font-mono text-[11px]">
              مقام: {selectedWord.location}
            </span>
          </div>

          {/* 3 Pillars: Linguistic Word, Root & Concordance, Part of Speech */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir="rtl">
            
            {/* Pillar 1: Word & Meaning */}
            <div className="space-y-1.5 pb-3 border-b md:border-b-0 md:border-l border-emerald-950/8 dark:border-white/5 md:pl-4">
              <span className="text-xs font-semibold text-slate-400 block">اللفظ والترجمة</span>
              <div className="text-3xl font-bold text-slate-900 dark:text-white font-uthmani">
                {selectedWord.text_uthmani}
              </div>
              <div className="text-sm font-bold text-emerald-800 dark:text-emerald-400 leading-snug">
                {selectedWord.translation_ur || '—'}
              </div>
              <div className="text-xs text-slate-500 font-app">
                {selectedWord.translation_en || '—'}
              </div>
            </div>

            {/* Pillar 2: Root & Lemma */}
            <div className="space-y-1.5 pb-3 border-b md:border-b-0 md:border-l border-emerald-950/8 dark:border-white/5 md:pl-4">
              <span className="text-xs font-semibold text-slate-400 block">الجذر والاشتقاق</span>
              {selectedWord.root ? (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">الجذر (Root):</span>
                    <button
                      onClick={() => onSelectWordRoot(selectedWord.root!)}
                      className="px-2.5 py-0.5 rounded-lg bg-emerald-700 text-white text-xs font-bold shadow-2xs hover:bg-emerald-600 transition-colors"
                      title="قرآن میں اس مادہ کے تمام مقامات دیکھیں"
                    >
                      {selectedWord.root} 🔍
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    کلک کر کے قرآن میں اس مادہ کے تمام مقامات دیکھیں۔
                  </p>
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-medium">جامد / حرف (No root)</div>
              )}

              {selectedWord.lemma && (
                <div className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">الكلمة المعجمية:</span> {selectedWord.lemma}
                </div>
              )}
            </div>

            {/* Pillar 3: Grammar Classification */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 block">الإعراب والتصنيف النحوي</span>
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-bold">
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

          {/* 4. Morphology Graph & Decomposition Tree */}
          <div className="pt-4 border-t border-emerald-950/8 dark:border-white/5">
            <MorphologyGraph
              word={selectedWord}
              onSelectRoot={onSelectWordRoot}
            />
          </div>
        </section>
      )}
    </div>
  );
};
