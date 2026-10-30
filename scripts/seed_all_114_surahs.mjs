import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'quran_study.db');
const MORPH_PATH = path.join(__dirname, '..', 'data', 'morphology.txt');

const db = new DatabaseSync(DB_PATH);

// Arabic Buckwalter transliteration table
const BW_MAP = {
  'A': 'ا', 'b': 'ب', 't': 'ت', 'v': 'ث', 'j': 'ج', 'H': 'ح', 'x': 'خ',
  'd': 'د', '*': 'ذ', 'r': 'ر', 'z': 'ز', 's': 'س', '$': 'ش', 'S': 'ص',
  'D': 'ض', 'T': 'ط', 'Z': 'ظ', 'E': 'ع', 'g': 'غ', 'f': 'ف', 'q': 'ق',
  'k': 'ك', 'l': 'ل', 'm': 'م', 'n': 'ن', 'h': 'ه', 'w': 'و', 'Y': 'ى',
  'y': 'ي', '{': 'ا', '\'': 'ء', '>': 'أ', '<': 'إ', '&': 'ؤ', '}': 'ئ',
  '`': 'ٰ'
};

const POS_MAP = {
  'N': 'اسم', 'PN': 'اسم علم', 'V': 'فعل', 'P': 'حرف جر', 'DET': 'أداة تعریف',
  'PRON': 'ضمیر', 'DEM': 'اسم إشارة', 'REL': 'اسم موصول', 'ADJ': 'صفة / نعت',
  'CONJ': 'حرف عطف', 'NEG': 'حرف نفی', 'SUB': 'حرف مصدري', 'COND': 'حرف شرط',
  'INTG': 'اسم استفهام', 'VOC': 'حرف نداء', 'RES': 'أداة حصر', 'EXP': 'أداة استثناء',
  'INC': 'حرف ابتداء', 'SUR': 'حرف فجاءة', 'ACC': 'حرف مشبه بالفعل'
};

const GRAMMAR_MAP = {
  'NOM': 'مرفوع', 'ACC': 'منصوب', 'GEN': 'مجرور', 'JUS': 'مجزوم', 'IND': 'مرفوع',
  'PERF': 'ماضٍ', 'IMPF': 'مضارع', 'IMPV': 'أمر', 'PASS': 'مبني للمجهول', 'ACT': 'مبني للمعلوم',
  'M': 'مذكر', 'MS': 'مفرد مذكر', 'F': 'مؤنث', 'FS': 'مفرد مؤنث',
  'MD': 'مثنى مذكر', 'FD': 'مثنى مؤنث', 'MP': 'جمع مذكر', 'FP': 'جمع مؤنث',
  '1S': 'متكلم مفرد', '1P': 'متكلم جمع', '2MS': 'مخاطب مفرد مذكر',
  '2FS': 'مخاطب مفرد مؤنث', '2D': 'مخاطب مثنى', '2MP': 'مخاطب جمع مذكر',
  '3MS': 'غائب مفرد مذكر', '3FS': 'غائب مفرد مؤنث', '3D': 'غائب مثنى', '3MP': 'غائب جمع مذكر'
};

function bwToAr(s) {
  if (!s) return null;
  return s.split('').map(c => BW_MAP[c] || c).join('');
}

console.log("Loading morphology index into memory...");
const morphCache = new Map();
if (fs.existsSync(MORPH_PATH)) {
  const lines = fs.readFileSync(MORPH_PATH, 'utf-8').split('\n');
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const parts = line.split('\t');
    if (parts.length < 4) continue;
    const [locStr, form, tag, features] = parts;
    const m = locStr.match(/\((\d+):(\d+):(\d+):(\d+)\)/);
    if (!m) continue;
    const key = `${m[1]}:${m[2]}:${m[3]}`;
    
    let root = null;
    let lemma = null;
    const featList = [];
    for (const item of features.split('|')) {
      if (item.startsWith('ROOT:')) {
        root = bwToAr(item.split(':')[1]);
      } else if (item.startsWith('LEM:')) {
        lemma = bwToAr(item.split(':')[1]);
      } else if (GRAMMAR_MAP[item]) {
        featList.push(GRAMMAR_MAP[item]);
      }
    }
    const pos = POS_MAP[tag] || tag;
    if (pos && !featList.includes(pos)) featList.unshift(pos);

    if (!morphCache.has(key)) {
      morphCache.set(key, { root, lemma, pos, featList });
    } else {
      const existing = morphCache.get(key);
      if (root && !existing.root) existing.root = root;
      if (lemma && !existing.lemma) existing.lemma = lemma;
      for (const f of featList) {
        if (!existing.featList.includes(f)) existing.featList.push(f);
      }
    }
  }
}
console.log(`Morphology loaded: ${morphCache.size} word entries.`);

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 Al-Wahyain Seeder' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

// Prepared Statements matching exact table columns
const insertAyah = db.prepare(`
  INSERT OR REPLACE INTO ayahs (
    surah_id, ayah_number, verse_key, text_uthmani, text_indopak, text_tajweed,
    page_madani, page_indopak, audio_url, audio_segments
  ) VALUES (
    @surah_id, @ayah_number, @verse_key, @text_uthmani, @text_indopak, @text_tajweed,
    @page_madani, @page_indopak, @audio_url, @audio_segments
  )
`);

const insertWord = db.prepare(`
  INSERT OR REPLACE INTO words (
    surah_id, ayah_number, position, location, text_uthmani, text_indopak,
    translation_ur, translation_en, audio_url, root, lemma, pos_tag, grammar_details
  ) VALUES (
    @surah_id, @ayah_number, @position, @location, @text_uthmani, @text_indopak,
    @translation_ur, @translation_en, @audio_url, @root, @lemma, @pos_tag, @grammar_details
  )
`);

