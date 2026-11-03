import React from 'react';
import { SlidersHorizontal, ArrowUp, ArrowDown, RotateCcw, X } from 'lucide-react';

export interface TafsirMetadata {
  slug: string;
  name: string;
  author: string;
}

export const ALL_KNOWN_TAFASEER: TafsirMetadata[] = [
  { slug: 'bayan_ul_quran', name: 'بیان القرآن', author: 'ڈاکٹر اسرار احمد' },
  { slug: 'tafheem', name: 'تفہیم القرآن', author: 'سید ابوالاعلیٰ مودودی' },
  { slug: 'maarif', name: 'معارف القرآن', author: 'مفتی محمد شفیع' },
  { slug: 'ibn_kathir', name: 'تفسیر ابن کثیر', author: 'علامہ ابن کثیر' },
  { slug: 'saadi', name: 'تفسیر السعدی', author: 'شیخ عبدالرحمٰن بن ناصر السعدی' },
  { slug: 'tayseer', name: 'تیسیر القرآن', author: 'مولانا عبد الرحمن کیلانی' },
];

export const DEFAULT_TAFSIR_ORDER = ['bayan_ul_quran', 'tafheem', 'maarif', 'ibn_kathir', 'saadi', 'tayseer'];

interface TafsirSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tafsirOrder: string[];
  onChangeOrder: (newOrder: string[]) => void;
  visibleTafasir: Record<string, boolean>;
  onToggleVisibility: (slug: string) => void;
  onResetDefaults: () => void;
}

export const TafsirSettingsModal: React.FC<TafsirSettingsModalProps> = ({
  isOpen,
  onClose,
  tafsirOrder,
  onChangeOrder,
  visibleTafasir,
  onToggleVisibility,
  onResetDefaults
}) => {
  if (!isOpen) return null;

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...tafsirOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    onChangeOrder(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-ibm">
      <div 
        dir="rtl"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              ترتیب اور انتخابِ تفاسیر
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          تفاسیر کے کارڈز کی ترتیب تبدیل کرنے کے لیے تیر کے نشانات استعمال کریں اور جن تفاسیر کو چھپانا ہو ان کا چیک باکس غیر فعال کریں۔
        </p>

        {/* Reorderable List */}
        <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
          {tafsirOrder.map((slug, idx) => {
            const meta = ALL_KNOWN_TAFASEER.find(t => t.slug === slug) || { slug, name: slug, author: '' };
            const isVisible = visibleTafasir[slug] !== false;

            return (
              <div
                key={slug}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isVisible
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-2xs'
                    : 'border-slate-100 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950/40 opacity-60'
                }`}
              >
                {/* Right: Checkbox & Name */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => onToggleVisibility(slug)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                    id={`check-${slug}`}
                  />
                  <label htmlFor={`check-${slug}`} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {meta.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {meta.author}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Left: Move Up / Down Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === tafsirOrder.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ڈیفالٹ پر لائیں</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl font-bold transition-colors cursor-pointer"
          >
            مکمل ہو گیا
          </button>
        </div>
      </div>
    </div>
  );
};
