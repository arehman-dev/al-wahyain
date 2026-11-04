import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { normalizeArabic } from '../server/arabicNormalizer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const dbPath = path.join(rootDir, 'data', 'hadith.db');

console.log('📚 Setting up data/hadith.db SQLite database...');
const db = new DatabaseSync(dbPath);

// Performance PRAGMAs
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA cache_size = -64000;
`);

// 1. Books Table
db.exec(`
  CREATE TABLE IF NOT EXISTS hadith_books (
    id INTEGER PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name_arabic TEXT NOT NULL,
    name_urdu TEXT NOT NULL,
    name_english TEXT NOT NULL,
    author_arabic TEXT NOT NULL,
    author_urdu TEXT NOT NULL,
    author_english TEXT NOT NULL,
    total_hadiths INTEGER NOT NULL
  );
`);

// 2. Chapters Table
db.exec(`
  CREATE TABLE IF NOT EXISTS hadith_chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL REFERENCES hadith_books(id),
    chapter_number INTEGER NOT NULL,
    title_arabic TEXT NOT NULL,
    title_urdu TEXT,
    title_english TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_chapters_book ON hadith_chapters(book_id, chapter_number);
`);

// 3. Hadiths Table
db.exec(`
  CREATE TABLE IF NOT EXISTS hadiths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL REFERENCES hadith_books(id),
    chapter_id INTEGER NOT NULL,
    hadith_number INTEGER NOT NULL,
    arabic_text TEXT NOT NULL,
    arabic_clean TEXT NOT NULL,
    urdu_text TEXT,
    english_narrator TEXT,
    english_text TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_hadiths_book_num ON hadiths(book_id, hadith_number);
  CREATE INDEX IF NOT EXISTS idx_hadiths_chapter ON hadiths(book_id, chapter_id);
`);

// 4. FTS5 Virtual Table for Search
db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS hadiths_fts USING fts5(
    arabic_clean,
    urdu_text,
    english_text,
    content='hadiths',
    content_rowid='id',
    tokenize='unicode61'
  );
`);

const BOOKS_CONFIG = [
  {
    id: 1,
    slug: 'bukhari',
    name_arabic: 'صحيح البخاري',
    name_urdu: 'صحیح بخاری',
    name_english: 'Sahih al-Bukhari',
    author_arabic: 'الإمام محمد بن إسماعيل البخاري',
    author_urdu: 'امام محمد بن اسماعیل بخاریؒ',
    author_english: 'Imam Muhammad ibn Ismail al-Bukhari',
    jsonUrl: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/bukhari.json',
    urduUrl: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-bukhari.json'
  },
  {
    id: 2,
    slug: 'muslim',
    name_arabic: 'صحيح مسلم',
    name_urdu: 'صحیح مسلم',
    name_english: 'Sahih Muslim',
    author_arabic: 'الإمام مسلم بن الحجاج النيسابوري',
    author_urdu: 'امام مسلم بن حجاج نیشاپوریؒ',
    author_english: 'Imam Muslim ibn al-Hajjaj',
    jsonUrl: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/muslim.json',
    urduUrl: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-muslim.json'
  },
  {
    id: 3,
    slug: 'abudawud',
    name_arabic: 'سنن أبي داود',
    name_urdu: 'سنن ابو داؤد',
    name_english: 'Sunan Abi Dawud',
    author_arabic: 'الإمام أبو داود السجستاني',
    author_urdu: 'امام ابو داؤد سجستانیؒ',
    author_english: 'Imam Abu Dawud al-Sijistani',
    jsonUrl: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/abudawud.json',
    urduUrl: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-abudawud.json'
  },
  {
    id: 4,
    slug: 'tirmidhi',
    name_arabic: 'جامع الترمذي',
    name_urdu: 'جامع ترمذی',
    name_english: 'Jami` at-Tirmidhi',
    author_arabic: 'الإمام أبو عيسى الترمذي',
    author_urdu: 'امام ابو عیسیٰ ترمذیؒ',
    author_english: 'Imam Abu `Isa at-Tirmidhi',
    jsonUrl: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/tirmidhi.json',
    urduUrl: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-tirmidhi.json'
  },
  {
    id: 5,
    slug: 'nasai',
    name_arabic: 'سنن النسائي',
    name_urdu: 'سنن نسائی',
    name_english: 'Sunan an-Nasa\'i',
    author_arabic: 'الإمام أحمد بن شعيب النسائي',
    author_urdu: 'امام احمد بن شعیب نسائیؒ',
    author_english: 'Imam Ahmad an-Nasa\'i',
    jsonUrl: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/nasai.json',
    urduUrl: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-nasai.json'
  },
  {
    id: 6,
    slug: 'ibnmajah',
    name_arabic: 'سنن ابن ماجه',
    name_urdu: 'سنن ابن ماجہ',
    name_english: 'Sunan Ibn Majah',
    author_arabic: 'الإمام محمد بن يزيد بن ماجه',
    author_urdu: 'امام محمد بن یزید ابن ماجہؒ',
    author_english: 'Imam Ibn Majah al-Qazwini',
    jsonUrl: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/ibnmajah.json',
    urduUrl: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-ibnmajah.json'
  },
  {
    id: 7,
    slug: 'malik',
    name_arabic: 'موطأ مالك',
    name_urdu: 'موطا امام مالک',
    name_english: 'Muwatta Malik',
    author_arabic: 'الإمام مالك بن أنس',
    author_urdu: 'امام مالک بن انسؒ',
    author_english: 'Imam Malik ibn Anas',
    jsonUrl: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/malik.json',
    urduUrl: null
  },
  {
    id: 8,
    slug: 'mishkat',
    name_arabic: 'مشكاة المصابيح',
    name_urdu: 'مشکوٰۃ المصابیح',
    name_english: 'Mishkat al-Masabih',
    author_arabic: 'الإمام الخطيب التبريزي',
    author_urdu: 'امام خطیب تبریزیؒ',
    author_english: 'Al-Khatib Al-Tabrizi',
    jsonUrl: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/other_books/mishkat_almasabih.json',
    urduUrl: null
  }
];

