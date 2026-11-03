import { normalizeArabic, hasTashkeel } from './arabicNormalizer.mjs';

export { hasTashkeel };

/**
 * Parse an incoming user query into a structured search specification.
 */
export function parseLexicalQuery(inputQuery, forceStrictDiacritics = false) {
  let q = (inputQuery || '').trim();
  if (!q) return null;

  // Check for strict diacritics prefix: e.g. "strict:مُخْلَصِين"
  let strictDiacritics = forceStrictDiacritics;
  if (q.startsWith('strict:')) {
    strictDiacritics = true;
    q = q.slice(7).trim();
  } else if (hasTashkeel(q)) {
    // If user explicitly typed harakat, enable strict diacritics
    strictDiacritics = true;
  }

  // 1. Root Search (root:كتب or جذر:كتب)
  const rootMatch = q.match(/^(?:root|جذر):([\u0600-\u06FFa-zA-Z\s-]+)$/i);
  if (rootMatch) {
    const rawRoot = rootMatch[1].trim().replace(/[-\s]/g, '');
    const cleanRoot = normalizeArabic(rawRoot);
    return {
      type: 'ROOT',
      root: cleanRoot,
      rawQuery: q
    };
  }

  // 2. Lemma Search (lem:كتاب or مادہ:كتاب)
  const lemMatch = q.match(/^(?:lem|lemma|مادہ|مادۂ):([\u0600-\u06FFa-zA-Z\s-]+)$/i);
  if (lemMatch) {
    const rawLemma = lemMatch[1].trim();
    const cleanLemma = normalizeArabic(rawLemma);
    return {
      type: 'LEMMA',
      lemma: cleanLemma,
      rawQuery: q
    };
  }

  // 3. Proximity Search: NEAR(word1, word2, distance)
  const nearMatch = q.match(/^NEAR\s*\(\s*([^,]+)\s*,\s*([^,]+)(?:\s*,\s*(\d+))?\s*\)$/i);
  if (nearMatch) {
    const word1 = nearMatch[1].trim();
    const word2 = nearMatch[2].trim();
    const dist = parseInt(nearMatch[3] || '5', 10);
    return {
      type: 'PROXIMITY',
      word1,
      word2,
      distance: dist,
      rawQuery: q
    };
  }

  // 4. Exact Phrase: "رسول الله"
  if (q.startsWith('"') && q.endsWith('"') && q.length > 2) {
    const inner = q.slice(1, -1).trim();
    return {
      type: 'EXACT_PHRASE',
      phrase: inner,
      strictDiacritics,
      rawQuery: q
    };
  }

  // 5. Wildcard Search (contains ? or *)
  if (q.includes('?') || q.includes('*')) {
    return {
      type: 'WILDCARD',
      pattern: q,
      cleanPattern: normalizeArabic(q).replace(/\?/g, '_').replace(/\*/g, '%'),
      rawQuery: q
    };
  }

  // 6. Boolean Exclude / Logical NOT (e.g. "كتاب -توراة" or "كتاب NOT توراة")
  if (q.includes(' -') || /\s+NOT\s+/i.test(q)) {
    let parts;
    if (q.includes(' -')) {
      const idx = q.indexOf(' -');
      parts = [q.slice(0, idx), q.slice(idx + 2)];
    } else {
      parts = q.split(/\s+NOT\s+/i);
    }
    return {
      type: 'BOOLEAN_NOT',
      include: parts[0].trim(),
      exclude: parts[1].trim(),
      rawQuery: q
    };
  }

  // 7. Boolean OR / Pipe (e.g. "كتاب | ميزان" or "كتاب OR ميزان")
  if (q.includes('|') || /\s+OR\s+/i.test(q)) {
    const terms = (q.includes('|') ? q.split('|') : q.split(/\s+OR\s+/i))
      .map(t => t.trim())
      .filter(Boolean);
    return {
      type: 'BOOLEAN_OR',
      terms,
      rawQuery: q
    };
  }

  // 8. Standard Lexical Search (Word or Multi-word phrase)
  return {
    type: 'STANDARD',
    query: q,
    cleanQuery: normalizeArabic(q),
    strictDiacritics,
    rawQuery: q
  };
}

/**
 * Execute the compiled search against SQLite and return results + dispersion.
 */
