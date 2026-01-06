import { useState } from 'react';

interface NoteAddFormProps {
  onAdd: (title: string, content: string) => Promise<void>;
  onCancel: () => void;
}

export default function NoteAddForm({ onAdd, onCancel }: NoteAddFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

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
      <input
        placeholder="Titel"
        className="border rounded px-2 py-1"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Inhalt"
        className="border rounded px-2 py-1 h-28"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleSubmit}>
          Hinzufügen
        </button>
        <button className="px-3 py-1 bg-gray-100 rounded" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}
