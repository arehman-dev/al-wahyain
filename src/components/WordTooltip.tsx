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
      className={`inline-block select-text px-0.5 rounded transition-colors ${
        isActive
          ? 'bg-amber-300 dark:bg-amber-600 text-slate-950 dark:text-white font-bold shadow-xs'
          : ''
      } ${className}`}
    >
      <span className="font-uthmani">
        {displayText}
      </span>
    </span>
  );
};
