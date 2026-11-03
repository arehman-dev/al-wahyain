import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  BookOpen, 
  Languages, 
  Sparkles, 
  Library, 
  CornerDownLeft, 
  ArrowRight, 
  Compass, 
  Layers, 
  Moon, 
  Sun, 
  Coffee, 
  Eye, 
  Maximize2, 
  Palette, 
  Bookmark, 
  Loader2,
  FileText
} from 'lucide-react';
import { Surah, AppMode, ReadingTheme, OverallReadingMode, SearchResultQuran, SearchResultTafsir } from '../types/quran';
import { searchLexical, searchTafsir } from '../services/api';
import { THEMATIC_TOPICS, ThematicItem } from '../data/thematicIndex';
import { toArabicDigits } from '../utils/juzMapping';

interface OmnibarModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahs: Surah[];
  onSelectSurahAyah: (surahId: number, ayahNumber: number) => void;
  onSelectPage?: (page: number) => void;
  onChangeMode?: (mode: AppMode) => void;
  onChangeTheme?: (theme: ReadingTheme) => void;
  onToggleZenMode?: () => void;
  onToggleTajweed?: () => void;
  onToggleScript?: () => void;
  onSelectReadingMode?: (mode: OverallReadingMode) => void;
}

interface OmnibarAction {
  id: string;
  type: 'jump' | 'surah' | 'page' | 'command' | 'quran' | 'tafsir' | 'thematic';
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  execute: () => void;
}

