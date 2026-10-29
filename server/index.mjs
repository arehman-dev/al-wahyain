import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'quran_study.db');

const db = new DatabaseSync(DB_PATH);
const PORT = process.env.PORT || 3001;

// Initialize bookmarks and notes tables
db.exec(`
  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    verse_key TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(surah_id, ayah_number)
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    verse_key TEXT NOT NULL,
    note_text TEXT NOT NULL,
    tags TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(surah_id, ayah_number)
  );
`);

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
        SELECT w.surah_id, s.name_urdu as surah_name_urdu, w.ayah_number, a.text_uthmani, w.text_uthmani as word_text
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

    // 9. BOOKMARKS API
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
        FROM bookmarks b
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
        INSERT OR IGNORE INTO bookmarks (surah_id, ayah_number, verse_key)
        VALUES (?, ?, ?)
      `).run(surah_id, ayah_number, vk);
      return jsonResponse(res, { success: true, surah_id, ayah_number });
    }

    // DELETE /api/bookmarks/:surah/:ayah
    const delBmMatch = pathname.match(/^\/api\/bookmarks\/(\d+)\/(\d+)$/);
    if (req.method === 'DELETE' && delBmMatch) {
      const sId = parseInt(delBmMatch[1], 10);
      const aNum = parseInt(delBmMatch[2], 10);
      db.prepare('DELETE FROM bookmarks WHERE surah_id = ? AND ayah_number = ?').run(sId, aNum);
      return jsonResponse(res, { success: true });
    }

    // 10. NOTES API
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
        FROM notes n
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
        INSERT INTO notes (surah_id, ayah_number, verse_key, note_text, tags, updated_at)
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
      db.prepare('DELETE FROM notes WHERE surah_id = ? AND ayah_number = ?').run(sId, aNum);
      return jsonResponse(res, { success: true });
    }

    // 404
    jsonResponse(res, { error: 'Not found' }, 404);
  } catch (err) {
    console.error('Server error:', err);
    jsonResponse(res, { error: err.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`Quran Study App Backend API running on http://localhost:${PORT}`);
});
