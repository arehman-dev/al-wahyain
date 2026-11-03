import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'quran_study.db');
const db = new DatabaseSync(dbPath);

console.log('Setting up SQLite FTS5 Full-Text Search tables...');

// Create FTS5 tables
db.exec(`
  DROP TABLE IF EXISTS ayahs_fts;
  CREATE VIRTUAL TABLE ayahs_fts USING fts5(
    surah_id UNINDEXED,
    ayah_number UNINDEXED,
    verse_key,
    text_uthmani,
    text_indopak,
    translations_text,
    tokenize = 'unicode61'
  );

  DROP TABLE IF EXISTS tafasir_fts;
  CREATE VIRTUAL TABLE tafasir_fts USING fts5(
    surah_id UNINDEXED,
    ayah_from UNINDEXED,
    ayah_to UNINDEXED,
    tafsir_slug UNINDEXED,
    tafsir_name,
    author_name,
    content_text,
    tokenize = 'unicode61'
  );
`);

console.log('Populating ayahs_fts...');
const ayahs = db.prepare('SELECT id, surah_id, ayah_number, verse_key, text_uthmani, text_indopak FROM ayahs ORDER BY id ASC').all();
const allTranslations = db.prepare('SELECT surah_id, ayah_number, text FROM translations').all();

const transByAyah = {};
for (const t of allTranslations) {
  const k = `${t.surah_id}:${t.ayah_number}`;
  if (!transByAyah[k]) transByAyah[k] = [];
  transByAyah[k].push(t.text);
}

const insertAyahFts = db.prepare(`
  INSERT INTO ayahs_fts (surah_id, ayah_number, verse_key, text_uthmani, text_indopak, translations_text)
  VALUES (?, ?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION');
for (const a of ayahs) {
  const k = `${a.surah_id}:${a.ayah_number}`;
  const tText = (transByAyah[k] || []).join(' ');
  insertAyahFts.run(a.surah_id, a.ayah_number, a.verse_key, a.text_uthmani, a.text_indopak, tText);
}
db.exec('COMMIT');
console.log(`✓ Populated ayahs_fts with ${ayahs.length} verses.`);

console.log('Populating tafasir_fts...');
const allTafasir = db.prepare('SELECT surah_id, ayah_from, ayah_to, tafsir_slug, tafsir_name, author_name, content_html FROM tafasir').all();
const insertTafasirFts = db.prepare(`
  INSERT INTO tafasir_fts (surah_id, ayah_from, ayah_to, tafsir_slug, tafsir_name, author_name, content_text)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION');
let tCount = 0;
for (const t of allTafasir) {
  const cleanContent = t.content_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  insertTafasirFts.run(t.surah_id, t.ayah_from, t.ayah_to, t.tafsir_slug, t.tafsir_name, t.author_name, cleanContent);
  tCount++;
}
db.exec('COMMIT');
console.log(`✓ Populated tafasir_fts with ${tCount} commentary entries.`);

console.log('\nTesting FTS5 queries...');
const sampleAyah = db.prepare("SELECT verse_key, snippet(ayahs_fts, 3, '<b>', '</b>', '...', 10) as snip FROM ayahs_fts WHERE ayahs_fts MATCH ? LIMIT 2").all('"الرحمن"');
console.log('Ayah search for الرحمن:', sampleAyah);

const sampleTafsir = db.prepare("SELECT surah_id, ayah_from, tafsir_name, snippet(tafasir_fts, 6, '<b>', '</b>', '...', 12) as snip FROM tafasir_fts WHERE tafasir_fts MATCH ? LIMIT 2").all('"توحید"');
console.log('Tafsir search for توحید:', sampleTafsir);

console.log('🎉 FTS5 setup completed successfully!');