export const OmnibarModal: React.FC<OmnibarModalProps> = ({
  isOpen,
  onClose,
  surahs,
  onSelectSurahAyah,
  onSelectPage,
  onChangeMode,
  onChangeTheme,
  onToggleZenMode,
  onToggleTajweed,
  onToggleScript,
  onSelectReadingMode
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quranResults, setQuranResults] = useState<SearchResultQuran[]>([]);
  const [tafsirResults, setTafsirResults] = useState<SearchResultTafsir[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setQuranResults([]);
      setTafsirResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced API Search for Quran & Tafsir
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setQuranResults([]);
      setTafsirResults([]);
      setLoading(false);
      return;
    }

    // Skip API search if it's purely a direct jump format like 55:13
    if (/^\d+[:\s]+\d+$/.test(trimmed)) {
      setQuranResults([]);
      setTafsirResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [qRes, tRes] = await Promise.all([
          searchLexical(trimmed).then(res => res.results).catch(() => []),
          searchTafsir(trimmed).catch(() => [])
        ]);
        setQuranResults(qRes.slice(0, 10));
        setTafsirResults(tRes.slice(0, 8));
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Assemble actions list
  const actions: OmnibarAction[] = [];

  // 1. Direct Verse Jump check (e.g., "55:13", "55 13", "2:255")
  const directMatch = trimmed.match(/^(\d+)[:\s]+(\d+)$/);
  if (directMatch) {
    const sId = parseInt(directMatch[1], 10);
    const aNum = parseInt(directMatch[2], 10);
    const matchedSurah = surahs.find(s => s.id === sId);
    if (matchedSurah && aNum >= 1 && aNum <= matchedSurah.verses_count) {
      actions.push({
        id: `jump-${sId}-${aNum}`,
        type: 'jump',
        title: `براہِ راست جمپ: سورة ${matchedSurah.name_arabic}، آیت ${aNum}`,
        subtitle: `${matchedSurah.name_simple} • ${sId}:${aNum}`,
        icon: <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        badge: 'Enter',
        execute: () => {
          onSelectSurahAyah(sId, aNum);
          onClose();
        }
      });
    }
  }

  // 2. Direct Page Jump check (e.g. "p 42", "ص 42", "صفحہ 42", or raw 1-604 if page requested)
  const pageMatch = trimmed.match(/^(?:p|page|ص|صفحہ|صفحه)\s*(\d+)$/);
  if (pageMatch) {
    const pNum = parseInt(pageMatch[1], 10);
    if (pNum >= 1 && pNum <= 604 && onSelectPage) {
      actions.push({
        id: `page-${pNum}`,
        type: 'page',
        title: `مصحف صفحہ ${pNum} پر جمپ کریں`,
        subtitle: `صفحہ ${pNum} از 604 صفحات`,
        icon: <BookOpen className="w-4 h-4 text-amber-500" />,
        badge: 'Enter',
        execute: () => {
          onSelectPage(pNum);
          if (onChangeMode) onChangeMode('quran');
          onClose();
        }
      });
    }
  }

  // 3. Matching Surahs (by Arabic name, Urdu name, English name, or Surah number)
  if (trimmed) {
    const matchingSurahs = surahs.filter(s => {
      const idStr = s.id.toString();
      return (
        s.name_arabic.toLowerCase().includes(trimmed) ||
        (s.name_urdu && s.name_urdu.toLowerCase().includes(trimmed)) ||
        s.name_simple.toLowerCase().includes(trimmed) ||
        idStr === trimmed
      );
    }).slice(0, 5);

    matchingSurahs.forEach(s => {
      actions.push({
        id: `surah-${s.id}`,
        type: 'surah',
        title: `سورة ${s.name_arabic} (${s.name_simple})`,
        subtitle: `${s.revelation_place === 'makkah' ? 'مکی' : 'مدنی'} • ${s.verses_count} آیات • صفحہ ${s.page_start}`,
        icon: <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        badge: `سورة ${s.id}`,
        execute: () => {
          onSelectSurahAyah(s.id, 1);
          onClose();
        }
      });
    });
  }

  // 4. Quick Commands (Reading Mode, Themes, Views)
  const commands = [
    {
      keywords: ['quran', 'قرآن', 'مصحف', 'تلاوت', '1'],
      title: 'قرآن و مصحف موڈ (1)',
      subtitle: 'مسلسل خالص عثمانی مصحف (QCF V2)',
      icon: <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      action: () => onChangeMode && onChangeMode('quran')
    },
    {
      keywords: ['translation', 'tarjuma', 'ترجمہ', 'لفظی', '2'],
      title: 'بامحاورہ و لفظی ترجمہ موڈ (2)',
      subtitle: 'مفتی تقی عثمانی، مولانا مودودی و دیگر تراجم',
      icon: <Languages className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      action: () => onChangeMode && onChangeMode('translation')
    },
    {
      keywords: ['sarf', 'nahw', 'صرف', 'نحو', 'لغت', 'گرامر', '3'],
      title: 'صرف، نحو و لغت موڈ (3)',
      subtitle: 'کلمات کی گرامر، صیغہ، مادہ اور ترکیبی درخت',
      icon: <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      action: () => onChangeMode && onChangeMode('sarf')
    },
    {
      keywords: ['tafsir', 'tafseer', 'تفسیر', 'تفاسیر', '4'],
      title: 'تقابلی تفاسیر موڈ (4)',
      subtitle: 'بیان القرآن، تفہیم، معارف القرآن، ابن کثیر، السعدی، تیسیر القرآن',
      icon: <Library className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      action: () => onChangeMode && onChangeMode('tafseer')
    },
    {
      keywords: ['zen', 'focus', 'زین', 'فوکس'],
      title: 'زین فوکس موڈ (Zen Focus HUD)',
      subtitle: 'تمام ٹول بار چھپا کر مکمل یکسوئی',
      icon: <Maximize2 className="w-4 h-4 text-emerald-500" />,
      action: () => onToggleZenMode && onToggleZenMode()
    },
    {
      keywords: ['tajweed', 'تجوید', 'رنگ'],
      title: 'تجوید کے قواعد کے رنگ آن / آف (QCF V4 COLRv1)',
      subtitle: 'مخارج اور احکام تجوید کے رنگین حروف',
      icon: <Palette className="w-4 h-4 text-rose-500" />,
      action: () => onToggleTajweed && onToggleTajweed()
    },
    {
      keywords: ['sepia', 'سپیا', 'قدیم'],
      title: 'قدیم اوراق تھیم (Sepia)',
      subtitle: 'روایتی کاغذ کی گرم رنگت آنکھوں کی راحت کیلئے',
      icon: <Coffee className="w-4 h-4 text-amber-700" />,
      action: () => onChangeTheme && onChangeTheme('sepia')
    },
    {
      keywords: ['dark', 'نائٹ', 'سیاہ', 'ڈارک'],
      title: 'نائٹ سلیٹ تھیم (Dark Slate)',
      subtitle: 'رات کے مطالعہ کیلئے گہرا ماحول',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      action: () => onChangeTheme && onChangeTheme('dark')
    },
    {
      keywords: ['oled', 'او لیڈ', 'مڈ نائٹ'],
      title: 'مڈ نائٹ او لیڈ تھیم (OLED Black)',
      subtitle: 'خالص سیاہ پس منظر بیٹری بچت اور تاریکی کیلئے',
      icon: <Eye className="w-4 h-4 text-emerald-400" />,
      action: () => onChangeTheme && onChangeTheme('oled')
    },
    {
      keywords: ['light', 'روشن', 'دن', 'سفید'],
      title: 'روشن دن تھیم (Light)',
      subtitle: 'صاف اور شفاف روایتی پس منظر',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      action: () => onChangeTheme && onChangeTheme('light')
    }
  ];

  commands.forEach(cmd => {
    if (!trimmed || cmd.keywords.some(kw => kw.includes(trimmed) || trimmed.includes(kw))) {
      actions.push({
        id: `cmd-${cmd.title}`,
        type: 'command',
        title: cmd.title,
        subtitle: cmd.subtitle,
        icon: cmd.icon,
        badge: 'کمانڈ',
        execute: () => {
          cmd.action();
          onClose();
        }
      });
    }
  });

  // 5. Thematic Quran Topics (موضوعاتی قرآنی اشاریہ)
  if (trimmed) {
    const matchingTopics = THEMATIC_TOPICS.filter(t => 
      t.title_ur.toLowerCase().includes(trimmed) ||
      t.title_en.toLowerCase().includes(trimmed) ||
      t.category.toLowerCase().includes(trimmed) ||
      t.description_ur.toLowerCase().includes(trimmed)
    ).slice(0, 4);

    matchingTopics.forEach(top => {
      actions.push({
        id: `topic-${top.id}`,
        type: 'thematic',
        title: `${top.title_ur} (${top.category})`,
        subtitle: top.description_ur,
        icon: <Bookmark className="w-4 h-4 text-amber-500" />,
        badge: top.verse_key,
        execute: () => {
          onSelectSurahAyah(top.surah_id, top.ayah_number);
          onClose();
        }
      });
    });
  }

  // 6. Quran Search Results
  quranResults.forEach(qr => {
    actions.push({
      id: `quran-${qr.surah_id}-${qr.ayah_number}`,
      type: 'quran',
      title: qr.text_uthmani,
      subtitle: `سورة ${qr.surah_name_arabic} [${qr.surah_id}:${qr.ayah_number}] • ${qr.translation_text || ''}`,
      icon: <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      badge: `${qr.surah_id}:${qr.ayah_number}`,
      execute: () => {
        onSelectSurahAyah(qr.surah_id, qr.ayah_number);
        onClose();
      }
    });
  });

  // 7. Tafsir Search Results
  tafsirResults.forEach(tr => {
    actions.push({
      id: `tafsir-${tr.surah_id}-${tr.ayah_from}-${tr.tafsir_slug}`,
      type: 'tafsir',
      title: `${tr.author_name} — سورة ${tr.surah_name_urdu} [${tr.surah_id}:${tr.ayah_from}]`,
      subtitle: tr.snippet,
      icon: <Library className="w-4 h-4 text-indigo-500" />,
      badge: 'تفسیر',
      execute: () => {
        onSelectSurahAyah(tr.surah_id, tr.ayah_from);
        if (onChangeMode) onChangeMode('tafseer');
        onClose();
      }
    });
  });

  // Handle Keyboard Navigation inside Omnibar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (actions.length > 0 ? (prev + 1) % actions.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (actions.length > 0 ? (prev - 1 + actions.length) % actions.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (actions[selectedIndex]) {
        actions[selectedIndex].execute();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh] p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        dir="rtl"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-ibm flex flex-col max-h-[75vh]"
      >
        {/* Omnibar Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="آیت تلاش کریں، سورۃ کا نام، جمپ (مثلاً 55:13)، یا کوئی کمانڈ..."
            className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          {loading && <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />}
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-200/70 dark:bg-slate-800 text-slate-500 rounded border border-slate-300 dark:border-slate-700">
              Esc
            </kbd>
            <button 
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div 
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40"
        >
          {actions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              کوئی نتیجہ نہیں ملا۔ آیت نمبر (مثلاً 55:13) یا سورۃ کا نام لکھ کر تلاش کریں۔
            </div>
          ) : (
            actions.map((act, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={act.id}
                  onClick={() => act.execute()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`shrink-0 p-1.5 rounded-lg ${
                      isSelected 
                        ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {act.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold truncate leading-tight">
                        {act.title}
                      </div>
                      {act.subtitle && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {act.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {act.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                        isSelected 
                          ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' 
                          : 'border-transparent bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {act.badge}
                      </span>
                    )}
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ انتخاب</span>
            <span>↵ عمل درآمد</span>
            <span>Esc بند کریں</span>
          </div>
          <span className="hidden sm:inline">الوحيين Command Palette</span>
        </div>
      </div>
    </div>
  );
};
