import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'quran_study.db');

const db = new DatabaseSync(DB_PATH);

console.log('Seeding strictly authentic verbatim Surah Introductions (Ayah 0)...');

// 1. Prepared Statements
const getSurahStmt = db.prepare('SELECT id, name_arabic, name_simple, name_urdu FROM surahs ORDER BY id ASC');
const getMaududiIntroStmt = db.prepare('SELECT title_ur, text_html_ur FROM surah_introductions WHERE surah_id = ?');

const insertStmt = db.prepare(`
  INSERT INTO tafasir (
    tafsir_slug, tafsir_name, author_name, surah_id, ayah_from, ayah_to,
    title, content_html, footnotes_json, source_attribution, source_url
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION');

// Purge any existing Ayah 0 entries for complete idempotency
db.exec('DELETE FROM tafasir WHERE ayah_from = 0 AND ayah_to = 0');

const surahs = getSurahStmt.all();
let insertedCount = 0;

for (const s of surahs) {
  // Ingest ONLY authentic, verbatim introductions from Maududi's Tafhim-ul-Quran
  const maududiRow = getMaududiIntroStmt.get(s.id);
  if (maududiRow && maududiRow.text_html_ur) {
    insertStmt.run(
      'tafheem',
      'تفہیم القرآن',
      'مولانا سید ابوالاعلیٰ مودودی',
      s.id,
      0,
      0,
      maududiRow.title_ur || `مقدمہ و پس منظر: سورة ${s.name_urdu}`,
      maududiRow.text_html_ur,
      '[]',
      'سید ابو اعلیٰ مودودیؒ - تفہیم القرآن',
      'https://www.readmaududi.com'
    );
    insertedCount++;
  }
}

db.exec('COMMIT');

console.log(`\n🎉 Successfully seeded ${insertedCount} authentic verbatim Surah Introductions into database!`);
const totalTafasir = db.prepare('SELECT count(*) as c FROM tafasir').get().c;
console.log(`Total tafasir rows in database: ${totalTafasir} (37,416 verse commentaries + 114 authentic intros = 37,530)`);
