import { useState } from 'react';
import type { Note } from '../../lib/notes';
import SwipeableCard from './SwipeableCard';
import NoteEditForm from './NoteEditForm';

interface NoteItemProps {
  note: Note;
  onDelete: (id: string) => void;
  onUpdate?: (updated: Note) => void;
  users?: { id: string; name: string }[];
}

const getCreatorName = (note: Note, users: { id: string; name: string }[]) => {
  if (note.creator?.name) return note.creator.name;
  const user = users.find((u) => u.id === note.created_by_id);
  return user?.name || note.created_by_id;
};

const formatDate = (dateString: string | null | undefined) => {
  return dateString ? new Date(dateString).toLocaleString() : '—';
};

const truncate = (content: string, max: number = 150) => {
  return content.length > max ? `${content.slice(0, max)}…` : content;
};

export default function NoteItem({ note, onDelete, onUpdate, users = [] }: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (title: string, content: string) => {
    onUpdate?.({ ...note, title, content });
    setIsEditing(false);
  };

  return (
    <SwipeableCard onSwipeDelete={() => onDelete(note.id)}>
      {isEditing ? (
        <NoteEditForm note={note} onSave={handleSave} onCancel={() => setIsEditing(false)} />
      ) : (
        <>
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded hover:bg-gray-100 text-blue-500 font-bold"
              title="Bearbeiten"
            >
              📝
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="p-1 rounded hover:bg-gray-100 text-red-600 font-bold"
              title="Löschen"
            >
              X
            </button>
          </div>

          <div className="pr-12">
            <div className="font-semibold text-lg">{note.title}</div>
            <div className="text-sm text-gray-600 mt-1">{truncate(note.content)}</div>
          </div>

          <div className="text-xs text-gray-400 mt-3">
            * {getCreatorName(note, users)}, {formatDate(note.created_at)}
          </div>
        </>
      )}
    </SwipeableCard>
  );
}