export function executeLexicalSearch(db, spec, limit = 60, offset = 0) {
  if (!spec) return { total: 0, results: [], dispersion: [] };

  let matchingAyahKeys = []; // Array of { surah_id, ayah_number }

  switch (spec.type) {
    case 'ROOT': {
      // Direct root query on words table
      const rows = db.prepare(`
        SELECT DISTINCT w.surah_id, w.ayah_number
        FROM words w
        WHERE w.root = ? OR w.root = ?
        ORDER BY w.surah_id, w.ayah_number ASC
      `).all(spec.root, spec.rawQuery.replace(/^(?:root|جذر):/i, '').trim());
      matchingAyahKeys = rows;
      break;
    }

    case 'LEMMA': {
      // Direct lemma query on words table
      const rows = db.prepare(`
        SELECT DISTINCT w.surah_id, w.ayah_number
        FROM words w
        WHERE w.lemma = ? OR w.lemma = ?
        ORDER BY w.surah_id, w.ayah_number ASC
      `).all(spec.lemma, spec.rawQuery.replace(/^(?:lem|lemma|مادہ|مادۂ):/i, '').trim());
      matchingAyahKeys = rows;
      break;
    }

    case 'PROXIMITY': {
      // FTS5 NEAR operator
      try {
        const rows = db.prepare(`
          SELECT surah_id, ayah_number
          FROM ayahs_fts
          WHERE ayahs_fts MATCH ?
          ORDER BY rank
        `).all(`NEAR(${spec.word1} ${spec.word2}, ${spec.distance})`);
        matchingAyahKeys = rows;
      } catch {
        matchingAyahKeys = [];
      }
      break;
    }

    case 'EXACT_PHRASE': {
      if (spec.strictDiacritics) {
        // Strict tashkeel match on text_uthmani
        const pattern = `%${spec.phrase}%`;
        const rows = db.prepare(`
          SELECT surah_id, ayah_number
          FROM ayahs
          WHERE text_uthmani LIKE ?
          ORDER BY surah_id, ayah_number ASC
        `).all(pattern);
        matchingAyahKeys = rows;
      } else {
        // Normalized exact phrase via FTS5 or text_clean
        const cleanPattern = `%${normalizeArabic(spec.phrase)}%`;
        const rows = db.prepare(`
          SELECT surah_id, ayah_number
          FROM ayahs
          WHERE text_clean LIKE ?
          ORDER BY surah_id, ayah_number ASC
        `).all(cleanPattern);
        matchingAyahKeys = rows;
      }
      break;
    }

    case 'WILDCARD': {
      // Match against text_clean with SQL wildcards
      const sqlPattern = `%${spec.cleanPattern}%`;
      const rows = db.prepare(`
        SELECT surah_id, ayah_number
        FROM ayahs
        WHERE text_clean LIKE ?
        ORDER BY surah_id, ayah_number ASC
      `).all(sqlPattern);
      matchingAyahKeys = rows;
      break;
    }

    case 'BOOLEAN_NOT': {
      try {
        const cleanInc = normalizeArabic(spec.include);
        const cleanExc = normalizeArabic(spec.exclude);
        const rows = db.prepare(`
          SELECT surah_id, ayah_number
          FROM ayahs
          WHERE text_clean LIKE ? AND text_clean NOT LIKE ?
          ORDER BY surah_id, ayah_number ASC
        `).all(`%${cleanInc}%`, `%${cleanExc}%`);
        matchingAyahKeys = rows;
      } catch {
        matchingAyahKeys = [];
      }
      break;
    }

    case 'BOOLEAN_OR': {
      const conditions = spec.terms.map(() => `text_clean LIKE ?`).join(' OR ');
      const params = spec.terms.map(t => `%${normalizeArabic(t)}%`);
      const rows = db.prepare(`
        SELECT surah_id, ayah_number
        FROM ayahs
        WHERE ${conditions}
        ORDER BY surah_id, ayah_number ASC
      `).all(...params);
      matchingAyahKeys = rows;
      break;
    }

    case 'STANDARD':
    default: {
      if (spec.strictDiacritics) {
        // Match exact vowels in text_uthmani
        const rows = db.prepare(`
          SELECT surah_id, ayah_number
          FROM ayahs
          WHERE text_uthmani LIKE ?
          ORDER BY surah_id, ayah_number ASC
        `).all(`%${spec.query}%`);
        matchingAyahKeys = rows;
      } else {
        // Normalized match
        const cleanPattern = `%${spec.cleanQuery}%`;
        const rows = db.prepare(`
          SELECT a.surah_id, a.ayah_number
          FROM ayahs a
          WHERE a.text_clean LIKE ?
          ORDER BY a.surah_id, a.ayah_number ASC
        `).all(cleanPattern);

        if (rows.length > 0) {
          matchingAyahKeys = rows;
        } else {
          // If no Arabic match, search translations (Urdu / English) via FTS5
          try {
            const ftsRows = db.prepare(`
              SELECT surah_id, ayah_number
              FROM ayahs_fts
              WHERE ayahs_fts MATCH ?
              ORDER BY rank
            `).all(`"${spec.query.replace(/"/g, '')}"`);
            matchingAyahKeys = ftsRows;
          } catch {
            matchingAyahKeys = [];
          }
        }
      }
      break;
    }
  }

  const total = matchingAyahKeys.length;

  // 114 Surah Dispersion Map
  const dispersionMap = new Map();
  for (let s = 1; s <= 114; s++) {
    dispersionMap.set(s, 0);
  }
  for (const item of matchingAyahKeys) {
    const cur = dispersionMap.get(item.surah_id) || 0;
    dispersionMap.set(item.surah_id, cur + 1);
  }

  const surahsMetadata = db.prepare('SELECT id, name_arabic, name_urdu, name_simple, revelation_place FROM surahs ORDER BY id ASC').all();
  const dispersion = surahsMetadata.map(s => ({
    surah_id: s.id,
    name_arabic: s.name_arabic,
    name_urdu: s.name_urdu,
    name_simple: s.name_simple,
    revelation_place: s.revelation_place,
    match_count: dispersionMap.get(s.id) || 0
  }));

  // Paginated Results Slice
  const paged = matchingAyahKeys.slice(offset, offset + limit);
  if (paged.length === 0) {
    return { total, results: [], dispersion };
  }

  // Fetch full verse details for paged items
  const results = [];
  const getAyahStmt = db.prepare(`
    SELECT 
      a.id,
      a.surah_id,
      s.name_arabic as surah_name_arabic,
      s.name_urdu as surah_name_urdu,
      s.name_simple as surah_name_simple,
      a.ayah_number,
      a.verse_key,
      a.text_uthmani,
      a.text_indopak,
      a.text_clean,
      a.page_madani
    FROM ayahs a
    JOIN surahs s ON a.surah_id = s.id
    WHERE a.surah_id = ? AND a.ayah_number = ?
  `);

  const getTranslationStmt = db.prepare(`
    SELECT text as translation_text, author_name
    FROM translations
    WHERE surah_id = ? AND ayah_number = ?
    ORDER BY CASE WHEN author_name LIKE '%Maududi%' THEN 1 WHEN author_name LIKE '%Tahir%' THEN 2 ELSE 3 END
    LIMIT 1
  `);

  const getMatchedWordsStmt = db.prepare(`
    SELECT position, text_uthmani, text_clean, root, lemma
    FROM words
    WHERE surah_id = ? AND ayah_number = ?
  `);

  for (const item of paged) {
    const ayah = getAyahStmt.get(item.surah_id, item.ayah_number);
    if (!ayah) continue;

    const tr = getTranslationStmt.get(item.surah_id, item.ayah_number);
    const words = getMatchedWordsStmt.all(item.surah_id, item.ayah_number);

    // Identify which words in the verse matched the query
    const matchedPositions = [];
    if (spec.type === 'ROOT') {
      for (const w of words) {
        if (w.root === spec.root) matchedPositions.push(w.position);
      }
    } else if (spec.type === 'LEMMA') {
      for (const w of words) {
        if (w.lemma === spec.lemma) matchedPositions.push(w.position);
      }
    } else if (spec.cleanPattern || spec.cleanQuery) {
      const pat = spec.cleanPattern || spec.cleanQuery;
      for (const w of words) {
        if (w.text_clean && (w.text_clean.includes(pat) || (spec.type === 'WILDCARD' && matchesWildcard(w.text_clean, pat)))) {
          matchedPositions.push(w.position);
        }
      }
    }

    results.push({
      ...ayah,
      translation_text: tr ? tr.translation_text : '',
      author_name: tr ? tr.author_name : '',
      matched_positions: matchedPositions
    });
  }

  return {
    total,
    results,
    dispersion
  };
}

