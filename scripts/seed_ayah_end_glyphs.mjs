import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'quran_study.db');
const db = new DatabaseSync(dbPath);

console.log('Ingesting ayah end glyphs (code_v2) for all 604 pages...');

// Ensure column end_code_v2 exists on words and ayahs
try {
  db.exec('ALTER TABLE words ADD COLUMN end_code_v2 TEXT');
} catch (e) {
  // column may already exist
}
try {
  db.exec('ALTER TABLE ayahs ADD COLUMN end_code_v2 TEXT');
} catch (e) {
  // column may already exist
}

const updateWordEndStmt = db.prepare(`
  UPDATE words 
  SET end_code_v2 = ? 
  WHERE surah_id = ? AND ayah_number = ? AND position = ?
`);

const updateAyahEndStmt = db.prepare(`
  UPDATE ayahs 
  SET end_code_v2 = ? 
  WHERE surah_id = ? AND ayah_number = ?
`);

async function fetchPage(page, retries = 3) {
  const url = `https://api.quran.com/api/v4/verses/by_page/${page}?words=true&word_fields=line_number,page_number,location,code_v2,char_type_name`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'AlWahyainStudyStation/1.0' } });
      if (res.ok) return await res.json();
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise(r => setTimeout(r, 300 * attempt));
    }
  }
  return null;
}

async function main() {
  const pages = Array.from({ length: 604 }, (_, i) => i + 1);
  const concurrency = 16;
  const pageResults = [];
  let completed = 0;

  async function worker() {
    while (pages.length > 0) {
      const p = pages.shift();
      if (!p) break;
      try {
        const data = await fetchPage(p);
        if (data && data.verses) {
          const list = [];
          for (const v of data.verses) {
            const endWord = v.words?.find(w => w.char_type_name === 'end');
            const [sId, aNum] = v.verse_key.split(':').map(Number);
            // find the last normal word position
            const normalWords = v.words?.filter(w => w.char_type_name !== 'end') || [];
            const lastPos = normalWords.length > 0 ? normalWords[normalWords.length - 1].position : null;
            if (endWord && endWord.code_v2) {
              list.push({ surah_id: sId, ayah_number: aNum, last_pos: lastPos, end_code_v2: endWord.code_v2 });
            }
          }
          pageResults.push(...list);
        }
        completed++;
        if (completed % 100 === 0 || completed === 604) {
          console.log(`Progress: ${completed}/604 pages processed`);
        }
      } catch (err) {
        console.error(`Error page ${p}:`, err.message);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  console.log(`Writing ${pageResults.length} end glyphs to DB...`);
  db.exec('BEGIN TRANSACTION');
  for (const item of pageResults) {
    updateAyahEndStmt.run(item.end_code_v2, item.surah_id, item.ayah_number);
    if (item.last_pos) {
      updateWordEndStmt.run(item.end_code_v2, item.surah_id, item.ayah_number, item.last_pos);
    }
  }
  db.exec('COMMIT');

  console.log('✅ Ayah end glyphs successfully saved!');
}

main().catch(console.error);
