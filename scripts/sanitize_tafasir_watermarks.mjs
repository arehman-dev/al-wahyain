import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'quran_study.db');
const userDbPath = path.join(__dirname, '..', 'data', 'user_study.db');

console.log('--- Starting Tafasir Watermark & Breadcrumb Sanitization ---');

const db = new DatabaseSync(dbPath);

const watermarkRegex = /\s*eQuran\s*Library\s*·\s*Quran\s*(?:&amp;|&)\s*Hadith\s*Library\s*/gi;
const tafheemRegex = /Tafseer\s*·\s*Tafheem-ul-Quran(?:\s*(?:سورة|سورۃ)\s*[^\d\n\r<]+\s*\d*|\s*\d+)?\s*/gi;
const maarifRegex = /Tafseer\s*·\s*Maarif-ul-Quran\s*/gi;
const tayseerRegex = /Tafseer\s*·\s*Taiseer-ul-Quran\s*/gi;

// 1. Sanitize tafasir table in quran_study.db
console.log('Sanitizing tafasir in quran_study.db...');
const rows = db.prepare(`
  SELECT id, tafsir_slug, content_html 
  FROM tafasir 
  WHERE content_html LIKE '%eQuran%' 
     OR content_html LIKE '%Library%' 
     OR content_html LIKE '%Tafseer%'
`).all();

console.log(`Found ${rows.length} rows to sanitize in tafasir.`);

const updateStmt = db.prepare('UPDATE tafasir SET content_html = ? WHERE id = ?');

db.exec('BEGIN TRANSACTION');
let updatedCount = 0;
for (const r of rows) {
  let html = r.content_html;
  html = html.replace(watermarkRegex, '');

  if (r.tafsir_slug === 'tafheem') {
    html = html.replace(tafheemRegex, '</p><p class="mb-4 leading-relaxed">');
  } else if (r.tafsir_slug === 'maarif') {
    html = html.replace(maarifRegex, '</p><p class="mb-4 leading-relaxed">');
  } else if (r.tafsir_slug === 'tayseer') {
    html = html.replace(tayseerRegex, '</p><p class="mb-4 leading-relaxed">');
  }

  updateStmt.run(html, r.id);
  updatedCount++;
}
db.exec('COMMIT');
console.log(`✓ Updated ${updatedCount} tafasir rows in quran_study.db.`);

// 2. Sanitize highlights in user_study.db if present
if (fs.existsSync(userDbPath)) {
  const userDb = new DatabaseSync(userDbPath);
  console.log('Checking highlights in user_study.db...');
  const highlights = userDb.prepare(`
    SELECT id, text 
    FROM highlights 
    WHERE text LIKE '%eQuran%' 
       OR text LIKE '%Library%' 
       OR text LIKE '%Tafseer%'
  `).all();

  if (highlights.length > 0) {
    const updateHl = userDb.prepare('UPDATE highlights SET text = ? WHERE id = ?');
    userDb.exec('BEGIN TRANSACTION');
    for (const h of highlights) {
      let cleanText = h.text.replace(watermarkRegex, '').trim();
      updateHl.run(cleanText, h.id);
    }
    userDb.exec('COMMIT');
    console.log(`✓ Sanitized ${highlights.length} user highlights.`);
  } else {
    console.log('✓ No contaminated highlights found in user_study.db.');
  }
}

// 3. Post-sanitization verification
const verifyRows = db.prepare(`
  SELECT COUNT(*) as count 
  FROM tafasir 
  WHERE content_html LIKE '%eQuran%Library%' 
     OR content_html LIKE '%Tafseer ·%'
`).get();

console.log(`Verification: Remaining contaminated rows in tafasir: ${verifyRows.count}`);
if (verifyRows.count === 0) {
  console.log('✅ All watermarks and breadcrumbs successfully eradicated!');
} else {
  console.error('❌ Warning: some rows still contain watermarks!');
  process.exit(1);
}
