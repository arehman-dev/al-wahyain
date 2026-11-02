import React from 'react';
import { Word, ScriptMode } from '../types/quran';
import { getQcfFontFamily } from '../utils/qcfFontLoader';

interface InteractiveWordProps {
  word: Word;
  scriptMode?: ScriptMode;
  showTajweed?: boolean;
  onSelectRoot?: (root: string) => void;
  isActive?: boolean;
  isVerseSelected?: boolean;
  className?: string;
  useQcf?: boolean;
}

export const InteractiveWord: React.FC<InteractiveWordProps> = ({
  word,
  showTajweed = false,
  onSelectRoot,
  isActive = false,
  isVerseSelected = false,
  className = ''
}) => {
  const hasQcf = !!word.code_v2 && !!word.page_number;
  const displayText = hasQcf ? word.code_v2 : word.text_uthmani;

  const fontStyle = hasQcf
    ? { fontFamily: getQcfFontFamily(word.page_number, showTajweed) }
    : undefined;

  const handleClick = (e: React.MouseEvent) => {
    if (word.root && onSelectRoot) {
      e.stopPropagation();
      onSelectRoot(word.root);
    }
  };

  // Non-boxed text-color-only highlighting (Quran.com style)
  // For COLRv1 Tajweed V4 font, CSS classes .qcf-tajweed-word handle hover/active via text-shadow
  const colorClasses = showTajweed
    ? isActive
      ? 'qcf-tajweed-word-active'
      : 'qcf-tajweed-word'
    : isActive
    ? 'text-amber-600 dark:text-amber-400'
    : isVerseSelected
    ? 'text-emerald-700 dark:text-emerald-400 hover:text-amber-600 dark:hover:text-amber-300'
    : 'hover:text-[#2ca4ab] dark:hover:text-[#2ca4ab]';

  return (
    <span
      onClick={handleClick}
      className={`inline-block cursor-pointer px-0.5 transition-colors duration-150 ${colorClasses} ${className}`}
    >
      <span
        className="font-qcf cursor-pointer"
        style={fontStyle}
        dangerouslySetInnerHTML={{ __html: displayText || '' }}
      />
    </span>
  );
};
