import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const dbPath = path.join(rootDir, 'data', 'quran_study.db');
const audioDir = path.join(rootDir, 'data', 'audio', 'alafasy');

fs.mkdirSync(audioDir, { recursive: true });

const db = new DatabaseSync(dbPath);

async function downloadFile(surahId, ayahNumber) {
  const fileName = `${String(surahId).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
  const filePath = path.join(audioDir, fileName);

  if (fs.existsSync(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > 1024) {
        return { skipped: true, fileName, bytes: stats.size };
      }
    } catch {}
  }

  const urls = [
    `https://verses.quran.com/Alafasy/mp3/${fileName}`,
    `https://everyayah.com/data/Alafasy_128kbps/${fileName}`
  ];

  for (let attempt = 0; attempt < 3; attempt++) {
    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(url, { 
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AlWahyain/1.0.1)' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          if (buffer.length > 500) {
            fs.writeFileSync(filePath, buffer);
            return { success: true, fileName, bytes: buffer.length };
          }
        }
      } catch {
        // Retry or fallback
      }
    }
    await new Promise(r => setTimeout(r, 600));
  }

  return { failed: true, fileName };
}

async function showStatus() {
  const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
  let totalBytes = 0;
  for (const f of files) {
    try {
      totalBytes += fs.statSync(path.join(audioDir, f)).size;
    } catch {}
  }
  const mb = (totalBytes / (1024 * 1024)).toFixed(2);
  console.log(`\n🎵 Al-Wahyain Offline Audio Cache Status:`);
  console.log(`  • Cached Ayahs : ${files.length} / 6,236 (${((files.length / 6236) * 100).toFixed(1)}%)`);
  console.log(`  • Disk Space   : ${mb} MB`);
  console.log(`  • Location     : ${audioDir}\n`);
}

async function downloadBatch(items, concurrency = 8) {
  let completed = 0;
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  const failedItems = [];
  const total = items.length;
  let cursor = 0;

  console.log(`⚡ Processing ${total} Ayahs with concurrency = ${concurrency}...`);
  const startTime = Date.now();

  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      const item = items[idx];
      try {
        const res = await downloadFile(item.surahId, item.ayahNumber);
        if (res.success) downloaded++;
        else if (res.skipped) skipped++;
        else if (res.failed) {
          failed++;
          failedItems.push(item);
        }
      } catch {
        failed++;
        failedItems.push(item);
      }
      completed++;

      if (completed % 10 === 0 || completed === total) {
        const pct = ((completed / total) * 100).toFixed(1);
        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(0);
        process.stdout.write(`\r  [${pct}%] ${completed}/${total} | ↓ ${downloaded} dl | ⏩ ${skipped} cached | ⚠️ ${failed} err (${elapsedSec}s)`);
      }
    }
  });

  await Promise.all(workers);

  // Retry any failed items
  if (failedItems.length > 0) {
    console.log(`\n🔄 Retrying ${failedItems.length} failed Ayahs...`);
    for (const item of failedItems) {
      const res = await downloadFile(item.surahId, item.ayahNumber);
      if (res.success) {
        downloaded++;
        failed--;
      }
    }
  }

  console.log(`\n✅ Batch completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s (Downloaded: ${downloaded}, Cached: ${skipped}, Failed: ${failed})\n`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--status')) {
    await showStatus();
    return;
  }

  let concurrency = 8;
  const concIdx = args.indexOf('--concurrency');
  if (concIdx !== -1 && args[concIdx + 1]) {
    concurrency = parseInt(args[concIdx + 1], 10) || 8;
  }

  const surahArgIdx = args.indexOf('--surah');
  if (surahArgIdx !== -1 && args[surahArgIdx + 1]) {
    const val = args[surahArgIdx + 1];
    let surahsToProcess = [];
    if (val.includes('-')) {
      const [start, end] = val.split('-').map(Number);
      for (let s = start; s <= end; s++) surahsToProcess.push(s);
    } else {
      surahsToProcess.push(Number(val));
    }

    const items = [];
    for (const sId of surahsToProcess) {
      const row = db.prepare('SELECT verses_count FROM surahs WHERE id = ?').get(sId);
      if (row) {
        for (let a = 1; a <= row.verses_count; a++) {
          items.push({ surahId: sId, ayahNumber: a });
        }
      }
    }

    await downloadBatch(items, concurrency);
    await showStatus();
    return;
  }

  if (args.includes('--all')) {
    console.log(`🚀 Starting full offline audio cache for all 114 Surahs (6,236 Ayahs)...`);
    const surahs = db.prepare('SELECT id, verses_count FROM surahs ORDER BY id ASC').all();
    const items = [];
    for (const s of surahs) {
      for (let a = 1; a <= s.verses_count; a++) {
        items.push({ surahId: s.id, ayahNumber: a });
      }
    }

    await downloadBatch(items, concurrency);
    await showStatus();
    return;
  }

  // Default: show status and instructions
  await showStatus();
  console.log(`Usage:`);
  console.log(`  node scripts/cache_audio.mjs --surah 1       # Pre-cache Surah Al-Fatihah`);
  console.log(`  node scripts/cache_audio.mjs --surah 1-5     # Pre-cache Surahs 1 to 5`);
  console.log(`  node scripts/cache_audio.mjs --all           # Pre-cache entire Quran (all 114 Surahs)`);
  console.log(`  node scripts/cache_audio.mjs --status        # View audio cache stats`);
}

main().catch(console.error);
