import { 
  Surah, 
  Ayah, 
  TafsirEntry, 
  RootDetail, 
  SearchResultQuran, 
  SearchResultTafsir, 
  Bookmark, 
  AyahNote,
  TafsirHighlight,
  PageData,
  LexicalSearchResponse,
  AutocompleteResponse,
  AyahTreebankResponse,
  UrduIrabResponse,
  HadithBook,
  HadithChapter,
  HadithItem,
  HadithListResponse,
  HadithSearchResult
} from '../types/quran';

const BASE_URL = '/api';

export async function searchLexical(
  query: string, 
  strict: boolean = false, 
  limit: number = 60, 
  offset: number = 0
): Promise<LexicalSearchResponse> {
  if (!query || !query.trim()) {
    return { query, total: 0, results: [], dispersion: [] };
  }
  const strictParam = strict ? '&strict=1' : '';
  const res = await fetch(`${BASE_URL}/search/lexical?q=${encodeURIComponent(query.trim())}${strictParam}&limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Failed to execute lexical search');
  return res.json();
}

export async function fetchAutocomplete(prefix: string): Promise<AutocompleteResponse> {
  if (!prefix || !prefix.trim()) {
    return { surahs: [], roots: [], words: [] };
  }
  const res = await fetch(`${BASE_URL}/search/autocomplete?q=${encodeURIComponent(prefix.trim())}`);
  if (!res.ok) throw new Error('Failed to fetch autocomplete suggestions');
  return res.json();
}

export async function fetchSurahs(): Promise<Surah[]> {
  const res = await fetch(`${BASE_URL}/surahs`);
  if (!res.ok) throw new Error('Failed to fetch surahs');
  return res.json();
}

export async function fetchAyahs(surahId: number): Promise<Ayah[]> {
  const res = await fetch(`${BASE_URL}/ayahs?surah=${surahId}`);
  if (!res.ok) throw new Error(`Failed to fetch ayahs for surah ${surahId}`);
  return res.json();
}

export async function fetchAyah(surahId: number, ayahNumber: number): Promise<Ayah> {
  const res = await fetch(`${BASE_URL}/ayah/${surahId}/${ayahNumber}`);
  if (!res.ok) throw new Error(`Failed to fetch ayah ${surahId}:${ayahNumber}`);
  return res.json();
}

export async function fetchTafasir(surahId: number, ayahNumber: number): Promise<TafsirEntry[]> {
  const res = await fetch(`${BASE_URL}/tafasir/${surahId}/${ayahNumber}`);
  if (!res.ok) throw new Error(`Failed to fetch tafasir for ${surahId}:${ayahNumber}`);
  return res.json();
}

export async function fetchRootDetails(root: string): Promise<RootDetail> {
  const res = await fetch(`${BASE_URL}/roots/${encodeURIComponent(root)}`);
  if (!res.ok) throw new Error(`Failed to fetch root details for ${root}`);
  return res.json();
}

export async function fetchAyahTreebank(surahId: number, ayahNumber: number): Promise<AyahTreebankResponse> {
  const res = await fetch(`${BASE_URL}/treebank/${surahId}/${ayahNumber}`);
  if (!res.ok) throw new Error(`Failed to fetch treebank for ${surahId}:${ayahNumber}`);
  return res.json();
}

export async function fetchUrduIrab(surahId: number, ayahNumber: number): Promise<UrduIrabResponse> {
  const res = await fetch(`${BASE_URL}/irab/${surahId}/${ayahNumber}`);
  if (!res.ok) throw new Error(`Failed to fetch Urdu I'rab for ${surahId}:${ayahNumber}`);
  return res.json();
}

export async function fetchPageData(pageNumber: number): Promise<PageData> {
  const res = await fetch(`${BASE_URL}/page/${pageNumber}`);
  if (!res.ok) throw new Error(`Failed to fetch page data for page ${pageNumber}`);
  return res.json();
}

// Search APIs
export async function searchQuran(query: string): Promise<SearchResultQuran[]> {
  if (!query || query.trim().length < 2) return [];
  const res = await fetch(`${BASE_URL}/search/quran?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) throw new Error('Failed to search Quran');
  return res.json();
}

export async function searchTafsir(query: string): Promise<SearchResultTafsir[]> {
  if (!query || query.trim().length < 2) return [];
  const res = await fetch(`${BASE_URL}/search/tafsir?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) throw new Error('Failed to search Tafsir');
  return res.json();
}

// Bookmarks APIs
export async function fetchBookmarks(): Promise<Bookmark[]> {
  const res = await fetch(`${BASE_URL}/bookmarks`);
  if (!res.ok) throw new Error('Failed to fetch bookmarks');
  return res.json();
}

export async function addBookmark(surah_id: number, ayah_number: number, verse_key: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/bookmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ surah_id, ayah_number, verse_key })
  });
  if (!res.ok) throw new Error('Failed to add bookmark');
}

