import React from 'react';
import { 
  X, 
  BookOpen, 
  Settings, 
  ShieldCheck, 
  Info, 
  ExternalLink, 
  Sun, 
  Coffee, 
  Moon, 
  Eye, 
  Palette, 
  MoveHorizontal, 
  SlidersHorizontal, 
  Sparkles, 
  Library, 
  Volume2, 
  Database, 
  Globe,
  Keyboard
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
  if (!isOpen) return null;

  const referenceCategories = [
    {
      category: '۱. القرآني نص، خطوط اور مصحف مدینہ (Quranic Script, QCF Fonts & APIs)',
      icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          title: 'مجمع الملك فهد لطباعة المصحف الشريف (KFGQPC)',
          org: 'King Fahd Glorious Quran Printing Complex, Madinah Munawwarah',
          desc: 'مصحف مدینہ منورہ کے مستند خطوط (QCF V2)، عثمانی رسم الخط اور ۶۰۴ صفحات کی معیاری تقسیم کا بنیادی سرکاری ماخذ۔',
          url: 'https://qurancomplex.gov.sa',
          secondaryUrl: 'https://fonts.qurancomplex.gov.sa',
          secondaryLabel: 'فونٹس پورٹل',
          license: 'Official Medina Mushaf Standard'
        },
        {
          title: 'Quran Foundation & Quran.com API (v4)',
          org: 'Quran.Foundation Open Islamic Infrastructure',
          desc: 'لفظ بلفظ کوڈز (code_v2)، صفحات و سطور کا ڈیٹا، اور جدید COLRv1 Tajweed V4 رنگین فونٹس کا مستند ذخیرہ۔',
          url: 'https://api-docs.quran.foundation',
          secondaryUrl: 'https://quran.com',
          secondaryLabel: 'Quran.com',
          license: 'Open Islamic API'
        },
        {
          title: 'Quran.com Frontend Next & COLRv1 Tajweed Fonts',
          org: 'Quran.com Engineering & Typography Team',
          desc: 'تجوید کے قواعد کے مطابق ہر حرف کی ویکٹر کلر لیئرنگ (COLRv1 Light/Dark/Sepia Palettes)۔',
          url: 'https://github.com/quran/quran.com-frontend-next',
          license: 'MIT Open Source'
        },
        {
          title: 'Tanzil Quran Navigator Project',
          org: 'Tanzil.net (Zekr / Global Quran Verification)',
          desc: 'قرآنی متن، آیات کے حدود، رکوع، سجدہ ہائے تلاوت اور حزب و منزل کی تصدیق شدہ ساخت۔',
          url: 'https://tanzil.net',
          license: 'Creative Commons Attribution 3.0'
        }
      ]
    },
    {
      category: '۲. الصرف والنحو والمعجم (Morphology, Grammar & Lexical Concordance)',
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          title: 'The Quranic Arabic Corpus — University of Leeds',
          org: 'Language Research Group, University of Leeds (Dr. Kais Dukes)',
          desc: '۷۷,۴۲۹ الفاظ کا تفصیلی صرفی و نحوی تجزیہ، مادہ (Roots)، صیغے، اعراب اور نحوی ترکیب کا عالمی علمی ماخذ۔',
          url: 'https://corpus.quran.com',
          license: 'GNU General Public License (GPL)'
        },
        {
          title: 'Quranic Universal Library (QUL by Tarteel)',
          org: 'Tarteel AI & Open Quranic Data Initiative',
          desc: 'قرآنی الفاظ کے معانی، صرفی ڈیٹا بیس، اور مصاحف کے تکنیکی وسائل کا اوپن پلیٹ فارم۔',
          url: 'https://qul.tarteel.ai',
          license: 'Open Community Resource'
        }
      ]
    },
    {
      category: '۳. التراجم المعتمدة (Urdu & English Scholarly Translations)',
      icon: <Globe className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          title: 'آسان ترجمۂ قرآن — مفتی محمد تقی عثمانی',
          org: 'دارالعلوم کراچی / مکتبہ معارف القرآن',
          desc: 'سلیس، فصیح اور بامحاورہ اردو ترجمۂ قرآن مع مختصر تشریحی ربط۔',
          url: 'https://quran.com',
          license: 'Educational & Study Access'
        },
        {
          title: 'ترجمہ تفہیم القرآن — سید ابوالاعلیٰ مودودیؒ',
          org: 'ادارہ ترجمان القرآن لاہور / ReadMaududi',
          desc: 'جدید اردو اسلوب میں قرآن مجید کے معانی و مطالب کی رواں ترجمانی۔',
          url: 'https://www.readmaududi.com',
          license: 'Public Da\'wah & Academic Use'
        },
        {
          title: 'ترجمہ بیان القرآن — ڈاکٹر اسرار احمدؒ',
          org: 'مرکزی انجمن خدام القرآن لاہور',
          desc: 'نظمِ قرآن اور سیاق و سباق کی روشنی میں سہل اردو ترجمہ۔',
          url: 'https://quranacademy.com',
          license: 'Anjuman Khuddam-ul-Quran Archive'
        },
        {
          title: 'ترجمہ شیخ الہندؒ، فتح محمد جالندھریؒ اور مولانا محمد جوناگڑھیؒ',
          org: 'کلاسیکی برصغیر اردو تراجم ذخیرہ (Tanzil & KFGQPC)',
          desc: 'برصغیر پاک و ہند کے مستند ترین اور مقبولِ عام اردو تراجم۔',
          url: 'https://tanzil.net/#trans/ur.mahali',
          license: 'Public Domain / Open Access'
        },
        {
          title: 'Saheeh International & Prof. M.A.S. Abdel Haleem (Oxford)',
          org: 'Abul-Qasim Publishing House / Oxford University Press',
          desc: 'عالمی سطح پر مستند ترین انگریزی تراجمِ قرآن اور لفظی انگریزی معانی۔',
          url: 'https://quran.com',
          license: 'Academic Reference'
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
          desc: 'حمید الدین فراہیؒ، امین احسن اصلاحیؒ اور مولانا محمود الحسنؒ کے منہج پر نظمِ قرآن کی بصیرت افروز تفسیر۔',
          url: 'https://quranacademy.com',
          license: 'Open Da\'wah Resource'
        },
        {
          title: 'تفہیم القرآن — مولانا سید ابوالاعلیٰ مودودیؒ',
          org: 'ReadMaududi Digital Library',
          desc: 'چھ جلدوں پر مشتمل عصری، دعوتی، تاریخی اور فقہی مباحث کی جامع تفسیر۔',
          url: 'https://www.readmaududi.com',
          license: 'Non-Commercial Educational'
        },
        {
          title: 'معارف القرآن — مفتی اعظم محمد شفیع عثمانیؒ',
          org: 'ادارۃ المعارف کراچی / eQuranLibrary',
          desc: 'بیان القرآن (اشرف علی تھانویؒ) کی تسہیل اور فقہی و علمی نکات کا مستند ذخیرہ۔',
          url: 'https://www.equranlibrary.com',
          license: 'Digital Islamic Library'
        },
        {
          title: 'تفسیر ابن کثیر (اردو) — حافظ عماد الدین ابن کثیرؒ',
          org: 'تفسیر القرآن العظیم (ترجمہ مولانا محمد جوناگڑھیؒ)',
          desc: 'قرآن، احادیثِ صحیحہ اور آثارِ صحابہ و تابعین کی روشنی میں قدیم ترین مستند تفسیر بالماثور۔',
          url: 'https://www.equranlibrary.com',
          license: 'Classical Heritage Archive'
        },
        {
          title: 'تفسیر السعدی (تیسیر الکریم الرحمٰن) — شیخ عبدالرحمٰن بن ناصر السعدیؒ',
          org: 'دارالسلام و QUL (Quranic Universal Library)',
          desc: 'سہل، جامع اور ایمان افروز اسلوب میں قرآنی مقاصد، عقائد اور اخلاقی لطائف کی مستند تفسیر۔',
          url: 'https://qul.tarteel.ai/resources/tafsir/309',
          license: 'Open Scholarly Access'
        },
        {
          title: 'تیسیر القرآن — مولانا عبدالرحمٰن کیلانیؒ',
          org: 'مکتبہ السلام لاہور / محدث لائبریری',
          desc: 'سلیس اردو، لغوی تحقیق اور سنتِ صحیحہ کی روشنی میں جامع تفسیر۔',
          url: 'https://www.equranlibrary.com',
          license: 'Digital Study Archive'
        }
      ]
    },
    {
      category: '۵. التلاوة الصوتية والمصادر المشابهة (Audio & Similar Scholarly Platforms)',
      icon: <Volume2 className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          title: 'EveryAyah & Quran.com Audio CDN',
          org: 'EveryAyah.com & Quran Foundation Audio',
          desc: 'شیخ مشاری راشد العفاسی کی آیت وار صوتی تلاوت اور ملی سیکنڈز کی سطح پر لفظی آڈیو سنکرونائزیشن۔',
          url: 'https://everyayah.com',
          license: 'Open Quran Audio Archive'
        },
        {
          title: 'آيات — المصحف الإلكتروني بجامعة الملك سعود',
          org: 'King Saud University Electronic Mosshaf Project',
          desc: 'تلاوت، عربی تفاسیر (طبری، قرطبی، سعدی، بغوی) اور قرآنی مطالعہ کا جامع پورٹل۔',
          url: 'https://quran.ksu.edu.sa',
          license: 'Academic University Portal'
        },
        {
          title: 'مركز تفسير للدراسات القرآنية والمكتبة الشاملة',
          org: 'Tafsir Center (tafsir.net) & Al-Maktabah Al-Shamilah',
          desc: 'علومِ قرآن، اصولِ تفسیر اور قدیم و جدید اسلامی کتب کا عالمی تحقیقی ذخیرہ۔',
          url: 'https://tafsir.net',
          secondaryUrl: 'https://shamela.ws',
          secondaryLabel: 'المكتبة الشاملة',
          license: 'Scholarly Research Platforms'
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
        
        {/* Sidebar Navigation Rail */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-950/90 border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0 select-none">
          <div className="space-y-4">
            {/* Brand Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    الوحيين
                  </h2>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Al-Wahyain v1.0
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                title="سائیڈ بار بند کریں"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Primary Sidebar Pages */}
            <nav className="flex md:flex-col gap-1.5 overflow-x-auto">
              <button
                onClick={() => onSelectTab('about')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'about'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Info className="w-4 h-4 shrink-0" />
                <span>تعارفی صفحہ (About)</span>
              </button>

              <button
                onClick={() => onSelectTab('preferences')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'preferences'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>ترجیحات (Preferences)</span>
              </button>

              <button
                onClick={() => onSelectTab('references')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'references'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>مآخذ و مراجع (References)</span>
              </button>
            </nav>
          </div>

          {/* Bottom Offline Database Status */}
          <div className="hidden md:block pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
              <Database className="w-3.5 h-3.5" />
              <span>مکمل آف لائن انجن فعال</span>
            </div>
            <p className="leading-relaxed">
              ۶۰۴ صفحات • ۶,۲۳۶ آیات • ۷۷,۴۲۹ الفاظ • ۶ تفاسیر
            </p>
          </div>
        </div>

        {/* Main Page Content Area inside Sidebar */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* ======================================================== */}
          {/* PAGE 1: ABOUT PAGE (تعارفی صفحہ)                           */}
          {/* ======================================================== */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                  ورژن 1.0 • علمی و تحقیقی مطالعہ قرآن اسٹیشن
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  الوحيين — قرآن مجید، صرف و نحو اور تقابلی تفاسیر کا جامع پلیٹ فارم
                </h1>
                <p className="urdu-nastaliq text-lg text-slate-700 dark:text-slate-300 mt-2 leading-[2.2]">
                  ’’الوحيين‘‘ ایک جدید، تیز رفتار اور مکمل طور پر آف لائن چلنے والا علمی اسٹیشن ہے جو قرآن کریم کی تلاوت، لفظی و بامحاورہ تراجم، عربی مادوں (Roots) کی تحقیق اور مستند اردو تفاسیر کے تقابلی مطالعے کے لیے تیار کیا گیا ہے۔
                </p>
              </div>

              {/* 4 Core Study Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-400">
                    <BookOpen className="w-4 h-4" />
                    <span>۱. مستند خطِ مدینہ (QCF V2 & V4 Tajweed)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    مجمع الملک فہد مدینہ منورہ کے ۶۰۴ صفحات کے اصلی خطاطی گلفس (QCF V2) اور Quran Foundation کے جدید COLRv1 رنگین تجوید فونٹس۔
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-400">
                    <Globe className="w-4 h-4" />
                    <span>۲. کلاسیکی سطری لفظی و بامحاورہ ترجمہ</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    ہر قرآنی لفظ کے نیچے اردو اور انگریزی معانی (الترجمة السطرية) اور بیک وقت دو مستند مترجمین کے بامحاورہ تراجم کا تقابل۔
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span>۳. صرف، نحو اور قرآنی مادوں کا اشاریہ</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    ہر لفظ کا مادہ (Root)، صیغہ، اعرابی حالت، نحوی گراف اور قرآن بھر میں اس مادے کے تمام مقامات تک فوری رسائی۔
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-400">
                    <Library className="w-4 h-4" />
                    <span>۴. چھ مستند تفاسیر کا تقابلی مطالعہ</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    بیان القرآن، تفہیم القرآن، معارف القرآن، ابن کثیر، تفسیر السعدی اور تیسیر القرآن کا فوکس اور فہرست موڈ میں مطالعہ اور ہائی لائٹنگ۔
                  </p>
                </div>
              </div>

              {/* Keyboard Shortcuts Reference */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-slate-100">
                  <Keyboard className="w-4 h-4 text-emerald-600" />
                  <span>تیز رفتار کی بورڈ شارٹ کٹس (Power-User Hotkeys)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <span>جامع تلاش</span>
                    <kbd className="px-1.5 py-0.5 font-mono bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">Ctrl+K</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <span>تلاوت چلائیں/روکیں</span>
                    <kbd className="px-1.5 py-0.5 font-mono bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">Space</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <span>اگلی / پچھلی آیت</span>
                    <kbd className="px-1.5 py-0.5 font-mono bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">J / K</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <span>اگلا / پچھلا صفحہ</span>
                    <kbd className="px-1.5 py-0.5 font-mono bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">[ / ]</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <span>آیت بک مارک</span>
                    <kbd className="px-1.5 py-0.5 font-mono bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">B</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <span>چاروں موڈز</span>
                    <kbd className="px-1.5 py-0.5 font-mono bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">1 - 4</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 2: PREFERENCES PAGE (ترجیحات و ترتیبات)               */}
          {/* ======================================================== */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  <span>ترجیحات و ترتیبات (Application Preferences)</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  اپنے مطالعے کے ماحول، دائیں بائیں حاشیے (Padding)، خطاطی، تراجم اور تفاسیر کی ترتیبات یہاں سے متعین کریں۔
                </p>
              </div>

              {/* 1. Theme Atmosphere */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  ۱. مطالعہ کا ماحول اور تھیم (Reading Atmosphere)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {([
                    { id: 'light', label: 'دن (Light)', icon: <Sun className="w-4 h-4 text-amber-500" /> },
                    { id: 'sepia', label: 'قدیم اوراق (Sepia)', icon: <Coffee className="w-4 h-4 text-amber-700" /> },
                    { id: 'dark', label: 'نائٹ (Dark)', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
                    { id: 'oled', label: 'مڈ نائٹ (OLED)', icon: <Eye className="w-4 h-4 text-emerald-400" /> },
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onChangeThemeMode(t.id)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold transition-all cursor-pointer ${
                        themeMode === t.id
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Left & Right Padding Slider (Requirement 4) */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <MoveHorizontal className="w-4 h-4 text-emerald-600" />
                    <span>۲. دائیں اور بائیں حاشیہ سلائیڈر (Left & Right Content Padding)</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                    {horizontalPadding}% حاشیہ
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  سلائیڈر کو کم کرنے سے دائیں اور بائیں جانب کا خالی حاشیہ کم ہو جائے گا اور متن کے لیے زیادہ جگہ ملے گی۔
                </p>
                <div className="flex items-center gap-4 pt-1">
                  <span className="text-[11px] font-bold text-emerald-600 shrink-0">زیادہ جگہ (1%)</span>
                  <input
                    type="range"
                    min={1}
                    max={24}
                    step={1}
                    value={horizontalPadding}
                    onChange={(e) => onChangeHorizontalPadding(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <span className="text-[11px] font-bold text-slate-400 shrink-0">تنگ کالم (24%)</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    { val: 2, label: 'وسیع ترین (2%)' },
                    { val: 6, label: 'متوازن (6%)' },
                    { val: 12, label: 'معیاری (12%)' },
                    { val: 18, label: 'کمپیکٹ کتابی (18%)' }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      onClick={() => onChangeHorizontalPadding(preset.val)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        horizontalPadding === preset.val
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Mushaf & Tajweed Settings */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-600" />
                  <span>۳. مصحف اور تجوید کے رنگ (QCF V2 & V4 Tajweed)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">رنگین تجوید (QCF V4 COLRv1)</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">قرآن فاؤنڈیشن کے رنگین تجویدی قوانین</div>
                    </div>
                    <button
                      onClick={onToggleTajweed}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                        showTajweed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {showTajweed ? 'فعال (ON)' : 'غیر فعال (OFF)'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">تفسیر فوکس موڈ (Focus Mode)</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">ایک تفسیر پر فوکس یا تمام تفاسیر یکجا</div>
                    </div>
                    <button
                      onClick={() => onSelectTafsirLayoutMode(tafsirLayoutMode === 'focus' ? 'stacked' : 'focus')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                        tafsirLayoutMode === 'focus'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tafsirLayoutMode === 'focus' ? 'فوکس موڈ (ON)' : 'تمام تفاسیر (OFF)'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Translation & Tafsir Preferences */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  <span>۴. تراجم اور تفاسیر کی ترتیبات</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">بنیادی مترجم</label>
                    <select
                      value={selectedTranslationAuthor}
                      onChange={(e) => onSelectTranslationAuthor(e.target.value)}
                      className="w-full h-9 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 font-semibold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
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

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">ثانوی تقابلی مترجم</label>
                    <select
                      value={secondaryTranslationAuthor || 'none'}
                      onChange={(e) => onSelectSecondaryTranslationAuthor(e.target.value === 'none' ? null : e.target.value)}
                      className="w-full h-9 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 font-semibold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
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

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">لفظی ترجمہ زبان</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onToggleWordByWord}
                        className={`px-3 h-9 rounded-xl font-bold cursor-pointer ${
                          showWordByWord
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {showWordByWord ? 'لفظی آن' : 'لفظی آف'}
                      </button>
                      <select
                        value={wbwLanguage}
                        onChange={(e) => onSelectWbwLanguage(e.target.value as any)}
                        className="flex-1 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 font-semibold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                      >
                        <option value="both">اردو + English</option>
                        <option value="ur">اردو 1 (نذر احمد)</option>
                        <option value="ur2">اردو 2 (توسیعی)</option>
                        <option value="en">English 1</option>
                        <option value="en2">English 2</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      تفسیری متن کا سائز ({fontSize}px)
                    </label>
                    <div className="flex items-center gap-3 h-9">
                      <input
                        type="range"
                        min={14}
                        max={26}
                        value={fontSize}
                        onChange={(e) => onFontSizeChange(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <button
                        onClick={() => {
                          onClose();
                          onOpenTafsirSettings();
                        }}
                        className="px-3 h-9 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors cursor-pointer shrink-0"
                      >
                        ترتیبِ تفاسیر
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 3: REFERENCES & DATA SOURCES PAGE (مآخذ و مراجع)     */}
          {/* ======================================================== */}
          {activeTab === 'references' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>مآخذ، مراجع اور مصدقہ ڈیٹا روابط (Data Sources & Scholarly Citations)</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  اس ایپلیکیشن میں شامل ہر قرآنی لفظ، خطاطی فونٹ، صرفی تجزیہ، ترجمہ، تفسیر اور آڈیو تلاوت کے مستند مآخذ اور ان کے براہِ راست روابط ذیل میں درج ہیں:
                </p>
              </div>

              {referenceCategories.map((group, gIdx) => (
                <div key={gIdx} className="space-y-3">
                  <h2 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2 pb-1.5 border-b border-emerald-950/10 dark:border-white/10">
                    {group.icon}
                    <span>{group.category}</span>
                  </h2>

                  <div className="grid grid-cols-1 gap-3">
                    {group.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-500/40 transition-colors space-y-1.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {item.title}
                          </span>
                          <div className="flex items-center gap-2">
                            {item.secondaryUrl && (
                              <a
                                href={item.secondaryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-[11px] font-semibold transition-colors"
                              >
                                <span>{item.secondaryLabel}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white text-[11px] font-bold transition-colors"
                            >
                              <span>ماخذ لنک</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 font-sans">
                          {item.org}
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">
                          {item.desc}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                          <span>License / Standard: {item.license}</span>
                          <span dir="ltr" className="truncate max-w-[240px]">{item.url}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </aside>
    </div>
  );
};
