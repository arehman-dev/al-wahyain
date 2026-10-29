import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Layers } from 'lucide-react';
import { Ayah, TafsirEntry } from '../types/quran';

interface QuickPeekDrawerProps {
  ayah: Ayah | null;
  tafasir: TafsirEntry[];
  onClose: () => void;
  onOpenFullTafsir: () => void;
  onOpenFullMorphology: () => void;
}

export const QuickPeekDrawer: React.FC<QuickPeekDrawerProps> = ({
  ayah,
  tafasir,
  onClose,
  onOpenFullTafsir,
  onOpenFullMorphology
}) => {
  const [activeTab, setActiveTab] = useState<'tafsir' | 'morphology'>('tafsir');

  if (!ayah) return null;

  const urduTranslation = ayah.translations?.find(t => t.author_id === 'taqi_usmani') || ayah.translations?.[0];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
            سرسری مطالعہ • Quick Peek ({ayah.verse_key})
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('tafsir')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'tafsir'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            تفاسیر ({tafasir.length})
          </button>
          <button
            onClick={() => setActiveTab('morphology')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'morphology'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            صرف و مفردات
          </button>
        </div>
      </div>

      {/* Ayah & Translation Pinned Section */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="tajweed-text text-right text-xl font-arabic leading-loose">
          {ayah.text_uthmani}
        </div>
        {urduTranslation && (
          <p className="urdu-nastaliq text-sm text-slate-700 dark:text-slate-300 text-right mt-2">
            {urduTranslation.text}
          </p>
        )}
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {activeTab === 'tafsir' ? (
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500">تفاسیر کا خلاصہ</span>
              <button
                onClick={onOpenFullTafsir}
                className="text-xs text-emerald-600 hover:underline font-semibold"
              >
                پوری تفاسیر اسکرین پر جائیں →
              </button>
            </div>

            <div className="space-y-4">
              {tafasir.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <div className="font-urdu font-bold text-base text-emerald-800 dark:text-emerald-400 mb-1">
                    {t.tafsir_name}
                  </div>
                  <div className="text-[11px] text-slate-400 mb-2 font-medium">
                    {t.author_name}
                  </div>
                  <div
                    className="urdu-nastaliq text-sm text-slate-700 dark:text-slate-300 line-clamp-4 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: t.content_html }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500">الفاظ کی صرفی تفصیل</span>
              <button
                onClick={onOpenFullMorphology}
                className="text-xs text-emerald-600 hover:underline font-semibold"
              >
                مکمل صرفی اسکرین پر جائیں →
              </button>
            </div>

            <div className="space-y-3" dir="rtl">
              {ayah.words?.map((w) => (
                <div
                  key={w.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                >
                  <div>
                    <div className="font-arabic font-bold text-lg text-slate-900 dark:text-white">
                      {w.text_uthmani}
                    </div>
                    <div className="urdu-nastaliq text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {w.translation_ur || w.translation_en}
                    </div>
                  </div>

                  <div className="text-left text-xs text-slate-500 font-sans">
                    {w.root && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold block mb-1">
                        جذر: {w.root}
                      </span>
                    )}
                    <span>{w.grammar_details || w.pos_tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
