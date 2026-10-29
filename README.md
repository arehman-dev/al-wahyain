# Al-Wahyain (الوحيين) — Quran & Islamic Study Station

A desktop-first, offline-capable study station designed for comparative reading of the Holy Quran, classical Urdu Tafasir, linguistic morphology, and the foundations of Islamic scholarship.

---

## 🌟 Key Features

### 1. Stacked & Comparative Multi-Tafsir Reader
* **Ayah Pinned at Top**: Arabic text (*Madani* or *Indo-Pak* script) paired with authentic Urdu translation (*Mufti Muhammad Taqi Usmani*).
* **4 Vertically Stacked & 2-Column Comparative Tafasir**:
  1. **تفہیم القرآن** (*Tafheem-ul-Quran* — مولانا سید ابوالاعلیٰ مودودی)
  2. **معارف القرآن** (*Maarif-ul-Quran* — مفتی محمد شفیع عثمانی)
  3. **تفسیر ابنِ کثیر** (*Tafsir Ibn Kathir Urdu* — حافظ عماد الدین ابنِ کثیر)
  4. **تیسیر القرآن** (*Tayseer-ul-Quran* — مولانا عبدالرحمٰن کیلانی)
* **Custom Reading Experience**:
  * Real-time **Font Scaler** (`A-` / `17px` / `A+`).
  * Typography toggle: **IBM Plex Sans Arabic** vs. **Noto Nastaliq Urdu**.
  * View toggle: **عمودی (1-Column Stacked)** vs. **تقابلی (2-Column Side-by-Side Grid)** on desktop.

### 2. Authentic 15-Line Mushaf Mode
* **True 15-Line Page View**: Authentic page frame with ornate borders, Juz headers, and page stepping.
* **Dual Script Support**: Toggle between **Madani (604-page King Fahd Complex standard)** and **Indo-Pak (15-line Pakistani standard)**.
* **Tajweed Color-Coding**: Real-time color-coded rules with interactive rules modal guide.
* **Continuous Scroll Mode**: For uninterrupted recitation with inline translations.

### 3. Word-by-Word Morphology (Quranic Corpus)
* **Interlinear Grammar Cards**: Arabic word, Urdu translation, and English meaning.
* **Traditional Arabic Grammar**: Grammatical classification (اسم، فعل، فاعل، مفعول، مبتدأ، خبر، مجرور، منصوب، مرفوع، صیغہ، وزن).
* **Root & Lemma Concordance**: Click any root (e.g. `ع - ل - م`) to explore total Quranic occurrences and jump to all verses containing that root.

### 4. Global Search System (`Ctrl + K` / `Cmd + K`)
* **Quran Verses & Translations**: Search in Urdu or Arabic (*"صبر"*, *"تقویٰ"*, *"جنت"*).
* **4 Tafasir Content Search**: Full-text keyword search across all 3,488 commentary records with context snippets and query highlighting.

### 5. Personal Study Suite: Bookmarks & Reflections
* **One-Click Bookmark Ribbon (`B`)**: Star favorite verses.
* **Personal Study Notes (`N`)**: Jot down reflections, cross-references, or lecture notes, persisted in local SQLite.
* **Study Notebook Modal**: Browse, review, or delete saved verses and notes.

### 6. Synchronized Audio Recitation Hub
* **Reciter**: Mishary Rashid Alafasy.
* **Playback Controls**: Play/Pause (`Space`), Repeat loop (`1x`, `3x`, `5x`, `∞`), Playback speed (`0.75x` to `1.5x`).
* **Real-Time Karaoke Highlighting**: Words highlight in sync with recitation.

### 7. Export & Sharing Hub
* **WhatsApp Card**: Formatted for instant sharing with Arabic, translation, and reference.
* **Academic Citation**: Arabic verse + translation + selected Tafsir snippet + author attribution & source link.
* **Markdown Export**: Formatted blockquotes ready for note-taking apps.

---

## ⌨️ Power-User Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| **`Space`** | Play / Pause recitation audio |
| **`Ctrl + K`** / **`⌘ + K`** | Open global search (Quran verses & 4 Tafasir) |
| **`←` / `→`** (or **`J` / `K`**) | Step to next / previous Ayah |
| **`B`** | Toggle bookmark on active Ayah |
| **`N`** | Open personal study note drawer |
| **`Z`** | Toggle Zen / Focus mode (collapses toolbars for distraction-free reading) |
| **`1` / `2` / `3`** | Switch mode (1: Tafsir, 2: Mushaf, 3: Morphology) |
| **`?`** | Open interactive shortcuts cheat sheet modal |
| **`Esc`** | Close any open drawer or modal |

---

## 🚀 Quick Start

### 1. Launch the Application
```bash
npm run start
```
* **Frontend**: `http://localhost:5173`
* **Local SQLite API**: `http://localhost:3001`

### 2. Available Seeded Chapters
The local SQLite database (`data/quran_study.db`) comes pre-seeded with:
* **All 114 Surahs metadata**
* **Surah 1 (*Al-Fatihah*)** — 7 verses
* **Surah 2 (*Al-Baqarah*)** — 286 verses
* **Surah 3 (*Ali 'Imran*)** — 200 verses
* **Surah 4 (*An-Nisa*)** — 176 verses
* **Surah 55 (*Ar-Rahman*)** — 78 verses
* **Surah 56 (*Al-Waqi'ah*)** — 96 verses
* **Surah 57 (*Al-Hadid*)** — 29 verses
* **Total: 872 Ayahs with complete words, translations, and all 4 classical Urdu Tafasir (3,488 records)**.

---

## 🛠️ Architecture & Tech Stack

* **Database**: Embedded local SQLite (`data/quran_study.db`)
* **Backend**: Node.js built-in `node:sqlite` (zero external C++ dependencies)
* **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons
* **Typography**: Google Fonts (*IBM Plex Sans Arabic*, *Noto Nastaliq Urdu*, *Amiri*, *Scheherazade New*)
