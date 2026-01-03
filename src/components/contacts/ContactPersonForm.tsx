import { useState } from 'react';

interface ContactPersonFormProps {
  contactFamilyId?: string | null;
  onAdd: (
    firstName: string,
    lastName: string,
    birthdate: string | null,
    phone: string,
    phoneLandline: string,
    email: string,
    street: string,
    houseNumber: string,
    zip: string,
    city: string,
    country: string
  ) => Promise<void>;
  onCancel: () => void;
}

export default function ContactPersonForm({ onAdd, onCancel }: ContactPersonFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneLandline, setPhoneLandline] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Deutschland');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setSubmitting(true);
    try {
      await onAdd(
        firstName.trim(),
        lastName.trim(),
        birthdate.trim() || null,
        phone.trim(),
        phoneLandline.trim(),
        email.trim(),
        street.trim(),
        houseNumber.trim(),
        zip.trim(),
        city.trim(),
        country.trim()
      );
      setFirstName('');
      setLastName('');
      setBirthdate('');
      setPhone('');
      setPhoneLandline('');
      setEmail('');
      setStreet('');
      setHouseNumber('');
      setZip('');
      setCity('');
      setCountry('Deutschland');
    } catch (err) {
      // Silent fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-h-[90vh] overflow-y-auto sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="sticky top-0 bg-white p-3 sm:p-4 border-b">
            <h3 className="text-lg font-bold">Neue Person hinzufügen</h3>
          </div>

          <div className="p-3 sm:p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Vorname *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-base"
                  placeholder="Max"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nachname *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-base"
                  placeholder="Mustermann"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Geburtsdatum (optional)</label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full border rounded px-3 py-2 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefon (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded px-3 py-2 text-base"
                placeholder="+49 123 456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Festnetz (optional)</label>
              <input
                type="tel"
                value={phoneLandline}
                onChange={(e) => setPhoneLandline(e.target.value)}
                className="w-full border rounded px-3 py-2 text-base"
                placeholder="+49 123 456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">E-Mail (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 text-base"
                placeholder="max@example.com"
              />
            </div>

            <div className="border-t pt-3">
              <h4 className="font-medium mb-3 text-sm text-gray-700">Anschrift (optional)</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Straße</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-base"
                    placeholder="Musterstraße"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nr.</label>
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-base"
                    placeholder="12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">PLZ</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-base"
                    placeholder="12345"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Ort</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-base"
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
                  className="w-full border rounded px-3 py-2 text-base"
                  placeholder="Deutschland"
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white p-3 sm:p-4 border-t flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-100 text-base font-medium"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting || !firstName.trim() || !lastName.trim()}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-base font-medium"
            >
              {submitting ? 'Speichern...' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
