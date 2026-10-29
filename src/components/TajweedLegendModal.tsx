import React from 'react';
import { X, Palette } from 'lucide-react';

interface TajweedLegendModalProps {
  onClose: () => void;
}

export const TajweedLegendModal: React.FC<TajweedLegendModalProps> = ({ onClose }) => {
  const rules = [
    {
      name: 'مد لازم و مد متصل (Madd Necessary & Mandatory)',
      duration: '4 تا 6 حرکات',
      color: '#e11d48',
      example: 'السَّمَاءِ • جَاءَتْ',
      desc: 'حرفِ مد کے بعد ہمزہ یا سکونِ اصلی آنے پر طویل مد کی جاتی ہے۔'
    },
    {
      name: 'مد طبیعی (Madd Normal)',
      duration: '2 حرکات',
      color: '#d97706',
      example: 'قَالَ • يَقُولُ • قِيلَ',
      desc: 'الف، واو یا یاء مدہ کو اصلی لمبائی (دو حرکات) کے برابر کھینچا جاتا ہے۔'
    },
    {
      name: 'غنہ، اخفاء اور ادغام بغنہ (Ghunnah & Ikhfa)',
      duration: '2 حرکات',
      color: '#16a34a',
      example: 'مِن قَبْلُ • إِنَّ • مَن يَقُولُ',
      desc: 'نون ساکن، تنوین یا نون/میم مشدد پر ناک سے آواز نکال کر غنہ کیا جاتا ہے۔'
    },
    {
      name: 'قلقلہ (Qalqalah - Echoing sound)',
      duration: 'جھٹکا / گونج',
      color: '#0284c7',
      example: 'قُطْبُ جَدٍّ (ق، ط، ب، ج، د)',
      desc: 'حروفِ قلقلہ جب ساکن ہوں تو مخرج میں جھٹکا دے کر گونج پیدا کی جاتی ہے۔'
    },
    {
      name: 'اقلاب (Iqlab)',
      duration: 'میم میں تبدیلی',
      color: '#2563eb',
      example: 'مِن بَعْدِ',
      desc: 'نون ساکن یا تنوین کے بعد باء آنے پر اسے میم مخفا سے بدل دیا جاتا ہے۔'
    },
    {
      name: 'حروف غیر ملفوظ (Silent Letters / Hamzat Wasl)',
      duration: 'پڑھا نہیں جائے گا',
      color: '#94a3b8',
      example: 'وَاسْتَغْفِرْ • الشَّمْسِ',
      desc: 'ملانے کی صورت میں ہمزہ وصل اور لام شمسیہ کا تلفظ ساکط ہو جاتا ہے۔'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              رموزِ تجوید اور رنگوں کی رہنمائی (Tajweed Color Rules)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" dir="rtl">
          {rules.map((r, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full shadow-sm shrink-0"
                    style={{ backgroundColor: r.color }}
                  ></span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {r.name}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {r.duration}
                </span>
              </div>

              <div className="text-right text-lg font-arabic font-bold my-1" style={{ color: r.color }}>
                مثال: {r.example}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 urdu-nastaliq">
                {r.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
