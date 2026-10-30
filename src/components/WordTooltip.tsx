import React from 'react';
import { Word, ScriptMode } from '../types/quran';

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
  const displayText = word.text_uthmani;

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
      <span className="font-uthmani">
        {displayText}
      </span>
    </span>
  );
};
