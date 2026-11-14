import React from 'react';
import { X, Keyboard, SlidersHorizontal } from 'lucide-react';
import { NavArrowMode, CustomShortcutsMap } from '../types/shortcuts';
import { 
  SHORTCUT_DEFINITIONS, 
  getEffectiveShortcut, 
  formatKeyForDisplay 
} from '../utils/shortcutsHelper';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  navArrowMode?: NavArrowMode;
  customShortcuts?: CustomShortcutsMap;
  onOpenPreferences?: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  navArrowMode = 'rtl',
  customShortcuts = {},
  onOpenPreferences
}) => {
  if (!isOpen) return null;

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
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">کی بورڈ شارٹ کٹس (Keyboard Hotkeys)</h3>
              <p className="text-[11px] text-slate-400">
                سمتِ رُخ: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{navArrowMode === 'rtl' ? 'قرآنی سمت (RTL)' : 'معیاری سمت (LTR)'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="بند کریں"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 sm:p-5 space-y-2 max-h-[60vh] overflow-y-auto">
          {SHORTCUT_DEFINITIONS.map((def) => {
            const effectiveKey = getEffectiveShortcut(def.id, customShortcuts, navArrowMode);
            const isCustomized = Boolean(customShortcuts[def.id]);

            return (
              <div 
                key={def.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{def.nameUrdu}</span>
                    <span className="text-[10px] text-slate-400">({def.nameEn})</span>
                    {isCustomized && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-medium">
                        تخصیص
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{def.descriptionUrdu}</p>
                </div>
                <kbd className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-mono text-[11px] font-bold shadow-xs shrink-0" dir="ltr">
                  {formatKeyForDisplay(effectiveKey)}
                </kbd>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            ٹیکسٹ فیلڈز کے علاوہ ہر اسکرین پر فعال ہیں
          </span>
          {onOpenPreferences && (
            <button
              onClick={() => {
                onClose();
                onOpenPreferences();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold transition-all cursor-pointer text-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>شارٹ کٹس میں ترمیم کریں</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
