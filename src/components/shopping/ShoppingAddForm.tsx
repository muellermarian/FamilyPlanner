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

type ReadonlyShoppingAddFormProps = Readonly<ShoppingAddFormProps>;

export default function ShoppingAddForm({ onAdd, onCancel }: ReadonlyShoppingAddFormProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Packung');
  const [store, setStore] = useState('');
  const [dealDate, setDealDate] = useState('');
  // Props for the ShoppingAddForm component: expects handlers for adding and cancelling
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      // State for item name
      await onAdd(name.trim(), quantity.trim() || '1', unit, store || null, dealDate || null);
      setName('');
      setQuantity('');
      setUnit('Packung');
      setStore('');
      setDealDate('');
    } catch (err) {
      // Log error to console for debugging
      console.error('Error adding shopping item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 border rounded">
      <div className="mb-3">
        <label htmlFor="shopping-item-name" className="block text-sm font-medium mb-1">
          Artikel
        </label>
        <input
          id="shopping-item-name"
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
          <label htmlFor="shopping-item-quantity" className="block text-sm font-medium mb-1">
            Menge
          </label>
          <input
            id="shopping-item-quantity"
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="1"
          />
        </div>
        <div>
          <label htmlFor="shopping-item-unit" className="block text-sm font-medium mb-1">
            Einheit
          </label>
          <select
            id="shopping-item-unit"
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
          <label htmlFor="shopping-item-store" className="block text-sm font-medium mb-1">
            Geschäft <span className="text-gray-400">(optional)</span>
          </label>
          <select
            id="shopping-item-store"
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
          <label htmlFor="shopping-item-date" className="block text-sm font-medium mb-1">
            Datum <span className="text-gray-400">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              id="shopping-item-date"
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
