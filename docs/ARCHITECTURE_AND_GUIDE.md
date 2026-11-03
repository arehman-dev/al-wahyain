# الوحيين (Al-Wahyain) — Comprehensive Architecture, Data Pipeline & Expansion Guide

This document provides an exhaustive, end-to-end technical reference for **Al-Wahyain (`الوحيين`)**. It covers the internal application logic, the dual-database SQLite + FTS5 engine, the QCF V2/V4 font rendering system, every data-fetching and normalization script in `scripts/`, the REST API contract, the Electron Desktop architecture, and step-by-step instructions for expanding the platform with new Tafaseer, translations, or reciters.

---

## 1. High-Level System Architecture

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19 + TypeScript)                    │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ 1. Mushaf    │  │ 2. Translation   │  │ 3. Sarf/Nahw │  │ 4. Tafsir  │  │
│  │ (QCF V2/V4   │  │ (Dual Transl. +  │  │ (Morphology  │  │ (Focus &   │  │
│  │  604 Pages)  │  │  4 WBW Glosses)  │  │  Tree+Roots) │  │  Stacked)  │  │
│  └──────┬───────┘  └────────┬─────────┘  └──────┬───────┘  └─────┬──────┘  │
│         └───────────────────┴─────────┬─────────┴────────────────┘         │
│                                       ▼                                    │
│             Dynamic QCF FontFace Loader (src/utils/qcfFontLoader.ts)       │
│        Loads /fonts/qcf-v2/p{1..604}.woff2 & /fonts/qcf-v4-tajweed/...     │
└───────────────────────────────────────┬────────────────────────────────────┘
                                        │ HTTP JSON (/api/*) on 127.0.0.1
                                        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                 BACKEND ENGINE (server/index.mjs — node:sqlite)            │
│  • Zero external npm runtime dependencies (uses built-in node:http &       │
│    node:sqlite DatabaseSync introduced in Node.js 22+)                     │
│  • Memory-mapped I/O: PRAGMA mmap_size = 268435456 (256 MB)                │
│                                                                            │
│  ┌───────────────────────────────────┐   ┌──────────────────────────────┐  │
│  │ MAIN DB: data/quran_study.db      │   │ ATTACHED DB: user_study.db   │  │
│  │ (447 MB Read-Only Scholarly Data) │   │ (Writable User Data Store)   │  │
│  │ • surahs (114)                    │   │ • user_db.bookmarks          │  │
│  │ • ayahs (6,236) + ayahs_fts       │   │ • user_db.notes              │  │
│  │ • words (77,429)                  │   │ • user_db.highlights         │  │
│  │ • translations (56,124) + fts     │   └──────────────────────────────┘  │
│  │ • tafasir (37,416) + tafasir_fts  │                                     │
│  └───────────────────────────────────┘                                     │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Typography & Calligraphic Rendering Engine

### 2.1 Why Standard Unicode Arabic Is Not Enough for a Medina Mushaf
Standard Unicode fonts render the Uthmani text dynamically using OpenType shaping tables, which often causes slight variations in ligatures, waqf marks, and line widths compared to the printed **1426 AH / 1441 AH King Fahd Complex Medina Mushaf**.

To achieve **100% page-for-page, line-for-line fidelity** with the printed Medina Mushaf:
1. Each of the **604 pages** of the Mushaf has its own dedicated font file:
   - **Standard Mushaf (`QCF V2`)**: `public/fonts/qcf-v2/p1.woff2` through `p604.woff2`.
   - **Color Tajweed (`QCF V4 COLRv1`)**: `public/fonts/qcf-v4-tajweed/p1.woff2` through `p604.woff2`.
2. In the database (`words` and `ayahs` tables):
   - Every word stores its `page_number` (`1..604`), `line_number` (`1..15`), and `code_v2` (page-specific PUA glyph sequence).
   - Every ayah stores `page_madani` and `end_code_v2` (the ornate verse-end calligraphy glyph for that page).
3. **[`src/utils/qcfFontLoader.ts`](../src/utils/qcfFontLoader.ts)** dynamically registers a browser `FontFace` (`QCF2_P{page}` or `QCF4_TAJWEED_P{page}`) as soon as a page or verse comes into view, preloading adjacent pages (`page - 1`, `page + 1`) for instant page turns.

### 2.2 QCF V4 COLRv1 Tajweed Theme Palettes
In [`src/index.css`](../src/index.css), the COLRv1 vector color layers automatically adapt to the active reading atmosphere using CSS `font-palette`:
- `html { font-palette: --Light; }`
- `html.dark, html.theme-oled { font-palette: --Dark; }`
- `html.theme-sepia { font-palette: --Sepia; }`

### 2.3 UI & Commentary Typography
Configured in [`tailwind.config.js`](../tailwind.config.js) and [`src/index.css`](../src/index.css):
- **Urdu & Arabic UI / Translations / Tafsir Prose**: `IBM Plex Sans Arabic` (bundled locally in `public/fonts/ibm-plex-sans-arabic-*.woff2`).
- **English UI & All Numeric Badges**: `Montserrat` in standard English digits (`1, 2, 3...`).

---

## 3. Complete Database Schema (`data/quran_study.db` & `user_study.db`)

### 3.1 Core Corpus Tables (`main` database — `data/quran_study.db`)

1. **`surahs` (114 rows)**:
   - `id` (`INTEGER PRIMARY KEY`, 1–114)
   - `name_arabic`, `name_simple`, `name_urdu`
   - `revelation_place` (`'makkah'` | `'madinah'`), `revelation_order` (`INTEGER`)
   - `bismillah_pre` (`BOOLEAN`), `verses_count` (`INTEGER`), `page_start` (`INTEGER`)

2. **`ayahs` (6,236 rows)**:
   - `id` (`INTEGER PRIMARY KEY`, 1–6236)
   - `surah_id` (`INTEGER`), `ayah_number` (`INTEGER`), `verse_key` (`TEXT`, e.g. `'2:255'`)
   - `text_uthmani` (`TEXT`), `text_indopak` (`TEXT`), `text_simple` (`TEXT`)
   - `juz_number`, `hizb_number`, `rub_el_hizb_number`, `ruku_number`, `manzil_number`, `sajdah_number`
   - `page_madani` (`INTEGER`, 1–604), `page_indopak` (`INTEGER`)
   - `end_code_v2` (`TEXT`, QCF V2 verse-end ornament glyph)
   - `audio_url` (`TEXT`), `audio_segments` (`TEXT`, JSON array of `[word_position, index, start_ms, end_ms]`)

3. **`words` (77,429 rows)**:
   - `id` (`INTEGER PRIMARY KEY`), `ayah_id` (`INTEGER`), `position` (`INTEGER`)
   - `text_uthmani`, `text_indopak`, `text_simple`
   - `code_v2` (`TEXT`, QCF V2 glyph), `page_number` (`INTEGER`, 1–604), `line_number` (`INTEGER`, 1–15)
   - `transliteration` (`TEXT`)
   - `translation_ur` (Hafiz Nazar Ahmad WBW), `translation_ur_2` (Hafiz Salahuddin Yusuf WBW)
   - `translation_en` (Saheeh Intl WBW), `translation_en_2` (Corpus Gloss)
   - `root_arabic` (`TEXT`), `lemma_arabic` (`TEXT`), `pos_tag` (`TEXT`), `grammar_urdu` (`TEXT`)
   - `morphology_json` (`TEXT`, JSON containing `gender`, `number`, `person`, `case`, `mood`, `form`, `voice`, `features_raw`)

4. **`translations` (56,124 rows = 9 authors × 6,236 ayahs)**:
   - `id`, `ayah_id`, `surah_id`, `ayah_number`
   - `author_id` (`'taqi_usmani'`, `'maududi'`, `'junagarhi'`, `'mahmud_hasan'`, `'israr_ahmad'`, `'jalandhari'`, `'sahih_intl'`, `'taqi_usmani_en'`, `'abdel_haleem'`)
   - `author_name`, `language` (`'ur'` | `'en'`), `text`, `source_attribution`

5. **`tafasir` (37,416 rows = 6 Urdu Tafaseer × 6,236 ayahs)**:
   - `id`, `ayah_id`, `surah_id`, `ayah_number`
   - `tafsir_slug` (`'bayan'`, `'tafheem'`, `'maarifulquran'`, `'ibnkathir'`, `'saadi'`, `'taisirulquran'`)
   - `tafsir_name`, `author_name`, `content_html`, `source_attribution`, `source_url`

6. **FTS5 Full-Text Search Virtual Tables**:
   - `ayahs_fts` (`verse_key`, `surah_id`, `ayah_number`, `text_simple`, `text_uthmani`)
   - `translations_fts` (`verse_key`, `surah_id`, `ayah_number`, `author_name`, `text`)
   - `tafasir_fts` (`verse_key`, `surah_id`, `ayah_number`, `tafsir_slug`, `tafsir_name`, `author_name`, `content_text`)

### 3.2 User Data Tables (`user_db` attached database — `user_study.db`)
- **`user_db.bookmarks`**: `(id, surah_id, ayah_number, verse_key, created_at)`
- **`user_db.notes`**: `(id, surah_id, ayah_number, verse_key, note_text, tags, updated_at)`
- **`user_db.highlights`**: `(id, surah_id, ayah_number, verse_key, tafsir_slug, text, color, created_at)`

---

## 4. Complete Backend API Reference (`server/index.mjs`)

| Method & Endpoint | Description |
| :--- | :--- |
| `GET /api/surahs` | Returns all 114 Surahs ordered by `id`. |
| `GET /api/surahs/:id/ayahs` | Returns all Ayahs for Surah `:id`, hydrated with nested `translations[]` and `words[]` (including `code_v2`, `page_number`, `line_number`, `morphology`). |
| `GET /api/pages/:pageNumber` | Returns all Ayahs and Words located on Madani Mushaf page `:pageNumber` (`1..604`) for exact 15-line rendering. |
| `GET /api/ayahs/:surah/:ayah/tafsir` | Returns all 6 Urdu Tafaseer entries for `:surah::ayah`. If a commentary spans a group of verses and the current verse stores a pointer/short text, automatically resolves the linked commentary from the group's primary ayah. |
| `GET /api/ayahs/:surah/:ayah/peek` | Lightweight endpoint for cross-reference hover/click popovers (`text_uthmani`, `page_madani`, `end_code_v2`, `qcf_v2_text`, primary translation, and brief Tafsir snippets). |
| `GET /api/roots/:root` | Lexical concordance for an Arabic root (e.g. `ر ح م`): returns total occurrences, distinct Surahs, POS distribution, derived morphological forms, and up to 150 verse occurrences with `qcf_v2_text` and `page_madani`. |
| `GET /api/search?q=...&scope=...&surah=...&tafsir=...` | Multi-scope FTS5 search (`all`, `quran`, `translation`, `tafsir`, `root`) with automatic fallback to `LIKE` matching for partial substrings. |
| `GET / POST / DELETE /api/bookmarks` | CRUD operations on `user_db.bookmarks`. |
| `GET / POST / DELETE /api/notes` | CRUD operations on `user_db.notes`. |
| `GET / POST / DELETE /api/highlights` | CRUD operations on `user_db.highlights`. |

---

## 5. Complete Reference of Scripts in `scripts/`

Every script used to build, fetch, normalize, and index the corpus is preserved in [`scripts/`](../scripts):

1. **`scripts/schema.sql` & `scripts/init_db.py`**:
   - Initializes the base SQLite schema (`surahs`, `ayahs`, `words`, `translations`, `tafasir`).
2. **`scripts/seed_all_114_surahs.mjs`**:
   - Populates all 114 Surahs, 6,236 Ayahs (Uthmani, Indopak, Simple scripts, Juz/Hizb/Ruku/Manzil/Page metadata), and 77,429 morphological word tokens.
3. **`scripts/download_qcf_v2_fonts.mjs`**:
   - Downloads all 604 King Fahd Complex QCF V2 page fonts (`p1.woff2` – `p604.woff2`) into `public/fonts/qcf_v2/`.
4. **`scripts/seed_word_lines.mjs`**:
   - Populates `code_v2`, `page_number` (`1..604`), and `line_number` (`1..15`) for all 77,429 words from the Quran.com v4 API so each Mushaf page renders in its exact 15-line grid.
5. **`scripts/seed_ayah_end_glyphs.mjs`**:
   - Populates `end_code_v2` on all 6,236 rows of `ayahs` so the verse-end marker uses the authentic QCF V2 calligraphy glyph.
6. **`scripts/seed_multi_translations.mjs`**:
   - Seeds the 9 complete translations (6 Urdu + 3 English) and 4 Word-by-Word interlinear gloss sets (`translation_ur`, `translation_ur_2`, `translation_en`, `translation_en_2`).
7. **`scripts/seed_audio_segments_114.mjs`**:
   - Populates `audio_url` and millisecond word-level timestamp segments (`audio_segments`) for Shaykh Mishary Rashid Alafasy across all 114 Surahs.
8. **`scripts/seed_bayan_ibnkathir_all.mjs`**:
   - Seeds complete *Bayan ul Quran* (Dr. Israr Ahmad) and *Tafsir Ibn Kathir* (Maulana Muhammad Junagarhi) across all 114 Surahs.
9. **`scripts/seed_eql_tafasir.mjs`**:
   - Fetches and cleans *Ma'ariful Quran* (`maarifulquran`), *Tafheem ul Quran* (`tafheem`), and *Taisir ul Quran* (`taisirulquran`) across all 114 Surahs (6,236 ayahs each).
10. **`scripts/seed_saadi_tafsir.mjs`**:
    - Fetches and normalizes *Tafseer e Sa'di* (`saadi`, QUL resource 309 — *Taysir al-Karim al-Rahman* by Shaykh Abdur-Rahman al-Sa'di) across all 6,236 ayahs.
    - Specifically strips embedded duplicate multi-ayah Arabic/translation table wrappers (`<table>`, `<p class="ur">`, `<p class="ar">`) from grouped commentaries so *Tafseer e Sa'di* follows the exact same clean per-ayah commentary architecture as the other 5 Tafaseer.
11. **`scripts/setup_fts5.mjs`**:
    - Drops and rebuilds the SQLite FTS5 virtual tables (`ayahs_fts`, `translations_fts`, `tafasir_fts`) using `tokenize='unicode61 remove_diacritics 2'` across all 6,236 ayahs, 56,124 translations, and 37,416 Tafsir records.

---

## 6. How to Expand the Setup (Step-by-Step Guide)

### 6.1 How to Add a 7th+ Tafsir
1. **Insert into `tafasir` table**:
   Write a Node.js script in `scripts/seed_my_new_tafsir.mjs` that inserts 6,236 rows into `tafasir`:
   ```js
   import { DatabaseSync } from 'node:sqlite';
   const db = new DatabaseSync('data/quran_study.db');
   const stmt = db.prepare(`
     INSERT INTO tafasir (ayah_id, surah_id, ayah_number, tafsir_slug, tafsir_name, author_name, content_html, source_attribution, source_url)
     VALUES (?, ?, ?, 'my_tafsir_slug', 'نامِ تفسیر', 'نامِ مفسر', ?, 'Source Name', 'https://example.com')
   `);
   ```
   *(Tip: If the source groups multiple ayahs together, either insert the clean commentary on each ayah of the group or insert a short reference string `اس آیت کی تفسیر آیات X تا Y کے تحت ملاحظہ فرمائیں۔` on the secondary ayahs—`server/index.mjs` automatically resolves grouped references!)*
2. **Rebuild the FTS5 Search Index**:
   ```bash
   node scripts/setup_fts5.mjs
   ```
3. **Register the Slug in Frontend Defaults**:
   - In [`src/App.tsx`](../src/App.tsx), add `'my_tafsir_slug'` to `DEFAULT_TAFSIR_ORDER` and `DEFAULT_VISIBLE_TAFASIR`.
   - In [`src/components/TafsirSettingsModal.tsx`](../src/components/TafsirSettingsModal.tsx) and [`src/components/SearchModal.tsx`](../src/components/SearchModal.tsx), add its display label and metadata.

### 6.2 How to Add a New Translation
1. Insert 6,236 rows into `translations` with a unique `author_id` (e.g. `'kanzul_iman'` or `'pickthall'`).
2. Run `node scripts/setup_fts5.mjs` to index the new translation for full-text search.
3. Add `<option value="your_author_id">...</option>` in [`src/components/SubHeaderToolbar.tsx`](../src/components/SubHeaderToolbar.tsx) and [`src/components/SidebarDrawer.tsx`](../src/components/SidebarDrawer.tsx).

### 6.3 How to Package for Desktop (Windows, macOS, Linux)
1. **Architecture**:
   - [`electron/main.mjs`](../electron/main.mjs) boots [`server/index.mjs`](../server/index.mjs) on `127.0.0.1` using an ephemeral free port (`port: 0`).
   - It sets `CORPUS_DB_PATH` to `process.resourcesPath + '/data/quran_study.db'` (unpacked outside `app.asar`) and `USER_DB_PATH` to `app.getPath('userData') + '/user_study.db'`.
2. **Build Commands**:
   ```bash
   npm install -D electron electron-builder
   npm run desktop:build
   ```
   Output installers are generated in `release/`.
