import { useState } from 'react';
import type { Note } from '../../lib/notes';

interface NoteEditFormProps {
  readonly note: Note;
  readonly onSave: (title: string, content: string) => void;
  readonly onCancel: () => void;
}

export default function NoteEditForm({ note, onSave, onCancel }: NoteEditFormProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Bitte gib einen Titel ein');
      return;
    }
    onSave(title, content);
  };

  const handleCancel = () => {
    setTitle(note.title);
    setContent(note.content);
    onCancel();
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        className="border rounded px-2 py-1"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titel"
      />
      <textarea
        className="border rounded px-2 py-1 h-28"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Inhalt"
      />
      <div className="flex gap-2 justify-end">
        <button
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          onClick={handleSave}
        >
          Speichern
        </button>
        <button
          className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
          onClick={handleCancel}
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}
