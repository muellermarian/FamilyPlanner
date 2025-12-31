import { useState, useEffect } from 'react';

interface TodoAddFormProps {
  currentProfileId: string;
  currentUserId: string;
  users: { id: string; name: string }[];
  onAdd: (task: string, assignedTo: string | null, comment: string, dueDate: string | null) => void;
  onCancel: () => void;
}

export default function TodoAddForm({
  currentProfileId,
  currentUserId,
  users,
  onAdd,
  onCancel,
}: TodoAddFormProps) {
  const [newTask, setNewTask] = useState('');
  const [assignedTo, setAssignedTo] = useState(currentProfileId || currentUserId);
  const [newComment, setNewComment] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    setAssignedTo(currentProfileId || currentUserId);
  }, [currentProfileId, currentUserId]);

  const handleAdd = () => {
    if (!newTask) return;
    onAdd(newTask, assignedTo || null, newComment, newDueDate || null);
    setNewTask('');
    setNewComment('');
    setAssignedTo(currentProfileId || currentUserId);
    setNewDueDate('');
  };

  return (
    <div className="flex flex-col gap-2 mb-6 border rounded p-3 bg-gray-50">
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Neue Aufgabe"
        className="border p-2 rounded"
      />
      <input
        type="date"
        value={newDueDate}
        onChange={(e) => setNewDueDate(e.target.value)}
        className="border p-2 rounded"
      />
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Kommentar"
        className="border p-2 rounded"
      />
      <select
        value={assignedTo || ''}
        onChange={(e) => setAssignedTo(e.target.value || currentProfileId || currentUserId)}
        className="border p-2 rounded"
      >
        <option value="">Ohne Zuweisung</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Hinzufügen
        </button>
        <button onClick={onCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400">
          Abbrechen
        </button>
      </div>
    </div>
  );
}
