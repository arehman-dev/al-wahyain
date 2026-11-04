import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  BookOpen, 
  Layers, 
  Loader2, 
  Sparkles, 
  Compass, 
  SlidersHorizontal,
  Bookmark,
  Check,
  Hash,
  Filter,
  ScrollText
} from 'lucide-react';
import { 
  SearchResultQuran, 
  SearchResultTafsir, 
  SurahDispersion,
  AutocompleteResponse,
  HadithSearchResult
} from '../types/quran';
import { searchLexical, searchTafsir, fetchAutocomplete, searchHadith } from '../services/api';
import { THEMATIC_TOPICS } from '../data/thematicIndex';
import { SurahDispersionHeatmap } from './SurahDispersionHeatmap';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (surahId: number, ayahNumber: number) => void;
  onSelectHadithResult?: (bookSlug: string, hadithNumber: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
  onSelectHadithResult
}) => {
  const [query, setQuery] = useState('');
  const [searchTab, setSearchTab] = useState<'lexical' | 'hadith' | 'tafsir' | 'thematic'>('lexical');
  const [strictDiacritics, setStrictDiacritics] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lexical Search State
  const [lexicalResults, setLexicalResults] = useState<SearchResultQuran[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [dispersion, setDispersion] = useState<SurahDispersion[]>([]);
  const [activeSurahFilter, setActiveSurahFilter] = useState<number | null>(null);

  // Hadith Search State
  const [hadithResults, setHadithResults] = useState<HadithSearchResult[]>([]);
  const [hadithBookFilter, setHadithBookFilter] = useState<string>('all');
  const [hadithTotal, setHadithTotal] = useState(0);

  // Autocomplete State
  const [autocomplete, setAutocomplete] = useState<AutocompleteResponse | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Tafsir & Thematic States
  const [tafsirResults, setTafsirResults] = useState<SearchResultTafsir[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close autocomplete
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Autocomplete when typing in lexical mode
  useEffect(() => {
    if (searchTab !== 'lexical' || !query.trim() || query.trim().length < 1) {
      setAutocomplete(null);
      setShowAutocomplete(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchAutocomplete(query)
        .then(data => {
          if (data.roots.length > 0 || data.words.length > 0 || data.surahs.length > 0) {
            setAutocomplete(data);
            setShowAutocomplete(true);
          } else {
            setShowAutocomplete(false);
          }
        })
        .catch(() => setShowAutocomplete(false));
    }, 150);

    return () => clearTimeout(timer);
  }, [query, searchTab]);

  // Perform Search Debounce
  useEffect(() => {
    if (searchTab === 'thematic') return;

    if (!query || query.trim().length < 1) {
      setLexicalResults([]);
      setTotalMatches(0);
      setDispersion([]);
      setTafsirResults([]);
      setHadithResults([]);
      setHadithTotal(0);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      if (searchTab === 'lexical') {
        searchLexical(query, strictDiacritics, 100)
          .then(res => {
            setLexicalResults(res.results);
            setTotalMatches(res.total);
            setDispersion(res.dispersion);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else if (searchTab === 'hadith') {
        searchHadith(query, hadithBookFilter === 'all' ? null : hadithBookFilter, 60)
          .then(res => {
            setHadithResults(res.results);
            setHadithTotal(res.total);
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
    }, 280);

    return () => clearTimeout(timer);
  }, [query, searchTab, strictDiacritics, hadithBookFilter]);

  if (!isOpen) return null;

  const handleSelectAutocomplete = (text: string) => {
    setQuery(text);
    setShowAutocomplete(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const categories = ['all', ...Array.from(new Set(THEMATIC_TOPICS.map(t => t.category)))];

  const filteredTopics = THEMATIC_TOPICS.filter(t => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    if (!matchesCat) return false;
    if (!query.trim()) return true;
    const qLower = query.toLowerCase();
    return (
      t.title_ur.toLowerCase().includes(qLower) ||
      t.title_en.toLowerCase().includes(qLower) ||
      t.description_ur.toLowerCase().includes(qLower) ||
      t.verse_key.includes(qLower)
    );
  });

  // Filter lexical results by selected Surah if any
  const displayedLexicalResults = activeSurahFilter
    ? lexicalResults.filter(r => r.surah_id === activeSurahFilter)
    : lexicalResults;

  const syntaxChips = [
    { label: 'روٹ: كتب', query: 'root:كتب', desc: 'جذر سے تمام الفاظ' },
    { label: 'مادہ: كتاب', query: 'lem:كتاب', desc: 'ڈکشنری مادہ تلاش' },
    { label: '"رسول الله"', query: '"رسول الله"', desc: 'ہوبہو مکمل جملہ' },
    { label: 'مس*ون', query: 'مس*ون', desc: 'وائلڈ کارڈ تلاش' },
    { label: 'ت?ون', query: 'ت?ون', desc: 'ایک حرفی وائلڈ کارڈ' },
    { label: 'كتاب | ميزان', query: 'كتاب | ميزان', desc: 'یا (Logical OR)' },
    { label: 'كتاب -توراة', query: 'كتاب -توراة', desc: 'استثناء (Logical NOT)' },
    { label: 'NEAR(نور, ظلمات, 5)', query: 'NEAR(نور, ظلمات, 5)', desc: 'باہمی قربت' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-14 p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div 
        dir="rtl"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden font-ibm"
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5 sm:gap-3 bg-slate-50/50 dark:bg-slate-950/40 relative">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          
          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (autocomplete && (autocomplete.roots.length > 0 || autocomplete.words.length > 0)) {
                setShowAutocomplete(true);
              }
            }}
            placeholder={
              searchTab === 'lexical'
                ? "لفظی تلاش (مثلاً: كتب، root:رحم، مس*ون، \"رسول الله\"، كتاب | ميزان)..."
                : searchTab === 'hadith'
                ? "۸ کتبِ حدیث میں تلاش (عربی، اردو، یا English)..."
                : searchTab === 'tafsir'
                ? "۵ مستند تفاسیر میں تلاش کریں..."
                : "مضامینِ قرآن میں تلاش کریں..."
            }
            className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg text-slate-900 dark:text-white placeholder-slate-400 font-medium"
          />

          {loading && <Loader2 className="w-5 h-5 text-emerald-600 animate-spin shrink-0" />}

          {/* Strict Diacritics Toggle (Harakat) */}
          {searchTab === 'lexical' && (
            <button
              type="button"
              onClick={() => setStrictDiacritics(prev => !prev)}
              title={strictDiacritics ? "اعراب حساس تلاش فعال ہے (Strict Tashkeel)" : "اعراب غیر حساس تلاش (Normalized Arabic)"}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border ${
                strictDiacritics
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300'
              }`}
            >
              <span>اعراب</span>
              {strictDiacritics && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            </button>
          )}

          {query && (
            <button 
              onClick={() => {
                setQuery('');
                setShowAutocomplete(false);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            ESC
          </button>

          {/* Typeahead Autocomplete Dropdown */}
          {showAutocomplete && autocomplete && (
            <div 
              ref={autocompleteRef}
              className="absolute top-full right-4 left-4 z-50 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 max-h-72 overflow-y-auto font-ibm"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* 1. Root Suggestions */}
                {autocomplete.roots.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-emerald-500" />
                      <span>قرآنی روٹس (Roots)</span>
                    </div>
                    <div className="space-y-1">
                      {autocomplete.roots.map((r) => (
                        <button
                          key={r.root}
                          onClick={() => handleSelectAutocomplete(`root:${r.root}`)}
                          className="w-full text-right px-2.5 py-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer group"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600">
                            جذر: <span className="font-qcf text-sm">{r.root_arabic || r.root}</span>
                          </span>
                          <span className="text-[10px] font-app font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                            {r.occurrences_count} آیات
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Word Token Suggestions */}
                {autocomplete.words.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>قرآنی الفاظ (Exact Tokens)</span>
                    </div>
                    <div className="space-y-1">
                      {autocomplete.words.slice(0, 6).map((w) => (
                        <button
                          key={w.token_uthmani}
                          onClick={() => handleSelectAutocomplete(w.token_clean)}
                          className="w-full text-right px-2.5 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer group"
                        >
                          <span className="text-sm font-qcf text-slate-800 dark:text-slate-200 group-hover:text-amber-600">
                            {w.token_uthmani}
                          </span>
                          <span className="text-[10px] font-app font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {w.occurrences_count} مرتبہ
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Surah Suggestions */}
                {autocomplete.surahs.length > 0 && (
                  <div className="col-span-full border-t border-slate-100 dark:border-slate-800 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {autocomplete.surahs.map(s => (
                        <button
                          key={s.id}
                          onClick={() => {
                            onSelectResult(s.id, 1);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer"
                        >
                          سورة {s.name_urdu} ({s.id})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

        {/* Syntax Operator Chips (Only in Lexical Tab) */}
        {searchTab === 'lexical' && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/30 overflow-x-auto text-[11px] select-none">
            <span className="text-[10px] text-slate-400 font-bold shrink-0 ml-1">تلاش کے طریقے:</span>
            {syntaxChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setQuery(chip.query);
                  if (inputRef.current) inputRef.current.focus();
                }}
                title={chip.desc}
                className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono text-[10.5px] transition-all whitespace-nowrap cursor-pointer shadow-2xs"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Search Scope Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 text-xs font-semibold overflow-x-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setSearchTab('lexical')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                searchTab === 'lexical'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>لفظی و صرفی تلاش {totalMatches > 0 ? `(${totalMatches})` : ''}</span>
            </button>
            <button
              onClick={() => setSearchTab('hadith')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                searchTab === 'hadith'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <ScrollText className="w-4 h-4" />
              <span>۸ کتبِ حدیث {hadithTotal > 0 ? `(${hadithTotal})` : ''}</span>
            </button>
            <button
              onClick={() => setSearchTab('tafsir')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                searchTab === 'tafsir'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>۵ تفاسیر کا مواد FTS5 {tafsirResults.length > 0 ? `(${tafsirResults.length})` : ''}</span>
            </button>
            <button
              onClick={() => setSearchTab('thematic')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                searchTab === 'thematic'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>مضامینِ قرآن ({THEMATIC_TOPICS.length})</span>
            </button>
          </div>
        </div>

        {/* 114 Surah Dispersion Heatmap (Lexical Mode) */}
        {searchTab === 'lexical' && dispersion.length > 0 && totalMatches > 0 && (
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <SurahDispersionHeatmap
              dispersion={dispersion}
              totalMatches={totalMatches}
              activeSurahFilter={activeSurahFilter}
              onSelectSurahFilter={(sId) => setActiveSurahFilter(sId)}
            />
          </div>
        )}

        {/* Hadith Book Filter Bar */}
        {searchTab === 'hadith' && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/30 overflow-x-auto text-xs select-none">
            <span className="text-[11px] text-slate-400 font-bold shrink-0 ml-1">کتاب فلٹر:</span>
            {[
              { slug: 'all', label: 'تمام کتب (All 8 Books)' },
              { slug: 'bukhari', label: 'صحیح بخاری' },
              { slug: 'muslim', label: 'صحیح مسلم' },
              { slug: 'abudawud', label: 'سنن ابو داؤد' },
              { slug: 'tirmidhi', label: 'جامع ترمذی' },
              { slug: 'nasai', label: 'سنن نسائی' },
              { slug: 'ibnmajah', label: 'سنن ابن ماجہ' },
              { slug: 'malik', label: 'موطا مالک' },
              { slug: 'mishkat', label: 'مشکوٰۃ' }
            ].map((b) => (
              <button
                key={b.slug}
                onClick={() => setHadithBookFilter(b.slug)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  hadithBookFilter === b.slug
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}

        {/* Thematic Category Filter Bar */}
        {searchTab === 'thematic' && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/30 overflow-x-auto text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium border transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat === 'all' ? 'تمام موضوعات' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
          
          {/* A. LEXICAL SEARCH RESULTS */}
          {searchTab === 'lexical' && (
            displayedLexicalResults.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                {query.trim() 
                  ? "اس تلاش کے مطابق کوئی قرآنی آیت نہیں ملی۔" 
                  : "اوپر تلاش باکس میں کوئی لفظ، روٹ (root:كتب) یا وائلڈ کارڈ درج کریں۔"}
              </div>
            ) : (
              displayedLexicalResults.map((item) => (
                <div
                  key={`${item.surah_id}-${item.ayah_number}`}
                  onClick={() => {
                    onSelectResult(item.surah_id, item.ayah_number);
                    onClose();
                  }}
                  className="pt-3.5 first:pt-0 p-3.5 rounded-2xl hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 cursor-pointer transition-all border border-transparent hover:border-emerald-200 dark:hover:border-slate-700/60 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <span>سورة {item.surah_name_urdu}</span>
                      <span className="text-slate-400 font-normal">({item.surah_name_simple})</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                      {item.verse_key}
                    </span>
                  </div>

                  {/* Quranic Arabic Text */}
                  <p 
                    dir="rtl"
                    className="text-lg sm:text-xl font-qcf text-slate-900 dark:text-slate-100 leading-loose mb-2.5 text-right"
                  >
                    {item.text_uthmani}
                  </p>

                  {/* Urdu Translation */}
                  {item.translation_text && (
                    <p 
                      dir="rtl"
                      className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-app leading-relaxed"
                    >
                      {item.translation_text}
                    </p>
                  )}
                </div>
              ))
            )
          )}

          {/* HADITH RESULTS */}
          {searchTab === 'hadith' && (
            hadithResults.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                {query.trim() 
                  ? "کتبِ حدیث میں اس لفظ یا عبارت کا اندراج نہیں ملا۔" 
                  : "کتبِ حدیث میں تلاش کے لیے الفاظ (عربی، اردو یا انگریزی) درج فرمائیں۔"}
              </div>
            ) : (
              hadithResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHadithResult?.(item.book_slug, item.hadith_number);
                    onClose();
                  }}
                  className="pt-3.5 first:pt-0 p-3.5 rounded-2xl hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 cursor-pointer transition-all border border-transparent hover:border-emerald-200 dark:hover:border-slate-700/60 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {item.book_name_urdu}
                      </span>
                      {item.chapter_title_arabic && (
                        <span dir="rtl" className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium truncate max-w-xs">
                          {item.chapter_title_arabic}
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                      حدیث #{item.hadith_number}
                    </span>
                  </div>

                  {item.snippet_ar && (
                    <p 
                      dir="rtl"
                      dangerouslySetInnerHTML={{ __html: item.snippet_ar }}
                      className="text-sm font-amiri text-slate-900 dark:text-slate-100 leading-relaxed mb-1.5 text-right"
                    />
                  )}

                  {item.snippet_ur ? (
                    <p 
                      dir="rtl"
                      dangerouslySetInnerHTML={{ __html: item.snippet_ur }}
                      className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-nastaliq leading-[2.2]"
                    />
                  ) : item.snippet_en ? (
                    <p 
                      dir="ltr"
                      dangerouslySetInnerHTML={{ __html: item.snippet_en }}
                      className="text-xs text-slate-600 dark:text-slate-400 font-app leading-relaxed"
                    />
                  ) : null}
                </div>
              ))
            )
          )}

          {/* B. TAFSIR RESULTS */}
          {searchTab === 'tafsir' && (
            tafsirResults.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                {query.trim() 
                  ? "ان تفاسیر میں اس لفظ کا اندراج نہیں ملا۔" 
                  : "تفاسیر میں تلاش کے لیے اوپر الفاظ درج کریں۔"}
              </div>
            ) : (
              tafsirResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectResult(item.surah_id, item.ayah_from);
                    onClose();
                  }}
                  className="pt-3.5 first:pt-0 p-3.5 rounded-2xl hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 cursor-pointer transition-all border border-transparent hover:border-emerald-200 dark:hover:border-slate-700/60 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        سورة {item.surah_name_urdu}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                        {item.tafsir_name}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                      {item.ayah_from === item.ayah_to ? `${item.surah_id}:${item.ayah_from}` : `${item.surah_id}:${item.ayah_from}-${item.ayah_to}`}
                    </span>
                  </div>

                  <p 
                    dir="rtl"
                    className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-app line-clamp-3"
                  >
                    {item.snippet}
                  </p>
                </div>
              ))
            )
          )}

          {/* C. THEMATIC TOPICS */}
          {searchTab === 'thematic' && (
            filteredTopics.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                اس تلاش کے مطابق کوئی قرآنی موضوع نہیں ملا۔
              </div>
            ) : (
              filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => {
                    onSelectResult(topic.surah_id, topic.ayah_number);
                    onClose();
                  }}
                  className="pt-3.5 first:pt-0 p-3.5 rounded-2xl hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 cursor-pointer transition-all border border-transparent hover:border-emerald-200 dark:hover:border-slate-700/60 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {topic.title_ur}
                      </span>
                      <span className="text-xs text-slate-400 font-sans">({topic.title_en})</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                      {topic.verse_key}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">
                    {topic.description_ur}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-medium ml-1">کلیدی آیات:</span>
                    {topic.key_verses.map((vk) => (
                      <span
                        key={vk}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px]"
                      >
                        {vk}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )
          )}

        </div>
      </div>
    </div>
  );
};
