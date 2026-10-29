import React, { useEffect, useState } from 'react';
import { X, Search, BookOpen, Layers } from 'lucide-react';
import { RootDetail } from '../types/quran';
import { fetchRootDetails } from '../services/api';

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
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [root]);

  if (!root) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg font-arabic">
              {root}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>جذر الکلمۃ (Root Concordance):</span>
                <span className="font-arabic text-emerald-600 text-lg font-bold">{root}</span>
              </h3>
              <p className="text-xs text-slate-400">
                قرآن کریم میں اس مادہ کے استعمالات اور مقامات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-400 animate-pulse">
              معلومات لوڈ کی جا رہی ہیں...
            </div>
          ) : data ? (
            <>
              {/* Summary Stats Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    قرآن پاک میں کل تکرار (Total Quranic Occurrences)
                  </div>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {data.occurrences_count || data.verses?.length || 0} مرتبہ
                  </div>
                </div>
                <Layers className="w-8 h-8 text-emerald-600/40" />
              </div>

              {/* Verses Concordance List */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                  آیاتِ مبارکہ (Verses containing this root)
                </h4>

                <div className="space-y-3">
                  {data.verses && data.verses.length > 0 ? (
                    data.verses.map((v, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-urdu">
                            {v.surah_name_urdu} ({v.surah_id}:{v.ayah_number})
                          </span>

                          <button
                            onClick={() => {
                              onJumpToAyah(v.surah_id, v.ayah_number);
                              onClose();
                            }}
                            className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <span>مطالعہ کریں →</span>
                          </button>
                        </div>

                        <div className="tajweed-text text-right text-xl font-arabic leading-relaxed text-slate-800 dark:text-slate-200">
                          {v.text_uthmani}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 font-urdu">
                      دیگر مقامات جلد شامل کیے جائیں گے۔
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
