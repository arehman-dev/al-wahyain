# الوحيين — Al-Wahyain (`v1.2.0`)

**Offline-First Quranic Study, Lexical Morphology & Comparative Urdu Tafaseer Workstation**

> **الوحيين (Al-Wahyain)** is a fast, 100% local-first scholarly workstation for studying the Noble Qur'an across **604 authentic Medina Mushaf pages (QCF V2 & V4 COLRv1 Tajweed)**, **Interactive SVG Syntactic Dependency Treebank (`corpus.quran.com` style) with 10 Sarf Verb Forms**, **Complete Urdu I'rab Treatise of Prof. Hafiz Ahmed Yar ؒ (340 passages)**, **Precision Lexical Search Engine (Tanzil-style operators & 114-Surah dispersion heatmap)**, **77,429 morphologically analyzed words**, **9 translations (6 Urdu + 3 English)**, and **6 complete classical & contemporary Urdu Tafaseer (37,416 entries)**—running seamlessly both in the browser and as a cross-platform Desktop Application.

- **Developer & Architect**: **Abdul Rehman (`@arehman-dev`)**
  - 🌐 **Portfolio Site**: [https://arehman-dev.github.io/](https://arehman-dev.github.io/)
  - ✍️ **Personal Editorial Site**: [https://arehman-dev.github.io/me/](https://arehman-dev.github.io/me/)
  - 💻 **GitHub**: [https://github.com/arehman-dev](https://github.com/arehman-dev) • [Repository](https://github.com/arehman-dev/al-wahyain)
  - 🐦 **X (Twitter)**: [https://x.com/arehman_dev](https://x.com/arehman_dev)
- 📖 **Deep Technical & Expansion Documentation**: See **[`docs/ARCHITECTURE_AND_GUIDE.md`](./docs/ARCHITECTURE_AND_GUIDE.md)** (also accessible in-app via **Sidebar → تکنیکی دستاویزات (Docs)**).

---

## 🌟 Core Pillars & Capabilities

1. **Authentic Medina Mushaf Typography (`QCF V2` & `QCF V4 COLRv1 Tajweed`)**:
   - Every Quranic word across the entire application—including the 15-line Continuous Mushaf, Translation view, Word-by-Word interlinear cards, Morphology Syntactic Tree, Root Explorer modal, Quick-Peek drawer, and Notes—renders using authentic **King Fahd Glorious Quran Printing Complex (KFGQPC) QCF V2 page-specific glyphs** (`p1.woff2` – `p604.woff2`).
   - One-click **QCF V4 COLRv1 Tajweed mode** dynamically switches to Quran Foundation color-layer vector fonts with theme-aware CSS `font-palette` (`--Light`, `--Dark`, `--Sepia`).
2. **4 Integrated Study Modes (`1` – `4` Hotkeys)**:
   - **`1` — قرآن (Mushaf Mode)**: Continuous 604-page, 15-line Medina Mushaf with page-accurate headers, Juz/Hizb/Ruku/Sajdah markers, word-level hover glosses, and synchronized audio highlighting.
   - **`2` — ترجمہ (Translation & Interlinear WBW Mode)**: Side-by-side primary and comparative secondary translations (6 Urdu + 3 English) with toggleable classical interlinear Word-by-Word (`الترجمة السطرية`) boxes.
   - **`3` — صرف و نحو (Morphology & Lexical Concordance Mode)**: Complete morphological breakdown of all 77,429 Quranic words (Root, Lemma, POS, Gender/Number/Person/Case/Mood, Decomposed Morpheme Syntactic Graph, and full Quranic Root Concordance).
   - **`4` — تفسیر (Comparative Tafaseer Mode)**: Study 6 complete Urdu Tafaseer in either **Single-Author Focus Mode** or **Stacked Comparative Mode** with custom ordering, persistent 3-color text highlighting (`Yellow`, `Sky Blue`, `Light Green`), and interactive cross-reference verse popovers.
3. **Dual-Database Local Engine (`quran_study.db` + `user_study.db`)**:
   - Powered by Node.js native `node:sqlite` (`DatabaseSync`) with SQLite FTS5 full-text search (`unicode61 remove_diacritics 2`).
   - Separates the **447 MB read-only scholarly corpus** (`data/quran_study.db`) from the **writable user database** (`user_study.db` via `ATTACH DATABASE ... AS user_db`), ensuring personal bookmarks, notes, and Tafsir highlights are never overwritten during application updates.

---

## 📚 Bundled Offline Corpus Summary

| Dataset Category | Included Works / Count | Details |
| :--- | :--- | :--- |
| **Quranic Script & Pages** | **114 Surahs • 6,236 Ayahs • 604 Pages** | Uthmani script, Indopak script, QCF V2 glyph codes (`code_v2`), verse-end markers (`end_code_v2`), and 15-line Mushaf layout coordinates. |
| **Morphology & Roots** | **77,429 Words • 1,648 Roots** | University of Leeds Quranic Arabic Corpus morphology, Arabic grammar templates, and root concordance. |
| **Urdu Translations (6)** | **37,416 Verse Translations** | 1. Mufti Muhammad Taqi Usmani (`taqi_usmani`)<br>2. Sayyid Abul Ala Maududi (`maududi`)<br>3. Maulana Muhammad Junagarhi (`junagarhi`)<br>4. Shaykh al-Hind Mahmud al-Hasan (`mahmud_hasan`)<br>5. Dr. Israr Ahmad (`israr_ahmad`)<br>6. Fateh Muhammad Jalandhari (`jalandhari`) |
| **English Translations (3)** | **18,708 Verse Translations** | 1. Saheeh International (`sahih_intl`)<br>2. Mufti Taqi Usmani English (`taqi_usmani_en`)<br>3. Prof. M.A.S. Abdel Haleem (`abdel_haleem`) |
| **Word-by-Word Glosses (4)** | **309,716 Word Glosses** | 1. Hafiz Nazar Ahmad Urdu WBW (`ur`)<br>2. Hafiz Salahuddin Yusuf Extended Urdu WBW (`ur2`)<br>3. Saheeh International English WBW (`en`)<br>4. Quranic Corpus English Gloss (`en2`) |
| **Complete Urdu Tafaseer (6)** | **37,416 Per-Ayah Commentaries** | 1. **بیان القرآن** — Dr. Israr Ahmad (`bayan`)<br>2. **تفہیم القرآن** — Sayyid Abul Ala Maududi (`tafheem`)<br>3. **معارف القرآن** — Mufti Muhammad Shafi Usmani (`maarifulquran`)<br>4. **تفسیر ابن کثیر** — Hafiz Ibn Kathir / Maulana Junagarhi (`ibnkathir`)<br>5. **تفسیر السعدی** — Shaykh Abdur-Rahman al-Sa'di (`saadi`)<br>6. **تیسیر القرآن** — Maulana Abdur-Rahman Kilani (`taisirulquran`) |

---

## 🚀 Quick Start (Web & Desktop Workflows)

### 1. Web Application Workflow (Default)
```bash
# Install dependencies
npm install

# Start both the Node.js SQLite Backend (port 3001) and Vite Frontend (port 5173)
npm run start
```
- **Frontend UI**: `http://localhost:5173`
- **Backend SQLite API**: `http://localhost:3001/api/...`

### 2. Desktop Application Workflow (Electron + `electron-builder`)
The desktop runtime uses `electron/main.mjs`, `electron/preload.cjs`, and `electron-builder.yml` without altering the web workflow:
```bash
# Install Electron & electron-builder (first time only when packaging desktop builds)
npm install -D electron electron-builder

# Launch the compiled Desktop App locally
npm run desktop:start

# Package unpacked desktop directory for testing
npm run desktop:pack

# Build distributable installers (.AppImage / .deb on Linux, .exe on Windows, .dmg on macOS)
npm run desktop:build
```

---

## 🗂️ Repository Structure

```text
al-wahyain/
├── data/
│   ├── quran_study.db            # 447 MB Read-Only Scholarly Corpus SQLite + FTS5 Database
│   └── user_study.db             # Auto-created Writable User DB (Bookmarks, Notes, Highlights)
├── docs/
│   └── ARCHITECTURE_AND_GUIDE.md # Deep Technical Architecture, Scripts, Schema & Expansion Guide
├── electron/
│   ├── main.mjs                  # Electron Main Process (Dual-DB paths, ephemeral loopback port, window state)
│   └── preload.cjs               # Secure ContextBridge (window.electronAPI)
├── public/
│   └── fonts/                    # 100 MB Offline Fonts (604 QCF V2 + 604 QCF V4 Tajweed + IBM Plex Sans Arabic)
├── scripts/                      # 12 Data Fetching, Normalization, Seeding & FTS5 Indexing Scripts
├── server/
│   ├── index.mjs                 # Zero-dependency Node.js HTTP + node:sqlite API & Static Server
│   └── start.mjs                 # Unified Launcher for Web Dev (spawns API server + Vite)
├── src/
│   ├── components/               # 19 Modular React UI Components (3-Bar Glassmorphic System, Views, Modals)
│   ├── types/                    # TypeScript Interfaces (quran.ts)
│   ├── utils/                    # QCF Font Loader, Mushaf Layout Metadata, Morphological Parser
│   ├── App.tsx                   # Central State, Keyboard Hotkeys, Cross-View Synchronization
│   └── index.css                 # Typography Rules, Glassmorphic Bars, COLRv1 Palettes & 4 Themes
├── electron-builder.yml          # Desktop Packaging Config (extraResources outside app.asar)
├── tailwind.config.js            # Unified Font Stacks (IBM Plex Sans Arabic, Montserrat, QCF V2)
└── package.json                  # Web & Desktop Scripts
```

---

## 🔗 Connect with the Developer

Built and maintained by **Abdul Rehman (`@arehman-dev`)**:
- **Engineering Portfolio**: [https://arehman-dev.github.io/](https://arehman-dev.github.io/)
- **Personal Editorial Space**: [https://arehman-dev.github.io/me/](https://arehman-dev.github.io/me/)
- **GitHub**: [https://github.com/arehman-dev](https://github.com/arehman-dev)
- **X (Twitter)**: [https://x.com/arehman_dev](https://x.com/arehman_dev)
