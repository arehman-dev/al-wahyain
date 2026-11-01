import React from 'react';
import { Word, ScriptMode } from '../types/quran';
import { getQcfFontFamily } from '../utils/qcfFontLoader';

interface InteractiveWordProps {
  word: Word;
  scriptMode: ScriptMode;
  onSelectRoot?: (root: string) => void;
  isActive?: boolean;
  className?: string;
  useQcf?: boolean;
}

export const InteractiveWord: React.FC<InteractiveWordProps> = ({
  word,
  scriptMode,
  onSelectRoot,
  isActive = false,
  className = '',
  useQcf = true
}) => {
  const isIndoPak = scriptMode === 'indopak';
  const hasQcf = useQcf && !isIndoPak && !!word.code_v2 && !!word.page_number;

  const displayText = isIndoPak 
    ? (word.text_indopak || word.text_uthmani)
    : hasQcf 
    ? word.code_v2 
    : word.text_uthmani;

  const fontStyle = hasQcf
    ? { fontFamily: getQcfFontFamily(word.page_number) }
    : undefined;

  const fontClass = isIndoPak
    ? 'font-indopak'
    : hasQcf
    ? 'font-qcf'
    : 'font-uthmani';

  const handleClick = (e: React.MouseEvent) => {
    if (word.root && onSelectRoot) {
      e.stopPropagation();
      onSelectRoot(word.root);
    }
  };

  return (
    <span
      onClick={handleClick}
      className={`inline-block select-text px-1 py-0.5 rounded-lg transition-all duration-150 ${
        isActive
          ? 'bg-amber-300/90 dark:bg-amber-500/90 text-slate-950 dark:text-slate-950 font-bold ring-2 ring-amber-400 shadow-sm scale-105 z-10'
          : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
      } ${className}`}
    >
      <span className={fontClass} style={fontStyle}>
        {displayText}
      </span>
    </span>
  );
};
