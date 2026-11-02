import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { Ayah, Word, ScriptMode } from '../types/quran';
import { toArabicDigits } from '../utils/juzMapping';
import { MorphologyGraph } from './MorphologyGraph';
import { loadQcfPageFont, getQcfFontFamily } from '../utils/qcfFontLoader';

interface MorphologyViewProps {
  currentAyah: Ayah;
  scriptMode?: ScriptMode;
  showTajweed?: boolean;
  onPrevAyah?: () => void;
  onNextAyah?: () => void;
  onSelectWordRoot: (root: string) => void;
  isPlaying: boolean;
  activePlayingWordIndex: number | null;
  onPlayAyah?: (ayah: Ayah) => void;
  onPauseAyah?: () => void;
  onOpenTafsir?: (ayahNumber: number) => void;
}

export const MorphologyView: React.FC<MorphologyViewProps> = ({
  currentAyah,
  showTajweed = false,
  onSelectWordRoot,
  isPlaying,
  activePlayingWordIndex
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

  // Preload King Fahd Complex QCF V2 / V4 Tajweed page font for active verse
  useEffect(() => {
    if (currentAyah.page_madani) {
      loadQcfPageFont(currentAyah.page_madani, showTajweed);
    }
  }, [currentAyah.page_madani, showTajweed]);

  const urduTranslation = currentAyah.translations?.find(t => t.author_id === 'taqi_usmani') || currentAyah.translations?.[0];

  return (
    <div dir="rtl" className="w-full py-4 space-y-6 font-ibm select-text">
      {/* ======================================================== */}
      {/* 1. TOP MATN SECTION (متن و ترجمہ) — Zero Box Card        */}
      {/* ======================================================== */}
      <section className="relative pb-6 border-b border-emerald-950/10 dark:border-white/10">
        
        {/* Verse Reference Metadata Only (Zero Extra Control Bars) */}
        <div className="flex items-center justify-between gap-3 mb-3 text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400">
              ۞ {currentAyah.verse_key}
            </span>
            <span className="text-slate-400 font-medium">
              • صرفی و نحوی تجزیہ (کسی بھی لفظ پر کلک کریں)
            </span>
          </div>
        </div>

        {/* Full Ayah Arabic Text with Clickable Interactive Words (Pure QCF V2 / V4, No Boxes) */}
        <div className="text-right text-2xl sm:text-3xl leading-[2.6] sm:leading-[2.85] my-3 text-slate-900 dark:text-white cursor-pointer">
          {currentAyah.words?.map((w, wIdx) => {
            const isWordActive = isPlaying && activePlayingWordIndex === wIdx;
            const isWordSelected = selectedWord?.id === w.id;
            const hasQcf = !!w.code_v2 && !!w.page_number;
            const displayText = hasQcf ? w.code_v2 : w.text_uthmani;
            const fontStyle = hasQcf ? { fontFamily: getQcfFontFamily(w.page_number, showTajweed) } : undefined;

            const colorClass = showTajweed
              ? isWordSelected
                ? 'qcf-tajweed-word-selected'
                : isWordActive
                ? 'qcf-tajweed-word-active'
                : 'qcf-tajweed-word'
              : isWordSelected
              ? 'text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/60 decoration-2 underline-offset-8'
              : isWordActive
              ? 'text-amber-600 dark:text-amber-400'
              : 'hover:text-[#2ca4ab] dark:hover:text-[#2ca4ab]';

            return (
              <span
                key={w.id}
                onClick={() => setSelectedWord(w)}
                style={fontStyle}
                className={`inline-block mx-1 px-0.5 cursor-pointer transition-colors font-qcf ${colorClass}`}
                dangerouslySetInnerHTML={{ __html: displayText || '' }}
              />
            );
          })}
          {currentAyah.end_code_v2 ? (
            <span 
              className="ayah-end-num select-none mr-2 font-qcf inline-block align-middle cursor-pointer text-emerald-700 dark:text-emerald-400"
              style={{ fontFamily: getQcfFontFamily(currentAyah.page_madani, showTajweed) }}
              dangerouslySetInnerHTML={{ __html: currentAyah.end_code_v2 }}
            />
          ) : (
            <span className="ayah-end-num select-none mr-2 cursor-pointer">﴿{toArabicDigits(currentAyah.ayah_number)}﴾</span>
          )}
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
              <span>
                تجزیہ برائے لفظ:{' '}
                <span
                  className="font-qcf text-xl text-emerald-800 dark:text-emerald-300 mx-1"
                  style={
                    selectedWord.code_v2 && selectedWord.page_number
                      ? { fontFamily: getQcfFontFamily(selectedWord.page_number, showTajweed) }
                      : undefined
                  }
                  dangerouslySetInnerHTML={{
                    __html: selectedWord.code_v2 && selectedWord.page_number ? selectedWord.code_v2 : selectedWord.text_uthmani
                  }}
                />
              </span>
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
              {(() => {
                const hasSelQcf = !!selectedWord.code_v2 && !!selectedWord.page_number;
                const selDisplayText = hasSelQcf ? selectedWord.code_v2 : selectedWord.text_uthmani;
                const selFontStyle = hasSelQcf ? { fontFamily: getQcfFontFamily(selectedWord.page_number, showTajweed) } : undefined;

                return (
                  <div 
                    className="text-3xl font-bold text-slate-900 dark:text-white font-qcf cursor-pointer"
                    style={selFontStyle}
                    dangerouslySetInnerHTML={{ __html: selDisplayText || '' }}
                  />
                );
              })()}
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
                      className="px-2.5 py-0.5 rounded-lg bg-emerald-700 text-white text-xs font-bold shadow-2xs hover:bg-emerald-600 transition-colors cursor-pointer"
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
