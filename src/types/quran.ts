export type ScriptMode = 'madani' | 'indopak';
export type MushafDisplayMode = 'page' | 'continuous';
export type AppMode = 'mushaf' | 'morphology' | 'tafsir';

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
  audio_url?: string;
  root?: string;
  lemma?: string;
  pos_tag?: string;
  grammar_details?: string;
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
  audio_url?: string;
  audio_segments?: [number, number, number, number][]; // [word_index, word_seq, start_ms, end_ms]
  translations?: AyahTranslation[];
  words?: Word[];
}

export interface TafsirEntry {
  id: number;
  tafsir_slug: 'tafheem' | 'maarif' | 'ibn_kathir' | 'tayseer';
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
  translation_text: string;
  author_name: string;
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
