import { useState } from 'react';
import type { Contact, ContactFamily } from '../../lib/types';

interface ContactPersonEditFormProps {
  contact: Contact;
  contactFamilies: ContactFamily[];
  onUpdate: (
    firstName: string,
    lastName: string,
    contactFamilyId: string | null,
    birthdate: string | null,
    phone: string,
    email: string,
    street: string,
    houseNumber: string,
    zip: string,
    city: string,
    country: string
  ) => Promise<void>;
  onCancel: () => void;
}

export default function ContactPersonEditForm({
  contact,
  contactFamilies,
  onUpdate,
  onCancel,
}: ContactPersonEditFormProps) {
  const [firstName, setFirstName] = useState(contact.first_name);
  const [lastName, setLastName] = useState(contact.last_name);
  const [contactFamilyId, setContactFamilyId] = useState(contact.contact_family_id || '');
  const [birthdate, setBirthdate] = useState(contact.birthdate || '');
  const [phone, setPhone] = useState(contact.phone || '');
  const [email, setEmail] = useState(contact.email || '');
  const [street, setStreet] = useState(contact.street || '');
  const [houseNumber, setHouseNumber] = useState(contact.house_number || '');
  const [zip, setZip] = useState(contact.zip || '');
  const [city, setCity] = useState(contact.city || '');
  const [country, setCountry] = useState(contact.country || 'Deutschland');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setSubmitting(true);
    try {
      await onUpdate(
        firstName.trim(),
        lastName.trim(),
        contactFamilyId || null,
        birthdate.trim() || null,
        phone.trim(),
        email.trim(),
        street.trim(),
        houseNumber.trim(),
        zip.trim(),
        city.trim(),
        country.trim()
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-h-[90vh] overflow-y-auto sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="sticky top-0 bg-white p-3 sm:p-4 border-b">
            <h3 className="text-lg font-bold">Person bearbeiten</h3>
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
              <label className="block text-sm font-medium mb-1">Familie zuordnen (optional)</label>
              <select
                value={contactFamilyId}
                onChange={(e) => setContactFamilyId(e.target.value)}
                className="w-full border rounded px-3 py-2 text-base"
              >
                <option value="">Keine Familie (Einzelperson)</option>
                {contactFamilies.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.family_name}
                  </option>
                ))}
              </select>
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
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-base font-medium"
            >
              {submitting ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
