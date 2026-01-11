// Import type definitions for Contact and ContactFamily
import type { Contact } from '../../lib/types';
// Import utility function to calculate age from birthdate
import { calculateAge } from '../../lib/contactUtils';

// Props for the ContactItem component
interface ContactItemProps {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
}

type ReadonlyContactItemProps = Readonly<ContactItemProps>;

export default function ContactItem({ contact, onEdit, onDelete }: ReadonlyContactItemProps) {
  const age = contact.birthdate ? calculateAge(contact.birthdate) : null;

  // Render the contact item UI
  return (
    <div className="flex justify-between items-start p-4 border rounded hover:bg-gray-50">
      <div>
        {/* Display contact name */}
        <div className="font-medium text-lg">
          {contact.last_name}, {contact.first_name}
        </div>
        {/* Display birthdate and age if available */}
        {contact.birthdate && (
          <div className="text-sm text-gray-600">
            🎈 {new Date(contact.birthdate).toLocaleDateString('de-DE')}
            {age !== null && <span className="text-gray-500"> ({age})</span>}
          </div>
        )}
        {/* Display email if available */}
        {contact.email && <div className="text-sm text-gray-600">✉️ {contact.email}</div>}
        {/* Display mobile phone if available */}
        {contact.phone && <div className="text-sm text-gray-600">📞 {contact.phone}</div>}
        {/* Display landline phone if available */}
        {contact.phone_landline && (
          <div className="text-sm text-gray-600">☎️ {contact.phone_landline}</div>
        )}
        {/* Display address if any address field is available */}
        {(contact.street || contact.house_number || contact.zip || contact.city) && (
          <div className="text-sm text-gray-600">
            🏠 {contact.street} {contact.house_number}, {contact.zip} {contact.city}
          </div>
        )}
      </div>
      <div className="flex gap-1">
        {/* Edit button */}
        <button onClick={onEdit} className="text-blue-500 font-bold ml-3">
          📝
        </button>
        {/* Delete button */}
        <button onClick={onDelete} className="text-red-500 font-bold ml-3">
          X
        </button>
      </div>
    </div>
  );
}
