import { useState } from 'react';
import type { Note } from '../../lib/notes';
import SwipeableCard from './SwipeableCard';
import NoteEditForm from './NoteEditForm';

// NoteItem component: displays a single note with edit and delete options.
// Props:
// - note: the note object to display
// - onDelete: callback to delete the note
// - onUpdate: optional callback to update the note
// - users: optional list of users for displaying creator name
interface NoteItemProps {
  readonly note: Note;
  readonly onDelete: (id: string) => void;
  readonly onUpdate?: (updated: Note) => void;
  readonly users?: { id: string; name: string }[];
}

// Helper to get the creator's name from users list or note object
const getCreatorName = (note: Note, users: { id: string; name: string }[]) => {
  if (note.creator?.name) return note.creator.name;
  const user = users.find((u) => u.id === note.created_by_id);
  return user?.name || note.created_by_id;
};

// Helper to format date string for display
const formatDate = (dateString: string | null | undefined) => {
  return dateString ? new Date(dateString).toLocaleString() : '—';
};

// Helper to truncate note content for preview
const truncate = (content: string, max: number = 150) => {
  return content.length > max ? `${content.slice(0, max)}…` : content;
};

// Main component function
export default function NoteItem({ note, onDelete, onUpdate, users = [] }: NoteItemProps) {
  // State to control edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Handler for saving note edits
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
          {/* Edit and delete buttons */}
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

          {/* Note title and content preview */}
          <div className="pr-12">
            <div className="font-semibold text-lg">{note.title}</div>
            <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
              {truncate(note.content)}
            </div>
          </div>

          {/* Creator and date info */}
          <div className="text-xs text-gray-400 mt-3">
            * {getCreatorName(note, users)}, {formatDate(note.created_at)}
          </div>
        </>
      )}
    </SwipeableCard>
  );
}
