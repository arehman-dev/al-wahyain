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
    const findTafsirSlug = (node: Node | null, root: HTMLElement): string | undefined => {
      let el: HTMLElement | null =
        node instanceof HTMLElement ? node : node?.parentElement || null;
      while (el && el !== root) {
        if (el.dataset && el.dataset.tafsirSlug) {
          return el.dataset.tafsirSlug;
        }
        el = el.parentElement;
      }
      return undefined;
    };

    const handleMouseUp = () => {
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
          setSelectedText('');
          return;
        }

        if (containerRef.current) {
          const anchorNode = selection.anchorNode;
          const focusNode = selection.focusNode;
          if (
            !anchorNode ||
            !focusNode ||
            !containerRef.current.contains(anchorNode) ||
            !containerRef.current.contains(focusNode)
          ) {
            setPosition(null);
            setSelectedText('');
            return;
          }

          // Strictly require selection to be inside a [data-tafsir-slug] commentary block
          // Never pop up on Quran verse or translation header
          const anchorSlug = findTafsirSlug(anchorNode, containerRef.current);
          const focusSlug = findTafsirSlug(focusNode, containerRef.current);
          if (!anchorSlug || !focusSlug || anchorSlug !== focusSlug) {
            setPosition(null);
            setSelectedText('');
            return;
          }

          setActiveSlug(anchorSlug);

          try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setPosition({
              x: Math.max(110, Math.min(window.innerWidth - 110, rect.left + rect.width / 2)),
              y: Math.max(12, rect.top - 12)
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

  if (!position || !selectedText || !activeSlug) return null;

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
      dir="ltr"
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

      {/* Colors strictly from Left to Right: Yellow, Sky Blue, Light Green */}
      <div dir="ltr" className="flex items-center gap-1.5 px-1.5 border-x border-slate-700/80">
        {/* 1. Yellow */}
        <button
          onClick={() => handleColorClick('yellow')}
          title="Yellow (زرد ہائی لائٹ)"
          className="w-5 h-5 rounded-full bg-yellow-300 hover:scale-115 active:scale-95 transition-transform border border-yellow-400 shadow-xs cursor-pointer"
        />

        {/* 2. Sky Blue */}
        <button
          onClick={() => handleColorClick('blue')}
          title="Sky Blue (آسمانی نیلا ہائی لائٹ)"
          className="w-5 h-5 rounded-full bg-sky-400 hover:scale-115 active:scale-95 transition-transform border border-sky-500 shadow-xs cursor-pointer"
        />

        {/* 3. Light Green */}
        <button
          onClick={() => handleColorClick('green')}
          title="Light Green (ہلکا سبز ہائی لائٹ)"
          className="w-5 h-5 rounded-full bg-emerald-300 hover:scale-115 active:scale-95 transition-transform border border-emerald-400 shadow-xs cursor-pointer"
        />
      </div>

      {/* Copy selection */}
      <button
        onClick={handleCopy}
        title="منتخب تفسیری متن کاپی کریں"
        className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      {/* Close tooltip */}
      <button
        onClick={handleDismiss}
        title="بند کریں"
        className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
