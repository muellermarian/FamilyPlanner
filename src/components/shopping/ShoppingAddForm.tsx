import { useState } from 'react';
import { QUANTITY_UNITS, STORES } from '../../lib/constants';

interface ShoppingAddFormProps {
  onAdd: (
    name: string,
    quantity: string,
    unit: string,
    store?: string | null,
    dealDate?: string | null
  ) => Promise<void>;
  onCancel: () => void;
}

export default function ShoppingAddForm({ onAdd, onCancel }: ShoppingAddFormProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Packung');
  const [store, setStore] = useState('');
  const [dealDate, setDealDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onAdd(name.trim(), quantity.trim() || '1', unit, store || null, dealDate || null);
      setName('');
      setQuantity('');
      setUnit('Packung');
      setStore('');
      setDealDate('');
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
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Geschäft <span className="text-gray-400">(optional)</span>
          </label>
          <select
            value={store}
            onChange={(e) => setStore(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-</option>
            {STORES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Datum <span className="text-gray-400">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dealDate}
              onChange={(e) => setDealDate(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
            />
            {dealDate && (
              <button
                type="button"
                onClick={() => setDealDate('')}
                className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-sm"
                title="Löschen"
              >
                ✕
              </button>
            )}
          </div>
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
