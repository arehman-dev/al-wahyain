import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'quran_study.db');
const db = new DatabaseSync(dbPath);

console.log('📖 Starting 604-Page Line & Layout Ingestion from Quran.com...');

const updateWordStmt = db.prepare(`
  UPDATE words 
  SET page_number = ?, line_number = ?, code_v2 = ?
  WHERE location = ?
`);

async function fetchPageWithRetry(page, retries = 3) {
  const url = `https://api.quran.com/api/v4/verses/by_page/${page}?words=true&word_fields=line_number,page_number,location,code_v2`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'AlWahyainStudyStation/1.0' } });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise(r => setTimeout(r, 400 * attempt));
    }
  }
  return null;
}

async function runQueue(tasks, concurrency = 16) {
  const executing = new Set();
  const results = [];
  for (const task of tasks) {
    const p = task().then(res => {
      executing.delete(p);
      return res;
    });
    executing.add(p);
    results.push(p);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

async function main() {
  const pages = Array.from({ length: 604 }, (_, i) => i + 1);
  let processed = 0;
  let updatedWords = 0;

  const tasks = pages.map(page => async () => {
    try {
      const data = await fetchPageWithRetry(page);
      if (!data || !data.verses) return { page, words: [] };
      
      const wordItems = [];
      for (const v of data.verses) {
        if (!v.words) continue;
        for (const w of v.words) {
          if (w.location && w.line_number && w.char_type_name !== 'end') {
            wordItems.push({
              location: w.location,
              page_number: w.page_number || page,
              line_number: w.line_number,
              code_v2: w.code_v2 || ''
            });
          }
        }
      }
      processed++;
      if (processed % 50 === 0 || processed === 604) {
        console.log(`⏳ Fetched ${processed}/604 pages...`);
      }
      return { page, words: wordItems };
    } catch (err) {
      console.error(`Error on page ${page}:`, err.message);
      return { page, words: [] };
    }
  });

  const pageResults = await runQueue(tasks, 16);

  console.log('\n💾 Writing line_number & page_number to SQLite database in transaction...');
  db.exec('BEGIN TRANSACTION');
  for (const res of pageResults) {
    for (const w of res.words) {
      updateWordStmt.run(w.page_number, w.line_number, w.code_v2, w.location);
      updatedWords++;
    }
  }
  db.exec('COMMIT');

  console.log(`\n✅ Successfully mapped line_number & page_number for ${updatedWords} words across all 604 pages.`);
  
  // Verify in DB
  const stats = db.prepare('SELECT count(*) as total, count(line_number) as with_line, count(page_number) as with_page FROM words').get();
  console.log('Database Stats:', stats);
}

main().catch(console.error);
