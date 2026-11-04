export type ScriptMode = 'madani' | 'indopak';
export type MushafDisplayMode = 'page' | 'continuous';
export type AppMode = 'quran' | 'translation' | 'sarf' | 'tafseer' | 'mushaf' | 'morphology' | 'tafsir';
export type ReadingTheme = 'light' | 'sepia' | 'dark' | 'oled';
export type TafsirLayoutMode = 'stacked' | 'split' | 'focus';
export type OverallReadingMode = 'standard' | 'book';

export interface Surah {
  id: number;
  name_arabic: string;
  name_simple: string;
  name_urdu: string;
  revelation_place: string;
  verses_count: number;
  page_start: number;
  page_end: number;
}

export interface Word {
  id: number;
  surah_id: number;
  ayah_number: number;
  position: number;
  location: string;
  text_uthmani: string;
  text_indopak: string;
  translation_ur: string;
  translation_en: string;
  translation_ur_2?: string;
  translation_en_2?: string;
  audio_url?: string;
  root?: string;
  lemma?: string;
  pos_tag?: string;
  grammar_details?: string;
  page_number?: number;
  line_number?: number;
  code_v2?: string;
  end_code_v2?: string;
  surah_name_arabic?: string;
  surah_name_urdu?: string;
}

export interface PageData {
  page_number: number;
  lines: Record<string, Word[]>;
  verses: Ayah[];
  words_count: number;
}

export interface AyahTranslation {
  author_id: string;
  author_name: string;
  language: 'ur' | 'en';
  text: string;
}

export interface Ayah {
  id: number;
  surah_id: number;
  ayah_number: number;
  verse_key: string;
  text_uthmani: string;
  text_indopak: string;
  text_tajweed: string;
  page_madani: number;
  page_indopak: number;
  end_code_v2?: string;
  audio_url?: string;
  audio_segments?: [number, number, number, number][]; // [word_index, word_seq, start_ms, end_ms]
  translations?: AyahTranslation[];
  words?: Word[];
}

export interface TafsirEntry {
  id: number;
  tafsir_slug: 'bayan_ul_quran' | 'tafheem' | 'maarif' | 'ibn_kathir' | 'saadi' | 'tayseer';
  tafsir_name: string;
  author_name: string;
  surah_id: number;
  ayah_from: number;
  ayah_to: number;
  title?: string;
  content_html: string;
  footnotes?: { id: number; number: string; text: string }[];
  source_attribution: string;
  source_url: string;
}

export interface RootDetail {
  root: string;
  root_arabic: string;
  meanings_ur?: string;
  meanings_en?: string;
  occurrences_count: number;
  verses?: {
    surah_id: number;
    surah_name_urdu: string;
    ayah_number: number;
    text_uthmani: string;
    word_text: string;
    page_madani?: number;
    end_code_v2?: string;
    word_code_v2?: string;
    qcf_v2_text?: string;
  }[];
}

export interface SearchResultQuran {
  surah_id: number;
  surah_name_urdu: string;
  surah_name_arabic: string;
  surah_name_simple: string;
  ayah_number: number;
  verse_key: string;
  text_uthmani: string;
  text_indopak: string;
  text_clean?: string;
  translation_text: string;
  author_name: string;
  matched_positions?: number[];
  page_madani?: number;
}

export interface SurahDispersion {
  surah_id: number;
  name_arabic: string;
  name_urdu: string;
  name_simple: string;
  revelation_place: string;
  match_count: number;
}

export interface LexicalSearchResponse {
  query: string;
  spec?: {
    type: string;
    root?: string;
    lemma?: string;
    pattern?: string;
    phrase?: string;
    rawQuery: string;
  };
  total: number;
  results: SearchResultQuran[];
  dispersion: SurahDispersion[];
}

export interface AutocompleteItemRoot {
  root: string;
  root_arabic: string;
  occurrences_count: number;
}

export interface AutocompleteItemWord {
  token_clean: string;
  token_uthmani: string;
  root?: string;
  lemma?: string;
  occurrences_count: number;
}

export interface AutocompleteItemSurah {
  id: number;
  name_arabic: string;
  name_urdu: string;
  name_simple: string;
  revelation_place: string;
  verses_count: number;
}

export interface AutocompleteResponse {
  surahs: AutocompleteItemSurah[];
  roots: AutocompleteItemRoot[];
  words: AutocompleteItemWord[];
}

export interface SubWordSegment {
  type: 'PREFIX' | 'STEM' | 'SUFFIX';
  text: string;
  pos: string;
  root?: string;
  lemma?: string;
}

export interface TreebankNode {
  id: number;
  position: number;
  text_uthmani: string;
  root?: string;
  lemma?: string;
  pos_tag?: string;
  grammar_details?: string;
  translation_ur?: string;
  translation_en?: string;
  category: 'noun' | 'verb' | 'particle' | 'pronoun' | 'proper_noun' | 'adjective' | 'relative';
  role_arabic: string;
  role_code: string;
  sub_segments: SubWordSegment[];
}

export interface TreebankEdge {
  source: number;
  target: number;
  label_arabic: string;
  label_code: string;
}

export interface SarfParadigmItem {
  form: string;
  wazan: string;
  madi: string;
  mudari: string;
  masdar: string;
  ism_fail: string;
  ism_maful: string;
  meaning: string;
}

export interface RootTreebankInfo {
  root: string;
  lemma?: string;
  pos: string;
  paradigms: SarfParadigmItem[];
}

export interface AyahTreebankResponse {
  surah_id: number;
  ayah_number: number;
  nodes: TreebankNode[];
  edges: TreebankEdge[];
  roots: RootTreebankInfo[];
}

export interface UrduIrabEntry {
  id: number;
  surah_id: number;
  ayah_start: number;
  ayah_end: number;
  title_ur: string;
  url: string;
  content_html: string;
}

export interface UrduIrabResponse {
  surah_id: number;
  ayah_number: number;
  has_entry: boolean;
  entry: UrduIrabEntry | null;
}

export interface SearchResultTafsir {
  id: number;
  surah_id: number;
  surah_name_urdu: string;
  ayah_from: number;
  ayah_to: number;
  tafsir_slug: string;
  tafsir_name: string;
  author_name: string;
  snippet: string;
}

export interface Bookmark {
  id: number;
  surah_id: number;
  surah_name_urdu: string;
  ayah_number: number;
  verse_key: string;
  created_at: string;
  text_uthmani: string;
  text_indopak: string;
  translation_text?: string;
}

export interface AyahNote {
  id: number;
  surah_id: number;
  surah_name_urdu: string;
  ayah_number: number;
  verse_key: string;
  note_text: string;
  tags?: string;
  updated_at: string;
  text_uthmani?: string;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'purple';

export interface TafsirHighlight {
  id: string;
  surah_id: number;
  surah_name_urdu?: string;
  ayah_number: number;
  verse_key: string;
  tafsir_slug: string;
  text: string;
  color: HighlightColor;
  created_at: string;
}

export interface ReadingHistoryEntry {
  surah_id: number;
  ayah_number: number;
  verse_key: string;
  surah_name_urdu: string;
  timestamp: number;
}

export interface StudyState {
  currentSurahId: number;
  currentAyahNumber: number;
  activeMode: AppMode;
  scriptMode: ScriptMode;
  mushafDisplayMode: MushafDisplayMode;
  showTajweed: boolean;
  showInlineTranslation: boolean;
  selectedTranslationAuthor: string;
  expandedTafasir: Record<string, boolean>;
  fontSizeArabic: number;
  fontSizeUrdu: number;
}
