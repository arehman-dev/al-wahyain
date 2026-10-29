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
    const handleSelectionChange = () => {
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

      // Check if selection is within our container
      if (containerRef.current) {
        const anchorNode = selection.anchorNode;
        if (!anchorNode || !containerRef.current.contains(anchorNode)) {
          setPosition(null);
          return;
        }

        // Find closest tafsir-slug container if any
        let element = anchorNode.parentElement;
        let foundSlug: string | undefined = undefined;
        while (element && element !== containerRef.current) {
          if (element.dataset.tafsirSlug) {
            foundSlug = element.dataset.tafsirSlug;
            break;
          }
          element = element.parentElement;
        }
        setActiveSlug(foundSlug);

        // Position toolbar above the selection range
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
          });
          setSelectedText(text);
        } catch {
          setPosition(null);
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
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
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)'
      }}
      className="z-50 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 select-none font-ibm"
    >
      <div className="flex items-center gap-1 pl-1 pr-1.5 text-xs text-slate-400 border-r border-slate-200 dark:border-slate-800">
        <Highlighter className="w-3.5 h-3.5 text-emerald-500" />
        <span className="hidden sm:inline">ہائی لائٹ:</span>
      </div>

      {/* 4 Palette Colors */}
      <button
        onClick={() => handleColorClick('yellow')}
        title="سنہری ہائی لائٹ"
        className="w-5 h-5 rounded-full bg-amber-400 hover:scale-115 border-2 border-white dark:border-slate-800 transition-transform shadow-xs"
      />
      <button
        onClick={() => handleColorClick('green')}
        title="سبز ہائی لائٹ"
        className="w-5 h-5 rounded-full bg-emerald-500 hover:scale-115 border-2 border-white dark:border-slate-800 transition-transform shadow-xs"
      />
      <button
        onClick={() => handleColorClick('blue')}
        title="نیلا ہائی لائٹ"
        className="w-5 h-5 rounded-full bg-sky-500 hover:scale-115 border-2 border-white dark:border-slate-800 transition-transform shadow-xs"
      />
      <button
        onClick={() => handleColorClick('purple')}
        title="جامنی ہائی لائٹ"
        className="w-5 h-5 rounded-full bg-purple-500 hover:scale-115 border-2 border-white dark:border-slate-800 transition-transform shadow-xs"
      />

      <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

      {/* Copy selection */}
      <button
        onClick={handleCopy}
        title="منتخب متن کاپی کریں"
        className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        title="بند کریں"
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
