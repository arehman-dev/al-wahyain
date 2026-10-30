import React, { useState, useEffect } from 'react';
import { HighlightColor } from '../types/quran';
import { Highlighter, Copy, Check, X } from 'lucide-react';

interface TextHighlighterBarProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onAddHighlight: (text: string, color: HighlightColor, tafsirSlug?: string) => void;
}

export const TextHighlighterBar: React.FC<TextHighlighterBarProps> = ({
  containerRef,
  onAddHighlight
}) => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleMouseUp = () => {
      // Small timeout so DOM selection finalizes
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.toString().trim()) {
          setPosition(null);
          setSelectedText('');
          return;
        }

        const text = selection.toString().trim();
        if (text.length < 2) {
          setPosition(null);
          return;
        }

        if (containerRef.current) {
          const anchorNode = selection.anchorNode;
          if (!anchorNode || !containerRef.current.contains(anchorNode)) {
            setPosition(null);
            return;
          }

          // Traverse upwards to find if user is inside a specific tafsir entry
          let element: HTMLElement | null = anchorNode.parentElement;
          let foundSlug: string | undefined = undefined;
          while (element && element !== containerRef.current) {
            if (element.dataset.tafsirSlug) {
              foundSlug = element.dataset.tafsirSlug;
              break;
            }
            element = element.parentElement;
          }
          setActiveSlug(foundSlug);

          try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            // Position tooltip centrally above the selected range
            setPosition({
              x: Math.max(100, Math.min(window.innerWidth - 100, rect.left + rect.width / 2)),
              y: Math.max(10, rect.top - 12)
            });
            setSelectedText(text);
          } catch {
            setPosition(null);
          }
        }
      }, 20);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      if (container) {
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('touchend', handleMouseUp);
      }
    };
  }, [containerRef]);

  if (!position || !selectedText) return null;

  const handleColorClick = (color: HighlightColor) => {
    onAddHighlight(selectedText, color, activeSlug);
    window.getSelection()?.removeAllRanges();
    setPosition(null);
    setSelectedText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      window.getSelection()?.removeAllRanges();
      setPosition(null);
      setSelectedText('');
    }, 1000);
  };

  const handleDismiss = () => {
    window.getSelection()?.removeAllRanges();
    setPosition(null);
    setSelectedText('');
  };

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)'
      }}
      className="fixed z-50 flex items-center gap-1.5 p-1.5 bg-slate-900/95 dark:bg-slate-800/95 text-white rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md animate-in fade-in zoom-in-95 font-ibm select-none"
    >
      <div className="flex items-center gap-1 px-1">
        <Highlighter className="w-3.5 h-3.5 text-emerald-400" />
      </div>

      {/* 4 Distinct Highlight Colors */}
      <div className="flex items-center gap-1.5 px-1 border-x border-slate-700/80">
        {/* Yellow / Amber */}
        <button
          onClick={() => handleColorClick('yellow')}
          title="سنہری ہائی لائٹ (Yellow)"
          className="w-5 h-5 rounded-full bg-amber-300 hover:scale-115 active:scale-95 transition-transform border border-amber-400 shadow-xs"
        />

        {/* Green / Emerald */}
        <button
          onClick={() => handleColorClick('green')}
          title="سبز ہائی لائٹ (Green)"
          className="w-5 h-5 rounded-full bg-emerald-400 hover:scale-115 active:scale-95 transition-transform border border-emerald-500 shadow-xs"
        />

        {/* Blue / Sky */}
        <button
          onClick={() => handleColorClick('blue')}
          title="نیلا ہائی لائٹ (Blue)"
          className="w-5 h-5 rounded-full bg-sky-400 hover:scale-115 active:scale-95 transition-transform border border-sky-500 shadow-xs"
        />

        {/* Purple / Violet */}
        <button
          onClick={() => handleColorClick('purple')}
          title="جامنی ہائی لائٹ (Purple)"
          className="w-5 h-5 rounded-full bg-purple-400 hover:scale-115 active:scale-95 transition-transform border border-purple-500 shadow-xs"
        />
      </div>

      {/* Copy selection */}
      <button
        onClick={handleCopy}
        title="منتخب متن کاپی کریں"
        className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      {/* Close tooltip */}
      <button
        onClick={handleDismiss}
        title="بند کریں"
        className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
