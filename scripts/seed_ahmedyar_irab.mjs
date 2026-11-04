import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const dbPath = path.join(rootDir, 'data', 'quran_study.db');

const db = new DatabaseSync(dbPath);

console.log('📖 Setting up urdu_irab_ahmedyar table in SQLite...');
db.exec(`
  CREATE TABLE IF NOT EXISTS urdu_irab_ahmedyar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id INTEGER NOT NULL,
    ayah_start INTEGER NOT NULL,
    ayah_end INTEGER NOT NULL,
    title_ur TEXT NOT NULL,
    url TEXT NOT NULL,
    content_html TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_irab_surah ON urdu_irab_ahmedyar(surah_id);
  CREATE INDEX IF NOT EXISTS idx_irab_surah_ayah ON urdu_irab_ahmedyar(surah_id, ayah_start, ayah_end);
`);

function norm(s) {
  return (s || '')
    .replace(/[\s\u064B-\u065F\u0670\u0653\-]/g, '')
    .replace(/[أإآءؤئ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ہ/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک');
}

// Build Surah Name to ID map
const surahs = db.prepare('SELECT id, name_arabic, name_urdu, name_simple FROM surahs').all();
const surahMap = new Map();
for (const s of surahs) {
  surahMap.set(norm(s.name_arabic), s.id);
  surahMap.set(norm(s.name_urdu), s.id);
  surahMap.set(norm(s.name_simple), s.id);
}

function parseTitle(raw) {
  const cleanTitle = raw.replace(/&#8211;/g, '-').trim();
  let t = cleanTitle.replace(/^[\d\s]+/, '').trim();
  t = t.replace(/^(سورة|سورہ|سورۃ)/, 'سورۃ');

  if (t.includes('سورۃالفاتحہ') || t.includes('سورۃ الفاتحہ')) {
    return { surahId: 1, ayahStart: 1, ayahEnd: 7, title: cleanTitle };
  }

  // Extract all numbers
  const numbers = cleanTitle.match(/\d+/g)?.map(Number) || [];
  let aStart = 1;
  let aEnd = 1;
  if (numbers.length === 1) {
    aStart = numbers[0];
    aEnd = numbers[0];
  } else if (numbers.length >= 2) {
    aStart = numbers[0];
    aEnd = numbers[numbers.length - 1];
  }

  // Extract Surah name part: between 'سورۃ' and 'آیت' / 'آیت' / 'نمبر'
  const normTitle = t.replace(/\u0653/g, '').replace(/[آآ]/g, 'ا');
  const m = normTitle.match(/سور[ۃہت]\s*(.+?)(?:\s*ایت|\s*نمبر|$)/);
  if (m) {
    const sName = m[1].trim();
    const sId = surahMap.get(norm(sName));
    if (sId) {
      return { surahId: sId, ayahStart: aStart, ayahEnd: aEnd, title: cleanTitle };
    }
  }

  // Fallback: match any surah in title
  for (const [key, id] of surahMap.entries()) {
    if (key.length >= 3 && norm(cleanTitle).includes(key)) {
      return { surahId: id, ayahStart: aStart, ayahEnd: aEnd, title: cleanTitle };
    }
  }

  return { surahId: null, ayahStart: aStart, ayahEnd: aEnd, title: cleanTitle };
}

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AlWahyainHarvester/1.0)'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        return await res.text();
      }
    } catch {}
    await new Promise(r => setTimeout(r, 600));
  }
  return null;
}

async function main() {
  console.log('📡 Fetching index from https://www.hafizahmedyar.com/lughat-ul-quran-text/ ...');
  const indexHtml = await fetchWithRetry('https://www.hafizahmedyar.com/lughat-ul-quran-text/');
  if (!indexHtml) {
    console.error('Failed to fetch index page.');
    return;
  }

  const regex = /<a\s+href="(https:\/\/hafizahmedyar\.tanzeemdigitallibrary\.com\/Detail\/(\d+)\/(\d+))"[^>]*>(.*?)<\/a>/g;
  let match;
  const items = [];
  while ((match = regex.exec(indexHtml)) !== null) {
    const parsed = parseTitle(match[4]);
    if (parsed.surahId) {
      items.push({
        url: match[1],
        volume: match[2],
        pageId: match[3],
        ...parsed
      });
    }
  }

  console.log(`📋 Found ${items.length} mapped Quranic passages.`);

  const insertStmt = db.prepare(`
    INSERT INTO urdu_irab_ahmedyar (surah_id, ayah_start, ayah_end, title_ur, url, content_html)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const existingCount = db.prepare('SELECT count(*) as count FROM urdu_irab_ahmedyar').get().count;
  if (existingCount > 300) {
    console.log(`Table already contains ${existingCount} entries. Skipping full re-fetch.`);
    return;
  }

  db.exec('DELETE FROM urdu_irab_ahmedyar;');

  let completed = 0;
  let successful = 0;
  const total = items.length;
  const concurrency = 6;
  let cursor = 0;

  console.log(`⚡ Ingesting ${total} passages with concurrency = ${concurrency}...`);
  const startTime = Date.now();

  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      const item = items[idx];
      const pageHtml = await fetchWithRetry(item.url);
      if (pageHtml) {
        const detailMatch = pageHtml.match(/<div id="txtDetailWeb"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<div class="row text-left">/i)
          || pageHtml.match(/<div id="txtDetailWeb"[^>]*>([\s\S]*?)<\/div>/i);
        if (detailMatch) {
          const content = detailMatch[1].trim();
          try {
            insertStmt.run(item.surahId, item.ayahStart, item.ayahEnd, item.title, item.url, content);
            successful++;
          } catch (e) {
            console.error('Insert error:', e.message);
          }
        }
      }
      completed++;

      if (completed % 10 === 0 || completed === total) {
        const pct = ((completed / total) * 100).toFixed(1);
        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(0);
        process.stdout.write(`\r  [${pct}%] ${completed}/${total} | Saved: ${successful} (${elapsedSec}s)`);
      }
    }
  });

  await Promise.all(workers);
  console.log(`\n\n✅ Ingested ${successful} passages into urdu_irab_ahmedyar in ${((Date.now() - startTime) / 1000).toFixed(1)}s!`);
}

main().catch(console.error);
