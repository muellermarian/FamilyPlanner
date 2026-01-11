import { useState } from 'react';

// NoteAddForm component: form for adding a new note.
// Props:
// - onAdd: callback to add a note (async)
// - onCancel: callback to cancel adding

interface NoteAddFormProps {
  readonly onAdd: (title: string, content: string) => Promise<void>;
  readonly onCancel: () => void;
}

export default function NoteAddForm({ onAdd, onCancel }: NoteAddFormProps) {
  // State for note title
  const [title, setTitle] = useState('');
  // State for note content
  const [content, setContent] = useState('');

  // Handles form submission: validates, calls onAdd, resets fields
  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Bitte gib einen Titel ein');
      return;
    }
    await onAdd(title.trim(), content.trim());
    setTitle('');
    setContent('');
  };

  return (
    <div className="mb-4 flex flex-col gap-2">
      {/* Input for note title */}
      <input
        placeholder="Titel"
        className="border rounded px-2 py-1"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {/* Textarea for note content */}
      <textarea
        placeholder="Inhalt"
        className="border rounded px-2 py-1 h-28"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        {/* Add note button */}
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleSubmit}>
          Hinzufügen
        </button>
        {/* Cancel button */}
        <button className="px-3 py-1 bg-gray-100 rounded" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}
