import React from 'react';
import { Word } from '../types/quran';
import { GitBranch, ArrowDown } from 'lucide-react';
import { getQcfFontFamily } from '../utils/qcfFontLoader';

interface MorphologyGraphProps {
  word: Word;
  onSelectRoot?: (root: string) => void;
}

interface SegmentNode {
  type: 'prefix' | 'stem' | 'suffix' | 'root';
  title_ar: string;
  title_ur: string;
  content: string;
  subtext?: string;
  badge: string;
  color: string;
}

export const MorphologyGraph: React.FC<MorphologyGraphProps> = ({
  word,
  onSelectRoot
}) => {
  const grammarParts = (word.grammar_details || '').split('•').map(s => s.trim()).filter(Boolean);

  // Decompose compound into segments based on POS and grammar details
  const segments: SegmentNode[] = [];

  // 1. Check for Prefixes (حرف جر، أداة تعريف، حرف عطف، حرف استقبال)
  const isPreposition = grammarParts.some(p => p.includes('حرف جر'));
  const isDefiniteArticle = grammarParts.some(p => p.includes('تعريف') || p.includes('أداة'));
  const isConjunction = grammarParts.some(p => p.includes('عطف'));

  if (isPreposition) {
    segments.push({
      type: 'prefix',
      title_ar: 'سابقة: حرف جر',
      title_ur: 'حرفِ جار (Preposition Prefix)',
      content: word.text_uthmani.startsWith('بِ') ? 'بِـ' : word.text_uthmani.startsWith('لِ') ? 'لِـ' : 'حرف جر',
      subtext: 'مبني على الكسر',
      badge: 'حرف جر',
      color: 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
    });
  } else if (isDefiniteArticle) {
    segments.push({
      type: 'prefix',
      title_ar: 'سابقة: أداة التعريف',
      title_ur: 'حرفِ تعریف (Definite Article)',
      content: 'الْـ',
      subtext: 'لتعريف الاسم',
      badge: 'أداة تعريف',
      color: 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
    });
  } else if (isConjunction) {
    segments.push({
      type: 'prefix',
      title_ar: 'سابقة: حرف عطف',
      title_ur: 'حرفِ عطف (Conjunction)',
      content: word.text_uthmani.startsWith('وَ') ? 'وَ' : 'فَـ',
      subtext: 'مبني على الفتح',
      badge: 'حرف عطف',
      color: 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
    });
  }

  // 2. Core Stem / الجذع (فعل أو اسم)
  const isVerb = grammarParts.some(p => p.includes('فعل'));
  const tense = grammarParts.find(p => p.includes('ماض') || p.includes('مضارع') || p.includes('أمر'));
  const irab = grammarParts.find(p => p.includes('مرفوع') || p.includes('منصوب') || p.includes('مجرور') || p.includes('مجزوم'));

  let cleanLemma = word.lemma || '';
  cleanLemma = cleanLemma.replace(/[~oaieu123]/g, '').trim();

  segments.push({
    type: 'stem',
    title_ar: isVerb ? 'الجذع: فِعْل' : 'الجذع: اسْم',
    title_ur: isVerb ? 'جذع / فعل (Verb Stem)' : 'جذع / اسم (Noun Stem)',
    content: cleanLemma || word.text_uthmani,
    subtext: [tense, irab, word.pos_tag].filter(Boolean).join(' • '),
    badge: isVerb ? 'فعل' : 'اسم',
    color: isVerb 
      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300'
      : 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
  });

  // 3. Suffix / لاحقة (ضمائر متصلة، جمع، تثنية)
  const hasPronoun = grammarParts.some(p => p.includes('ضمير') || p.includes('متكلم') || p.includes('مخاطب') || p.includes('غائب'));
  const numberGender = grammarParts.find(p => p.includes('جمع') || p.includes('مفرد') || p.includes('مذكر') || p.includes('مؤنث'));

  if (hasPronoun) {
    segments.push({
      type: 'suffix',
      title_ar: 'لاحقة: ضمير متصل',
      title_ur: 'ضمير متصل (Attached Pronoun / Suffix)',
      content: grammarParts.find(p => p.includes('ضمير')) || 'ضمير بارز',
      subtext: numberGender || 'في محل نصب / جر',
      badge: 'ضمير',
      color: 'border-purple-400 bg-purple-50/70 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300'
    });
  }

  // 4. Root Node (الجذر الثلاثي)
  if (word.root) {
    segments.push({
      type: 'root',
      title_ar: 'الجذر الأصلي',
      title_ur: 'مادہ و حروفِ اصلیہ (Trilateral Root)',
      content: word.root.split('').join(' - '),
      subtext: 'مادہ لغویہ برائے اشتقاق',
      badge: 'جذر',
      color: 'border-rose-400 bg-rose-50/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
    });
  }

  return (
    <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 font-ibm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
            الشجرة الصرفية والتركيب النحوي (Morphology Graph & Decomposition Tree)
          </h4>
        </div>
        <span className="text-slate-400 font-mono text-[11px]">
          مقام الكلمة: {word.location}
        </span>
      </div>

      {/* Visual Tree Graph Container */}
      <div className="flex flex-col items-center justify-center pt-2 pb-4">
        
        {/* Top Node: Complete Word Compound */}
        <div className="relative flex flex-col items-center">
          <div className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-emerald-500 shadow-md flex flex-col items-center">
            <span className="text-xs text-slate-400 font-medium mb-1 font-ibm">المركب اللفظي الكامل (Word Token)</span>
            {word.code_v2 && word.page_number ? (
              <span
                className="text-3xl font-bold font-qcf text-slate-900 dark:text-white"
                style={{ fontFamily: getQcfFontFamily(word.page_number, false) }}
                dangerouslySetInnerHTML={{ __html: word.code_v2 }}
              />
            ) : (
              <span className="text-3xl font-bold font-qcf text-slate-900 dark:text-white">
                {word.text_uthmani}
              </span>
            )}
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1 font-ibm">
              {word.translation_ur || word.translation_en || '—'}
            </span>
          </div>

          {/* Trunk Connector Line */}
          <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700 my-1"></div>
          <ArrowDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        </div>

        {/* Level 2: Decomposed Morpheme Segments Grid */}
        <div className="w-full mt-4">
          <div className="text-center text-xs font-bold text-slate-500 mb-3">
            تحلیلِ اجزائے کلمہ (Decomposed Morphemes & Syntactic Components)
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(4, Math.max(1, segments.length))} gap-3.5 max-w-4xl mx-auto`}>
            {segments.map((node, idx) => (
              <div
                key={`${node.type}-${idx}`}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between shadow-2xs relative ${node.color}`}
              >
                {/* Branch Accent Tag */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold">
                    {node.title_ar}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/70 dark:bg-slate-900/60 uppercase">
                    {node.badge}
                  </span>
                </div>

                {/* Node Main Glyph / Morpheme */}
                <div className="py-2 text-center">
                  {node.type === 'stem' && !cleanLemma && word.code_v2 && word.page_number ? (
                    <div
                      className="text-2xl font-bold font-qcf tracking-wide"
                      style={{ fontFamily: getQcfFontFamily(word.page_number, false) }}
                      dangerouslySetInnerHTML={{ __html: word.code_v2 }}
                    />
                  ) : (
                    <div className="text-xl font-bold font-ibm tracking-wide">
                      {node.content}
                    </div>
                  )}
                  <div className="text-xs font-semibold mt-1 opacity-90 font-ibm">
                    {node.title_ur}
                  </div>
                </div>

                {/* Node Subtext / Grammatical Case */}
                <div className="pt-2 border-t border-current/20 text-center">
                  <span className="text-[11px] font-medium opacity-80">
                    {node.subtext || '—'}
                  </span>

                  {node.type === 'root' && word.root && onSelectRoot && (
                    <button
                      onClick={() => onSelectRoot(word.root!)}
                      className="mt-2 block w-full py-1 text-center text-xs font-bold rounded-lg border border-rose-500 text-rose-700 dark:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    >
                      مادہ &quot;{word.root}&quot; کا مکمل جدول دیکھیں ←
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level 3: Grammatical Chain Summary Ribbon */}
        {word.grammar_details && (
          <div className="w-full max-w-3xl mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
              <span className="font-bold text-slate-500 ml-1">سلسلہ ترکیب و اعراب:</span>
              {grammarParts.map((part, pIdx) => (
                <React.Fragment key={pIdx}>
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold shadow-2xs">
                    {part}
                  </span>
                  {pIdx < grammarParts.length - 1 && (
                    <span className="text-emerald-500 font-bold">←</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
