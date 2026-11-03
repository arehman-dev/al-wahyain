import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const dbPath = path.join(rootDir, 'data', 'quran_study.db');

export function normalizeArabic(text) {
  if (!text) return '';
  return text
    // Remove Tashkeel (Fathah, Dammah, Kasrah, Sukun, Shaddah, Tanween, dagger alif)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alefs (أ, إ, آ -> ا)
    .replace(/[إأآءؤئ]/g, 'ا')
    // Normalize Alif Maqsurah (ى -> ي)
    .replace(/ى/g, 'ي')
    // Normalize Ta Marbuta (ة -> ه)
    .replace(/ة/g, 'ه')
    // Strip Quranic Waqf symbols (ۖ ۗ ۚ ۛ ۜ ۞ ۟ ۠ ۡ ۢ)
    .replace(/[\u06D6-\u06ED]/g, '')
    // Normalize Persian/Urdu Yeh and Kaf if any
    .replace(/ی/g, 'ي')
    .replace(/ک/g, 'ك')
    .trim();
}

console.log('🔍 Seeding Precision Lexical Search Engine tables & indexes...');
const db = new DatabaseSync(dbPath);

// 1. Add text_clean to ayahs
const ayahCols = db.prepare('PRAGMA table_info(ayahs)').all().map(c => c.name);
if (!ayahCols.includes('text_clean')) {
  console.log('Adding text_clean column to ayahs...');
  db.exec('ALTER TABLE ayahs ADD COLUMN text_clean TEXT;');
}

// 2. Add text_clean to words
const wordCols = db.prepare('PRAGMA table_info(words)').all().map(c => c.name);
if (!wordCols.includes('text_clean')) {
  console.log('Adding text_clean column to words...');
  db.exec('ALTER TABLE words ADD COLUMN text_clean TEXT;');
}

// 3. Populate text_clean in ayahs
console.log('Populating ayahs.text_clean...');
const ayahs = db.prepare('SELECT id, text_uthmani FROM ayahs').all();
const updateAyah = db.prepare('UPDATE ayahs SET text_clean = ? WHERE id = ?');
db.exec('BEGIN TRANSACTION;');
for (const a of ayahs) {
  updateAyah.run(normalizeArabic(a.text_uthmani), a.id);
}
db.exec('COMMIT;');
console.log(`Updated ${ayahs.length} ayahs with clean text.`);

// 4. Populate text_clean in words
console.log('Populating words.text_clean...');
const words = db.prepare('SELECT id, text_uthmani FROM words').all();
const updateWord = db.prepare('UPDATE words SET text_clean = ? WHERE id = ?');
db.exec('BEGIN TRANSACTION;');
for (const w of words) {
  updateWord.run(normalizeArabic(w.text_uthmani), w.id);
}
db.exec('COMMIT;');
console.log(`Updated ${words.length} words with clean text.`);

// 5. Create Indexes
console.log('Creating database indexes...');
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_ayahs_text_clean ON ayahs(text_clean);
  CREATE INDEX IF NOT EXISTS idx_words_text_clean ON words(text_clean);
  CREATE INDEX IF NOT EXISTS idx_words_root ON words(root);
  CREATE INDEX IF NOT EXISTS idx_words_lemma ON words(lemma);
`);

// 6. Create lexical_dictionary table
console.log('Creating lexical_dictionary table...');
db.exec(`
  CREATE TABLE IF NOT EXISTS lexical_dictionary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_clean TEXT NOT NULL,
    token_uthmani TEXT NOT NULL,
    root TEXT,
    lemma TEXT,
    occurrences_count INTEGER NOT NULL
  );
  DELETE FROM lexical_dictionary;
`);

const allWords = db.prepare('SELECT text_uthmani, text_clean, root, lemma FROM words').all();
const tokenMap = new Map();
for (const w of allWords) {
  const clean = w.text_clean;
  if (!clean) continue;
  if (!tokenMap.has(clean)) {
    tokenMap.set(clean, {
      token_clean: clean,
      token_uthmani: w.text_uthmani,
      root: w.root,
      lemma: w.lemma,
      occurrences_count: 0
    });
  }
  tokenMap.get(clean).occurrences_count++;
}

console.log(`Inserting ${tokenMap.size} unique lexical tokens into lexical_dictionary...`);
const insertLex = db.prepare(`
  INSERT INTO lexical_dictionary (token_clean, token_uthmani, root, lemma, occurrences_count)
  VALUES (?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION;');
for (const item of tokenMap.values()) {
  insertLex.run(item.token_clean, item.token_uthmani, item.root, item.lemma, item.occurrences_count);
}
db.exec('COMMIT;');

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_lexical_token_clean ON lexical_dictionary(token_clean);
  CREATE INDEX IF NOT EXISTS idx_lexical_root ON lexical_dictionary(root);
  CREATE INDEX IF NOT EXISTS idx_lexical_lemma ON lexical_dictionary(lemma);
`);

console.log('✅ Precision Lexical Search Engine tables and indexes ready!');
