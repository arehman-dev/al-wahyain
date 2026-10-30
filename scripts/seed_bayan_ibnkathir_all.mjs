import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'quran_study.db');
const db = new DatabaseSync(dbPath);

console.log('Seeding all 114 Surahs for Bayan-ul-Quran and Ibn Kathir (Urdu)...');

// Load existing keys
const existingRows = db.prepare('SELECT surah_id, ayah_from, tafsir_slug FROM tafasir').all();
const existingKeys = new Set(existingRows.map(r => `${r.surah_id}:${r.ayah_from}:${r.tafsir_slug}`));
console.log(`Found ${existingKeys.size} existing tafasir records in DB. These will remain 100% intact.`);

function textToHtml(text) {
  if (!text) return '';
  // If already contains HTML tags like <p> or <div>, return as-is
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

let bayanCount = 0;
let ibnCount = 0;

db.exec('BEGIN TRANSACTION');

for (let sId = 1; sId <= 114; sId++) {
  // 1. Bayan-ul-Quran
  const bayanPath = `/tmp/tafsir_ur/tafsir/ur-tafsir-bayan-ul-quran/${sId}.json`;
  if (fs.existsSync(bayanPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(bayanPath, 'utf8'));
      if (Array.isArray(data.ayahs)) {
        for (const item of data.ayahs) {
          const key = `${sId}:${item.ayah}:bayan_ul_quran`;
          if (!existingKeys.has(key) && item.text && item.text.trim()) {
            insertStmt.run(
              'bayan_ul_quran',
              'بیان القرآن',
              'ڈاکٹر اسرار احمد',
              sId,
              item.ayah,
              item.ayah,
              `بیان القرآن • آیت ${item.ayah}`,
              textToHtml(item.text),
              '[]',
              'مرکزی انجمن خدام القرآن لاہور',
              'https://www.tanzeem.org'
            );
            existingKeys.add(key);
            bayanCount++;
          }
        }
      }
    } catch (e) {
      console.error(`Error loading Bayan for Surah ${sId}:`, e.message);
    }
  }

  // 2. Ibn Kathir (Urdu)
  const ibnPath = `/tmp/tafsir_ur/tafsir/ur-tafseer-ibn-e-kaseer/${sId}.json`;
  if (fs.existsSync(ibnPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(ibnPath, 'utf8'));
      if (Array.isArray(data.ayahs)) {
        for (const item of data.ayahs) {
          const key = `${sId}:${item.ayah}:ibn_kathir`;
          if (!existingKeys.has(key) && item.text && item.text.trim()) {
            insertStmt.run(
              'ibn_kathir',
              'تفسیر ابنِ کثیر (اردو)',
              'حافظ عماد الدین ابنِ کثیر',
              sId,
              item.ayah,
              item.ayah,
              `تفسیر ابنِ کثیر (اردو) • آیت ${item.ayah}`,
              textToHtml(item.text),
              '[]',
              'Quran.com & Darussalam',
              'https://quran.com'
            );
            existingKeys.add(key);
            ibnCount++;
          }
        }
      }
    } catch (e) {
      console.error(`Error loading Ibn Kathir for Surah ${sId}:`, e.message);
    }
  }
}

db.exec('COMMIT');

console.log(`✅ Completed! Ingested ${bayanCount} new Bayan-ul-Quran entries and ${ibnCount} new Ibn Kathir entries.`);

const totalTafasir = db.prepare('SELECT count(*) as c FROM tafasir').get();
console.log(`📊 Total tafasir entries now in database: ${totalTafasir.c}`);
