import React, { useEffect, useState } from 'react';
import { X, Layers } from 'lucide-react';
import { RootDetail } from '../types/quran';
import { fetchRootDetails } from '../services/api';
import { loadQcfPageFont, getQcfFontFamily } from '../utils/qcfFontLoader';
import { toArabicDigits } from '../utils/juzMapping';

interface RootExplorerModalProps {
  root: string | null;
  onClose: () => void;
  onJumpToAyah: (surahId: number, ayahNumber: number) => void;
}

export const RootExplorerModal: React.FC<RootExplorerModalProps> = ({
  root,
  onClose,
  onJumpToAyah
}) => {
  const [data, setData] = useState<RootDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!root) return;
    setLoading(true);
    fetchRootDetails(root)
      .then(res => {
        setData(res);
        setLoading(false);
        if (res?.verses) {
          const uniquePages = new Set<number>();
          for (const v of res.verses) {
            if (v.page_madani) uniquePages.add(v.page_madani);
          }
          uniquePages.forEach(p => loadQcfPageFont(p, false));
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [root]);

  if (!root) return null;

  return (
    <div
      dir="rtl"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn font-ibm"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-ibm"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3.5">
            <div className="px-3.5 h-11 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg font-ibm tracking-wide">
              {root.split('').join(' ')}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 font-ibm">
                <span>مادہ و جذر الکلمۃ:</span>
                <span className="font-ibm text-emerald-600 dark:text-emerald-400 text-lg font-bold">
                  {root}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-ibm mt-0.5">
                قرآن کریم میں اس مادہ کے تمام مشتقات اور آیاتِ مبارکہ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-ibm">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-ibm animate-pulse">
              قرآنی آیات اور مادہ کی تفصیلات لوڈ کی جا رہی ہیں...
            </div>
          ) : data ? (
            <>
              {/* Summary Stats Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 font-ibm">
                    قرآن پاک میں کل تکرار (Total Occurrences)
                  </div>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 font-ibm">
                    <span className="font-app">{data.occurrences_count || data.verses?.length || 0}</span> مرتبہ
                  </div>
                </div>
                <Layers className="w-8 h-8 text-emerald-600/40" />
              </div>

              {/* Verses Concordance List */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 font-ibm">
                  آیاتِ مبارکہ جن میں یہ مادہ استعمال ہوا ہے:
                </h4>

                <div className="space-y-3.5">
                  {data.verses && data.verses.length > 0 ? (
                    data.verses.map((v, i) => {
                      const hasQcf = !!v.qcf_v2_text && !!v.page_madani;
                      const pageFont = v.page_madani ? getQcfFontFamily(v.page_madani, false) : undefined;

                      return (
                        <div
                          key={`${v.surah_id}:${v.ayah_number}:${i}`}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-emerald-500/50 transition-all flex flex-col gap-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-ibm">
                                سورۃ {v.surah_name_urdu}{' '}
                                <span className="font-app font-semibold">
                                  ({v.surah_id}:{v.ayah_number})
                                </span>
                              </span>

                              {v.word_code_v2 && v.page_madani ? (
                                <span
                                  className="px-2.5 py-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 text-xl font-qcf"
                                  style={{ fontFamily: pageFont }}
                                  dangerouslySetInnerHTML={{ __html: v.word_code_v2 }}
                                />
                              ) : v.word_text ? (
                                <span className="px-2.5 py-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 text-sm font-ibm font-bold">
                                  {v.word_text}
                                </span>
                              ) : null}
                            </div>

                            <button
                              onClick={() => {
                                onJumpToAyah(v.surah_id, v.ayah_number);
                                onClose();
                              }}
                              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-ibm shrink-0"
                            >
                              <span>آیت پر جائیں ←</span>
                            </button>
                          </div>

                          <div
                            onClick={() => {
                              onJumpToAyah(v.surah_id, v.ayah_number);
                              onClose();
                            }}
                            className="text-right text-2xl leading-[2.45] text-slate-900 dark:text-slate-100 font-qcf cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                            style={hasQcf ? { fontFamily: pageFont } : undefined}
                          >
                            {hasQcf ? (
                              <>
                                <span dangerouslySetInnerHTML={{ __html: v.qcf_v2_text! }} />
                                {v.end_code_v2 ? (
                                  <span
                                    className="ayah-end-num select-none mr-1.5 font-qcf inline-block align-middle text-emerald-700 dark:text-emerald-400"
                                    style={{ fontFamily: pageFont }}
                                    dangerouslySetInnerHTML={{ __html: v.end_code_v2 }}
                                  />
                                ) : (
                                  <span className="ayah-end-num select-none mr-1.5">
                                    ﴿{toArabicDigits(v.ayah_number)}﴾
                                  </span>
                                )}
                              </>
                            ) : (
                              <span>{v.text_uthmani}</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-400 font-ibm">
                      اس مادہ کے دیگر مقامات دستیاب نہیں ہیں۔
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
