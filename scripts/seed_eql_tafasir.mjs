import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'quran_study.db');
const db = new DatabaseSync(dbPath);

const CONFIGS = [
  {
    slug: 'tafheem',
    name: 'تفہیم القرآن',
    author: 'مولانا سید ابوالاعلیٰ مودودی',
    source: 'ReadMaududi & eQuranLibrary',
    source_url: 'https://www.readmaududi.com',
    eql_slug: 'tafheemulquran'
  },
  {
    slug: 'maarif',
    name: 'معارف القرآن',
    author: 'مفتی محمد شفیع عثمانی',
    source: 'Easy Quran wa Hadees & eQuranLibrary',
    source_url: 'https://www.equranlibrary.com',
    eql_slug: 'maarifulquran'
  },
  {
    slug: 'tayseer',
    name: 'تیسیر القرآن',
    author: 'مولانا عبدالرحمٰن کیلانی',
    source: 'Idara Tarjuman-ul-Islam & eQuranLibrary',
    source_url: 'https://www.equranlibrary.com',
    eql_slug: 'taiseerulquran'
  }
];

function cleanEqlHtml(rawHtml) {
  if (!rawHtml) return '';
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  const paras = [];
  let m;
  while ((m = pRegex.exec(rawHtml)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > 20 && !text.startsWith('eQuran') && /[\u0600-\u06FF]/.test(text)) {
      paras.push(text);
    }
  }
  if (paras.length === 0) return '';
  return '<p class="mb-4 leading-relaxed">' + paras.join('</p><p class="mb-4 leading-relaxed">') + '</p>';
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.text();
      }
    } catch (e) {
      if (i === retries) return '';
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  return '';
}

async function runQueue(tasks, concurrency = 16) {
  const executing = new Set();
  const results = [];
  for (const task of tasks) {
    const p = task().then(res => {
      executing.delete(p);
      results.push(res);
    });
    executing.add(p);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
  return results;
}

const existingRows = db.prepare('SELECT surah_id, ayah_from, tafsir_slug FROM tafasir').all();
const existingKeys = new Set(existingRows.map(r => `${r.surah_id}:${r.ayah_from}:${r.tafsir_slug}`));
console.log(`Found ${existingKeys.size} existing tafasir records in DB.`);

const insertStmt = db.prepare(`
  INSERT INTO tafasir (
    tafsir_slug, tafsir_name, author_name, surah_id, ayah_from, ayah_to,
    title, content_html, footnotes_json, source_attribution, source_url
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Order surahs by priority:
// 1. Juz 30 (78 to 114)
// 2. Juz 29 (67 to 77)
// 3. Juz 28 (58 to 66)
// 4. Surahs 5 to 54
const orderedSurahs = [];
for (let s = 78; s <= 114; s++) orderedSurahs.push(s);
for (let s = 67; s <= 77; s++) orderedSurahs.push(s);
for (let s = 58; s <= 66; s++) orderedSurahs.push(s);
for (let s = 5; s <= 54; s++) orderedSurahs.push(s);

async function main() {
  console.log(`Starting ingestion across ${orderedSurahs.length} surahs...`);
  let totalSaved = 0;
  let surahIndex = 0;

  for (const sId of orderedSurahs) {
    surahIndex++;
    const surahRow = db.prepare('SELECT name_arabic, name_simple, verses_count FROM surahs WHERE id = ?').get(sId);
    if (!surahRow) continue;
    const count = surahRow.verses_count;

    const tasks = [];
    for (let a = 1; a <= count; a++) {
      for (const cfg of CONFIGS) {
        const key = `${sId}:${a}:${cfg.slug}`;
        if (!existingKeys.has(key)) {
          tasks.push(async () => {
            const url = `https://www.equranlibrary.com/tafseer/${cfg.eql_slug}/${sId}/${a}`;
            const html = await fetchWithRetry(url);
            const content = cleanEqlHtml(html);
            return { sId, a, cfg, content, key };
          });
        }
      }
    }

    if (tasks.length === 0) {
      continue;
    }

    const t0 = Date.now();
    process.stdout.write(`[${surahIndex}/${orderedSurahs.length}] Surah ${sId} (${surahRow.name_arabic} - ${surahRow.name_simple}, ${tasks.length} reqs)... `);
    const results = await runQueue(tasks, 16);

    let saved = 0;
    db.exec('BEGIN TRANSACTION');
    for (const r of results) {
      if (r && r.content) {
        insertStmt.run(
          r.cfg.slug,
          r.cfg.name,
          r.cfg.author,
          r.sId,
          r.a,
          r.a,
          `${r.cfg.name} • آیت ${r.a}`,
          r.content,
          '[]',
          r.cfg.source,
          r.cfg.source_url
        );
        existingKeys.add(r.key);
        saved++;
      }
    }
    db.exec('COMMIT');
    totalSaved += saved;
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`✓ ${saved}/${tasks.length} saved (${elapsed}s) [Total: ${totalSaved}]`);
  }

  const finalCount = db.prepare('SELECT count(*) as c FROM tafasir').get();
  console.log(`\n🎉 Finished! Total tafasir entries in database: ${finalCount.c}`);
}

main().catch(err => {
  console.error('Fatal error in seeding:', err);
  process.exit(1);
});
