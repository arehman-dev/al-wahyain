import React from 'react';
import { X, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

interface SourcesAttributionModalProps {
  onClose: () => void;
}

export const SourcesAttributionModal: React.FC<SourcesAttributionModalProps> = ({ onClose }) => {
  const sources = [
    {
      title: 'The Quranic Arabic Corpus',
      organization: 'Language Research Group, University of Leeds (Kais Dukes)',
      purpose: 'اعراب القرآن، تفصیلی صرفی تجزیہ، قرآنی جڑوں (Roots) اور لغوی قواعد کا ماخذ',
      url: 'https://corpus.quran.com',
      license: 'GNU General Public License'
    },
    {
      title: 'مجمع الملك فهد لطباعة المصحف الشريف (KFGQPC)',
      organization: 'King Fahd Glorious Quran Printing Complex, Madinah',
      purpose: 'مصحف مدینہ منورہ کے مستند خطوط، عثمانی املاء اور 604 صفحات کی معیاری تقسیم',
      url: 'https://qurancomplex.gov.sa',
      license: 'Official Verification'
    },
    {
      title: 'Tanzil Project',
      organization: 'Tanzil Quran Navigator',
      purpose: 'پاک و ہند 15 سطری مصحف اور متنِ قرآن کی اعراب کے ساتھ تصدیق شدہ ساخت',
      url: 'https://tanzil.net',
      license: 'Open Access / Creative Commons'
    },
    {
      title: 'ReadMaududi & تفہیم القرآن',
      organization: 'ReadMaududi Digital Library',
      purpose: 'تفسیر تفہیم القرآن از مولانا سید ابوالاعلیٰ مودودی مع حواشی و مقدمات',
      url: 'https://www.readmaududi.com',
      license: 'Educational / Non-profit'
    },
    {
      title: 'eQuran Library & Easy Quran wa Hadees',
      organization: 'eQuranLibrary / Easy Quran wa Hadees Software',
      purpose: 'معارف القرآن (مفتی محمد شفیع) اور تیسیر القرآن (مولانا عبدالرحمٰن کیلانی) کا مستند ذخیرہ',
      url: 'https://www.equranlibrary.com',
      license: 'Digital Islamic Archive'
    },
    {
      title: 'Quran.com API & EveryAyah',
      organization: 'Quran.com Community & EveryAyah',
      purpose: 'قاری مشاری راشد العفاسی کی صوتی تلاوت، الفاظ کی سیکنڈ وار ٹائمنگ اور تفسیر ابن کثیر',
      url: 'https://api-docs.quran.com',
      license: 'Open Islamic Data Infrastructure'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              مآخذ، مراجع اور مصدقہ روابط (Data Sources & Official Citations)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sources List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-urdu leading-relaxed">
            یہ ایپلیکیشن خالصتاً غیر تجارتی اور علمی مطالعہ کے لیے بنائی گئی ہے۔ تمام قرآنی نصوص، اعراب، صوتی تلاوت اور اردو تفاسیر درج ذیل مستند اور تصدیق شدہ اداروں کے مآخذ سے حاصل کی گئی ہیں:
          </p>

          <div className="space-y-3">
            {sources.map((s, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {s.title}
                  </span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    <span>سرکاری ویب سائٹ</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 font-sans">
                  {s.organization}
                </div>

                <div className="urdu-nastaliq text-xs text-slate-700 dark:text-slate-300 mt-1">
                  {s.purpose}
                </div>

                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  لائسنس / نوعیت: {s.license}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50 text-center">
            <p className="urdu-nastaliq text-xs text-emerald-800 dark:text-emerald-300">
              جزاهم الله خير الجزاء فی الدنیا والآخرة
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
