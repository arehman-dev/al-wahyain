import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, FileText, Check } from 'lucide-react';
import { Ayah } from '../types/quran';
import { fetchNotes, saveNote, deleteNote } from '../services/api';

interface NoteEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ayah: Ayah | null;
  onNoteSaved?: () => void;
}

export const NoteEditorDrawer: React.FC<NoteEditorDrawerProps> = ({
  isOpen,
  onClose,
  ayah,
  onNoteSaved
}) => {
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!ayah || !isOpen) return;
    setSavedSuccess(false);
    fetchNotes()
      .then(notes => {
        const found = notes.find(n => n.surah_id === ayah.surah_id && n.ayah_number === ayah.ayah_number);
        setNoteText(found ? found.note_text : '');
      })
      .catch(console.error);
  }, [ayah, isOpen]);

  if (!isOpen || !ayah) return null;

  const handleSave = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await saveNote(ayah.surah_id, ayah.ayah_number, ayah.verse_key, noteText.trim());
      setSaving(false);
      setSavedSuccess(true);
      if (onNoteSaved) onNoteSaved();
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('کیا آپ واقعی یہ نوٹ حذف کرنا چاہتے ہیں؟')) return;
    setSaving(true);
    try {
      await deleteNote(ayah.surah_id, ayah.ayah_number);
      setNoteText('');
      setSaving(false);
      if (onNoteSaved) onNoteSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div 
        dir="rtl"
        className="w-full max-w-md bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl font-ibm"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">ذاتی مطالعہ نوٹ</h3>
              <p className="text-xs text-slate-400 font-mono">آیت مبارکہ: {ayah.verse_key}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ayah Snippet */}
        <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 space-y-1">
          <p className="font-arabic text-base text-slate-900 dark:text-slate-100 leading-relaxed text-right">
            {ayah.text_uthmani}
          </p>
        </div>

        {/* Text Area */}
        <div className="flex-1 p-5 flex flex-col space-y-3">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
            آپ کے تاثرات، تفسیری نکات یا حوالہ جات درج کریں:
          </label>
          <textarea
            autoFocus
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="اس آیت سے حاصل ہونے والا سبق، احادیث کے حوالہ جات یا فقہی فوائد..."
            className="flex-1 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-800 dark:text-slate-100 leading-relaxed focus:outline-none focus:border-emerald-500 resize-none font-ibm"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/30 dark:bg-slate-950/30">
          {noteText && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف کریں</span>
            </button>
          )}

          <div className="flex items-center gap-2 mr-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              منسوخ
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !noteText.trim()}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>محفوظ ہو گیا!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'محفوظ ہو رہا ہے...' : 'محفوظ کریں'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