const insertTranslation = db.prepare(`
  INSERT OR REPLACE INTO translations (
    surah_id, ayah_number, author_id, author_name, language, text
  ) VALUES (
    @surah_id, @ayah_number, @author_id, @author_name, @language, @text
  )
`);

// Authors map
const TRANSLATION_AUTHORS = {
  234: { id: "taqi_usmani", name: "مفتی محمد تقی عثمانی", lang: "ur" },
  233: { id: "jalandhari", name: "فتح محمد جالندھری", lang: "ur" },
  97: { id: "maududi", name: "سید ابوالاعلیٰ مودودی", lang: "ur" },
  131: { id: "sahih_intl", name: "Saheeh International", lang: "en" }
};

const existingSurahs = new Set(
  db.prepare("SELECT DISTINCT surah_id FROM ayahs").all().map(r => r.surah_id)
);

const allSurahs = db.prepare("SELECT id, name_arabic, verses_count FROM surahs ORDER BY id").all();

console.log(`Currently seeded: ${existingSurahs.size} surahs. Target: 114 surahs.`);

for (const surah of allSurahs) {
  if (existingSurahs.has(surah.id)) {
    console.log(`⏩ Surah ${surah.id} (${surah.name_arabic}) already in DB, skipping.`);
    continue;
  }

  console.log(`\n⏳ Fetching Surah ${surah.id}: ${surah.name_arabic} (${surah.verses_count} ayahs)...`);
  const startTime = Date.now();

  try {
    // 1. Tajweed
    const tajweedData = await fetchWithRetry(`https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=${surah.id}`);
    const tajweedMap = new Map((tajweedData.verses || []).map(v => [v.verse_key, v.text_uthmani_tajweed]));

    // 2. IndoPak
    const indopakData = await fetchWithRetry(`https://api.quran.com/api/v4/quran/verses/indopak?chapter_number=${surah.id}`);
    const indopakMap = new Map((indopakData.verses || []).map(v => [v.verse_key, v.text_indopak]));

    // 3. Verses + Words + Translations (per_page 350 covers all remaining surahs)
    const versesData = await fetchWithRetry(`https://api.quran.com/api/v4/verses/by_chapter/${surah.id}?words=true&word_fields=location,text_uthmani,text_indopak,translation,transliteration,page_number&translations=234,233,97,131&per_page=350`);
    const verses = versesData.verses || [];

    // 4. Urdu WBW
    const urduWbwData = await fetchWithRetry(`https://api.quran.com/api/v4/verses/by_chapter/${surah.id}?words=true&word_fields=location,translation&language=ur&per_page=350`);
    const urduWordMap = new Map();
    for (const uv of (urduWbwData.verses || [])) {
      for (const uw of (uv.words || [])) {
        if (uw.location && uw.translation?.text) {
          urduWordMap.set(uw.location, uw.translation.text);
        }
      }
    }

    // Begin database transaction for this Surah
    db.exec("BEGIN TRANSACTION");

    for (const v of verses) {
      const vk = v.verse_key;
      const vNum = v.verse_number;
      const pageMadani = v.page_number || 1;
      const wordItems = (v.words || []).filter(w => w.char_type_name === 'word');
      const wordsUthmani = wordItems.map(w => w.text_uthmani || w.text || '').join(' ');
      const textUthmani = v.text_uthmani || wordsUthmani || indopakMap.get(vk) || '';
      const textIndopak = indopakMap.get(vk) || textUthmani;
      const textTajweed = tajweedMap.get(vk) || textUthmani;

      insertAyah.run({
        surah_id: surah.id,
        ayah_number: vNum,
        verse_key: vk,
        text_uthmani: textUthmani,
        text_indopak: textIndopak,
        text_tajweed: textTajweed,
        page_madani: pageMadani,
        page_indopak: pageMadani,
        audio_url: `https://everyayah.com/data/Alafasy_128kbps/${String(surah.id).padStart(3, '0')}${String(vNum).padStart(3, '0')}.mp3`,
        audio_segments: null
      });

      // Insert words
      for (const w of wordItems) {
        const loc = w.location;
        const morph = morphCache.get(loc);
        const urTrans = urduWordMap.get(loc) || (w.translation?.language_name === 'urdu' ? w.translation.text : '');
        const enTrans = w.translation?.language_name === 'english' ? w.translation.text : (w.translation?.text || '');

        insertWord.run({
          surah_id: surah.id,
          ayah_number: vNum,
          position: w.position,
          location: loc,
          text_uthmani: w.text_uthmani || w.text || '',
          text_indopak: w.text_indopak || w.text_uthmani || '',
          translation_ur: urTrans,
          translation_en: enTrans,
          audio_url: w.audio_url || null,
          root: morph?.root || null,
          lemma: morph?.lemma || null,
          pos_tag: morph?.pos || null,
          grammar_details: morph?.featList ? morph.featList.join(' • ') : null
        });
      }

      // Insert Translations
      for (const t of (v.translations || [])) {
        const auth = TRANSLATION_AUTHORS[t.resource_id];
        if (auth) {
          const cleanText = (t.text || '').replace(/<sup[^>]*>.*?<\/sup>/g, '').trim();
          insertTranslation.run({
            surah_id: surah.id,
            ayah_number: vNum,
            author_id: auth.id,
            author_name: auth.name,
            language: auth.lang,
            text: cleanText
          });
        }
      }
    }

    db.exec("COMMIT");
    console.log(`  ✅ Surah ${surah.id} saved (${verses.length} ayahs, ${Date.now() - startTime}ms)`);
  } catch (err) {
    db.exec("ROLLBACK");
    console.error(`  ❌ Error on Surah ${surah.id}:`, err.message);
  }
}

console.log("\n🎉 Full Quran data seeding completed!");
