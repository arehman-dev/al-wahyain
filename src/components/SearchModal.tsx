import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Layers, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { SearchResultQuran, SearchResultTafsir } from '../types/quran';
import { searchQuran, searchTafsir } from '../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (surahId: number, ayahNumber: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const [searchTab, setSearchTab] = useState<'quran' | 'tafsir'>('quran');
  const [quranResults, setQuranResults] = useState<SearchResultQuran[]>([]);
  const [tafsirResults, setTafsirResults] = useState<SearchResultTafsir[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setQuranResults([]);
      setTafsirResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      if (searchTab === 'quran') {
        searchQuran(query)
          .then(res => {
            setQuranResults(res);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else {
        searchTafsir(query)
          .then(res => {
            setTafsirResults(res);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchTab]);

  if (!isOpen) return null;

  const highlightMatch = (text: string, q: string) => {
    if (!q || !text) return text;
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === q.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-1 py-0.5 rounded font-bold">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        dir="rtl"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[82vh] flex flex-col shadow-2xl overflow-hidden font-ibm"
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-950/40">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="قرآنی آیات، الفاظ، تراجم یا تفاسیر میں تلاش کریں (مثلاً: صبر، تقویٰ، جنت، الرحمن)..."
            className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg text-slate-900 dark:text-white placeholder-slate-400 font-medium"
          />
          {loading && <Loader2 className="w-5 h-5 text-emerald-600 animate-spin shrink-0" />}
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Search Scope Switcher Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setSearchTab('quran')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              searchTab === 'quran'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>آیات اور تراجم ({quranResults.length})</span>
          </button>
          <button
            onClick={() => setSearchTab('tafsir')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              searchTab === 'tafsir'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>۴ تفاسیر کا مواد ({tafsirResults.length})</span>
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
          {!query || query.trim().length < 2 ? (
            <div className="py-14 text-center text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-emerald-500/40" />
              <p className="text-sm font-medium">کم از کم ۲ حروف درج کریں تا کہ تلاش شروع کی جا سکے</p>
              <p className="text-xs text-slate-500">اردو اور عربی دونوں زبانوں میں تلاش معاون ہے</p>
            </div>
          ) : loading ? (
            <div className="py-14 text-center text-slate-400 space-y-2">
              <Loader2 className="w-7 h-7 mx-auto text-emerald-600 animate-spin" />
              <p className="text-xs">تلاش جاری ہے...</p>
            </div>
          ) : searchTab === 'quran' ? (
            quranResults.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                کوئی نتیجہ نہیں ملا۔ کسی دوسرے لفظ سے تلاش کریں۔
              </div>
            ) : (
              quranResults.map((item, idx) => (
                <div
                  key={`${item.surah_id}-${item.ayah_number}-${idx}`}
                  onClick={() => {
                    onSelectResult(item.surah_id, item.ayah_number);
                    onClose();
                  }}
                  className="pt-3 first:pt-0 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                      {item.surah_name_urdu} ({item.surah_name_simple})
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                      {item.verse_key}
                    </span>
                  </div>
                  <p className="font-arabic text-xl leading-relaxed text-slate-900 dark:text-slate-100 mb-1.5">
                    {highlightMatch(item.text_uthmani, query)}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {highlightMatch(item.translation_text, query)}
                  </p>
                </div>
              ))
            )
          ) : (
            tafsirResults.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                کوئی تفسیری مواد نہیں ملا۔
              </div>
            ) : (
              tafsirResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectResult(item.surah_id, item.ayah_from);
                    onClose();
                  }}
                  className="pt-3 first:pt-0 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-indigo-700 dark:text-indigo-400">
                        {item.tafsir_name}
                      </span>
                      <span className="text-xs text-slate-400">({item.author_name})</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                      {item.surah_name_urdu}: {item.ayah_from}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {highlightMatch(item.snippet, query)}
                  </p>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