function matchesWildcard(str, patternWithSqlWildcards) {
  // Convert SQL wildcards % -> .*, _ -> . to regex
  try {
    const rxStr = '^' + patternWithSqlWildcards.replace(/%/g, '.*').replace(/_/g, '.') + '$';
    return new RegExp(rxStr).test(str);
  } catch {
    return false;
  }
}

/**
 * Sub-10ms typeahead autocomplete suggestions.
 */
export function getAutocompleteSuggestions(db, input, limit = 8) {
  const q = (input || '').trim();
  if (!q || q.length < 1) return { roots: [], words: [], surahs: [] };

  const clean = normalizeArabic(q);

  // 1. Surah suggestions
  const surahs = db.prepare(`
    SELECT id, name_arabic, name_urdu, name_simple, revelation_place, verses_count
    FROM surahs
    WHERE name_arabic LIKE ? OR name_urdu LIKE ? OR name_simple LIKE ?
    LIMIT 3
  `).all(`%${q}%`, `%${q}%`, `%${q}%`);

  // 2. Root suggestions
  const roots = db.prepare(`
    SELECT root, root_arabic, occurrences_count
    FROM roots
    WHERE root LIKE ? OR root_arabic LIKE ?
    ORDER BY occurrences_count DESC
    LIMIT 5
  `).all(`${clean}%`, `${clean}%`);

  // 3. Word token suggestions from lexical_dictionary
  const tokens = db.prepare(`
    SELECT token_clean, token_uthmani, root, lemma, occurrences_count
    FROM lexical_dictionary
    WHERE token_clean LIKE ?
    ORDER BY occurrences_count DESC
    LIMIT 8
  `).all(`${clean}%`);

  return {
    surahs,
    roots,
    words: tokens
  };
}
