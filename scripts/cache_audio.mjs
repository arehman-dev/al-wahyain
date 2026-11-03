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
    return { skipped: true, fileName };
  }

  const urls = [
    `https://everyayah.com/data/Alafasy_128kbps/${fileName}`,
    `https://verses.quran.com/Alafasy/mp3/${fileName}`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        return { success: true, fileName, bytes: buffer.length };
      }
    } catch {
      // Try next CDN
    }
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

async function cacheSurah(surahId) {
  const surah = db.prepare('SELECT id, name_arabic, name_urdu, verses_count FROM surahs WHERE id = ?').get(surahId);
  if (!surah) {
    console.error(`Surah ${surahId} not found.`);
    return;
  }

  console.log(`📥 Caching Surah ${surah.id}: ${surah.name_arabic} (${surah.verses_count} ayahs)...`);
  let downloaded = 0;
  let cached = 0;

  for (let a = 1; a <= surah.verses_count; a++) {
    const res = await downloadFile(surah.id, a);
    if (res.success) downloaded++;
    if (res.skipped) cached++;
    process.stdout.write(`\r  Ayah ${a}/${surah.verses_count} (${res.success ? 'Downloaded' : 'Cached'})`);
  }
  console.log(`\n  Done: ${downloaded} downloaded, ${cached} already cached.\n`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--status')) {
    await showStatus();
    return;
  }

  const surahArgIdx = args.indexOf('--surah');
  if (surahArgIdx !== -1 && args[surahArgIdx + 1]) {
    const val = args[surahArgIdx + 1];
    if (val.includes('-')) {
      const [start, end] = val.split('-').map(Number);
      for (let s = start; s <= end; s++) {
        await cacheSurah(s);
      }
    } else {
      await cacheSurah(Number(val));
    }
    await showStatus();
    return;
  }

  if (args.includes('--all')) {
    console.log(`🚀 Starting full offline audio cache for all 114 Surahs...`);
    for (let s = 1; s <= 114; s++) {
      await cacheSurah(s);
    }
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
