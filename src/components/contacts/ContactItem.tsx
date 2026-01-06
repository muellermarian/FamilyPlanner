import type { Contact, ContactFamily } from '../../lib/types';

interface ContactItemProps {
  contact: Contact;
  contactFamilies: ContactFamily[];
  onEdit: () => void;
  onDelete: () => void;
}

export default function ContactItem({ contact, onEdit, onDelete }: ContactItemProps) {
  const calculateAge = (birthdate: string): number => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = contact.birthdate ? calculateAge(contact.birthdate) : null;

  return (
    <div className="flex justify-between items-start p-4 border rounded hover:bg-gray-50">
      <div>
        <div className="font-medium text-lg">
          {contact.last_name}, {contact.first_name}
          {age !== null && <span className="text-gray-500 font-normal"> ({age})</span>}
        </div>
        {contact.birthdate && (
          <div className="text-sm text-gray-600">
            🎈 {new Date(contact.birthdate).toLocaleDateString('de-DE')}
          </div>
        )}
        {contact.email && <div className="text-sm text-gray-600">✉️ {contact.email}</div>}
        {contact.phone && <div className="text-sm text-gray-600">📞 {contact.phone}</div>}
        {contact.phone_landline && (
          <div className="text-sm text-gray-600">☎️ {contact.phone_landline}</div>
        )}
        {(contact.street || contact.house_number || contact.zip || contact.city) && (
          <div className="text-sm text-gray-600">
            🏠 {contact.street} {contact.house_number}, {contact.zip} {contact.city}
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <button onClick={onEdit} className="text-blue-500 font-bold ml-3">
          📝
        </button>
        <button onClick={onDelete} className="text-red-500 font-bold ml-3">
          X
        </button>
      </div>
    </div>
  );
}
