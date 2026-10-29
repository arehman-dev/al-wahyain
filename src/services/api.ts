import { 
  Surah, 
  Ayah, 
  TafsirEntry, 
  RootDetail, 
  SearchResultQuran, 
  SearchResultTafsir, 
  Bookmark, 
  AyahNote,
  TafsirHighlight 
} from '../types/quran';

const BASE_URL = '/api';

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
