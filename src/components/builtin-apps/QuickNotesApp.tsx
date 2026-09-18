import React, { useState, useEffect, useCallback } from 'react';
import { useAndroidSystem } from '../../runtime/AndroidSystemContext';
import { Plus, Search, Trash2, Pin, Tag, Check, Sparkles } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'Personal' | 'Work' | 'Ideas' | 'Urgent';
  pinned: boolean;
  date: string;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Personal: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  Work: 'bg-blue-50 border-blue-200 text-blue-800',
  Ideas: 'bg-amber-50 border-amber-200 text-amber-800',
  Urgent: 'bg-rose-50 border-rose-200 text-rose-800',
};

export function QuickNotesApp() {
  const { vibrateDevice, showToast, addLog } = useAndroidSystem();

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('android_notes_db');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'n1',
        title: 'Android APK Runner Checklist',
        content: 'Support AXML decoding, DEX inspection, permissions risk breakdown, live logcat, and touch gestures.',
        category: 'Work',
        pinned: true,
        date: 'Today, 09:15',
        color: '#E8F0FE',
      },
      {
        id: 'n2',
        title: 'Grocery List',
        content: 'Oat milk, avocados, whole grain sourdough, cold brew coffee, blueberries.',
        category: 'Personal',
        pinned: false,
        date: 'Yesterday',
        color: '#E6F4EA',
      },
      {
        id: 'n3',
        title: 'App Idea: WebAssembly Dalvik',
        content: 'Look into direct bytecode JIT translation using WebAssembly for zero-overhead execution.',
        category: 'Ideas',
        pinned: false,
        date: 'Sep 12',
        color: '#FEF7E0',
      },
    ];
  });

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isEditing, setIsEditing] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  useEffect(() => {
    localStorage.setItem('android_notes_db', JSON.stringify(notes));
  }, [notes]);

  const handleCreateNew = useCallback(() => {
    vibrateDevice(15);
    const newNote: Note = {
      id: `note_${Date.now()}`,
      title: '',
      content: '',
      category: 'Personal',
      pinned: false,
      date: 'Just now',
      color: '#ffffff',
    };
    setActiveNote(newNote);
    setIsEditing(true);
  }, [vibrateDevice]);

  const handleSaveNote = useCallback(() => {
    if (!activeNote) return;
    if (!activeNote.title.trim() && !activeNote.content.trim()) {
      setIsEditing(false);
      setActiveNote(null);
      return;
    }

    vibrateDevice(20);
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === activeNote.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = activeNote;
        return copy;
      }
      return [activeNote, ...prev];
    });

    setIsEditing(false);
    setActiveNote(null);
    showToast('Note saved');
    addLog('D', 'NotesActivity', 'SQLite note record updated');
  }, [activeNote, vibrateDevice, showToast, addLog]);

  const handleDelete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    vibrateDevice(25);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    showToast('Note deleted');
    addLog('D', 'NotesActivity', `Deleted note ${id}`);
  }, [vibrateDevice, showToast, addLog]);

  const handleTogglePin = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    vibrateDevice(15);
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  }, [vibrateDevice]);

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div id="quick_notes_app" className="w-full h-full flex flex-col bg-[#f8f9fa] text-slate-800 select-none">
      {/* Top Header */}
      <div className="p-3 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Notes</h2>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-semibold shadow transition"
          >
            <Plus size={14} />
            <span>New Note</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search your notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-none text-[11px]">
          {['All', 'Personal', 'Work', 'Ideas', 'Urgent'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-0.5 rounded-full whitespace-nowrap font-medium transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Screen Overlay */}
      {isEditing && activeNote ? (
        <div className="flex-1 flex flex-col p-4 bg-white animate-fade-in">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <select
              value={activeNote.category}
              onChange={(e) =>
                setActiveNote({ ...activeNote, category: e.target.value as any })
              }
              className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
            >
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Ideas">Ideas</option>
              <option value="Urgent">Urgent</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-500 px-2 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="flex items-center gap-1 bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow"
              >
                <Check size={13} />
                <span>Done</span>
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Title"
            value={activeNote.title}
            onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
            className="text-base font-bold text-slate-900 placeholder:text-slate-400 mb-2 focus:outline-none"
          />

          <textarea
            placeholder="Type your note here..."
            value={activeNote.content}
            onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })}
            className="flex-1 w-full text-xs text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none leading-relaxed"
          />
        </div>
      ) : (
        /* Notes List */
        <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2.5">
          {filteredNotes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Tag size={28} className="mb-2 opacity-50" />
              <p className="text-xs font-medium">No notes found</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  setActiveNote(note);
                  setIsEditing(true);
                }}
                className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400/70 transition cursor-pointer flex flex-col gap-1.5 group"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-xs text-slate-800 leading-snug line-clamp-1">
                    {note.title || 'Untitled Note'}
                  </h4>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleTogglePin(note.id, e)}
                      className={`p-1 rounded ${
                        note.pinned ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                      }`}
                    >
                      <Pin size={12} className={note.pinned ? 'fill-amber-500' : ''} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(note.id, e)}
                      className="p-1 rounded text-slate-300 hover:text-rose-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {note.content}
                </p>

                <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100 text-[10px]">
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold ${
                      CATEGORY_COLORS[note.category] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {note.category}
                  </span>
                  <span className="text-slate-400">{note.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
