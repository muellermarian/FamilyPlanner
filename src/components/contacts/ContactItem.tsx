import type { Contact, ContactFamily } from '../../lib/types';

interface ContactItemProps {
  contact: Contact;
  contactFamilies: ContactFamily[];
  onEdit: () => void;
  onDelete: () => void;
}

export default function ContactItem({
  contact,
  contactFamilies,
  onEdit,
  onDelete,
}: ContactItemProps) {
  const familyName = contact.contact_family_id
    ? contactFamilies.find((f) => f.id === contact.contact_family_id)?.family_name
    : null;

  return (
    <div className="flex justify-between items-start p-4 border rounded hover:bg-gray-50">
      <div>
        <div className="font-medium text-lg">
          {contact.last_name}, {contact.first_name}
        </div>
        {familyName && <div className="text-sm text-gray-500 italic">Familie: {familyName}</div>}
        {contact.birthdate && (
          <div className="text-sm text-gray-600">
            🎂 {new Date(contact.birthdate).toLocaleDateString('de-DE')}
          </div>
        )}
        {contact.phone && <div className="text-sm text-gray-600">📞 {contact.phone}</div>}
        {contact.email && <div className="text-sm text-gray-600">✉️ {contact.email}</div>}
      </div>
      <div className="flex gap-1">
        <button onClick={onDelete} className="text-red-500 font-bold ml-3">
          X
        </button>
        <button onClick={onEdit} className="text-blue-500 font-bold ml-3">
          📝
        </button>
      </div>
    </div>
  );
}
