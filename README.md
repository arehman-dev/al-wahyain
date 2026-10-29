# Quran Study App — مطالعہ قرآن و تقابلی تفاسیر

A modern, desktop-first, offline-capable study station designed for comparative reading of the Holy Quran, linguistic morphology, and classical Urdu Tafasir.

---

## 🌟 Key Features

### 1. Stacked Multi-Tafsir Comparative Reader
* **Ayah Pinned at Top**: Arabic text (Madani or Indo-Pak script) paired with authentic Urdu translation (*Mufti Taqi Usmani*).
* **Vertically Stacked Tafasir**:
  1. **تفہیم القرآن** (*Tafheem-ul-Quran* — مولانا سید ابوالاعلیٰ مودودی)
  2. **معارف القرآن** (*Maarif-ul-Quran* — مفتی محمد شفیع عثمانی)
  3. **تفسیر ابنِ کثیر** (*Tafsir Ibn Kathir* — حافظ عماد الدین ابنِ کثیر)
  4. **تیسیر القرآن** (*Tayseer-ul-Quran* — مولانا عبدالرحمٰن کیلانی)
* **Expand & Collapse Controls**: Expand or collapse commentaries individually, or toggle all with `[+ تمام کھولیں]` and `[- تمام سمیٹیں]`.
* **Smooth Ayah Navigation**: Stepping to next/previous Ayahs updates the Ayah, translation, and all open Tafsir panels without page reloads.

### 2. Mushaf Reader Mode
* **Dual Script Support**: Toggle between **Madani (604-page King Fahd Complex standard)** and **Indo-Pak (15-line Pakistani standard)**.
* **Dual Display Mode**: Traditional **15-line Mushaf Page View** or **Continuous Reading Flow**.
* **Tajweed Color-Coding**: Standard palette (Madd, Ghunnah, Ikhfa, Qalqalah, Silent letters) with an interactive rules guide.
* **Inline & Drawer Translations**: Display translation directly under the Ayah or in an auxiliary panel.

### 3. Word-by-Word & Deep Morphology (Corpus)
* **Word-by-Word Interlinear Grid**: Arabic word, Urdu translation, and English meaning.
* **Traditional Arabic Grammar**: Grammatical classification (اسم، فعل، فاعل، مفعول، مبتدأ، خبر، مجرور، منصوب، مرفوع، صیغہ، وزن).
* **Root & Lemma Concordance**: Click any root (e.g. `ع - ل - م`) to explore total Quranic occurrences and jump to all verses containing that root.

### 4. Synchronized Audio Recitation
* **Reciter**: Mishary Rashid Alafasy.
* **Word-Level Highlighting**: Words highlight in real-time as the reciter recites.
* **Study Controls**: Repeat current Ayah `N` times, playback speed adjustment (0.75x to 1.5x).

### 5. Official Source Citations (Zero Requirement)
* Built-in attribution modal linking back to official institutions:
  * *The Quranic Arabic Corpus* (University of Leeds)
  * *King Fahd Glorious Quran Printing Complex* (Madinah)
  * *Tanzil Quran Project*
  * *ReadMaududi & eQuranLibrary*
  * *Quran.com API & EveryAyah*

---

## 🚀 Quick Start

### 1. Launch the Application
Run the single start command:
```bash
npm run start
```
* **Frontend**: `http://localhost:5173`
* **Local SQLite API**: `http://localhost:3001`

### 2. Seeding Additional Data (Optional)
The local SQLite database (`data/quran_study.db`) comes pre-seeded with baseline data:
* **All 114 Surahs metadata**
* **Surah 1 (Al-Fatihah)** and **Surah 2 (Al-Baqarah)** verses, words, audio segments, and translations
* **All 1,570 Quranic Roots**
* **The 4 core Urdu Tafasir** for Surah 1 and Surah 2

To re-seed or pull additional chapters:
```bash
# Seed Quran text & morphology
python3 scripts/seed_quran_data.py

# Seed the 4 Urdu Tafasir
python3 scripts/seed_tafasir.py
```

---

## 🛠️ Tech Stack & Architecture

* **Database**: Embedded local SQLite (`data/quran_study.db`)
* **Backend**: Node.js built-in `node:sqlite` (sub-millisecond local queries, zero external C++ dependencies)
* **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons
* **Typography**: Google Fonts (*Noto Nastaliq Urdu*, *Amiri*, *Scheherazade New*, *Gulzar*)
