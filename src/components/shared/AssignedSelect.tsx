import type { ReactNode } from 'react';

interface AssignedSelectProps {
  label?: ReactNode;
  value: string | null;
  users: { id: string; name: string }[];
  onChange: (value: string | null) => void;
}

export default function AssignedSelect({ label, value, users, onChange }: AssignedSelectProps) {
  return (
    <div>
      {label && <label className="text-sm font-medium mb-1 block">{label}</label>}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Ohne Zuweisung</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );
}
