import React from 'react';
import { 
  X, 
  BookOpen, 
  SlidersHorizontal, 
  ShieldCheck, 
  Info, 
  ExternalLink, 
  Sun, 
  Coffee, 
  Moon, 
  Eye, 
  Palette, 
  MoveHorizontal, 
  Sparkles, 
  Library, 
  Volume2, 
  Database, 
  Globe,
  Type,
  Minus,
  Plus,
  Code2,
  Terminal,
  Cpu,
  User,
  FolderGit2,
  Download,
  RefreshCw,
  CheckCircle2,
  Layers,
  Check
} from 'lucide-react';
import { ReadingTheme, TafsirLayoutMode, OverallReadingMode } from '../types/quran';
import { SidebarTab } from './Header';

interface SidebarDrawerProps {
  isOpen: boolean;
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  onClose: () => void;

  // Preferences State & Handlers
  themeMode: ReadingTheme;
  onChangeThemeMode: (theme: ReadingTheme) => void;
  horizontalPadding: number;
  onChangeHorizontalPadding: (val: number) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  showTajweed: boolean;
  onToggleTajweed: () => void;
  showWordByWord: boolean;
  onToggleWordByWord: () => void;
  wbwLanguage: 'both' | 'ur' | 'en' | 'ur2' | 'en2';
  onSelectWbwLanguage: (lang: 'both' | 'ur' | 'en' | 'ur2' | 'en2') => void;
  selectedTranslationAuthor: string;
  onSelectTranslationAuthor: (authorId: string) => void;
  secondaryTranslationAuthor: string | null;
  onSelectSecondaryTranslationAuthor: (authorId: string | null) => void;
  tafsirLayoutMode: TafsirLayoutMode;
  onSelectTafsirLayoutMode: (mode: TafsirLayoutMode) => void;
  overallReadingMode: OverallReadingMode;
  onChangeReadingMode: (mode: OverallReadingMode) => void;
  onOpenTafsirSettings: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  activeTab,
  onSelectTab,
  onClose,
  themeMode,
  onChangeThemeMode,
  horizontalPadding,
  onChangeHorizontalPadding,
  fontSize,
  onFontSizeChange,
  showTajweed,
  onToggleTajweed,
  showWordByWord,
  onToggleWordByWord,
  wbwLanguage,
  onSelectWbwLanguage,
  selectedTranslationAuthor,
  onSelectTranslationAuthor,
  secondaryTranslationAuthor,
  onSelectSecondaryTranslationAuthor,
  tafsirLayoutMode,
  onSelectTafsirLayoutMode,
  overallReadingMode,
  onChangeReadingMode,
  onOpenTafsirSettings
}) => {
  const [audioCacheStatus, setAudioCacheStatus] = React.useState<{ cachedCount: number; cachedBytes: number } | null>(null);
  const [cachingSurahLoading, setCachingSurahLoading] = React.useState(false);

  const refreshAudioCache = React.useCallback(async () => {
    try {
      const res = await fetch('/api/audio/status');
      if (res.ok) {
        const data = await res.json();
        setAudioCacheStatus(data);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    if (isOpen && activeTab === 'preferences') {
      refreshAudioCache();
    }
  }, [isOpen, activeTab, refreshAudioCache]);

  const handlePrecacheSurah = async (surahId: number) => {
    setCachingSurahLoading(true);
    try {
      await fetch('/api/audio/cache-surah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surah_id: surahId })
      });
      setTimeout(refreshAudioCache, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setCachingSurahLoading(false);
    }
  };

  if (!isOpen) return null;

  const referenceCategories = [
    {
      category: '۱. القرآني نص وخطوط (Quranic Text, QCF Fonts & APIs)',
      icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          title: 'مجمع الملك فهد لطباعة المصحف الشريف (KFGQPC)',
          org: 'King Fahd Complex, Madinah Munawwarah',
          desc: 'مصحف مدینہ کے مستند خطوط (QCF V2)، عثمانی رسم الخط اور ۶۰۴ صفحات کی معیاری تقسیم کا بنیادی ماخذ۔',
          url: 'https://qurancomplex.gov.sa',
          badge: 'Official Medina Standard'
        },
        {
          title: 'Quran Foundation & Quran.com API (v4)',
          org: 'Quran.Foundation Open Infrastructure',
          desc: 'لفظ بلفظ کوڈز (code_v2)، صفحات و سطور کا ڈیٹا، اور جدید COLRv1 Tajweed V4 رنگین فونٹس۔',
          url: 'https://api-docs.quran.foundation',
          badge: 'Open Islamic API'
        },
        {
          title: 'Tanzil Quran Navigator Project',
          org: 'Tanzil.net (Global Quran Verification)',
          desc: 'قرآنی متن، آیات کے حدود، رکوع، سجدہ ہائے تلاوت اور حروف و اعراب کی مستند ترین عالمی تصدیق۔',
          url: 'https://tanzil.net',
          badge: 'Verified Text Standard'
        }
      ]
    },
    {
      category: '۲. الصرف والنحو والمعجم (Morphology, Grammar & Lexical Concordance)',
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          title: 'The Quranic Arabic Corpus — University of Leeds',
          org: 'Dr. Kais Dukes, Language Research Group, University of Leeds',
          desc: '۷۷,۴۲۹ الفاظ کا تفصیلی صرفی و نحوی تجزیہ، مادے (Roots)، صیغے اور نحوی ٹری بینک۔',
          url: 'https://corpus.quran.com',
          badge: 'Academic Corpus'
        },
        {
          title: 'لغات، اعراب و رسمِ قرآن — پروفیسر حافظ احمد یارؒ',
          org: 'تنظیم ڈیجیٹل لائبریری / ڈاکٹر اسرار احمدؒ اکیڈمی',
          desc: 'قرآنی تراکیب، اعرابی حالتیں، اور لغوی حل پر ۳۴۰ مفصل اسباق پر مشتمل عظیم الشان اردو نحوی ذخیرہ۔',
          url: 'https://hafizahmedyar.tanzeemdigitallibrary.com',
          badge: 'Urdu Irab Treatise'
        },
        {
          title: 'Quranic Universal Library (QUL by Tarteel)',
          org: 'Tarteel AI & Open Quranic Data',
          desc: 'قرآنی معانی اور لغوی اشاریہ کا جدید اوپن پلیٹ فارم۔',
          url: 'https://qul.tarteel.ai',
          badge: 'Open Data Resource'
        }
      ]
    },
    {
      category: '۳. التراجم المعتمدة (Scholarly Translations)',
      icon: <Globe className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          title: 'آسان ترجمۂ قرآن — مفتی محمد تقی عثمانی',
          org: 'دارالعلوم کراچی / مکتبہ معارف القرآن',
          desc: 'سلیس، فصیح اور بامحاورہ اردو و انگریزی ترجمۂ قرآن مع مختصر تشریحی ربط۔',
          url: 'https://quran.com',
          badge: 'Urdu & English'
        },
        {
          title: 'ترجمہ تفہیم القرآن — سید ابوالاعلیٰ مودودیؒ',
          org: 'ادارہ ترجمان القرآن لاہور / ReadMaududi',
          desc: 'جدید اردو اسلوب میں قرآنی معانی و مطالب کی رواں ترجمانی۔',
          url: 'https://www.readmaududi.com',
          badge: 'Contemporary Urdu'
        },
        {
          title: 'ترجمہ بیان القرآن — ڈاکٹر اسرار احمدؒ',
          org: 'مرکزی انجمن خدام القرآن لاہور',
          desc: 'نظمِ قرآن اور سیاق و سباق کی روشنی میں فہم قرآن کا سلیس اردو ترجمہ۔',
          url: 'https://quranacademy.com',
          badge: 'Classical Urdu'
        },
        {
          title: 'تراجم شیخ الہندؒ، فتح محمد جالندھریؒ اور مولانا محمد جوناگڑھیؒ',
          org: 'کلاسیکی برصغیر اردو تراجم ذخیرہ (Tanzil & KFGQPC)',
          desc: 'برصغیر پاک و ہند کے مستند ترین اور صدیوں سے متداول مقبولِ عام اردو تراجم۔',
          url: 'https://tanzil.net/#trans/ur.mahali',
          badge: 'Scholarly Heritage'
        },
        {
          title: 'Saheeh International & Prof. M.A.S. Abdel Haleem (Oxford)',
          org: 'Abul-Qasim Publishing House / Oxford University Press',
          desc: 'عالمی سطح پر معتبر ترین انگریزی تراجمِ قرآن اور معیاری قرآنی لغت۔',
          url: 'https://quran.com',
          badge: 'Academic English'
        }
      ]
    },
    {
      category: '۴. التفاسير العلمية (Classical & Contemporary Tafasir)',
      icon: <Library className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          title: 'بیان القرآن — ڈاکٹر اسرار احمدؒ',
          org: 'مرکزی انجمن خدام القرآن لاہور / قرآن اکیڈمی',
          desc: 'حمید الدین فراہیؒ اور مولانا محمود الحسنؒ کے منہج پر نظمِ قرآن کی بصیرت افروز تفسیر۔',
          url: 'https://quranacademy.com',
          badge: '37,416 Ingested Records'
        },
        {
          title: 'تفہیم القرآن — مولانا سید ابوالاعلیٰ مودودیؒ',
          org: 'ادارہ ترجمان القرآن / ReadMaududi',
          desc: 'چھ جلدوں پر مشتمل عصری، دعوتی، تاریخی اور فکری مباحث کی جامع تفسیر۔',
          url: 'https://www.readmaududi.com',
          badge: 'Sanitized Clean Text'
        },
        {
          title: 'معارف القرآن — مفتی اعظم محمد شفیع عثمانیؒ',
          org: 'ادارۃ المعارف کراچی',
          desc: 'حکیم الامت تھانویؒ کے بیان القرآن کی تسہیل اور فقہی و علمی نکات کا مستند ذخیرہ۔',
          url: 'https://www.equranlibrary.com',
          badge: 'Sanitized Clean Text'
        },
        {
          title: 'تفسیر ابن کثیر (اردو) — حافظ عماد الدین ابن کثیرؒ',
          org: 'تفسیر القرآن العظیم (ترجمہ مولانا محمد جوناگڑھیؒ)',
          desc: 'قرآن، احادیثِ صحیحہ اور آثارِ صحابہ و تابعین کی روشنی میں مستند ترین تفسیر بالماثور۔',
          url: 'https://www.equranlibrary.com',
          badge: 'Classical Heritage'
        },
        {
          title: 'تفسیر السعدی (تیسیر الکریم الرحمٰن) — شیخ عبدالرحمٰن بن ناصر السعدیؒ',
          org: 'دارالسلام ریاض و QUL Tarteel',
          desc: 'سہل، جامع اور ایمان افروز اسلوب میں قرآنی مقاصد، عقائد اور اخلاقی لطائف کی تفسیر۔',
          url: 'https://qul.tarteel.ai/resources/tafsir/309',
          badge: 'Arabic / Urdu Salafi Heritage'
        },
        {
          title: 'تیسیر القرآن — مولانا عبدالرحمٰن کیلانیؒ',
          org: 'مکتبہ السلام لاہور / محدث لائبریری',
          desc: 'سلیس اردو، لغوی تحقیق اور سنتِ صحیحہ کی روشنی میں تفصیلی اور جامع تفسیر۔',
          url: 'https://www.equranlibrary.com',
          badge: 'Sanitized Clean Text'
        }
      ]
    },
    {
      category: '۵. التلاوة الصوتية والمنصات المشابهة (Audio CDN & Research Platforms)',
      icon: <Volume2 className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          title: 'EveryAyah & Quran.com Audio CDN',
          org: 'EveryAyah.com & Quran Foundation',
          desc: 'شیخ مشاری راشد العفاسی کی آیت وار صوتی تلاوت اور ملی سیکنڈز کی سطح پر لفظی آڈیو سنکرونائزیشن۔',
          url: 'https://everyayah.com',
          badge: 'High-Bitrate MP3'
        },
        {
          title: 'آيات — المصحف الإلكتروني بجامعة الملك سعود',
          org: 'King Saud University Electronic Mosshaf Project',
          desc: 'تلاوت، عربی تفاسیر اور قرآنی تقابلی مطالعہ کا جامع پورٹل۔',
          url: 'https://quran.ksu.edu.sa',
          badge: 'Academic Research'
        },
        {
          title: 'المكتبة الشاملة ومركز تفسير',
          org: 'Al-Maktabah Al-Shamilah & Tafsir Center',
          desc: 'علومِ قرآن اور قدیم و جدید اسلامی کتب کا عالمی تحقیقی ذخیرہ۔',
          url: 'https://shamela.ws',
          badge: 'Scholarly Database'
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex" dir="rtl">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-out Sidebar Panel (Right Side in RTL) */}
      <aside className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col md:flex-row h-full overflow-hidden font-ibm">
        
        {/* ======================================================== */}
        {/* SIDEBAR NAVIGATION RAIL                                  */}
        {/* ======================================================== */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-950/90 border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0 select-none">
          <div className="space-y-4">
            {/* Brand Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    الوحيين
                  </h2>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Al-Wahyain v1.2.2
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex md:flex-col gap-1 overflow-x-auto">
              <button
                onClick={() => onSelectTab('about')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'about'
                    ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Info className="w-4 h-4 shrink-0" />
                <span>تعارف (About)</span>
              </button>

              <button
                onClick={() => onSelectTab('verification')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'verification'
                    ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>توثیقِ متن (Verification)</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-normal">
                  مصدقہ
                </span>
              </button>

              <button
                onClick={() => onSelectTab('preferences')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'preferences'
                    ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 shrink-0" />
                <span>ترجیحات (Preferences)</span>
              </button>

              <button
                onClick={() => onSelectTab('references')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'references'
                    ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Library className="w-4 h-4 shrink-0" />
                <span>مآخذ و مراجع (References)</span>
              </button>

              <button
                onClick={() => onSelectTab('docs')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'docs'
                    ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Code2 className="w-4 h-4 shrink-0" />
                <span>تکنیکی دستاویزات (Docs)</span>
              </button>
            </nav>
          </div>

          {/* Bottom Offline Database Status & Developer Quick Links */}
          <div className="hidden md:block pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                <Database className="w-3.5 h-3.5" />
                <span>آف لائن انجن فعال (Offline Engine)</span>
              </div>
              <p className="leading-relaxed font-ibm text-[11px]">
                <span className="font-app font-semibold">604</span> صفحات • <span className="font-app font-semibold">6,236</span> آیات • <span className="font-app font-semibold">6</span> تفاسیر
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/70 text-[10px]">
              <div className="text-slate-700 dark:text-slate-300 font-semibold">
                Abdul Rehman (<a href="https://github.com/arehman-dev" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">@arehman-dev</a>)
              </div>
              <div className="flex items-center gap-2 text-slate-400 pt-0.5 font-sans" dir="ltr">
                <a href="https://arehman-dev.github.io/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">Portfolio</a>
                <span>•</span>
                <a href="https://github.com/arehman-dev/al-wahyain" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">Repo</a>
                <span>•</span>
                <a href="https://x.com/arehman_dev" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">X</a>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN CONTENT AREA (Reduced cards, unified sections)     */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* ======================================================== */}
          {/* PAGE 1: ABOUT (تعارف)                                     */}
          {/* ======================================================== */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Banner */}
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                    ورژن <span className="font-app">1.2.2</span> • تحقیقی و علمی مطالعہ قرآن پلیٹ فارم
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  الوحيين — قرآن مجید، صرف و نحو اور تقابلی تفاسیر کا جامع اسٹیشن
                </h1>
                <p className="font-ibm text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-[2.1]">
                  ’’الوحيين‘‘ ایک تیز رفتار، مقامی (Local-First) اور جدید ڈیجیٹل علمی پلیٹ فارم ہے جسے محققین، طلبۂ علومِ اسلامیہ اور عام قارئین کے لیے ڈیزائن کیا گیا ہے۔ یہ مصحف مدینہ کے اصل خطوط، مفصل صرفی و اعرابی تجزیے اور چھ مستند اردو تفاسیر کے تقابل کو یکجا کرتا ہے۔
                </p>
              </div>

              {/* 4 Core Pillars — Borderless Unified Grid */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">
                  بنیادی علمی خصوصیات (Key Study Pillars)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        ۱. مستند خطِ مدینہ و تجوید (QCF V2 & V4)
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        مجمع الملک فہد مدینہ منورہ کے ۶۰۴ صفحات کے خطاطی گلفس اور Quran Foundation کے جدید COLRv1 رنگین تجوید فونٹس۔
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        ۲. سطری لفظی و تقابلی بامحاورہ تراجم
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        ہر قرآنی لفظ کے نیچے اردو اور انگریزی معانی، اور بیک وقت دو مستند مترجمین کے بامحاورہ تراجم کا موازنہ۔
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        ۳. صرف، نحو اور قرآنی مادوں کا اشاریہ
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        ۷۷,۴۲۹ الفاظ کا مادہ (Root)، صیغہ، اعرابی حالت، نحوی گراف اور قرآن بھر میں مادوں کے تمام مقامات تک فوری رسائی۔
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Library className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        ۴. چھ مستند تفاسیر کا تقابلی مطالعہ
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        بیان القرآن، تفہیم القرآن، معارف القرآن، ابن کثیر، السعدی اور تیسیر القرآن کا صاف اور بیرونی واٹر مارک سے پاک مطالعہ۔
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Action & Quick Links Row */}
              <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    قرآنی متن اور تفاسیر کی تصدیق و اسناد کا تفصیلی بیان دیکھیں۔
                  </span>
                </div>
                <button
                  onClick={() => onSelectTab('verification')}
                  className="px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>توثیقِ متن کھولیں</span>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Minimal Keyboard Hint */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                <span>تیز رفتار نیویگیشن: جامع تلاش کے لیے <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono border border-slate-200 dark:border-slate-700">Ctrl+K</kbd> اور تمام کی بورڈ شارٹ کٹس کے لیے <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono border border-slate-200 dark:border-slate-700">Ctrl+/</kbd> دبائیں۔</span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 2: TEXT VERIFICATION & AUTHENTICITY (توثیقِ متن)     */}
          {/* ======================================================== */}
          {activeTab === 'verification' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>مصدقہ و محفوظ شدہ نص • 100% Verified Islamic Corpus</span>
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span>توثیقِ نصِ قرآن، خطاطی اور تفاسیر کی دیانتداری</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-ibm">
                  قرآنی کلمات، اعراب، خطِ مدینہ، صرفی تجزئے اور تقابلی تفاسیر کی علمی توثیق اور مستند ماخذوں سے تقابل کی مکمل تفصیلات:
                </p>
              </div>

              {/* Verification Metric Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-app">114</div>
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">سورتیں (Surahs)</div>
                  <div className="text-[10px] text-slate-400">مکمل مصدقہ ترتیب</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-app">6,236</div>
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">آیات (Ayahs)</div>
                  <div className="text-[10px] text-slate-400">تنزیل و مصحف مدینہ</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-app">77,429</div>
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">الفاظ (Word Tokens)</div>
                  <div className="text-[10px] text-slate-400">صرفی و لفظی تصدیق</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-app">37,416</div>
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">تفسیری ریکارڈز</div>
                  <div className="text-[10px] text-slate-400">6 تفاسیر (واٹرمارک پاک)</div>
                </div>
              </div>

              {/* Verification Sections (Streamlined, elegant dividers) */}
              <div className="space-y-4 pt-1">
                
                {/* 1. Uthmani Script & Medina Mushaf */}
                <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>۱. رسم الخط اور مصحف مدینہ کی توثیق (Uthmani Text & Tanzil Verification)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-6">
                    قرآن مجید کا بنیادی متن <strong>مجمع الملك فهد لطباعة المصحف الشريف</strong> (طبع مدینہ منورہ ۱۴۲۲ھ) کے مطابق ہے اور بین الاقوامی قرآنی پروجیکٹ <strong>Tanzil (v1.0.2)</strong> کے ساتھ حرف بہ حرف اور اعراب بہ اعراب ۱۰۰ فیصد مطابقت رکھتا ہے۔ ۶,۲۳۶ آیات، رکوعات، سجدہ ہائے تلاوت اور سورتوں کے احزاب و منازل کی درجہ بندی میں صفر فرق کی تصدیق کی گئی ہے۔
                  </p>
                </div>

                {/* 2. Fonts & Glyphs Integrity */}
                <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>۲. خطاطی گلفس اور رنگین تجوید (QCF V2 & V4 COLRv1 Vector Audit)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-6">
                    ہر قرآنی لفظ عام یونیکوڈ ٹیکسٹ کے بجائے مجمع الملک فہد کے ۶۰۴ صفحات کے مخصوص گلفس (<code className="font-app">code_v2</code>) اور ۱۵ سطری مصحف کی تقسیم پر مبنی ہے۔ رنگین تجوید موڈ میں Quran Foundation کے <strong>COLRv1</strong> ملٹی پیلیٹ ویکٹر گلفس استعمال ہوتے ہیں جن میں غنہ، اخفاء، ادغام، قلقلہ اور مدات کے ۷ قواعد ہر حرف کی سطح پر درست رنگ کے ساتھ منسلک ہیں۔
                  </p>
                </div>

                {/* 3. Tafasir Sanitization & Watermark Purge */}
                <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>۳. تفاسیر کی طہارت اور واٹر مارکس کی تطہیر (Tafasir Integrity & Watermark Purge)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-6">
                    ڈیٹا بیس میں موجود تمام ۶ تفاسیر (بیان القرآن، تفہیم القرآن، معارف القرآن، تفسیر ابن کثیر، تیسیر القرآن، تفسیر السعدی) کو تفصیلی تحقیقی عمل سے گزارا گیا ہے۔ تیسرے فریق کی ویب سائٹس کے تمام خودکار واٹر مارکس (جیسے <code className="font-app">eQuran Library</code>) اور عنوانات کے زائد اسکریپڈ ٹکڑوں کو ڈیٹا بیس اور <strong>SQLite FTS5</strong> سرچ انڈیکس سے مکمل طور پر خارج کر دیا گیا ہے تاکہ قاری تک صرف اصل مفسر کا مستند اور باوقار کلام پہنچے۔
                  </p>
                </div>

                {/* 4. Morphology & Treebank Sanad */}
                <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>۴. صرفی تجزیہ اور نحوی ٹری بینک (Corpus & Treebank Provenance)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-6">
                    قرآن مجید کے ۷۷,۴۲۹ الفاظ کا صرفی و نحوی تجزیہ، مادے (Roots) اور افعال کے اوزان یونیورسٹی آف لیڈز کے <strong>The Quranic Arabic Corpus</strong> (زیرِ نگرانی ڈاکٹر قیس ڈیوکس) کے ڈیٹا سے ہم آہنگ ہیں۔ اس کے ساتھ ساتھ پروفیسر حافظ احمد یارؒ کی شہرۂ آفاق کتاب <em>’’لغات، اعراب و رسمِ قرآن‘‘</em> کے ۳۴۰ مکمل اسباق اور نحوی شجرے (Syntax Treebank) ایپلیکیشن میں مربوط کیے گئے ہیں۔
                  </p>
                </div>

                {/* 5. Offline Integrity & Privacy */}
                <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>۵. مقامی ڈیٹا بیس کی رازداری و دیانتداری (Local-First Offline Privacy)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-6">
                    قرآنی کارپس کا تمام ڈیٹا ۴۴۷ میگا بائٹ کی مقامی SQLite فائل میں مکمل طور پر محفوظ ہے۔ کسی بھی آیت کی تلاوت، تلاش، یا تفسیری مطالعے کے لیے کسی کلاؤڈ سرور پر کوئی ذاتی ڈیٹا، سوالات یا ہسٹری ارسال نہیں کی جاتی۔
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 3: PREFERENCES (ترجیحات و ترتیبات)                    */}
          {/* ======================================================== */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                  <span>ترجیحات و ترتیبات (Reading Preferences)</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  مطالعے کے ماحول، حاشیہ، متن کے سائز، تراجم اور آڈیو تلاوت کی ترتیبات۔
                </p>
              </div>

              {/* Group 1: Display & Atmosphere (Theme, Padding, Font Size) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800 space-y-5">
                <h2 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>۱. ماحول و منظر (Atmosphere, Layout & Typography)</span>
                </h2>

                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    مطالعہ کا تھیم (Theme Atmosphere)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {([
                      { id: 'light', label: 'دن (Light)', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
                      { id: 'sepia', label: 'قدیم اوراق (Sepia)', icon: <Coffee className="w-3.5 h-3.5 text-amber-700" /> },
                      { id: 'dark', label: 'نائٹ (Dark)', icon: <Moon className="w-3.5 h-3.5 text-indigo-400" /> },
                      { id: 'oled', label: 'مڈ نائٹ (OLED)', icon: <Eye className="w-3.5 h-3.5 text-emerald-400" /> },
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onChangeThemeMode(t.id)}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                          themeMode === t.id
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {t.icon}
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Padding Slider */}
                <div className="space-y-2 pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MoveHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                      <span>دائیں بائیں حاشیہ (Side Margins)</span>
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 font-app">
                      {horizontalPadding}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-emerald-600 font-bold shrink-0">1% (وسیع)</span>
                    <input
                      type="range"
                      min={1}
                      max={24}
                      step={1}
                      value={horizontalPadding}
                      onChange={(e) => onChangeHorizontalPadding(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">24% (کتابی)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {[
                      { val: 2, label: 'وسیع (2%)' },
                      { val: 6, label: 'متوازن (6%)' },
                      { val: 12, label: 'معیاری (12%)' },
                      { val: 18, label: 'کتابی (18%)' }
                    ].map((p) => (
                      <button
                        key={p.val}
                        onClick={() => onChangeHorizontalPadding(p.val)}
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                          horizontalPadding === p.val
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size Control */}
                <div className="space-y-2 pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-emerald-600" />
                      <span>متن اور خط کا سائز (Font Sizing)</span>
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 font-app">
                      {fontSize}px (قرآنی خط: {Math.round(fontSize * 1.65)}px)
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => onFontSizeChange(Math.max(14, fontSize - 1))}
                      disabled={fontSize <= 14}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-emerald-500 disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={14}
                      max={28}
                      step={1}
                      value={fontSize}
                      onChange={(e) => onFontSizeChange(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <button
                      onClick={() => onFontSizeChange(Math.min(28, fontSize + 1))}
                      disabled={fontSize >= 28}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-emerald-500 disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {[
                      { val: 15, label: 'چھوٹا (15px)' },
                      { val: 18, label: 'معیاری (18px)' },
                      { val: 21, label: 'بڑا (21px)' },
                      { val: 25, label: 'جلی (25px)' }
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        onClick={() => onFontSizeChange(preset.val)}
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                          fontSize === preset.val
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Group 2: Mushaf, Tajweed & Translations */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <h2 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                  <Palette className="w-4 h-4 text-emerald-600" />
                  <span>۲. خط، تجوید اور تقابلی تراجم (Typography & Translations)</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Tajweed Switch */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">رنگین تجوید (QCF V4 COLRv1)</div>
                      <div className="text-[11px] text-slate-400">تجویدی قوانین کے رنگین حروف</div>
                    </div>
                    <button
                      onClick={onToggleTajweed}
                      className={`px-3 py-1 rounded-lg border font-bold transition-colors cursor-pointer ${
                        showTajweed
                          ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {showTajweed ? 'فعال' : 'بند'}
                    </button>
                  </div>

                  {/* Focus Mode Switch */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">تفسیر فوکس موڈ (Focus View)</div>
                      <div className="text-[11px] text-slate-400">ایک تفسیر پر یکسوئی یا تمام تفاسیر</div>
                    </div>
                    <button
                      onClick={() => onSelectTafsirLayoutMode(tafsirLayoutMode === 'focus' ? 'stacked' : 'focus')}
                      className={`px-3 py-1 rounded-lg border font-bold transition-colors cursor-pointer ${
                        tafsirLayoutMode === 'focus'
                          ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {tafsirLayoutMode === 'focus' ? 'فوکس آن' : 'تمام یکجا'}
                    </button>
                  </div>

                  {/* Primary Translator */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block">بنیادی بامحاورہ مترجم</label>
                    <select
                      value={selectedTranslationAuthor}
                      onChange={(e) => onSelectTranslationAuthor(e.target.value)}
                      className="w-full h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 px-2.5 font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="taqi_usmani">مفتی محمد تقی عثمانی</option>
                      <option value="maududi">سید ابوالاعلیٰ مودودی</option>
                      <option value="junagarhi">مولانا محمد جوناگڑھی</option>
                      <option value="mahmud_hasan">شیخ الہند محمود الحسن</option>
                      <option value="israr_ahmad">ڈاکٹر اسرار احمد</option>
                      <option value="jalandhari">فتح محمد جالندھری</option>
                      <option value="sahih_intl">Saheeh International (EN)</option>
                      <option value="taqi_usmani_en">Mufti Taqi Usmani (EN)</option>
                      <option value="abdel_haleem">Abdel Haleem Oxford (EN)</option>
                    </select>
                  </div>

                  {/* Secondary Comparative Translator */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block">ثانوی تقابلی مترجم</label>
                    <select
                      value={secondaryTranslationAuthor || 'none'}
                      onChange={(e) => onSelectSecondaryTranslationAuthor(e.target.value === 'none' ? null : e.target.value)}
                      className="w-full h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 px-2.5 font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="none">کوئی نہیں (بند)</option>
                      <option value="sahih_intl">+ Saheeh International (EN)</option>
                      <option value="taqi_usmani_en">+ Taqi Usmani (EN)</option>
                      <option value="abdel_haleem">+ Abdel Haleem (EN)</option>
                      <option value="taqi_usmani">+ مفتی تقی عثمانی</option>
                      <option value="maududi">+ مولانا مودودی</option>
                      <option value="israr_ahmad">+ ڈاکٹر اسرار احمد</option>
                    </select>
                  </div>

                  {/* Word by word */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block">لفظ بلفظ سطری ترجمہ</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onToggleWordByWord}
                        className={`px-3 h-9 rounded-xl border font-bold cursor-pointer shrink-0 ${
                          showWordByWord
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {showWordByWord ? 'لفظی فعال' : 'بند'}
                      </button>
                      <select
                        value={wbwLanguage}
                        onChange={(e) => onSelectWbwLanguage(e.target.value as any)}
                        className="flex-1 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 px-2.5 font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                      >
                        <option value="both">اردو + Eng</option>
                        <option value="ur">حافظ نذر احمد (اردو 1)</option>
                        <option value="ur2">حافظ صلاح الدین یوسف (اردو 2)</option>
                        <option value="en">Sahih Intl WBW (EN 1)</option>
                        <option value="en2">Corpus Gloss (EN 2)</option>
                      </select>
                    </div>
                  </div>

                  {/* Tafsir Order Modal Trigger */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block">انتخاب و ترتیبِ تفاسیر</label>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTafsirSettings();
                      }}
                      className="w-full h-9 rounded-xl border border-emerald-500/60 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>تفاسیر کی فہرست و ترتیب ترتیب دیں</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Group 3: Offline Recitation Cache */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <span>۳. خودکار آف لائن آڈیو تلاوت (Alafasy Audio Cache)</span>
                  </h2>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 font-app">
                    {audioCacheStatus?.cachedCount ?? '...'} / 6,236 محفوظ شدہ
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  تلاوت سنتے ہی آیات خودکار طور پر ڈسک (<code className="font-app">data/audio/alafasy</code>) میں مستقل محفوظ ہو جاتی ہیں تاکہ آئندہ بغیر انٹرنیٹ کے تلاوت سنی جا سکے۔
                </p>

                <div className="flex items-center justify-between gap-3 pt-1 text-xs">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-app">
                    حجم: {audioCacheStatus ? (audioCacheStatus.cachedBytes / (1024 * 1024)).toFixed(2) : '0'} MB
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePrecacheSurah(1)}
                      disabled={cachingSurahLoading}
                      className="px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{cachingSurahLoading ? 'کیشنگ...' : 'سورۃ الفاتحہ محفوظ کریں'}</span>
                    </button>
                    <button
                      onClick={refreshAudioCache}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                      title="اسٹیٹس ریفریش کریں"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 4: REFERENCES & SCHOLARLY DIRECTORY (مآخذ و مراجع)    */}
          {/* ======================================================== */}
          {activeTab === 'references' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Library className="w-5 h-5 text-emerald-600" />
                  <span>مآخذ، مراجع اور مصدقہ کتب خانہ (Scholarly Citations)</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  پلیٹ فارم میں شامل ہر قرآنی لفظ، خطاطی، ترجمہ اور تفسیری ذخیرے کے اصل مآخذ اور براہِ راست روابط:
                </p>
              </div>

              {/* Compact Academic Directory (Replacing 20 bulky cards) */}
              <div className="space-y-5">
                {referenceCategories.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-2.5">
                    <h2 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 pb-1 border-b border-slate-200/80 dark:border-slate-800">
                      {group.icon}
                      <span>{group.category}</span>
                    </h2>

                    <div className="space-y-2">
                      {group.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800/60 hover:border-emerald-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {item.title}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-sans">
                                {item.org}
                              </span>
                              {item.badge && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-app">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-bold transition-colors shrink-0"
                          >
                            <span>ماخذ لنک</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 5: TECHNICAL DOCUMENTATION (تکنیکی دستاویزات)          */}
          {/* ======================================================== */}
          {activeTab === 'docs' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                  System Architecture • Local-First SQLite • Data Pipelines
                </span>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-emerald-600" />
                  <span>تکنیکی آرکیٹیکچر، ڈیٹا بیس ساخت اور توسیعی رہنما</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ایپلیکیشن کے اندرونی انجن، دوہرے ڈیٹا بیس ماڈل اور نئی تفاسیر و تراجم شامل کرنے کا رہنما:
                </p>
              </div>

              {/* 1. Dual-Database Model */}
              <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
                <h2 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>۱. دوہرا ڈیٹا بیس ماڈل (Dual-Database Architecture)</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white font-app">data/quran_study.db (447 MB — Read-Only Corpus)</div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                      ۱۱۴ سورتیں، ۶,۲۳۶ آیات، ۷۷,۴۲۹ الفاظ، ۹ تراجم اور ۶ مکمل تفاسیر (۳۷,۴۱۶ ریکارڈز) بمعہ SQLite FTS5 انڈیکس۔ میموری میپنگ کے ذریعے ملی سیکنڈز میں کوئریز مکمل کرتا ہے۔
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white font-app">data/user_study.db (Writable User State)</div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                      بک مارکس، ذاتی نوٹس اور تفسیری ہائی لائٹس الگ فائل میں محفوظ ہوتے ہیں جسے سرور <code className="font-app">ATTACH DATABASE</code> کے ذریعے جوڑتا ہے۔ ایپ اپڈیٹ سے صارف کا ڈیٹا محفوظ رہتا ہے۔
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Pipeline Scripts Reference */}
              <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <h2 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>۲. ڈیٹا حصول و پراسیسنگ اسکرپٹس (scripts/)</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]" dir="ltr">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70">
                    <strong className="text-emerald-600 font-app">scripts/seed_all_114_surahs.mjs</strong>
                    <div className="text-slate-500 dark:text-slate-400">114 Surahs, 6,236 Ayahs, 77,429 words, lines & QCF codes.</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70">
                    <strong className="text-emerald-600 font-app">scripts/setup_fts5.mjs</strong>
                    <div className="text-slate-500 dark:text-slate-400">Builds FTS5 virtual tables with unicode61 diacritic-insensitive search.</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70">
                    <strong className="text-emerald-600 font-app">scripts/sanitize_tafasir_watermarks.mjs</strong>
                    <div className="text-slate-500 dark:text-slate-400">Purges 3rd-party scraped artifacts and breadcrumbs across all tafasir.</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70">
                    <strong className="text-emerald-600 font-app">scripts/seed_lexical_search.mjs</strong>
                    <div className="text-slate-500 dark:text-slate-400">Generates 14,771-token lexical dictionary & Tanzania-style search syntax.</div>
                  </div>
                </div>
              </div>

              {/* 3. System Expansion */}
              <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <h2 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4" />
                  <span>۳. سسٹم میں نئی تفاسیر و تراجم کی شمولیت (System Expansion)</span>
                </h2>
                <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed list-disc pr-5">
                  <li>
                    <strong>ساتویں تفسیر شامل کرنا:</strong> ٹیبل <code className="font-app">tafasir</code> میں آیات کے لیے نیا <code className="font-app">tafsir_slug</code>، <code className="font-app">author_name</code> اور <code className="font-app">content_html</code> درج کریں، پھر <code className="font-app">node scripts/setup_fts5.mjs</code> چلائیں۔
                  </li>
                  <li>
                    <strong>نیا ترجمہ شامل کرنا:</strong> ٹیبل <code className="font-app">translations</code> میں نیا <code className="font-app">author_id</code> اور <code className="font-app">text</code> داخل کر کے انڈیکس اپڈیٹ کریں۔
                  </li>
                </ul>
              </div>

            </div>
          )}

        </div>
      </aside>
    </div>
  );
};
