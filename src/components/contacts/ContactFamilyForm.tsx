import { useState } from 'react';
import type { ContactFamily } from '../../lib/types';

// Props for the ContactFamilyForm component
interface ContactFamilyFormProps {
  family?: ContactFamily | null; // Existing family data for editing
  onAdd?: (
    familyName: string,
    street: string,
    houseNumber: string,
    zip: string,
    city: string,
    country: string
  ) => Promise<void>; // Callback for adding a new family
  onUpdate?: (
    contactFamilyId: string,
    familyName: string,
    street: string,
    houseNumber: string,
    zip: string,
    city: string,
    country: string
  ) => Promise<void>; // Callback for updating an existing family
  onCancel: () => void; // Callback for cancel action
}

type ReadonlyContactFamilyFormProps = Readonly<ContactFamilyFormProps>;

export default function ContactFamilyForm({
  family,
  onAdd,
  onUpdate,
  onCancel,
}: ReadonlyContactFamilyFormProps) {
  // State for each form field and submission status
  const [familyName, setFamilyName] = useState(family?.family_name || '');
  const [street, setStreet] = useState(family?.street || '');
  const [houseNumber, setHouseNumber] = useState(family?.house_number || '');
  const [zip, setZip] = useState(family?.zip || '');
  const [city, setCity] = useState(family?.city || '');
  const [country, setCountry] = useState(family?.country || 'Deutschland');
  const [submitting, setSubmitting] = useState(false);

  // Handle form submission for add or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    setSubmitting(true);
    try {
      if (family && onUpdate) {
        // Update existing family
        await onUpdate(
          family.id,
          familyName.trim(),
          street.trim(),
          houseNumber.trim(),
          zip.trim(),
          city.trim(),
          country.trim()
        );
      } else if (onAdd) {
        // Add new family
        await onAdd(
          familyName.trim(),
          street.trim(),
          houseNumber.trim(),
          zip.trim(),
          city.trim(),
          country.trim()
        );
        // Reset form fields after adding
        setFamilyName('');
        setStreet('');
        setHouseNumber('');
        setZip('');
        setCity('');
        setCountry('');
      }
    } catch (err) {
      console.error('Error submitting family form:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Render the family form UI
  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header with back button and form title */}
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={onCancel} className="text-2xl">
            ←
          </button>
          <h3 className="text-xl font-bold">{family ? 'Edit family' : 'Add new family'}</h3>
        </div>
        {/* Family name input */}
        <div>
          <label htmlFor="familyName" className="block text-sm font-medium mb-1">
            Family name *
          </label>
          <input
            id="familyName"
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. Family Müller"
            required
          />
        </div>

        {/* Address section */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Address</h4>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="col-span-2">
              <label htmlFor="street" className="block text-sm text-gray-600 mb-1">
                Street
              </label>
              <input
                id="street"
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Sample Street"
              />
            </div>
            <div>
              <label htmlFor="houseNumber" className="block text-sm text-gray-600 mb-1">
                No.
              </label>
              <input
                id="houseNumber"
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
              <label htmlFor="zip" className="block text-sm text-gray-600 mb-1">
                ZIP
              </label>
              <input
                id="zip"
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="12345"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="city" className="block text-sm text-gray-600 mb-1">
                City
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Sample City"
              />
            </div>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm text-gray-600 mb-1">
              Country
            </label>
            <input
              id="country"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Germany"
            />
          </div>
        </div>

        {/* Action buttons for cancel and submit */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !familyName.trim()}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {/* Extracted nested ternary for SonarQube compliance */}
            {(() => {
              if (submitting) return 'Saving...';
              if (family) return 'Save';
              return 'Add family';
            })()}
          </button>
        </div>
      </form>
    </div>
  );
}