async function fetchJsonWithRetry(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (AlWahyain/1.3)' } });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    await new Promise(r => setTimeout(r, 800));
  }
  return null;
}

async function seedBook(bookCfg) {
  console.log(`\n📥 Fetching & Ingesting [${bookCfg.name_urdu} / ${bookCfg.name_english}]...`);
  
  // Check if book already seeded
  const existing = db.prepare('SELECT count(*) as count FROM hadiths WHERE book_id = ?').get(bookCfg.id);
  if (existing.count > 100) {
    console.log(`  ⏩ Book ${bookCfg.slug} already seeded with ${existing.count} hadiths. Skipping.`);
    return;
  }

  const mainData = await fetchJsonWithRetry(bookCfg.jsonUrl);
  if (!mainData || !mainData.hadiths) {
    console.error(`  ❌ Failed to load main data for ${bookCfg.slug}`);
    return;
  }

  // Fetch Urdu edition if available
  let urduMap = new Map();
  if (bookCfg.urduUrl) {
    try {
      console.log(`  🇵🇰 Fetching Urdu translation for ${bookCfg.slug}...`);
      const urduData = await fetchJsonWithRetry(bookCfg.urduUrl);
      if (urduData && urduData.hadiths) {
        for (const h of urduData.hadiths) {
          if (h.hadithnumber && h.text) {
            urduMap.set(h.hadithnumber, h.text);
          }
        }
        console.log(`  ✅ Loaded ${urduMap.size} Urdu translations.`);
      }
    } catch (e) {
      console.warn(`  ⚠️ Could not fetch Urdu for ${bookCfg.slug}:`, e.message);
    }
  }

  // 1. Insert Book metadata
  db.prepare(`
    INSERT OR REPLACE INTO hadith_books (id, slug, name_arabic, name_urdu, name_english, author_arabic, author_urdu, author_english, total_hadiths)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    bookCfg.id,
    bookCfg.slug,
    bookCfg.name_arabic,
    bookCfg.name_urdu,
    bookCfg.name_english,
    bookCfg.author_arabic,
    bookCfg.author_urdu,
    bookCfg.author_english,
    mainData.hadiths.length
  );

  // 2. Insert Chapters
  const insertChap = db.prepare(`
    INSERT OR REPLACE INTO hadith_chapters (book_id, chapter_number, title_arabic, title_urdu, title_english)
    VALUES (?, ?, ?, ?, ?)
  `);

  const chapters = mainData.chapters || [];
  db.exec('BEGIN TRANSACTION;');
  for (const chap of chapters) {
    insertChap.run(
      bookCfg.id,
      chap.id,
      chap.arabic || `باب ${chap.id}`,
      null,
      chap.english || `Chapter ${chap.id}`
    );
  }
  db.exec('COMMIT;');
  console.log(`  📖 Inserted ${chapters.length} chapters.`);

  // 3. Insert Hadiths
  const insertHadith = db.prepare(`
    INSERT INTO hadiths (book_id, chapter_id, hadith_number, arabic_text, arabic_clean, urdu_text, english_narrator, english_text)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertFts = db.prepare(`
    INSERT INTO hadiths_fts (rowid, arabic_clean, urdu_text, english_text)
    VALUES (?, ?, ?, ?)
  `);

  console.log(`  💾 Saving ${mainData.hadiths.length} hadiths into SQLite...`);
  db.exec('BEGIN TRANSACTION;');

  for (let idx = 0; idx < mainData.hadiths.length; idx++) {
    const h = mainData.hadiths[idx];
    const hNum = h.idInBook || (idx + 1);
    const arabicText = h.arabic || '';
    const arabicClean = normalizeArabic(arabicText);
    const urduText = urduMap.get(hNum) || urduMap.get(h.id) || null;
    const engNarrator = h.english?.narrator || null;
    const engText = h.english?.text || '';

    const res = insertHadith.run(
      bookCfg.id,
      h.chapterId || 1,
      hNum,
      arabicText,
      arabicClean,
      urduText,
      engNarrator,
      engText
    );

    insertFts.run(
      res.lastInsertRowid,
      arabicClean,
      urduText || '',
      engText
    );
  }

  db.exec('COMMIT;');
  console.log(`  ✅ Successfully saved ${mainData.hadiths.length} hadiths for ${bookCfg.name_english}!`);
}

async function main() {
  const startTime = Date.now();
  console.log('🚀 Starting Seeding of All 8 Canonical Hadith Collections (6 Kutub al-Sittah + Muwatta Malik + Mishkat al-Masabih)...');

  for (const cfg of BOOKS_CONFIG) {
    await seedBook(cfg);
  }

  const totalCount = db.prepare('SELECT count(*) as count FROM hadiths').get().count;
  console.log(`\n🎉 ALL 8 COLLECTIONS SEEDED SUCCESSFULLY!`);
  console.log(`  • Total Hadiths in Database: ${totalCount}`);
  console.log(`  • Elapsed Time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  console.log(`  • Location: ${dbPath}\n`);
}

main().catch(console.error);
