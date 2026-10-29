-- Quran Study App SQLite Schema
PRAGMA foreign_keys = ON;

-- 1. Surahs table
CREATE TABLE IF NOT EXISTS surahs (
    id INTEGER PRIMARY KEY,
    name_arabic TEXT NOT NULL,
    name_simple TEXT NOT NULL,
    name_urdu TEXT NOT NULL,
    revelation_place TEXT NOT NULL,
    verses_count INTEGER NOT NULL,
    page_start INTEGER NOT NULL,
    page_end INTEGER NOT NULL
);

-- 2. Ayahs table
CREATE TABLE IF NOT EXISTS ayahs (
    id INTEGER PRIMARY KEY,
    surah_id INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    verse_key TEXT NOT NULL UNIQUE,
    text_uthmani TEXT NOT NULL,
    text_indopak TEXT NOT NULL,
    text_tajweed TEXT NOT NULL,
    page_madani INTEGER NOT NULL,
    page_indopak INTEGER NOT NULL,
    audio_url TEXT,
    audio_segments TEXT, -- JSON array: [[word_idx, start_ms, end_ms], ...]
    FOREIGN KEY(surah_id) REFERENCES surahs(id)
);
CREATE INDEX IF NOT EXISTS idx_ayahs_surah_ayah ON ayahs(surah_id, ayah_number);
CREATE INDEX IF NOT EXISTS idx_ayahs_page_madani ON ayahs(page_madani);
CREATE INDEX IF NOT EXISTS idx_ayahs_page_indopak ON ayahs(page_indopak);

-- 3. Words and Morphology table
CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY,
    surah_id INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    position INTEGER NOT NULL,
    location TEXT NOT NULL UNIQUE, -- e.g. "1:1:1"
    text_uthmani TEXT NOT NULL,
    text_indopak TEXT NOT NULL,
    translation_ur TEXT,
    translation_en TEXT,
    audio_url TEXT,
    root TEXT,
    lemma TEXT,
    pos_tag TEXT,
    grammar_details TEXT, -- JSON or string with traditional Arabic grammar analysis
    FOREIGN KEY(surah_id) REFERENCES surahs(id)
);
CREATE INDEX IF NOT EXISTS idx_words_surah_ayah ON words(surah_id, ayah_number);
CREATE INDEX IF NOT EXISTS idx_words_root ON words(root);

-- 4. Translations table
CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    author_id TEXT NOT NULL, -- e.g. "taqi_usmani", "jalandhari", "maududi", "sahih_int"
    author_name TEXT NOT NULL,
    language TEXT NOT NULL,  -- "ur" or "en"
    text TEXT NOT NULL,
    FOREIGN KEY(surah_id) REFERENCES surahs(id)
);
CREATE INDEX IF NOT EXISTS idx_translations_surah_ayah ON translations(surah_id, ayah_number);
CREATE INDEX IF NOT EXISTS idx_translations_author ON translations(author_id);

-- 5. Tafasir table (stacked multi-tafsir support)
CREATE TABLE IF NOT EXISTS tafasir (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tafsir_slug TEXT NOT NULL, -- "tafheem", "maarif", "ibn_kathir", "tayseer"
    tafsir_name TEXT NOT NULL,
    author_name TEXT NOT NULL,
    surah_id INTEGER NOT NULL,
    ayah_from INTEGER NOT NULL,
    ayah_to INTEGER NOT NULL,
    title TEXT,
    content_html TEXT NOT NULL,
    footnotes_json TEXT, -- JSON array of footnotes
    source_attribution TEXT,
    source_url TEXT,
    FOREIGN KEY(surah_id) REFERENCES surahs(id)
);
CREATE INDEX IF NOT EXISTS idx_tafasir_range ON tafasir(tafsir_slug, surah_id, ayah_from, ayah_to);

-- 6. Roots Dictionary / Concordance
CREATE TABLE IF NOT EXISTS roots (
    root TEXT PRIMARY KEY,
    root_arabic TEXT NOT NULL,
    meanings_ur TEXT,
    meanings_en TEXT,
    occurrences_count INTEGER DEFAULT 0
);
