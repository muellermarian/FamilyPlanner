import { useState } from 'react';

interface ContactFamilyFormProps {
  onAdd: (
    familyName: string,
    street: string,
    houseNumber: string,
    zip: string,
    city: string,
    country: string
  ) => Promise<void>;
  onCancel: () => void;
}

export default function ContactFamilyForm({ onAdd, onCancel }: ContactFamilyFormProps) {
  const [familyName, setFamilyName] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Deutschland');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    setSubmitting(true);
    try {
      await onAdd(
        familyName.trim(),
        street.trim(),
        houseNumber.trim(),
        zip.trim(),
        city.trim(),
        country.trim()
      );
      setFamilyName('');
      setStreet('');
      setHouseNumber('');
      setZip('');
      setCity('');
      setCountry('');
    } catch (err) {
      // Silent fail on family form submit
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h3 className="text-lg font-bold">Neue Familie hinzufügen</h3>
          </div>

          <div className="overflow-y-auto flex-1 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Familienname *</label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="z.B. Familie Müller"
                required
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Anschrift</h4>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Straße</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Musterstraße"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nr.</label>
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">PLZ</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="12345"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Ort</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Musterstadt"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Land</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Deutschland"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting || !familyName.trim()}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Speichern...' : 'Familie hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
