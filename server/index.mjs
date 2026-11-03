import http from 'node:http';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.CORPUS_DB_PATH || path.join(__dirname, '..', 'data', 'quran_study.db');
const USER_DB_PATH = process.env.USER_DB_PATH || path.join(__dirname, '..', 'data', 'user_study.db');
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, '..', 'dist');
const FONTS_DIR = process.env.FONTS_DIR || path.join(__dirname, '..', 'public', 'fonts');

// Ensure parent directory for writable user_study.db exists
fs.mkdirSync(path.dirname(USER_DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
const PORT = process.env.PORT !== undefined ? Number(process.env.PORT) : 3001;

// Best Practice #2: Memory-mapped I/O & in-memory temp store for 447MB corpus DB
try {
  db.exec(`
    PRAGMA mmap_size = 268435456;
    PRAGMA temp_store = MEMORY;
    PRAGMA cache_size = -64000;
  `);
} catch (err) {
  console.warn('SQLite PRAGMA tuning warning:', err.message);
}

// Best Practice #1: Attach separate writable user database (user_study.db)
// so app updates to quran_study.db never overwrite user bookmarks, notes, or highlights.
const escapedUserDbPath = USER_DB_PATH.replace(/'/g, "''");
db.exec(`ATTACH DATABASE '${escapedUserDbPath}' AS user_db;`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_db.bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    verse_key TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(surah_id, ayah_number)
  );

  CREATE TABLE IF NOT EXISTS user_db.notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    verse_key TEXT NOT NULL,
    note_text TEXT NOT NULL,
    tags TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(surah_id, ayah_number)
  );

  CREATE TABLE IF NOT EXISTS user_db.highlights (
    id TEXT PRIMARY KEY,
    surah_id INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    verse_key TEXT NOT NULL,
    tafsir_slug TEXT NOT NULL,
    text TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seamless one-time migration of any legacy rows stored in main.bookmarks / notes / highlights
try {
  const hasMainBookmarks = db.prepare("SELECT name FROM main.sqlite_master WHERE type='table' AND name='bookmarks'").get();
  if (hasMainBookmarks) {
    db.exec(`INSERT OR IGNORE INTO user_db.bookmarks (surah_id, ayah_number, verse_key, created_at) SELECT surah_id, ayah_number, verse_key, created_at FROM main.bookmarks;`);
  }
  const hasMainNotes = db.prepare("SELECT name FROM main.sqlite_master WHERE type='table' AND name='notes'").get();
  if (hasMainNotes) {
    db.exec(`INSERT OR IGNORE INTO user_db.notes (surah_id, ayah_number, verse_key, note_text, tags, updated_at) SELECT surah_id, ayah_number, verse_key, note_text, tags, updated_at FROM main.notes;`);
  }
  const hasMainHighlights = db.prepare("SELECT name FROM main.sqlite_master WHERE type='table' AND name='highlights'").get();
  if (hasMainHighlights) {
    db.exec(`INSERT OR IGNORE INTO user_db.highlights (id, surah_id, ayah_number, verse_key, tafsir_slug, text, color, created_at) SELECT id, surah_id, ayah_number, verse_key, tafsir_slug, text, color, created_at FROM main.highlights;`);
  }
} catch (migErr) {
  console.warn('Legacy user data migration notice:', migErr.message);
}

function jsonResponse(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function extractSnippet(html, query, len = 200) {
  if (!html) return '';
  const clean = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const lowerClean = clean.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerClean.indexOf(lowerQuery);
  if (idx === -1) {
    return clean.slice(0, len) + (clean.length > len ? '...' : '');
  }
  const start = Math.max(0, idx - 60);
  const end = Math.min(clean.length, idx + query.length + 140);
  let snippet = clean.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < clean.length) snippet = snippet + '...';
  return snippet;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  try {
    // 0. Serve or proxy QCF v2 & v4 (COLRv1 Tajweed) font files
    const fontMatch = pathname.match(/^\/(?:api\/)?fonts\/(qcf_v2|qcf_v4)\/(p\d+\.woff2)$/);
    if ((req.method === 'GET' || req.method === 'HEAD') && fontMatch) {
      const fontFolder = fontMatch[1];
      const fileName = fontMatch[2];
      const fontDir = path.join(FONTS_DIR, fontFolder);
      const filePath = path.join(fontDir, fileName);

      try {
        if (fs.existsSync(filePath)) {
          const fontData = fs.readFileSync(filePath);
          res.writeHead(200, {
            'Content-Type': 'font/woff2',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*'
          });
          return res.end(fontData);
        }

        const cdnUrl = fontFolder === 'qcf_v4'
          ? `https://verses.quran.com/fonts/quran/hafs/v4/colrv1/woff2/${fileName}`
          : `https://verses.quran.com/fonts/quran/hafs/v2/woff2/${fileName}`;
        const fetchRes = await fetch(cdnUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (fetchRes.ok) {
          const arrayBuffer = await fetchRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          if (!fs.existsSync(fontDir)) fs.mkdirSync(fontDir, { recursive: true });
          fs.writeFileSync(filePath, buffer);

          res.writeHead(200, {
            'Content-Type': 'font/woff2',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*'
          });
          return res.end(buffer);
        }
      } catch (err) {
        console.error('Error serving font:', err.message);
      }
      res.writeHead(404);
      return res.end('Font not found');
    }

    // 1. GET /api/surahs
    if (req.method === 'GET' && pathname === '/api/surahs') {
      const rows = db.prepare('SELECT * FROM surahs ORDER BY id ASC').all();
      return jsonResponse(res, rows);
    }

    // 2. GET /api/surah/:id
    const surahMatch = pathname.match(/^\/api\/surah\/(\d+)$/);
    if (req.method === 'GET' && surahMatch) {
      const surahId = parseInt(surahMatch[1], 10);
      const row = db.prepare('SELECT * FROM surahs WHERE id = ?').get(surahId);
      if (!row) return jsonResponse(res, { error: 'Surah not found' }, 404);
      return jsonResponse(res, row);
    }

    // 3. GET /api/ayahs?surah=1
    if (req.method === 'GET' && pathname === '/api/ayahs') {
      const surahId = parseInt(parsedUrl.searchParams.get('surah') || '1', 10);
      const ayahs = db.prepare('SELECT * FROM ayahs WHERE surah_id = ? ORDER BY ayah_number ASC').all(surahId);
      
      const wordsStmt = db.prepare('SELECT * FROM words WHERE surah_id = ? ORDER BY ayah_number, position ASC');
      const allWords = wordsStmt.all(surahId);
      
      const wordsByAyah = {};
      for (const w of allWords) {
        if (!wordsByAyah[w.ayah_number]) wordsByAyah[w.ayah_number] = [];
        wordsByAyah[w.ayah_number].push(w);
      }

      const transStmt = db.prepare('SELECT * FROM translations WHERE surah_id = ? ORDER BY ayah_number, id ASC');
      const allTrans = transStmt.all(surahId);
      const transByAyah = {};
      for (const t of allTrans) {
        if (!transByAyah[t.ayah_number]) transByAyah[t.ayah_number] = [];
        transByAyah[t.ayah_number].push(t);
      }

      const fullAyahs = ayahs.map(a => ({
        ...a,
        audio_segments: a.audio_segments ? JSON.parse(a.audio_segments) : [],
        words: wordsByAyah[a.ayah_number] || [],
        translations: transByAyah[a.ayah_number] || []
      }));

      return jsonResponse(res, fullAyahs);
    }

    // 4. GET /api/ayah/:surah/:ayah
    const ayahMatch = pathname.match(/^\/api\/ayah\/(\d+)\/(\d+)$/);
    if (req.method === 'GET' && ayahMatch) {
      const surahId = parseInt(ayahMatch[1], 10);
      const ayahNumber = parseInt(ayahMatch[2], 10);

      const ayah = db.prepare('SELECT * FROM ayahs WHERE surah_id = ? AND ayah_number = ?').get(surahId, ayahNumber);
      if (!ayah) return jsonResponse(res, { error: 'Ayah not found' }, 404);

      const words = db.prepare('SELECT * FROM words WHERE surah_id = ? AND ayah_number = ? ORDER BY position ASC').all(surahId, ayahNumber);
      const translations = db.prepare('SELECT * FROM translations WHERE surah_id = ? AND ayah_number = ?').all(surahId, ayahNumber);

      return jsonResponse(res, {
        ...ayah,
        audio_segments: ayah.audio_segments ? JSON.parse(ayah.audio_segments) : [],
        words,
        translations
      });
    }

    // 4b. GET /api/page/:number (Line-by-Line Mushaf Page Endpoint)
    const pageMatch = pathname.match(/^\/api\/page\/(\d+)$/);
    if (req.method === 'GET' && pageMatch) {
      const pageNumber = parseInt(pageMatch[1], 10);
      const words = db.prepare(`
        SELECT w.*, s.name_arabic as surah_name_arabic, s.name_urdu as surah_name_urdu
        FROM words w
        JOIN surahs s ON w.surah_id = s.id
        WHERE w.page_number = ?
        ORDER BY w.line_number ASC, w.surah_id ASC, w.ayah_number ASC, w.position ASC
      `).all(pageNumber);

      const lines = {};
      const wordsByVerseKey = {};
      for (const w of words) {
        if (!lines[w.line_number]) lines[w.line_number] = [];
        lines[w.line_number].push(w);
        const vk = `${w.surah_id}:${w.ayah_number}`;
        if (!wordsByVerseKey[vk]) wordsByVerseKey[vk] = [];
        wordsByVerseKey[vk].push(w);
      }

      const rawVerses = db.prepare(`
        SELECT a.*, s.name_arabic as surah_name_arabic, s.name_urdu as surah_name_urdu
        FROM ayahs a
        JOIN surahs s ON a.surah_id = s.id
        WHERE a.page_madani = ?
        ORDER BY a.surah_id ASC, a.ayah_number ASC
      `).all(pageNumber);

      const verses = rawVerses.map(v => ({
        ...v,
        words: wordsByVerseKey[`${v.surah_id}:${v.ayah_number}`] || []
      }));

      return jsonResponse(res, {
        page_number: pageNumber,
        lines,
        verses,
        words_count: words.length
      });
    }

    // 5. GET /api/tafasir/:surah/:ayah
    const tafsirMatch = pathname.match(/^\/api\/tafasir\/(\d+)\/(\d+)$/);
    if (req.method === 'GET' && tafsirMatch) {
      const surahId = parseInt(tafsirMatch[1], 10);
      const ayahNumber = parseInt(tafsirMatch[2], 10);

      const rows = db.prepare(`
        SELECT * FROM tafasir 
        WHERE surah_id = ? AND ayah_from <= ? AND ayah_to >= ?
        ORDER BY id ASC
      `).all(surahId, ayahNumber, ayahNumber);

      return jsonResponse(res, rows);
    }

    // 6. GET /api/roots/:root
    const rootMatch = pathname.match(/^\/api\/roots\/(.+)$/);
    if (req.method === 'GET' && rootMatch) {
      const rootQuery = decodeURIComponent(rootMatch[1]);
      const rootRow = db.prepare('SELECT * FROM roots WHERE root = ? OR root_arabic = ?').get(rootQuery, rootQuery);
      
      const verses = db.prepare(`
        SELECT 
          w.surah_id, 
          s.name_urdu as surah_name_urdu, 
          w.ayah_number, 
          a.text_uthmani, 
          w.text_uthmani as word_text,
          a.page_madani,
          a.end_code_v2,
          w.code_v2 as word_code_v2,
          (
            SELECT GROUP_CONCAT(code_v2, ' ')
            FROM (
              SELECT code_v2
              FROM words w2
              WHERE w2.surah_id = w.surah_id AND w2.ayah_number = w.ayah_number
              ORDER BY w2.position ASC
            )
          ) as qcf_v2_text
        FROM words w
        JOIN surahs s ON w.surah_id = s.id
        JOIN ayahs a ON (w.surah_id = a.surah_id AND w.ayah_number = a.ayah_number)
        WHERE w.root = ?
        GROUP BY w.surah_id, w.ayah_number
        ORDER BY w.surah_id, w.ayah_number ASC
        LIMIT 50
      `).all(rootQuery);

      return jsonResponse(res, {
        root: rootRow || { root: rootQuery, root_arabic: rootQuery, occurrences_count: verses.length },
        verses
      });
    }

    // 7. GET /api/search/quran?q=...
    if (req.method === 'GET' && pathname === '/api/search/quran') {
      const q = (parsedUrl.searchParams.get('q') || '').trim();
      if (!q || q.length < 2) {
        return jsonResponse(res, []);
      }

      try {
        const safeQuery = `"${q.replace(/"/g, '')}"`;
        const ftsRows = db.prepare(`
          SELECT 
            f.surah_id, 
            s.name_urdu as surah_name_urdu, 
            s.name_arabic as surah_name_arabic, 
            s.name_simple as surah_name_simple, 
            f.ayah_number, 
            f.verse_key, 
            f.text_uthmani, 
            f.text_indopak,
            f.translations_text
          FROM ayahs_fts f
          JOIN surahs s ON f.surah_id = s.id
          WHERE ayahs_fts MATCH ?
          ORDER BY rank
          LIMIT 60
        `).all(safeQuery);

        if (ftsRows.length > 0) {
          const results = ftsRows.map(r => {
            let translationText = '';
            if (r.translations_text) {
              const parts = r.translations_text.split(/(?<=[۔.])/g);
              translationText = parts.find(p => p.toLowerCase().includes(q.toLowerCase())) || parts[0] || r.translations_text.slice(0, 160);
            }
            return {
              surah_id: r.surah_id,
              surah_name_urdu: r.surah_name_urdu,
              surah_name_arabic: r.surah_name_arabic,
              surah_name_simple: r.surah_name_simple,
              ayah_number: r.ayah_number,
              verse_key: r.verse_key,
              text_uthmani: r.text_uthmani,
              text_indopak: r.text_indopak,
              translation_text: translationText.trim(),
              author_name: 'FTS5'
            };
          });
          return jsonResponse(res, results);
        }
      } catch (err) {
        console.warn('FTS ayah search fallback to LIKE:', err.message);
      }

      const pattern = `%${q}%`;
      const results = db.prepare(`
        SELECT 
          t.surah_id, 
          s.name_urdu as surah_name_urdu, 
          s.name_arabic as surah_name_arabic, 
          s.name_simple as surah_name_simple, 
          t.ayah_number, 
          a.verse_key, 
          a.text_uthmani, 
          a.text_indopak, 
          t.text as translation_text, 
          t.author_name
        FROM translations t
        JOIN surahs s ON t.surah_id = s.id
        JOIN ayahs a ON (t.surah_id = a.surah_id AND t.ayah_number = a.ayah_number)
        WHERE t.text LIKE ? OR a.text_uthmani LIKE ? OR a.text_indopak LIKE ?
        GROUP BY t.surah_id, t.ayah_number
        LIMIT 60
      `).all(pattern, pattern, pattern);

      return jsonResponse(res, results);
    }

    // 8. GET /api/search/tafsir?q=...
    if (req.method === 'GET' && pathname === '/api/search/tafsir') {
      const q = (parsedUrl.searchParams.get('q') || '').trim();
      if (!q || q.length < 2) {
        return jsonResponse(res, []);
      }

      try {
        const safeQuery = `"${q.replace(/"/g, '')}"`;
        const ftsRows = db.prepare(`
          SELECT 
            f.rowid as id,
            f.surah_id, 
            s.name_urdu as surah_name_urdu, 
            f.ayah_from, 
            f.ayah_to, 
            f.tafsir_slug, 
            f.tafsir_name, 
            f.author_name, 
            snippet(tafasir_fts, 6, '<b>', '</b>', '...', 25) as snippet
          FROM tafasir_fts f
          JOIN surahs s ON f.surah_id = s.id
          WHERE tafasir_fts MATCH ?
          ORDER BY rank
          LIMIT 50
        `).all(safeQuery);

        if (ftsRows.length > 0) {
          return jsonResponse(res, ftsRows);
        }
      } catch (err) {
        console.warn('FTS tafsir search fallback to LIKE:', err.message);
      }

      const pattern = `%${q}%`;
      const rows = db.prepare(`
        SELECT 
          tf.id, 
          tf.surah_id, 
          s.name_urdu as surah_name_urdu, 
          tf.ayah_from, 
          tf.ayah_to, 
          tf.tafsir_slug, 
          tf.tafsir_name, 
          tf.author_name, 
          tf.content_html
        FROM tafasir tf
        JOIN surahs s ON tf.surah_id = s.id
        WHERE tf.content_html LIKE ?
        LIMIT 50
      `).all(pattern);

      const results = rows.map(r => ({
        id: r.id,
        surah_id: r.surah_id,
        surah_name_urdu: r.surah_name_urdu,
        ayah_from: r.ayah_from,
        ayah_to: r.ayah_to,
        tafsir_slug: r.tafsir_slug,
        tafsir_name: r.tafsir_name,
        author_name: r.author_name,
        snippet: extractSnippet(r.content_html, q, 220)
      }));

      return jsonResponse(res, results);
    }

    // 9. BOOKMARKS API (Stored in attached user_db)
    // GET /api/bookmarks
    if (req.method === 'GET' && pathname === '/api/bookmarks') {
      const bookmarks = db.prepare(`
        SELECT 
          b.id, 
          b.surah_id, 
          s.name_urdu as surah_name_urdu, 
          b.ayah_number, 
          b.verse_key, 
          b.created_at, 
          a.text_uthmani, 
          a.text_indopak,
          (SELECT text FROM translations t WHERE t.surah_id = b.surah_id AND t.ayah_number = b.ayah_number AND t.author_id = 'taqi_usmani' LIMIT 1) as translation_text
        FROM user_db.bookmarks b
        JOIN surahs s ON b.surah_id = s.id
        JOIN ayahs a ON (b.surah_id = a.surah_id AND b.ayah_number = a.ayah_number)
        ORDER BY b.id DESC
      `).all();
      return jsonResponse(res, bookmarks);
    }

    // POST /api/bookmarks
    if (req.method === 'POST' && pathname === '/api/bookmarks') {
      const body = await parseBody(req);
      const { surah_id, ayah_number, verse_key } = body;
      if (!surah_id || !ayah_number) {
        return jsonResponse(res, { error: 'surah_id and ayah_number required' }, 400);
      }
      const vk = verse_key || `${surah_id}:${ayah_number}`;
      db.prepare(`
        INSERT OR IGNORE INTO user_db.bookmarks (surah_id, ayah_number, verse_key)
        VALUES (?, ?, ?)
      `).run(surah_id, ayah_number, vk);
      return jsonResponse(res, { success: true, surah_id, ayah_number });
    }

    // DELETE /api/bookmarks/:surah/:ayah
    const delBmMatch = pathname.match(/^\/api\/bookmarks\/(\d+)\/(\d+)$/);
    if (req.method === 'DELETE' && delBmMatch) {
      const sId = parseInt(delBmMatch[1], 10);
      const aNum = parseInt(delBmMatch[2], 10);
      db.prepare('DELETE FROM user_db.bookmarks WHERE surah_id = ? AND ayah_number = ?').run(sId, aNum);
      return jsonResponse(res, { success: true });
    }

    // 10. NOTES API (Stored in attached user_db)
    // GET /api/notes
    if (req.method === 'GET' && pathname === '/api/notes') {
      const notes = db.prepare(`
        SELECT 
          n.id, 
          n.surah_id, 
          s.name_urdu as surah_name_urdu, 
          n.ayah_number, 
          n.verse_key, 
          n.note_text, 
          n.tags, 
          n.updated_at, 
          a.text_uthmani
        FROM user_db.notes n
        JOIN surahs s ON n.surah_id = s.id
        JOIN ayahs a ON (n.surah_id = a.surah_id AND n.ayah_number = a.ayah_number)
        ORDER BY n.updated_at DESC
      `).all();
      return jsonResponse(res, notes);
    }

    // POST /api/notes
    if (req.method === 'POST' && pathname === '/api/notes') {
      const body = await parseBody(req);
      const { surah_id, ayah_number, verse_key, note_text, tags } = body;
      if (!surah_id || !ayah_number || note_text === undefined) {
        return jsonResponse(res, { error: 'surah_id, ayah_number, and note_text required' }, 400);
      }
      const vk = verse_key || `${surah_id}:${ayah_number}`;
      db.prepare(`
        INSERT INTO user_db.notes (surah_id, ayah_number, verse_key, note_text, tags, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(surah_id, ayah_number) DO UPDATE SET 
          note_text = excluded.note_text, 
          tags = excluded.tags, 
          updated_at = CURRENT_TIMESTAMP
      `).run(surah_id, ayah_number, vk, note_text, tags || '');
      return jsonResponse(res, { success: true, surah_id, ayah_number });
    }

    // DELETE /api/notes/:surah/:ayah
    const delNoteMatch = pathname.match(/^\/api\/notes\/(\d+)\/(\d+)$/);
    if (req.method === 'DELETE' && delNoteMatch) {
      const sId = parseInt(delNoteMatch[1], 10);
      const aNum = parseInt(delNoteMatch[2], 10);
      db.prepare('DELETE FROM user_db.notes WHERE surah_id = ? AND ayah_number = ?').run(sId, aNum);
      return jsonResponse(res, { success: true });
    }

    // 11. HIGHLIGHTS API (Stored in attached user_db)
    // GET /api/highlights
    if (req.method === 'GET' && pathname === '/api/highlights') {
      const highlights = db.prepare(`
        SELECT 
          h.id, 
          h.surah_id, 
          s.name_urdu as surah_name_urdu, 
          h.ayah_number, 
          h.verse_key, 
          h.tafsir_slug, 
          h.text, 
          h.color, 
          h.created_at
        FROM user_db.highlights h
        JOIN surahs s ON h.surah_id = s.id
        ORDER BY h.created_at DESC
      `).all();
      return jsonResponse(res, highlights);
    }

    // POST /api/highlights
    if (req.method === 'POST' && pathname === '/api/highlights') {
      const body = await parseBody(req);
      const { id, surah_id, ayah_number, verse_key, tafsir_slug, text, color } = body;
      if (!id || !surah_id || !ayah_number || !text) {
        return jsonResponse(res, { error: 'id, surah_id, ayah_number, and text required' }, 400);
      }
      const vk = verse_key || `${surah_id}:${ayah_number}`;
      db.prepare(`
        INSERT OR REPLACE INTO user_db.highlights (id, surah_id, ayah_number, verse_key, tafsir_slug, text, color, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(id, surah_id, ayah_number, vk, tafsir_slug || 'general', text, color || 'yellow');
      return jsonResponse(res, { success: true, id });
    }

    // DELETE /api/highlights/:id
    const delHlMatch = pathname.match(/^\/api\/highlights\/(.+)$/);
    if (req.method === 'DELETE' && delHlMatch) {
      const hlId = decodeURIComponent(delHlMatch[1]);
      db.prepare('DELETE FROM user_db.highlights WHERE id = ?').run(hlId);
      return jsonResponse(res, { success: true });
    }

    // 12. STATIC ASSET FALLBACK FOR PRODUCTION & ELECTRON DESKTOP RUNTIME
    if (req.method === 'GET' && !pathname.startsWith('/api/')) {
      const MIME_TYPES = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.otf': 'font/opentype',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.ico': 'image/x-icon'
      };

      const safeRelPath = decodeURIComponent(pathname === '/' ? '/index.html' : pathname).replace(/\.\./g, '');
      let candidatePath = path.join(STATIC_DIR, safeRelPath);

      if (!fs.existsSync(candidatePath) && safeRelPath.startsWith('/fonts/')) {
        candidatePath = path.join(FONTS_DIR, safeRelPath.replace(/^\/fonts\//, ''));
      }

      if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
        const ext = path.extname(candidatePath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': ext === '.woff2' || ext === '.ttf' ? 'public, max-age=31536000, immutable' : 'no-cache'
        });
        return fs.createReadStream(candidatePath).pipe(res);
      }
    }

    // 404
    jsonResponse(res, { error: 'Not found' }, 404);
  } catch (err) {
    console.error('Server error:', err);
    jsonResponse(res, { error: err.message }, 500);
  }
});

export function startServer(port = PORT, host = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      const address = server.address();
      const actualPort = typeof address === 'object' && address ? address.port : port;
      console.log(`Al-Wahyain Backend API running on http://${host}:${actualPort}`);
      console.log(`  • Corpus DB : ${DB_PATH}`);
      console.log(`  • User DB   : ${USER_DB_PATH}`);
      resolve({ server, port: actualPort, host, url: `http://${host}:${actualPort}` });
    });
  });
}

// Auto-start when run directly via `node server/index.mjs` (Web Workflow)
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  server.listen(PORT, () => {
    console.log(`Quran Study App Backend API running on http://localhost:${PORT}`);
    console.log(`  • Corpus DB : ${DB_PATH}`);
    console.log(`  • User DB   : ${USER_DB_PATH}`);
  });
}
