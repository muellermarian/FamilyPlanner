import { useState, useEffect } from 'react';
import AssignedSelect from '../shared/AssignedSelect';

interface TodoAddFormProps {
  currentProfileId: string;
  currentUserId: string;
  users: { id: string; name: string }[];
  onAdd: (
    task: string,
    assignedTo: string | null,
    description: string,
    dueDate: string | null
  ) => void;
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
  const [assignedTo, setAssignedTo] = useState<string | null>(currentProfileId || currentUserId);
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    setAssignedTo(currentProfileId || currentUserId);
  }, [currentProfileId, currentUserId]);

  const handleAdd = () => {
    if (!newTask) return;
    onAdd(newTask, assignedTo, newDescription, newDueDate || null);
    setNewTask('');
    setNewDescription('');
    setAssignedTo(currentProfileId || currentUserId);
    setNewDueDate('');
  };

  return (
    <div className="flex flex-col gap-2 mb-6 border rounded p-3 bg-gray-50">
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Neue Aufgabe / Titel"
        className="border p-2 rounded"
      />

      <textarea
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
        placeholder="Beschreibung (optional)"
        className="border p-2 rounded"
      />

      <div>
        <label className="text-sm font-medium mb-1 block">Fällig am: (optional)</label>
        <div className="flex gap-2">
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          {newDueDate && (
            <button
              type="button"
              onClick={() => setNewDueDate('')}
              className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-sm"
              title="Löschen"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <AssignedSelect
        label="Zugewiesen an: (optional)"
        value={assignedTo}
        users={users}
        onChange={setAssignedTo}
      />

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
