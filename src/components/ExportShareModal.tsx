import React, { useState } from 'react';
import { Share2, Copy, Check, X, MessageSquare, BookOpen, Code } from 'lucide-react';
import { Ayah, TafsirEntry } from '../types/quran';

interface ExportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayah: Ayah | null;
  tafasir: TafsirEntry[];
}

export const ExportShareModal: React.FC<ExportShareModalProps> = ({
  isOpen,
  onClose,
  ayah,
  tafasir
}) => {
  const [format, setFormat] = useState<'whatsapp' | 'academic' | 'markdown'>('whatsapp');
  const [selectedTafsirSlug, setSelectedTafsirSlug] = useState<string>('tafheem');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !ayah) return null;

  const urduTranslation = ayah.translations?.find(t => t.author_id === 'taqi_usmani') || ayah.translations?.[0];
  const chosenTafsir = tafasir.find(t => t.tafsir_slug === selectedTafsirSlug) || tafasir[0];

  const cleanTafsirText = (html: string) => {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const getExportText = () => {
    const arabic = ayah.text_uthmani;
    const trans = urduTranslation ? urduTranslation.text : '';
    const ref = `[سورۃ ${ayah.verse_key}]`;

    if (format === 'whatsapp') {
      return `🕋 *${arabic}* ﴿${ayah.ayah_number}﴾\n\n📖 *ترجمہ:* ${trans}\n\n📌 ${ref}\n\n— مطالعہ قرآن و تقابلی تفاسیر اسٹیشن`;
    }

    if (format === 'academic') {
      const tafsirSnippet = chosenTafsir ? cleanTafsirText(chosenTafsir.content_html).slice(0, 350) + '...' : '';
      return `قال الله تعالى:\n"${arabic}" ﴿${ayah.verse_key}﴾\n\nترجمہ (مفتی محمد تقی عثمانی):\n"${trans}"\n\nتفسیر (${chosenTafsir?.tafsir_name || 'تفسیر'} — ${chosenTafsir?.author_name || ''}):\n"${tafsirSnippet}"\n\nماخذ: ${chosenTafsir?.source_attribution || 'eQuranLibrary'} (${chosenTafsir?.source_url || ''})`;
    }

    if (format === 'markdown') {
      return `### آیت مبارکہ ${ayah.verse_key}\n\n> **${arabic}**\n>\n> *${trans}*\n> — *ترجمہ: ${urduTranslation?.author_name || ''}*\n\n---\n\n#### اقتباس از ${chosenTafsir?.tafsir_name || ''}\n\n${chosenTafsir ? cleanTafsirText(chosenTafsir.content_html).slice(0, 400) + '...' : ''}\n\n*ماخذ: [${chosenTafsir?.source_attribution}](${chosenTafsir?.source_url})*`;
    }

    return '';
  };

  const textToCopy = getExportText();

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        dir="rtl"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-ibm"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">آیت و تفاسیر برآمد کریں (Export & Share)</h3>
              <p className="text-xs text-slate-400 font-mono">حوالہ: {ayah.verse_key}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30 flex gap-2 text-xs font-semibold">
          <button
            onClick={() => setFormat('whatsapp')}
            className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
              format === 'whatsapp'
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>واٹس ایپ کارڈ</span>
          </button>
          <button
            onClick={() => setFormat('academic')}
            className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
              format === 'academic'
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>تحقیقی حوالہ</span>
          </button>
          <button
            onClick={() => setFormat('markdown')}
            className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
              format === 'markdown'
                ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>مارک ڈاؤن</span>
          </button>
        </div>

        {/* Tafsir picker for academic / markdown format */}
        {format !== 'whatsapp' && tafasir.length > 0 && (
          <div className="px-5 pt-3 pb-1 flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">منتخب تفسیر:</span>
            <select
              value={selectedTafsirSlug}
              onChange={(e) => setSelectedTafsirSlug(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 font-bold"
            >
              {tafasir.map(t => (
                <option key={t.tafsir_slug} value={t.tafsir_slug}>{t.tafsir_name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Preview Container */}
        <div className="flex-1 p-5 overflow-y-auto">
          <label className="text-xs font-bold text-slate-400 block mb-2">متن کا پیش منظر (Preview):</label>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-ibm select-all">
            {textToCopy}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/50">
          <span className="text-xs text-slate-400">
            {copied ? 'متن کلپ بورڈ میں محفوظ ہو گیا!' : 'کاپی کر کے کہیں بھی چسپاں (Paste) کریں'}
          </span>
          <button
            onClick={handleCopy}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>کاپی مکمل!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>متن کاپی کریں (Copy)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
