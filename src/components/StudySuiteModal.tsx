import React, { useState, useEffect } from 'react';
import { Bookmark as BookmarkIcon, FileText, Trash2, ExternalLink, X, BookOpen, Clock, Highlighter, Download, FileJson } from 'lucide-react';
import { Bookmark, AyahNote, TafsirHighlight } from '../types/quran';
import { fetchBookmarks, removeBookmark, fetchNotes, deleteNote, fetchHighlights, deleteHighlight } from '../services/api';
import { HIGHLIGHT_STYLES } from '../utils/highlighterHelper';

interface StudySuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToAyah: (surahId: number, ayahNumber: number) => void;
}

export const StudySuiteModal: React.FC<StudySuiteModalProps> = ({
  isOpen,
  onClose,
  onJumpToAyah
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes' | 'highlights'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<AyahNote[]>([]);
  const [highlights, setHighlights] = useState<TafsirHighlight[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchBookmarks(), fetchNotes(), fetchHighlights()])
      .then(([bm, nt, hl]) => {
        setBookmarks(bm);
        setNotes(nt);
        setHighlights(hl);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleRemoveBookmark = async (e: React.MouseEvent, surahId: number, ayahNumber: number) => {
    e.stopPropagation();
    try {
      await removeBookmark(surahId, ayahNumber);
      setBookmarks(prev => prev.filter(b => !(b.surah_id === surahId && b.ayah_number === ayahNumber)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (e: React.MouseEvent, surahId: number, ayahNumber: number) => {
    e.stopPropagation();
    if (!window.confirm('کیا آپ واقعی یہ نوٹ حذف کرنا چاہتے ہیں؟')) return;
    try {
      await deleteNote(surahId, ayahNumber);
      setNotes(prev => prev.filter(n => !(n.surah_id === surahId && n.ayah_number === ayahNumber)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHighlight = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('کیا آپ واقعی یہ ہائی لائٹ حذف کرنا چاہتے ہیں؟')) return;
    try {
      await deleteHighlight(id);
      setHighlights(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const exportAsJson = () => {
    const exportData = {
      export_version: '1.0',
      exported_at: new Date().toISOString(),
      counts: {
        bookmarks: bookmarks.length,
        notes: notes.length,
        highlights: highlights.length
      },
      bookmarks,
      notes,
      highlights
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quran_study_suite_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsMarkdown = () => {
    let md = `# قرآنی مطالعہ نوٹ بک و محفوظات (Quran Study Suite)\n\n`;
    md += `*تاریخ برآمد:* ${new Date().toLocaleDateString('ur-PK')} (${new Date().toISOString().slice(0, 10)})\n\n`;
    md += `---\n\n`;

    md += `## ۱. محفوظ آیات (Bookmarked Verses - ${bookmarks.length})\n\n`;
    if (bookmarks.length === 0) {
      md += `*کوئی محفوظ آیت نہیں۔*\n\n`;
    } else {
      bookmarks.forEach((b, idx) => {
        md += `### ${idx + 1}. ${b.surah_name_urdu} (آیت ${b.ayah_number}) [${b.verse_key}]\n`;
        md += `> ${b.text_uthmani}\n\n`;
      });
    }

    md += `---\n\n## ۲. ذاتی تحقیقی نوٹس (Study Notes - ${notes.length})\n\n`;
    if (notes.length === 0) {
      md += `*کوئی ذاتی نوٹ محفوظ نہیں۔*\n\n`;
    } else {
      notes.forEach((n, idx) => {
        md += `### ${idx + 1}. سورہ ${n.surah_name_urdu} (آیت ${n.ayah_number}) [${n.verse_key}]\n`;
        md += `${n.note_text}\n\n`;
        if (n.tags) {
          md += `*ٹیگز:* \`${n.tags}\`\n\n`;
        }
      });
    }

    md += `---\n\n## ۳. تفسیری اقتباسات و ہائی لائٹس (Tafsir Highlights - ${highlights.length})\n\n`;
    if (highlights.length === 0) {
      md += `*کوئی ہائی لائٹ محفوظ نہیں۔*\n\n`;
    } else {
      highlights.forEach((h, idx) => {
        md += `### ${idx + 1}. [${h.tafsir_slug}] سورہ ${h.surah_name_urdu || h.surah_id} (آیت ${h.ayah_number}) [${h.verse_key}]\n`;
        md += `> "${h.text}"\n\n`;
        md += `*تاریخ:* ${new Date(h.created_at).toLocaleDateString('ur-PK')}\n\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quran_study_notes_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        dir="rtl"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-ibm"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookmarkIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">مطالعہ نوٹ بک و محفوظ آیات</h3>
              <p className="text-xs text-slate-400">آپ کی پسندیدہ آیات، تفسیری اقتباسات اور ذاتی تحقیقی نوٹس</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 pt-3 gap-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'bookmarks'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <BookmarkIcon className="w-4 h-4" />
            <span>محفوظ آیات ({bookmarks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'notes'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ذاتی نوٹس ({notes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('highlights')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'highlights'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Highlighter className="w-4 h-4" />
            <span>تفسیری ہائی لائٹس ({highlights.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="py-14 text-center text-slate-400">لوڈ ہو رہا ہے...</div>
          ) : activeTab === 'bookmarks' ? (
            bookmarks.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <BookmarkIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p>کوئی آیت محفوظ نہیں کی گئی۔ آیت کے اوپر بک مارک آئیکن پر کلک کریں۔</p>
              </div>
            ) : (
              bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  onClick={() => {
                    onJumpToAyah(bm.surah_id, bm.ayah_number);
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all flex items-start justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                        {bm.surah_name_urdu}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
                        {bm.verse_key}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(bm.created_at).toLocaleDateString('ur-PK')}
                      </span>
                    </div>
                    <p className="font-qcf text-xl sm:text-2xl text-slate-800 dark:text-slate-200 leading-relaxed">
                      {bm.text_uthmani}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleRemoveBookmark(e, bm.surah_id, bm.ayah_number)}
                    className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )
          ) : activeTab === 'notes' ? (
            notes.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p>کوئی نوٹ تحریر نہیں کیا گیا۔ تلاوت کے دوران نوٹ بک کھول کر نوٹس لکھیں۔</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    onJumpToAyah(note.surah_id, note.ayah_number);
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all flex items-start justify-between gap-4 group"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                        {note.surah_name_urdu}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
                        {note.verse_key}
                      </span>
                      {note.tags && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-medium">
                          {note.tags}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(note.updated_at).toLocaleDateString('ur-PK')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {note.note_text}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteNote(e, note.surah_id, note.ayah_number)}
                    className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )
          ) : (
            highlights.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <Highlighter className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p>کوئی تفسیری عبارت ہائی لائٹ نہیں کی گئی۔ تفاسیر میں متن منتخب کر کے رنگ دیں۔</p>
              </div>
            ) : (
              highlights.map((hl) => {
                const style = HIGHLIGHT_STYLES[hl.color] || HIGHLIGHT_STYLES.yellow;
                return (
                  <div
                    key={hl.id}
                    onClick={() => {
                      onJumpToAyah(hl.surah_id, hl.ayah_number);
                      onClose();
                    }}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all flex items-start justify-between gap-4 group"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400">
                          {hl.surah_name_urdu || `سورہ ${hl.surah_id}`}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
                          {hl.verse_key}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${style.badge}`}>
                          {style.label}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(hl.created_at).toLocaleDateString('ur-PK')}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed p-3 rounded-xl border border-slate-100 dark:border-slate-800/70 ${style.mark}`}>
                        "{hl.text}"
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteHighlight(e, hl.id)}
                      className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )
          )}
        </div>

        {/* Footer: Export Action Suite */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-xs text-slate-500 font-medium">
            مجموعہ: {bookmarks.length} محفوظ آیات • {notes.length} نوٹس • {highlights.length} ہائی لائٹس
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportAsMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ایکسپورٹ Markdown</span>
            </button>
            <button
              onClick={exportAsJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 shadow-2xs transition-all"
            >
              <FileJson className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ایکسپورٹ JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
