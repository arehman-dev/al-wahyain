import React, { useState, useEffect } from 'react';
import { Bookmark as BookmarkIcon, FileText, Trash2, ExternalLink, X, BookOpen, Clock, Highlighter } from 'lucide-react';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        dir="rtl"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[82vh] flex flex-col shadow-2xl overflow-hidden font-ibm"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookmarkIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">مطالعہ نوٹ بک و محفوظ آیات</h3>
              <p className="text-xs text-slate-400">آپ کی پسندیدہ آیات اور ذاتی تحقیقی نوٹس</p>
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
            <div className="py-16 text-center text-slate-400 text-xs">معلومات لوڈ کی جا رہی ہیں...</div>
          ) : activeTab === 'bookmarks' ? (
            bookmarks.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <BookmarkIcon className="w-8 h-8 mx-auto text-amber-400/40" />
                <p className="text-sm">ابھی تک کوئی آیت محفوظ نہیں کی گئی</p>
                <p className="text-xs text-slate-500">تفسیر یا مصحف کے دوران ستارے کے آئیکن پر کلک کر کے آیات محفوظ کریں</p>
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
                      <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400">
                        {bm.surah_name_urdu}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
                        {bm.verse_key}
                      </span>
                    </div>
                    <p className="font-arabic text-lg text-slate-900 dark:text-slate-100 leading-relaxed">
                      {bm.text_uthmani}
                    </p>
                    {bm.translation_text && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {bm.translation_text}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleRemoveBookmark(e, bm.surah_id, bm.ayah_number)}
                    title="محفوظ فہرست سے ہٹائیں"
                    className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )
          ) : activeTab === 'notes' ? (
            notes.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-emerald-500/40" />
                <p className="text-sm">ابھی تک کوئی ذاتی نوٹ شامل نہیں کیا گیا</p>
                <p className="text-xs text-slate-500">آیت کے ساتھ "نوٹ لکھیں" بٹن سے اپنے فہم و نکات محفوظ کریں</p>
              </div>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    onJumpToAyah(n.surah_id, n.ayah_number);
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all flex items-start justify-between gap-4 group"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400">
                        {n.surah_name_urdu}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
                        {n.verse_key}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.updated_at).toLocaleDateString('ur-PK')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/70">
                      {n.note_text}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteNote(e, n.surah_id, n.ayah_number)}
                    title="نوٹ حذف کریں"
                    className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )
          ) : (
            highlights.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Highlighter className="w-8 h-8 mx-auto text-purple-500/40" />
                <p className="text-sm">ابھی تک کوئی تفسیری اقتباس ہائی لائٹ نہیں کیا گیا</p>
                <p className="text-xs text-slate-500">تفسیر کے دوران کسی بھی عبارت کو منتخب کر کے ہائی لائٹ مارکر کا استعمال کریں</p>
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
                      title="ہائی لائٹ حذف کریں"
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
      </div>
    </div>
  );
};
