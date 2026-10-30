import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'quran_study.db');
const db = new DatabaseSync(dbPath);

console.log('Seeding audio timing segments for all 114 Surahs...');

const updateStmt = db.prepare('UPDATE ayahs SET audio_segments = ? WHERE surah_id = ? AND ayah_number = ?');

// Find which surahs need audio_segments
const rows = db.prepare(`
  SELECT DISTINCT surah_id 
  FROM ayahs 
  WHERE audio_segments IS NULL OR audio_segments = '' OR audio_segments = '[]'
  ORDER BY surah_id
`).all();

const missingSurahIds = rows.map(r => r.surah_id);
console.log(`Found ${missingSurahIds.length} surahs needing audio segments.`);

async function fetchChapterSegments(chapterId) {
  try {
    const res = await fetch(`https://api.quran.com/api/v4/chapter_recitations/7/${chapterId}?segments=true`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.audio_file?.timestamps || null;
  } catch (e) {
    return null;
  }
}

async function main() {
  let updatedAyahs = 0;

  for (let i = 0; i < missingSurahIds.length; i++) {
    const sId = missingSurahIds[i];
    process.stdout.write(`[${i + 1}/${missingSurahIds.length}] Fetching segments for Surah ${sId}... `);
    const timestamps = await fetchChapterSegments(sId);
    if (!timestamps) {
      console.log('FAILED to fetch from API.');
      continue;
    }

    db.exec('BEGIN TRANSACTION');
    let sCount = 0;
    for (const t of timestamps) {
      const match = t.verse_key.match(/^(\d+):(\d+)$/);
      if (!match) continue;
      const aNum = parseInt(match[2], 10);
      const baseTime = t.timestamp_from || 0;

      const segments = (t.segments || []).map(([seq, start, end]) => [
        seq - 1,
        seq,
        Math.max(0, start - baseTime),
        Math.max(0, end - baseTime)
      ]);

      if (segments.length > 0) {
        updateStmt.run(JSON.stringify(segments), sId, aNum);
        sCount++;
        updatedAyahs++;
      }
    }
    db.exec('COMMIT');
    console.log(`✓ ${sCount} ayahs updated.`);
    // Tiny delay to be gentle to API
    await new Promise(r => setTimeout(r, 60));
  }

  console.log(`\n🎉 Finished! Updated ${updatedAyahs} ayahs with precise audio synchronization segments.`);
}

main().catch(console.error);
