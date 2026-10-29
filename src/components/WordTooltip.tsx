import React, { useState, useRef, useEffect } from 'react';
import { Word, ScriptMode } from '../types/quran';
import { Sparkles, Search, Volume2 } from 'lucide-react';

interface InteractiveWordProps {
  word: Word;
  scriptMode: ScriptMode;
  onSelectRoot?: (root: string) => void;
  isActive?: boolean;
  className?: string;
}

export const InteractiveWord: React.FC<InteractiveWordProps> = ({
  word,
  scriptMode,
  onSelectRoot,
  isActive = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<any>(null);

  const displayText = scriptMode === 'indopak' ? (word.text_indopak || word.text_uthmani) : word.text_uthmani;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(true), 120);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  // Close when clicked outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Format root into space-separated letters (e.g. "رحم" -> "ر - ح - م")
  const formattedRoot = word.root ? word.root.split('').join(' - ') : null;

  return (
    <span
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative inline-block cursor-pointer select-text px-1 py-0.5 rounded-lg transition-colors group ${
        isActive
          ? 'bg-amber-300 dark:bg-amber-600 text-slate-950 dark:text-white font-bold shadow-xs'
          : isOpen
          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
          : 'hover:bg-emerald-50 dark:hover:bg-slate-800/80'
      } ${className}`}
    >
      <span className={scriptMode === 'indopak' ? 'font-indopak' : ''}>
        {displayText}
      </span>

      {/* Popover Floating Tooltip */}
      {isOpen && (
        <span
          dir="rtl"
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/40 rounded-2xl shadow-xl text-right animate-in fade-in zoom-in-95 duration-150 pointer-events-auto cursor-default font-normal not-italic"
        >
          {/* Arrow Pointer */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-white dark:border-t-slate-900" />

          {/* Header Word */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xl font-bold font-arabic text-emerald-800 dark:text-emerald-400">
              {displayText}
            </span>
            {word.pos_tag && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-ibm">
                {word.pos_tag}
              </span>
            )}
          </div>

          {/* Urdu Meaning */}
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 urdu-nastaliq leading-[1.8]">
            {word.translation_ur || '—'}
          </div>

          {/* English Meaning */}
          {word.translation_en && (
            <div dir="ltr" className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5 text-left">
              {word.translation_en}
            </div>
          )}

          {/* Grammar Details if available */}
          {word.grammar_details && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-ibm leading-relaxed">
              {word.grammar_details}
            </div>
          )}

          {/* Root Linkable Badge */}
          {word.root && onSelectRoot && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-ibm">عربی مادہ (جڑ):</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onSelectRoot(word.root!);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors shadow-2xs"
                title="تمام قرآنی کلمات دیکھیں"
              >
                <span>{formattedRoot}</span>
                <Search className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          )}
        </span>
      )}
    </span>
  );
};