export async function removeBookmark(surah_id: number, ayah_number: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/bookmarks/${surah_id}/${ayah_number}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete bookmark');
}

// Notes APIs
export async function fetchNotes(): Promise<AyahNote[]> {
  const res = await fetch(`${BASE_URL}/notes`);
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}

export async function saveNote(surah_id: number, ayah_number: number, verse_key: string, note_text: string, tags?: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ surah_id, ayah_number, verse_key, note_text, tags })
  });
  if (!res.ok) throw new Error('Failed to save note');
}

export async function deleteNote(surah_id: number, ayah_number: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/notes/${surah_id}/${ayah_number}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete note');
}

// Highlights APIs
export async function fetchHighlights(): Promise<TafsirHighlight[]> {
  const res = await fetch(`${BASE_URL}/highlights`);
  if (!res.ok) throw new Error('Failed to fetch highlights');
  return res.json();
}

export async function saveHighlight(highlight: Omit<TafsirHighlight, 'created_at'>): Promise<void> {
  const res = await fetch(`${BASE_URL}/highlights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(highlight)
  });
  if (!res.ok) throw new Error('Failed to save highlight');
}

export async function deleteHighlight(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/highlights/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete highlight');
}

// ========================================================
// HADITH API CALLS (8 Canonical Collections)
// ========================================================

export async function fetchHadithBooks(): Promise<HadithBook[]> {
  const res = await fetch(`${BASE_URL}/hadith/books`);
  if (!res.ok) throw new Error('Failed to fetch hadith books');
  return res.json();
}

export async function fetchHadithChapters(bookSlug: string): Promise<{ book: HadithBook; chapters: HadithChapter[] }> {
  const res = await fetch(`${BASE_URL}/hadith/${encodeURIComponent(bookSlug)}/chapters`);
  if (!res.ok) throw new Error(`Failed to fetch chapters for ${bookSlug}`);
  return res.json();
}

export async function fetchHadithList(
  bookSlug: string, 
  chapterId?: number | 'all', 
  page: number = 1, 
  limit: number = 25
): Promise<HadithListResponse> {
  let url = `${BASE_URL}/hadith/${encodeURIComponent(bookSlug)}/list?page=${page}&limit=${limit}`;
  if (chapterId !== undefined && chapterId !== null && chapterId !== 'all') {
    url += `&chapterId=${chapterId}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch hadiths for ${bookSlug}`);
  return res.json();
}

export async function fetchHadithByNumber(bookSlug: string, hadithNumber: number): Promise<{ 
  book: HadithBook; 
  hadith: HadithItem; 
  chapter_page?: number; 
  book_page?: number; 
}> {
  const res = await fetch(`${BASE_URL}/hadith/${encodeURIComponent(bookSlug)}/${hadithNumber}`);
  if (!res.ok) throw new Error(`Failed to fetch hadith ${bookSlug} #${hadithNumber}`);
  return res.json();
}

export async function searchHadith(
  query: string, 
  bookSlug: string | null = null, 
  limit: number = 30
): Promise<{ query: string; results: HadithSearchResult[]; total: number }> {
  if (!query || !query.trim()) {
    return { query, results: [], total: 0 };
  }
  let url = `${BASE_URL}/hadith/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`;
  if (bookSlug && bookSlug !== 'all') {
    url += `&book=${encodeURIComponent(bookSlug)}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to search hadiths');
  return res.json();
}
