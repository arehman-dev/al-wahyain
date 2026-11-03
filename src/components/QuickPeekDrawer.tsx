import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Ayah, TafsirEntry } from '../types/quran';
import { loadQcfPageFont, getQcfFontFamily } from '../utils/qcfFontLoader';
import { toArabicDigits } from '../utils/juzMapping';

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

  useEffect(() => {
    if (ayah?.page_madani) {
      loadQcfPageFont(ayah.page_madani, false);
    }
  }, [ayah?.page_madani]);

  if (!ayah) return null;

  const urduTranslation = ayah.translations?.find(t => t.author_id === 'taqi_usmani') || ayah.translations?.[0];
  const pageFont = ayah.page_madani ? getQcfFontFamily(ayah.page_madani, false) : undefined;

  return (
    <div
      dir="rtl"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 font-ibm"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200 font-ibm">
            سرسری مطالعہ • <span className="font-app">{ayah.verse_key}</span>
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold font-ibm">
          <button
            onClick={() => setActiveTab('tafsir')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'tafsir'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            تفاسیر (<span className="font-app">{tafasir.length}</span>)
          </button>
          <button
            onClick={() => setActiveTab('morphology')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
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
        <div
          className="text-right text-2xl font-qcf leading-[2.4] text-slate-900 dark:text-white"
          style={pageFont ? { fontFamily: pageFont } : undefined}
        >
          {ayah.words && ayah.words.length > 0 ? (
            <>
              {ayah.words.map(w => (
                <span
                  key={w.id}
                  className="inline-block mx-0.5 font-qcf"
                  style={w.page_number ? { fontFamily: getQcfFontFamily(w.page_number, false) } : undefined}
                  dangerouslySetInnerHTML={{ __html: w.code_v2 || w.text_uthmani }}
                />
              ))}
              {ayah.end_code_v2 ? (
                <span
                  className="ayah-end-num select-none mr-1.5 font-qcf inline-block align-middle text-emerald-700 dark:text-emerald-400"
                  style={pageFont ? { fontFamily: pageFont } : undefined}
                  dangerouslySetInnerHTML={{ __html: ayah.end_code_v2 }}
                />
              ) : (
                <span className="ayah-end-num select-none mr-1.5">﴿{toArabicDigits(ayah.ayah_number)}﴾</span>
              )}
            </>
          ) : (
            <span>{ayah.text_uthmani}</span>
          )}
        </div>
        {urduTranslation && (
          <p className="font-ibm text-sm text-slate-700 dark:text-slate-300 text-right mt-2 leading-relaxed">
            {urduTranslation.text}
          </p>
        )}
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-ibm">
        {activeTab === 'tafsir' ? (
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 font-ibm">تفاسیر کا خلاصہ</span>
              <button
                onClick={onOpenFullTafsir}
                className="text-xs text-emerald-600 hover:underline font-semibold cursor-pointer font-ibm"
              >
                پوری تفاسیر اسکرین پر جائیں ←
              </button>
            </div>

            <div className="space-y-4">
              {tafasir.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <div className="font-ibm font-bold text-base text-emerald-800 dark:text-emerald-400 mb-1">
                    {t.tafsir_name}
                  </div>
                  <div className="text-[11px] text-slate-400 mb-2 font-medium font-ibm">
                    {t.author_name}
                  </div>
                  <div
                    className="font-ibm text-sm text-slate-700 dark:text-slate-300 line-clamp-4 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: t.content_html }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 font-ibm">الفاظ کی صرفی تفصیل</span>
              <button
                onClick={onOpenFullMorphology}
                className="text-xs text-emerald-600 hover:underline font-semibold cursor-pointer font-ibm"
              >
                مکمل صرفی اسکرین پر جائیں ←
              </button>
            </div>

            <div className="space-y-3" dir="rtl">
              {ayah.words?.map((w) => (
                <div
                  key={w.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                >
                  <div>
                    {w.code_v2 && w.page_number ? (
                      <div
                        className="font-qcf font-bold text-2xl text-slate-900 dark:text-white"
                        style={{ fontFamily: getQcfFontFamily(w.page_number, false) }}
                        dangerouslySetInnerHTML={{ __html: w.code_v2 }}
                      />
                    ) : (
                      <div className="font-qcf font-bold text-xl text-slate-900 dark:text-white">
                        {w.text_uthmani}
                      </div>
                    )}
                    <div className="font-ibm text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {w.translation_ur || w.translation_en}
                    </div>
                  </div>

                  <div className="text-left text-xs text-slate-500 font-ibm">
                    {w.root && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold block mb-1 font-ibm">
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
