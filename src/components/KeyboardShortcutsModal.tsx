import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K / ⌘ + K', desc: 'قرآن و تفاسیر میں تلاش (Global Search)' },
    { key: 'Space', desc: 'تلاوت شروع / موقوف کریں (Play / Pause Audio)' },
    { key: '← / → (یا J / K)', desc: 'اگلی / پچھلی آیت پر جائیں (Next / Prev Ayah)' },
    { key: 'B', desc: 'آیت کو محفوظ کریں (Toggle Bookmark)' },
    { key: 'N', desc: 'ذاتی تفسیری نوٹ لکھیں (Add / Edit Note)' },
    { key: 'Z', desc: 'زین موڈ (Toggle Focus / Zen Mode)' },
    { key: '1 / 2 / 3', desc: 'مطالعہ موڈز تبدیل کریں (1: تفسیر، 2: مصحف، 3: صرف)' },
    { key: '?', desc: 'کی بورڈ شارٹ کٹس کا یہ جدول کھولیں' },
    { key: 'Esc', desc: 'کھلی ہوئی ونڈو یا تلاش بند کریں' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        dir="rtl"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden font-ibm"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">کی بورڈ شارٹ کٹس (Power-User Hotkeys)</h3>
              <p className="text-[11px] text-slate-400">تیز ترین اور کی بورڈ پر مبنی مطالعہ کے لیے</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 sm:p-5 space-y-2 max-h-[65vh] overflow-y-auto">
          {shortcuts.map((s, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all text-xs"
            >
              <span className="text-slate-700 dark:text-slate-300 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-mono text-[11px] font-bold shadow-xs" dir="ltr">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-center text-[11px] text-slate-400">
          شارٹ کٹس کسی بھی اسکرین پر براہِ راست کام کرتے ہیں (سوائے ٹیکسٹ فیلڈز کے)
        </div>
      </div>
    </div>
  );
};
