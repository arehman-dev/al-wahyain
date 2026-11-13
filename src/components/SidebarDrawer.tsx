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

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      category: '1. Quranic Script, Fonts & Core APIs',
      icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          title: 'King Fahd Glorious Quran Printing Complex (KFGQPC)',
          org: 'King Fahd Complex, Madinah Munawwarah',
          desc: 'Authoritative primary standard for official Medina Mushaf typography (QCF V2), Uthmanic script orthography, and the 604-page Madani pagination schema.',
          url: 'https://qurancomplex.gov.sa',
          badge: 'Official Medina Standard'
        },
        {
          title: 'Quran Foundation & Quran.com API (v4)',
          org: 'Quran.Foundation Open Islamic Infrastructure',
          desc: 'Token-level glyph coordinates (code_v2), page-line layout index, and modern COLRv1 Tajweed V4 vector color font assets.',
          url: 'https://api-docs.quran.foundation',
          badge: 'Open Islamic API'
        },
        {
          title: 'Tanzil Quran Navigator Project',
          org: 'Tanzil.net (Global Quran Verification Initiative)',
          desc: 'Global benchmark for precise ayah boundaries, ruku divisions, sajdah indicators, and character/diacritic concordance.',
          url: 'https://tanzil.net',
          badge: 'Verified Text Standard'
        }
      ]
    },
    {
      category: '2. Morphology, Grammar & Lexical Concordance',
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          title: 'The Quranic Arabic Corpus — University of Leeds',
          org: 'Dr. Kais Dukes, Language Research Group, University of Leeds',
          desc: 'Comprehensive grammatical annotation, root-lemma mappings, morphological decomposition, and syntactic dependency treebank across 77,429 words.',
          url: 'https://corpus.quran.com',
          badge: 'Academic Corpus'
        },
        {
          title: 'Lughat, Irab wa Rasm-ul-Quran — Prof. Hafiz Ahmed Yar',
          org: 'Tanzeem Digital Library / Quran Academy Lahore',
          desc: 'Exhaustive 340-chapter Urdu grammatical treatise on Quranic syntax, syntactic declension, and orthographic analysis.',
          url: 'https://hafizahmedyar.tanzeemdigitallibrary.com',
          badge: 'Grammar Treatise'
        },
        {
          title: 'Quranic Universal Library (QUL by Tarteel)',
          org: 'Tarteel AI & Open Quranic Data Initiative',
          desc: 'Modern open repository for Quranic vocabulary, morphological datasets, and computational linguistic resources.',
          url: 'https://qul.tarteel.ai',
          badge: 'Open Data Resource'
        }
      ]
    },
    {
      category: '3. Authorized Scholarly Translations',
      icon: <Globe className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          title: 'Easy Quran Translation — Mufti Muhammad Taqi Usmani',
          org: 'Darul Uloom Karachi / Maktaba Maarif-ul-Quran',
          desc: 'Contemporary, precise idiomatic Urdu and English renderings accompanied by contextual thematic links.',
          url: 'https://quran.com',
          badge: 'Urdu & English'
        },
        {
          title: 'Tafhim-ul-Quran Translation — Sayyid Abul A\'la Maududi',
          org: 'Idara Tarjuman-ul-Quran Lahore / ReadMaududi',
          desc: 'Fluid contemporary Urdu translation capturing structural discourse, idiomatic eloquence, and core Quranic themes.',
          url: 'https://www.readmaududi.com',
          badge: 'Contemporary Urdu'
        },
        {
          title: 'Bayan-ul-Quran Translation — Dr. Israr Ahmad',
          org: 'Markazi Anjuman Khuddam-ul-Quran Lahore',
          desc: 'Thematic Urdu translation structured upon linguistic coherence (Nazm-ul-Quran) and contextual harmony.',
          url: 'https://quranacademy.com',
          badge: 'Thematic Urdu'
        },
        {
          title: 'Classical Subcontinent Translations (Shaikh-ul-Hind, Jalandhari, Junagarhi)',
          org: 'Classical Subcontinent Quranic Heritage (Tanzil & KFGQPC)',
          desc: 'Time-tested and historically referenced Urdu translations widely accredited across South Asia.',
          url: 'https://tanzil.net/#trans/ur.mahali',
          badge: 'Scholarly Heritage'
        },
        {
          title: 'Saheeh International & Prof. M.A.S. Abdel Haleem (Oxford)',
          org: 'Abul-Qasim Publishing House / Oxford University Press',
          desc: 'Internationally recognized academic English translations maintaining rigorous semantic and doctrinal fidelity.',
          url: 'https://quran.com',
          badge: 'Academic English'
        }
      ]
    },
    {
      category: '4. Classical & Contemporary Commentaries (Tafasir)',
      icon: <Library className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          title: 'Bayan-ul-Quran — Dr. Israr Ahmad',
          org: 'Markazi Anjuman Khuddam-ul-Quran Lahore / Quran Academy',
          desc: 'Insightful Urdu commentary rooted in structural cohesion (Nazm-ul-Quran), bridging classical scholarship with modern intellectual thought.',
          url: 'https://quranacademy.com',
          badge: '37,416 Ingested Records'
        },
        {
          title: 'Tafhim-ul-Quran — Sayyid Abul A\'la Maududi',
          org: 'Idara Tarjuman-ul-Quran / ReadMaududi',
          desc: 'Monumental 6-volume contemporary commentary covering socio-theological, historical, and legislative discourse. 100% sanitized text.',
          url: 'https://www.readmaududi.com',
          badge: 'Sanitized Clean Text'
        },
        {
          title: 'Ma\'arif-ul-Quran — Mufti Muhammad Shafi Usmani',
          org: 'Idarat-ul-Ma\'arif Karachi',
          desc: 'Exhaustive classical commentary distilling Hanafi jurisprudence, spiritual insights, and authentic traditions. 100% sanitized text.',
          url: 'https://www.equranlibrary.com',
          badge: 'Sanitized Clean Text'
        },
        {
          title: 'Tafsir Ibn Kathir (Urdu) — Hafiz Imad-ud-Din Ibn Kathir',
          org: 'Tafsir al-Quran al-Azim (Tr. Maulana Muhammad Junagarhi)',
          desc: 'The preeminent classical Tafsir bil-Ma\'thur grounded in Quranic cross-references, authentic Hadith, and early companion traditions.',
          url: 'https://www.equranlibrary.com',
          badge: 'Classical Heritage'
        },
        {
          title: 'Tafsir as-Sa\'di (Tayseer al-Karim al-Rahman) — Shaikh Abdur Rahman as-Sa\'di',
          org: 'Darussalam Riyadh & QUL Tarteel',
          desc: 'Accessible, concise commentary highlighting core spiritual objectives, theology, and ethical guidance.',
          url: 'https://qul.tarteel.ai/resources/tafsir/309',
          badge: 'Theological Precision'
        },
        {
          title: 'Taiseer-ul-Quran — Maulana Abdul Rahman Kilani',
          org: 'Maktaba-as-Salam Lahore / Mohaddis Library',
          desc: 'Rigorous modern Urdu commentary balancing linguistic morphology with authentic Sunnah evidence. 100% sanitized text.',
          url: 'https://www.equranlibrary.com',
          badge: 'Sanitized Clean Text'
        }
      ]
    },
    {
      category: '5. Audio CDN & Scholarly Research Platforms',
      icon: <Volume2 className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          title: 'EveryAyah & Quran.com Audio CDN',
          org: 'EveryAyah.com & Quran Foundation',
          desc: 'High-bitrate verse-by-verse audio recitations and millisecond-level word timing segments for Shaikh Mishary Rashid Alafasy.',
          url: 'https://everyayah.com',
          badge: 'High-Bitrate MP3'
        },
        {
          title: 'Ayat — Electronic Mosshaf Project (KSU)',
          org: 'King Saud University Electronic Mosshaf Project',
          desc: 'Academic repository for recitation, classical Arabic commentaries, and cross-comparative studies.',
          url: 'https://quran.ksu.edu.sa',
          badge: 'Academic Research'
        },
        {
          title: 'Al-Maktabah Al-Shamilah & Tafsir Center',
          org: 'Al-Maktabah Al-Shamilah & Tafsir Center for Quranic Studies',
          desc: 'Global digital repository for classical Islamic literature, tafsir methodologies, and Quranic sciences.',
          url: 'https://shamela.ws',
          badge: 'Scholarly Database'
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn" dir="ltr">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-out Sidebar Panel (Right-Anchored, LTR Content) */}
      <aside className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col md:flex-row h-full overflow-hidden font-sans">
        
        {/* Top-Right Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close (Esc)"
          aria-label="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ======================================================== */}
        {/* SIDEBAR NAVIGATION RAIL                                  */}
        {/* ======================================================== */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-950/90 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0 select-none">
          <div className="space-y-4">
            {/* Brand Header */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  Al-Wahyain
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">
                  v1.2.2 • Local-First
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex md:flex-col gap-1 overflow-x-auto">
              <button
                onClick={() => onSelectTab('about')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'about'
                    ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Info className="w-4 h-4 shrink-0" />
                <span>About</span>
              </button>

              <button
                onClick={() => onSelectTab('verification')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'verification'
                    ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Text Verification</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono">
                  Verified
                </span>
              </button>

              <button
                onClick={() => onSelectTab('preferences')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'preferences'
                    ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 shrink-0" />
                <span>Preferences</span>
              </button>

              <button
                onClick={() => onSelectTab('references')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'references'
                    ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Library className="w-4 h-4 shrink-0" />
                <span>References</span>
              </button>

              <button
                onClick={() => onSelectTab('docs')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'docs'
                    ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Code2 className="w-4 h-4 shrink-0" />
                <span>Documentation</span>
              </button>
            </nav>
          </div>

          {/* Bottom Offline Database Status & Developer Quick Links */}
          <div className="hidden md:block pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                <Database className="w-3.5 h-3.5" />
                <span>Offline Engine Active</span>
              </div>
              <p className="leading-relaxed text-[11px] font-mono">
                604 Pages • 6,236 Ayahs • 6 Tafasir
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
        {/* MAIN CONTENT AREA (Clean, Formal English Developer Tone) */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* ======================================================== */}
          {/* PAGE 1: ABOUT                                            */}
          {/* ======================================================== */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Banner */}
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-2 pr-10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold font-mono">
                    v1.2.2 • Academic & Computational Quran Station
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Al-Wahyain — High-Performance Quranic Morphology, Syntax & Comparative Tafsir Station
                </h1>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  Al-Wahyain is a local-first, high-performance research workstation engineered for rigorous Quranic scholarship. It unifies official Medina Mushaf typography, fine-grained morphological and syntactic treebanks, and comparative study across six classical and contemporary commentaries—running entirely offline with zero network latency or external telemetry.
                </p>
              </div>

              {/* 4 Core Pillars — Borderless Unified Grid */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                  Core Engineering & Scholarly Pillars
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        1. Authentic Madani Typography (QCF V2 & V4 COLRv1)
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Pixel-accurate rendering of the 604-page Medina Mushaf using official King Fahd Complex font glyphs (<code className="font-mono text-[11px]">code_v2</code>) and Quran Foundation's COLRv1 vector color layers for fine-grained tajweed visualization.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        2. Interlinear Word-by-Word & Comparative Translations
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Sub-word lexical glosses in Urdu and English beneath every token, coupled with synchronized dual-pane comparative viewing across nine authorized scholarly translations.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        3. Computational Morphology & Root Indexing
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Comprehensive lemma, root, and grammatical decomposition across 77,429 tokens with instant cross-corpus root concordance, verbal form extraction, and dependency tree visualizations.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Library className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        4. Comparative Scholarly Tafasir Engine
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Parallel multi-pane and focused study across 37,416 commentary records (Bayan, Tafhim, Ma'arif, Ibn Kathir, Sa'di, and Tayseer) with clean, sanitized textual provenance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Action Row */}
              <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Inspect the complete verification audit, font glyph mappings, and scholarly sanad.
                  </span>
                </div>
                <button
                  onClick={() => onSelectTab('verification')}
                  className="px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Inspect Text Verification</span>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Minimal Keyboard Hint */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60 font-mono">
                <span>Global Search: Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">Ctrl+K</kbd> for lexical search. Keybindings: Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">Ctrl+/</kbd> for the full shortcuts modal.</span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 2: TEXT VERIFICATION & AUTHENTICITY                 */}
          {/* ======================================================== */}
          {activeTab === 'verification' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-1.5 pr-10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>100% Verified Islamic Corpus • Zero Discrepancies</span>
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span>Text Verification, Orthography & Commentary Provenance</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  Formal technical audit and scholarly provenance declaration for Quranic script, diacritics, typography glyphs, and commentary integrity:
                </p>
              </div>

              {/* Verification Metric Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">114</div>
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Surahs</div>
                  <div className="text-[10px] text-slate-400">Standard Madani Sequence</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">6,236</div>
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Ayahs</div>
                  <div className="text-[10px] text-slate-400">Tanzil & KFGQPC Verified</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">77,429</div>
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Word Tokens</div>
                  <div className="text-[10px] text-slate-400">Morphology & Lexical Concordance</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">37,416</div>
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Tafsir Records</div>
                  <div className="text-[10px] text-slate-400">Purged of Scraped Web Artifacts</div>
                </div>
              </div>

              {/* Verification Sections */}
              <div className="space-y-4 pt-1">
                
                {/* 1. Uthmani Script & Medina Mushaf */}
                <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1. Uthmanic Script & Tanzil v1.0.2 Concordance Audit</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                    The foundational Quranic text conforms strictly to the 1422H Medina Mushaf issued by the <strong>King Fahd Glorious Quran Printing Complex (KFGQPC)</strong>. Full character-by-character and diacritic-by-diacritic parity has been verified against the international <strong>Tanzil Quran Project (v1.0.2)</strong>. Zero discrepancies exist across all 6,236 verses, ruku markers, sajdah indicators, and Manzil/Juz subdivisions.
                  </p>
                </div>

                {/* 2. Fonts & Glyphs Integrity */}
                <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>2. Calligraphic Glyphs & COLRv1 Tajweed Vector Layering</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                    Instead of fallback system Unicode Arabic, each word renders via authentic King Fahd Complex page-specific glyph codes (<code className="font-mono text-[11px]">code_v2</code>) mapped across standard 15-line Madani Mushaf pages (1..604). In tajweed mode, the engine loads Quran Foundation <strong>COLRv1</strong> vector fonts containing multi-layer color palettes for Ghunnah, Ikhfa, Idgham, Qalqalah, Iqlab, and Madd rules.
                  </p>
                </div>

                {/* 3. Tafasir Sanitization & Watermark Purge */}
                <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>3. Commentary Integrity & Scraped Artifact Eradication</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                    All six integrated commentaries (Bayan-ul-Quran, Tafhim-ul-Quran, Ma'arif-ul-Quran, Tafsir Ibn Kathir, Taiseer-ul-Quran, and Tafsir as-Sa'di) underwent automated and manual sanitization. All third-party scraper watermarks (e.g., <code className="font-mono text-[11px]">eQuran Library</code>) and concatenated navigational breadcrumbs have been purged from both the database tables and the <strong>SQLite FTS5</strong> search index (0 residual tokens), ensuring pristine scholarly integrity.
                  </p>
                </div>

                {/* 4. Morphology & Treebank Sanad */}
                <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>4. Grammatical Treebank & Morphological Sanad</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                    Grammatical tags, roots, lemmas, and verbal patterns for all 77,429 tokens conform to the academic dataset developed by the Language Research Group at the <strong>University of Leeds (Dr. Kais Dukes)</strong>. In addition, all 340 chapters of Professor Hafiz Ahmed Yar's monumental grammatical treatise (<em>Lughat, Irab wa Rasm-ul-Quran</em>) are natively indexed with syntactic dependency relations.
                  </p>
                </div>

                {/* 5. Offline Integrity & Privacy */}
                <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>5. Local-First Engine & Cryptographic / Offline Privacy</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                    All corpus data resides in a pre-indexed 447 MB local SQLite database utilizing FTS5 full-text search (<code className="font-mono text-[11px]">unicode61 remove_diacritics 2</code>). The application operates 100% offline with zero cloud telemetry, query tracking, or external network dependencies.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 3: PREFERENCES                                      */}
          {/* ======================================================== */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="pb-3 border-b border-slate-200 dark:border-slate-800 pr-10">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                  <span>Reading & Rendering Preferences</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Configure layout atmosphere, margin padding, typography scaling, translation pairs, and offline recitation storage.
                </p>
              </div>

              {/* Group 1: Display & Atmosphere (Theme, Padding, Font Size) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800 space-y-5">
                <h2 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>1. Atmosphere, Layout & Typography</span>
                </h2>

                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Reading Theme Atmosphere
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {([
                      { id: 'light', label: 'Day (Light)', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
                      { id: 'sepia', label: 'Sepia (Warm)', icon: <Coffee className="w-3.5 h-3.5 text-amber-700" /> },
                      { id: 'dark', label: 'Night (Dark)', icon: <Moon className="w-3.5 h-3.5 text-indigo-400" /> },
                      { id: 'oled', label: 'Midnight (OLED)', icon: <Eye className="w-3.5 h-3.5 text-emerald-400" /> },
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
                      <span>Content Margins (Horizontal Padding)</span>
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                      {horizontalPadding}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-emerald-600 font-bold shrink-0 font-mono">1% (Wide)</span>
                    <input
                      type="range"
                      min={1}
                      max={24}
                      step={1}
                      value={horizontalPadding}
                      onChange={(e) => onChangeHorizontalPadding(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400 font-bold shrink-0 font-mono">24% (Column)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {[
                      { val: 2, label: 'Wide (2%)' },
                      { val: 6, label: 'Balanced (6%)' },
                      { val: 12, label: 'Default (12%)' },
                      { val: 18, label: 'Book (18%)' }
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
                      <span>Typography Scaling (Prose & Script)</span>
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                      {fontSize}px (Quranic Script: {Math.round(fontSize * 1.65)}px)
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
                      { val: 15, label: 'Compact (15px)' },
                      { val: 18, label: 'Standard (18px)' },
                      { val: 21, label: 'Large (21px)' },
                      { val: 25, label: 'Display (25px)' }
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
                  <span>2. Typography & Comparative Translations</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Tajweed Switch */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">COLRv1 Tajweed Coloring</div>
                      <div className="text-[11px] text-slate-400">Multi-palette vector glyphs</div>
                    </div>
                    <button
                      onClick={onToggleTajweed}
                      className={`px-3 py-1 rounded-lg border font-bold transition-colors cursor-pointer ${
                        showTajweed
                          ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {showTajweed ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  {/* Focus Mode Switch */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Tafsir Focus Layout</div>
                      <div className="text-[11px] text-slate-400">Single commentary focus vs. stacked view</div>
                    </div>
                    <button
                      onClick={() => onSelectTafsirLayoutMode(tafsirLayoutMode === 'focus' ? 'stacked' : 'focus')}
                      className={`px-3 py-1 rounded-lg border font-bold transition-colors cursor-pointer ${
                        tafsirLayoutMode === 'focus'
                          ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {tafsirLayoutMode === 'focus' ? 'Focus View' : 'Stacked All'}
                    </button>
                  </div>

                  {/* Primary Translator */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block">Primary Scholarly Translator</label>
                    <select
                      value={selectedTranslationAuthor}
                      onChange={(e) => onSelectTranslationAuthor(e.target.value)}
                      className="w-full h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 px-2.5 font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="taqi_usmani">Mufti Muhammad Taqi Usmani</option>
                      <option value="maududi">Sayyid Abul A'la Maududi</option>
                      <option value="junagarhi">Maulana Muhammad Junagarhi</option>
                      <option value="mahmud_hasan">Shaikh-ul-Hind Mahmud Hasan</option>
                      <option value="israr_ahmad">Dr. Israr Ahmad</option>
                      <option value="jalandhari">Fateh Muhammad Jalandhari</option>
                      <option value="sahih_intl">Saheeh International (EN)</option>
                      <option value="taqi_usmani_en">Mufti Taqi Usmani (EN)</option>
                      <option value="abdel_haleem">Abdel Haleem Oxford (EN)</option>
                    </select>
                  </div>

                  {/* Secondary Comparative Translator */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block">Secondary Comparative Translator</label>
                    <select
                      value={secondaryTranslationAuthor || 'none'}
                      onChange={(e) => onSelectSecondaryTranslationAuthor(e.target.value === 'none' ? null : e.target.value)}
                      className="w-full h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 px-2.5 font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="none">None (Disabled)</option>
                      <option value="sahih_intl">+ Saheeh International (EN)</option>
                      <option value="taqi_usmani_en">+ Taqi Usmani (EN)</option>
                      <option value="abdel_haleem">+ Abdel Haleem (EN)</option>
                      <option value="taqi_usmani">+ Mufti Taqi Usmani</option>
                      <option value="maududi">+ Maulana Maududi</option>
                      <option value="israr_ahmad">+ Dr. Israr Ahmad</option>
                    </select>
                  </div>

                  {/* Word by word */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block">Interlinear Word-by-Word Gloss</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onToggleWordByWord}
                        className={`px-3 h-9 rounded-xl border font-bold cursor-pointer shrink-0 ${
                          showWordByWord
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {showWordByWord ? 'Active' : 'Disabled'}
                      </button>
                      <select
                        value={wbwLanguage}
                        onChange={(e) => onSelectWbwLanguage(e.target.value as any)}
                        className="flex-1 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 px-2.5 font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                      >
                        <option value="both">Urdu + English</option>
                        <option value="ur">Hafiz Nazar Ahmed (UR 1)</option>
                        <option value="ur2">Hafiz Salahuddin Yusuf (UR 2)</option>
                        <option value="en">Sahih Intl WBW (EN 1)</option>
                        <option value="en2">Corpus Gloss (EN 2)</option>
                      </select>
                    </div>
                  </div>

                  {/* Tafsir Order Modal Trigger */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block">Commentary Order & Visibility</label>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTafsirSettings();
                      }}
                      className="w-full h-9 rounded-xl border border-emerald-500/60 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Configure Active Commentaries & Order</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Group 3: Offline Recitation Cache */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <span>3. Offline Recitation Storage (Alafasy Audio)</span>
                  </h2>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {audioCacheStatus?.cachedCount ?? '...'} / 6,236 Verses Cached
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Recitation audio automatically caches to local disk (<code className="font-mono text-[11px]">data/audio/alafasy</code>) upon playback for seamless offline listening without network requests.
                </p>

                <div className="flex items-center justify-between gap-3 pt-1 text-xs">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                    Disk Usage: {audioCacheStatus ? (audioCacheStatus.cachedBytes / (1024 * 1024)).toFixed(2) : '0'} MB
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePrecacheSurah(1)}
                      disabled={cachingSurahLoading}
                      className="px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{cachingSurahLoading ? 'Caching...' : 'Pre-cache Surah Al-Fatihah'}</span>
                    </button>
                    <button
                      onClick={refreshAudioCache}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                      title="Refresh Cache Status"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 4: REFERENCES & SCHOLARLY DIRECTORY                 */}
          {/* ======================================================== */}
          {activeTab === 'references' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="pb-3 border-b border-slate-200 dark:border-slate-800 pr-10">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Library className="w-5 h-5 text-emerald-600" />
                  <span>Data Sources & Scholarly Citations</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Direct references, licensing, and authoritative provenance for all Quranic text, fonts, translations, and commentaries:
                </p>
              </div>

              {/* Compact Academic Directory */}
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
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-mono">
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
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-bold transition-colors shrink-0 font-mono"
                          >
                            <span>Source Link</span>
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
          {/* PAGE 5: TECHNICAL DOCUMENTATION                          */}
          {/* ======================================================== */}
          {activeTab === 'docs' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="pb-3 border-b border-slate-200 dark:border-slate-800 pr-10">
                <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold font-mono">
                  System Architecture • Local-First SQLite • Data Pipelines
                </span>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-emerald-600" />
                  <span>Technical Architecture & Expansion Guide</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Internal architecture overview, dual-database model, ingestion pipelines, and extension procedures:
                </p>
              </div>

              {/* 1. Dual-Database Model */}
              <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
                <h2 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>1. Dual-Database Architecture</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white font-mono">data/quran_study.db (447 MB — Read-Only Corpus)</div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                      Contains 114 Surahs, 6,236 Ayahs, 77,429 word tokens, 9 translations, and 6 full commentaries (37,416 records) with SQLite FTS5 index. Memory-mapped (<code className="font-mono text-[10px]">mmap_size = 256MB</code>) for sub-millisecond query execution.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white font-mono">data/user_study.db (Writable User State)</div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                      Stores bookmarks, personal study notes, and commentary highlights in an isolated SQLite database attached at server launch via <code className="font-mono text-[10px]">ATTACH DATABASE</code>. User data remains untouched across app upgrades.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Pipeline Scripts Reference */}
              <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <h2 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>2. Data Ingestion & Maintenance Pipelines (scripts/)</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]" dir="ltr">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70">
                    <strong className="text-emerald-600 font-mono">scripts/seed_all_114_surahs.mjs</strong>
                    <div className="text-slate-500 dark:text-slate-400">114 Surahs, 6,236 Ayahs, 77,429 words, lines & QCF codes.</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70">
                    <strong className="text-emerald-600 font-mono">scripts/setup_fts5.mjs</strong>
                    <div className="text-slate-500 dark:text-slate-400">Builds FTS5 virtual tables with unicode61 diacritic-insensitive search.</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70">
                    <strong className="text-emerald-600 font-mono">scripts/sanitize_tafasir_watermarks.mjs</strong>
                    <div className="text-slate-500 dark:text-slate-400">Purges 3rd-party scraped artifacts and breadcrumbs across all tafasir.</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70">
                    <strong className="text-emerald-600 font-mono">scripts/seed_lexical_search.mjs</strong>
                    <div className="text-slate-500 dark:text-slate-400">Generates 14,771-token lexical dictionary & search syntax.</div>
                  </div>
                </div>
              </div>

              {/* 3. System Expansion */}
              <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <h2 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4" />
                  <span>3. System Expansion Procedures</span>
                </h2>
                <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-5 font-sans">
                  <li>
                    <strong>Adding a 7th+ Commentary:</strong> Insert records into the <code className="font-mono text-[10px]">tafasir</code> table with matching <code className="font-mono text-[10px]">surah_id</code> and <code className="font-mono text-[10px]">ayah_from/to</code> ranges, execute <code className="font-mono text-[10px]">node scripts/setup_fts5.mjs</code>, and register the slug in <code className="font-mono text-[10px]">DEFAULT_TAFSIR_ORDER</code> in <code className="font-mono text-[10px]">src/App.tsx</code>.
                  </li>
                  <li>
                    <strong>Adding a New Translation:</strong> Insert 6,236 rows into <code className="font-mono text-[10px]">translations</code> with a unique <code className="font-mono text-[10px]">author_id</code>, rebuild FTS index via <code className="font-mono text-[10px]">setup_fts5.mjs</code>, and expose the author in <code className="font-mono text-[10px]">SubHeaderToolbar.tsx</code> and <code className="font-mono text-[10px]">SidebarDrawer.tsx</code>.
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
