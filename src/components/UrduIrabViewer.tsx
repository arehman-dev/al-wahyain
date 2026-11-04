import React, { useState, useEffect } from 'react';
import { UrduIrabResponse } from '../types/quran';
import { fetchUrduIrab } from '../services/api';
import { BookOpen, ExternalLink, GraduationCap, Loader2, Info } from 'lucide-react';

interface UrduIrabViewerProps {
  surahId: number;
  ayahNumber: number;
}

export const UrduIrabViewer: React.FC<UrduIrabViewerProps> = ({
  surahId,
  ayahNumber
}) => {
  const [data, setData] = useState<UrduIrabResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchUrduIrab(surahId, ayahNumber)
      .then(res => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [surahId, ayahNumber]);

  if (loading) {
    return (
      <div className="w-full p-8 flex items-center justify-center gap-2 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        <span className="text-xs">اعراب و لغاتِ حافظ احمد یارؒ لوڈ ہو رہا ہے...</span>
      </div>
    );
  }

  if (!data || !data.has_entry || !data.entry) {
    return (
      <div className="w-full p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-950/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
        اس آیت کے لیے لغات و اعراب کا کوئی الگ اندراج دستیاب نہیں ہے۔
      </div>
    );
  }

  const { entry } = data;

  return (
    <div 
      dir="rtl"
      className="w-full bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4 font-ibm select-text"
    >
      {/* Header & Attribution */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>{entry.title_ur}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold">
                ترکیب و اعرابِ قرآن
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              پروفیسر حافظ احمد یارؒ • لغات و اعرابِ قرآن کی روشنی میں ترجمۂ قرآن کی لغوی اور نحوی بنیادیں (مرکزی انجمن خدام القرآن)
            </p>
          </div>
        </div>

        {entry.url && (
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 text-xs transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>تنظیم ڈیجیٹل لائبریری</span>
          </a>
        )}
      </div>

      {/* Render HTML Content with Authentic Styling */}
      <div 
        className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-loose font-app overflow-x-auto space-y-3"
        dangerouslySetInnerHTML={{ __html: entry.content_html }}
      />
    </div>
  );
};
