import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'quran_study.db');
const db = new DatabaseSync(dbPath);

console.log('Seeding all 114 Surahs for Tafsir As-Saadi (تفسیر السعدی - اردو)...');

const existingRows = db.prepare("SELECT surah_id, ayah_from FROM tafasir WHERE tafsir_slug = 'saadi'").all();
const existingKeys = new Set(existingRows.map(r => `${r.surah_id}:${r.ayah_from}`));
console.log(`Found ${existingKeys.size} existing Tafsir As-Saadi records in DB.`);

function textToHtml(text) {
  if (!text) return '';
  if (/<(p|div|span|h[1-6]|ul|ol|li)[^>]*>/i.test(text)) {
    return text;
  }
  const paras = text.split(/\r?\n\r?\n|\n/).map(p => p.trim()).filter(Boolean);
  if (paras.length === 0) return '';
  return '<p class="mb-4 leading-relaxed">' + paras.join('</p><p class="mb-4 leading-relaxed">') + '</p>';
}

const insertStmt = db.prepare(`
  INSERT INTO tafasir (
    tafsir_slug, tafsir_name, author_name, surah_id, ayah_from, ayah_to,
    title, content_html, footnotes_json, source_attribution, source_url
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

async function fetchSurahSaadi(sId) {
  const url = `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ur-tafsir-as-saadi-urdu/${sId}.json`;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : (Array.isArray(data.ayahs) ? data.ayahs : Object.values(data));
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 400 * (i + 1)));
    }
  }
  return [];
}

async function main() {
  let totalInserted = 0;
  const surahIds = Array.from({ length: 114 }, (_, i) => i + 1);

  // Fetch in batches of 12 surahs concurrently
  for (let i = 0; i < surahIds.length; i += 12) {
    const batch = surahIds.slice(i, i + 12);
    const results = await Promise.all(
      batch.map(async sId => ({ sId, items: await fetchSurahSaadi(sId) }))
    );

    db.exec('BEGIN TRANSACTION');
    for (const { sId, items } of results) {
      for (const item of items) {
        if (!item || !item.ayah || !item.text) continue;
        const key = `${sId}:${item.ayah}`;
        if (!existingKeys.has(key) && item.text.trim()) {
          insertStmt.run(
            'saadi',
            'تفسیر السعدی',
            'شیخ عبدالرحمٰن بن ناصر السعدی',
            sId,
            item.ayah,
            item.ayah,
            `تفسیر السعدی • آیت ${item.ayah}`,
            textToHtml(item.text),
            '[]',
            'Darussalam & QUL (Tarteel)',
            'https://qul.tarteel.ai/resources/tafsir/309'
          );
          existingKeys.add(key);
          totalInserted++;
        }
      }
    }
    db.exec('COMMIT');
    process.stdout.write(`Processed Surahs ${batch[0]}-${batch[batch.length - 1]} (Inserted so far: ${totalInserted})\n`);
  }

  const finalCount = db.prepare("SELECT count(*) as c FROM tafasir WHERE tafsir_slug = 'saadi'").get();
  console.log(`✅ Completed! Total Tafsir As-Saadi records in DB: ${finalCount.c}`);
}

main().catch(err => {
  console.error('Error seeding Tafsir As-Saadi:', err);
  process.exit(1);
});
