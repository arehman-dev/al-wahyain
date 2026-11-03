import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'quran_study.db');
const db = new DatabaseSync(dbPath);

console.log('Seeding & normalizing all 114 Surahs for Tafsir As-Saadi (تفسیر السعدی - اردو)...');

function parseBracketSpec(spec) {
  const clean = spec.replace(/[^\d\s,،\-–—تا]/g, '');
  const nums = [];
  for (const part of clean.split(/[,،]+/)) {
    const p = part.trim();
    const rangeMatch = p.match(/^(\d+)\s*(?:[-–—]|تا)\s*(\d+)$/);
    if (rangeMatch) {
      const s = parseInt(rangeMatch[1], 10);
      const e = parseInt(rangeMatch[2], 10);
      for (let k = Math.min(s, e); k <= Math.max(s, e); k++) nums.push(k);
    } else if (/^\d+$/.test(p)) {
      nums.push(parseInt(p, 10));
    } else {
      const allNums = p.match(/\d+/g);
      if (allNums && allNums.length === 2) {
        const s = parseInt(allNums[0], 10);
        const e = parseInt(allNums[1], 10);
        for (let k = Math.min(s, e); k <= Math.max(s, e); k++) nums.push(k);
      } else if (allNums) {
        allNums.forEach(n => nums.push(parseInt(n, 10)));
      }
    }
  }
  if (nums.length === 2 && Math.abs(nums[0] - nums[1]) <= 3) {
    const min = Math.min(nums[0], nums[1]);
    const max = Math.max(nums[0], nums[1]);
    const rangeSet = new Set();
    for (let k = min; k <= max; k++) rangeSet.add(k);
    return rangeSet;
  }
  return new Set(nums);
}

export function extractPerAyahSaadiHtml(rawTextOrHtml, ayahNum) {
  if (!rawTextOrHtml) return '';
  const plain = rawTextOrHtml
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();

  const regex = /\[([^\]]+)\]/g;
  const matches = [...plain.matchAll(regex)];
  const blocks = [];

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const nums = parseBracketSpec(m[1]);
    if (nums.size === 0) continue;
    const startIdx = m.index + m[0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index : plain.length;
    const chunk = plain.slice(startIdx, endIdx).trim();
    if (chunk) {
      blocks.push({ nums, chunk });
    }
  }

  const direct = blocks.filter(b => b.nums.has(ayahNum));
  let selectedChunks = direct.map(b => b.chunk);

  if (selectedChunks.length === 0 && blocks.length > 0) {
    let best = blocks[0];
    let bestDist = 9999;
    for (const b of blocks) {
      for (const n of b.nums) {
        const d = Math.abs(n - ayahNum);
        if (d < bestDist) {
          bestDist = d;
          best = b;
        }
      }
    }
    selectedChunks = [best.chunk];
  }

  if (selectedChunks.length === 0) {
    selectedChunks = [plain];
  }

  const paras = selectedChunks
    .join('\n\n')
    .split(/\r?\n\r?\n|\n/)
    .map(p => p.trim())
    .filter(Boolean);

  if (paras.length === 0) return '';
  return '<p class="mb-4 leading-relaxed">' + paras.join('</p><p class="mb-4 leading-relaxed">') + '</p>';
}

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
  const existingRows = db.prepare("SELECT id, surah_id, ayah_from, content_html FROM tafasir WHERE tafsir_slug = 'saadi'").all();

  if (existingRows.length === 6236) {
    console.log('Found 6,236 existing Tafsir As-Saadi rows in DB. Normalizing per-ayah commentary in place...');
    const updateStmt = db.prepare(`
      UPDATE tafasir
      SET content_html = ?,
          title = ?,
          source_attribution = 'دارالسلام و ای قرآن لائبریری (eQuranLibrary)',
          source_url = 'https://www.equranlibrary.com'
      WHERE id = ?
    `);

    let updated = 0;
    db.exec('BEGIN TRANSACTION');
    for (const row of existingRows) {
      const cleanedHtml = extractPerAyahSaadiHtml(row.content_html, row.ayah_from);
      if (cleanedHtml) {
        updateStmt.run(cleanedHtml, `تفسیر السعدی • آیت ${row.ayah_from}`, row.id);
        updated++;
      }
    }
    db.exec('COMMIT');
    console.log(`✅ Normalized ${updated} Tafsir As-Saadi records to clean per-ayah commentary!`);
    return;
  }

  // Fresh seed if not all 6,236 rows exist
  db.prepare("DELETE FROM tafasir WHERE tafsir_slug = 'saadi'").run();

  const insertStmt = db.prepare(`
    INSERT INTO tafasir (
      tafsir_slug, tafsir_name, author_name, surah_id, ayah_from, ayah_to,
      title, content_html, footnotes_json, source_attribution, source_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalInserted = 0;
  const surahIds = Array.from({ length: 114 }, (_, i) => i + 1);

  for (let i = 0; i < surahIds.length; i += 12) {
    const batch = surahIds.slice(i, i + 12);
    const results = await Promise.all(
      batch.map(async sId => ({ sId, items: await fetchSurahSaadi(sId) }))
    );

    db.exec('BEGIN TRANSACTION');
    for (const { sId, items } of results) {
      for (const item of items) {
        if (!item || !item.ayah || !item.text) continue;
        const cleanedHtml = extractPerAyahSaadiHtml(item.text, item.ayah);
        if (cleanedHtml) {
          insertStmt.run(
            'saadi',
            'تفسیر السعدی',
            'شیخ عبدالرحمٰن بن ناصر السعدی',
            sId,
            item.ayah,
            item.ayah,
            `تفسیر السعدی • آیت ${item.ayah}`,
            cleanedHtml,
            '[]',
            'دارالسلام و ای قرآن لائبریری (eQuranLibrary)',
            'https://www.equranlibrary.com'
          );
          totalInserted++;
        }
      }
    }
    db.exec('COMMIT');
    process.stdout.write(`Processed Surahs ${batch[0]}-${batch[batch.length - 1]} (Inserted so far: ${totalInserted})\n`);
  }

  console.log(`✅ Completed! Total Tafsir As-Saadi records in DB: ${totalInserted}`);
}

main().catch(err => {
  console.error('Error seeding Tafsir As-Saadi:', err);
  process.exit(1);
});
