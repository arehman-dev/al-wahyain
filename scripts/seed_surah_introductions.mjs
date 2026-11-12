import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'quran_study.db');

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS surah_introductions (
    id INTEGER PRIMARY KEY,
    surah_id INTEGER NOT NULL UNIQUE,
    title_ur TEXT,
    title_en TEXT,
    source_ur TEXT DEFAULT 'سید ابو اعلیٰ مودودیؒ - تفہیم القرآن',
    source_en TEXT DEFAULT 'Sayyid Abul Ala Maududi - Tafhim al-Qur''an',
    short_text_ur TEXT,
    short_text_en TEXT,
    text_html_ur TEXT NOT NULL,
    text_html_en TEXT NOT NULL,
    FOREIGN KEY(surah_id) REFERENCES surahs(id)
  );
  CREATE INDEX IF NOT EXISTS idx_surah_intro_surah_id ON surah_introductions(surah_id);
`);

async function fetchIntro(surahId, lang) {
  const url = `https://api.quran.com/api/v4/chapters/${surahId}/info?language=${lang}`;
  for (let retry = 0; retry < 3; retry++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'AlWahyain/1.2' } });
      if (res.ok) {
        const json = await res.json();
        return json.chapter_info || null;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 500 * (retry + 1)));
    }
  }
  return null;
}

const insertStmt = db.prepare(`
  INSERT INTO surah_introductions (
    surah_id, title_ur, title_en, source_ur, source_en,
    short_text_ur, short_text_en, text_html_ur, text_html_en
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(surah_id) DO UPDATE SET
    title_ur = excluded.title_ur,
    title_en = excluded.title_en,
    source_ur = excluded.source_ur,
    source_en = excluded.source_en,
    short_text_ur = excluded.short_text_ur,
    short_text_en = excluded.short_text_en,
    text_html_ur = excluded.text_html_ur,
    text_html_en = excluded.text_html_en
`);

async function main() {
  console.log("Seeding Surah Introductions (114 Surahs) from Tafhim-ul-Quran (Urdu & English)...");
  
  const surahs = db.prepare("SELECT id, name_arabic, name_simple, name_urdu FROM surahs ORDER BY id ASC").all();
  let successCount = 0;

  for (let i = 0; i < surahs.length; i++) {
    const s = surahs[i];
    process.stdout.write(`[${s.id}/114] Surah ${s.name_simple} (${s.name_arabic})... `);
    
    const [infoUr, infoEn] = await Promise.all([
      fetchIntro(s.id, 'ur'),
      fetchIntro(s.id, 'en')
    ]);

    if (!infoUr && !infoEn) {
      console.log("FAILED");
      continue;
    }

    insertStmt.run(
      s.id,
      `مقدمہ و پس منظر: سورة ${s.name_urdu}`,
      `Introduction: Surah ${s.name_simple}`,
      infoUr?.source || 'سید ابو اعلیٰ مودودیؒ - تفہیم القرآن',
      infoEn?.source || 'Sayyid Abul Ala Maududi - Tafhim al-Qur\'an',
      infoUr?.short_text || '',
      infoEn?.short_text || '',
      infoUr?.text || '',
      infoEn?.text || ''
    );

    successCount++;
    console.log("✓ Done");
  }

  const countRow = db.prepare("SELECT count(*) as cnt FROM surah_introductions").get();
  console.log(`\n🎉 Successfully seeded ${countRow.cnt}/114 Surah Introductions into database!`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
