// PersonForm component for adding or editing a contact
// Only comments are changed, no user-facing German content is modified
import { useState } from 'react';
import type { Contact, ContactFamily } from '../../lib/types';

// Props for the PersonForm component
interface PersonFormProps {
  contact?: Contact;
  contactFamilies: ContactFamily[];
  preselectedFamilyId?: string | null;
  onSave: (data: {
    firstName: string;
    lastName: string;
    contactFamilyId: string | null;
    birthdate: string | null;
    phone: string;
    phoneLandline: string;
    email: string;
    street: string;
    houseNumber: string;
    zip: string;
    city: string;
    country: string;
  }) => Promise<void>;
  onCancel: () => void;
}

type ReadonlyPersonFormProps = Readonly<PersonFormProps>;

// Main PersonForm component definition
export default function PersonForm({
  contact,
  contactFamilies,
  preselectedFamilyId,
  onSave,
  onCancel,
}: ReadonlyPersonFormProps) {
  // Determine if editing an existing contact
  const isEdit = !!contact;

  // State hooks for all form fields
  const [firstName, setFirstName] = useState(contact?.first_name || '');
  const [lastName, setLastName] = useState(contact?.last_name || '');
  const [contactFamilyId, setContactFamilyId] = useState(
    contact?.contact_family_id || preselectedFamilyId || ''
  );
  const [birthdate, setBirthdate] = useState(contact?.birthdate || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [phoneLandline, setPhoneLandline] = useState(contact?.phone_landline || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [street, setStreet] = useState(contact?.street || '');
  const [houseNumber, setHouseNumber] = useState(contact?.house_number || '');
  const [zip, setZip] = useState(contact?.zip || '');
  const [city, setCity] = useState(contact?.city || '');
  const [country, setCountry] = useState(contact?.country || 'Deutschland');
  const [submitting, setSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setSubmitting(true);
    await onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      contactFamilyId: contactFamilyId || null,
      birthdate: birthdate.trim() || null,
      phone: phone.trim(),
      phoneLandline: phoneLandline.trim(),
      email: email.trim(),
      street: street.trim(),
      houseNumber: houseNumber.trim(),
      zip: zip.trim(),
      city: city.trim(),
      country: country.trim(),
    });
    setSubmitting(false);
  };

  // Render the form UI
  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={onCancel} className="text-2xl">
            ←
          </button>
          <h3 className="text-xl font-bold">
            {isEdit ? 'Person bearbeiten' : 'Neue Person hinzufügen'}
          </h3>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              {/* First name input */}
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">Vorname *</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border rounded px-3 py-2 text-base"
                placeholder="Max"
                required
              />
            </div>
            <div>
              {/* Last name input */}
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">Nachname *</label>
              <input
                id="lastName"
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
            {/* Family select dropdown */}
            <label htmlFor="contactFamilyId" className="block text-sm font-medium mb-1">Familie zuordnen (optional)</label>
            <select
              id="contactFamilyId"
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
            {/* Birthdate input */}
            <label htmlFor="birthdate" className="block text-sm font-medium mb-1">Geburtsdatum (optional)</label>
            <div className="flex gap-2">
              <input
                id="birthdate"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-base"
              />
              {birthdate && (
                <button
                  type="button"
                  onClick={() => setBirthdate('')}
                  className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-sm"
                  title="Löschen"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div>
            {/* Phone input */}
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Telefon (optional)</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded px-3 py-2 text-base"
              placeholder="+49 123 456789"
            />
          </div>

          <div>
            {/* Landline input */}
            <label htmlFor="phoneLandline" className="block text-sm font-medium mb-1">Festnetz (optional)</label>
            <input
              id="phoneLandline"
              type="tel"
              value={phoneLandline}
              onChange={(e) => setPhoneLandline(e.target.value)}
              className="w-full border rounded px-3 py-2 text-base"
              placeholder="+49 123 456789"
            />
          </div>

          <div>
            {/* Email input */}
            <label htmlFor="email" className="block text-sm font-medium mb-1">E-Mail (optional)</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 text-base"
              placeholder="max@example.com"
            />
          </div>

          <div className="border-t pt-3">
            {/* Address section */}
            <h4 className="font-medium mb-3 text-sm text-gray-700">Anschrift (optional)</h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <div className="sm:col-span-2">
                {/* Street input */}
                <label htmlFor="street" className="block text-sm text-gray-600 mb-1">Straße</label>
                <input
                  id="street"
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-base"
                  placeholder="Musterstraße"
                />
              </div>
              <div>
                {/* House number input */}
                <label htmlFor="houseNumber" className="block text-sm text-gray-600 mb-1">Nr.</label>
                <input
                  id="houseNumber"
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
                {/* ZIP code input */}
                <label htmlFor="zip" className="block text-sm text-gray-600 mb-1">PLZ</label>
                <input
                  id="zip"
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-base"
                  placeholder="12345"
                />
              </div>
              <div className="sm:col-span-2">
                {/* City input */}
                <label htmlFor="city" className="block text-sm text-gray-600 mb-1">Ort</label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-base"
                  placeholder="Musterstadt"
                />
              </div>
            </div>

            <div>
                {/* Country input */}
              <label htmlFor="country" className="block text-sm text-gray-600 mb-1">Land</label>
              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border rounded px-3 py-2 text-base"
                placeholder="Deutschland"
              />
            </div>
          </div>
        </div>

        {/* Form action buttons */}
        <div className="flex gap-3 mt-6">
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
            className={`flex-1 text-white px-4 py-2 rounded disabled:opacity-50 text-base font-medium ${
              isEdit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {(() => {
              if (submitting) return 'Speichern...';
              if (isEdit) return 'Speichern';
              return 'Hinzufügen';
            })()}
          </button>
        </div>
      </form>
    </div>
  );
}
