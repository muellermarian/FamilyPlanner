import { useState } from 'react';
import { QUANTITY_UNITS } from '../../lib/constants';

interface ShoppingAddFormProps {
  onAdd: (name: string, quantity: string, unit: string) => Promise<void>;
  onCancel: () => void;
}

export default function ShoppingAddForm({ onAdd, onCancel }: ShoppingAddFormProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Packung');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onAdd(name.trim(), quantity.trim() || '1', unit);
      setName('');
      setQuantity('');
      setUnit('Packung');
    } catch (err) {
      // Silent fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 border rounded">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Artikel</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="z.B. Milch"
          autoFocus
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium mb-1">Menge</label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Einheit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            {QUANTITY_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? 'Hinzufügen...' : 'Hinzufügen'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
