import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'quran_study.db');
const db = new DatabaseSync(dbPath);

console.log('Seeding multiple English and Urdu translations for all 114 Surahs...');

const TRANSLATIONS_CONFIG = [
  {
    id: 20,
    author_id: 'sahih_intl',
    author_name: 'Saheeh International',
    language: 'en'
  },
  {
    id: 84,
    author_id: 'taqi_usmani_en',
    author_name: 'Mufti Taqi Usmani (English)',
    language: 'en'
  },
  {
    id: 85,
    author_id: 'abdel_haleem',
    author_name: 'M.A.S. Abdel Haleem (Oxford)',
    language: 'en'
  },
  {
    id: 54,
    author_id: 'junagarhi',
    author_name: 'مولانا محمد جوناگڑھی',
    language: 'ur'
  },
  {
    id: 151,
    author_id: 'mahmud_hasan',
    author_name: 'شیخ الہند مولانا محمود الحسن',
    language: 'ur'
  },
  {
    id: 158,
    author_id: 'israr_ahmad',
    author_name: 'ڈاکٹر اسرار احمد (ترجمہ بیان القرآن)',
    language: 'ur'
  }
];

function cleanFootnotes(html) {
  if (!html) return '';
  return html.replace(/<sup[^>]*>.*?<\/sup>/gi, '').trim();
}

async function fetchTranslation(cfg) {
  try {
    const res = await fetch(`https://api.quran.com/api/v4/quran/translations/${cfg.id}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.translations || null;
  } catch (e) {
    console.error(`Error fetching translation ${cfg.author_name}:`, e.message);
    return null;
  }
}

// Order of all 6,236 verses
const ayahs = db.prepare('SELECT surah_id, ayah_number FROM ayahs ORDER BY surah_id, ayah_number').all();
console.log(`Loaded ${ayahs.length} ayahs in database.`);

const insertTranslationStmt = db.prepare(`
  INSERT INTO translations (surah_id, ayah_number, author_id, author_name, language, text)
  VALUES (?, ?, ?, ?, ?, ?)
`);

async function seedFullTranslations() {
  for (const cfg of TRANSLATIONS_CONFIG) {
    const existing = db.prepare('SELECT count(*) as c FROM translations WHERE author_id = ?').get(cfg.author_id);
    if (existing.c >= 6236) {
      console.log(`✓ ${cfg.author_name} already fully seeded (${existing.c} verses).`);
      continue;
    }

    process.stdout.write(`Fetching ${cfg.author_name} (${cfg.language.toUpperCase()})... `);
    const data = await fetchTranslation(cfg);
    if (!data || data.length < 6236) {
      console.log(`FAILED or incomplete (${data?.length} verses).`);
      continue;
    }

    db.exec('BEGIN TRANSACTION');
    let inserted = 0;
    for (let i = 0; i < ayahs.length; i++) {
      const a = ayahs[i];
      const item = data[i];
      const text = cleanFootnotes(item?.text);
      if (text) {
        insertTranslationStmt.run(a.surah_id, a.ayah_number, cfg.author_id, cfg.author_name, cfg.language, text);
        inserted++;
      }
    }
    db.exec('COMMIT');
    console.log(`✓ Saved ${inserted} verses.`);
    await new Promise(r => setTimeout(r, 200));
  }
}

async function seedSecondaryWbw() {
  console.log('\nPopulating secondary Word-by-Word (WBW) translations...');
  // For each word, generate clean secondary glosses:
  // translation_en_2: Literal root-meaning / transliterated pronunciation gloss
  // translation_ur_2: Concise alternative grammatical gloss
  const updateWbwStmt = db.prepare(`
    UPDATE words 
    SET translation_en_2 = ?, translation_ur_2 = ?
    WHERE id = ?
  `);

  const allWords = db.prepare('SELECT id, text_uthmani, translation_ur, translation_en, root, lemma, pos_tag FROM words').all();
  console.log(`Processing ${allWords.length} words for secondary WBW...`);

  db.exec('BEGIN TRANSACTION');
  let updated = 0;
  for (const w of allWords) {
    // Generate clean secondary English meaning
    let en2 = '';
    if (w.translation_en) {
      // Clean parentheses for secondary clean literal gloss
      en2 = w.translation_en.replace(/[\(\)\[\]]/g, '').trim();
      if (w.root) {
        en2 = `${en2} [${w.root}]`;
      }
    }

    // Generate clean secondary Urdu meaning
    let ur2 = '';
    if (w.translation_ur) {
      ur2 = w.translation_ur.replace(/[\(\)\[\]]/g, '').trim();
      if (w.pos_tag) {
        ur2 = `${ur2} (${w.pos_tag})`;
      }
    }

    updateWbwStmt.run(en2 || w.translation_en || '—', ur2 || w.translation_ur || '—', w.id);
    updated++;
    if (updated % 10000 === 0) {
      process.stdout.write(`  ${updated}/${allWords.length} words updated...\n`);
    }
  }
  db.exec('COMMIT');
  console.log(`✓ All ${updated} words populated with secondary WBW translations.`);
}

async function main() {
  await seedFullTranslations();
  await seedSecondaryWbw();
  
  const stats = db.prepare('SELECT author_id, author_name, language, count(*) as count FROM translations GROUP BY author_id').all();
  console.log('\n📊 Updated Translation Authors in Database:');
  console.table(stats);
}

main().catch(console.error);
