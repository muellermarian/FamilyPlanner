import type { ContactFamily } from '../../lib/types';
import { calculateAge } from '../../lib/contactUtils';

interface PersonDetailsProps {
  familyName?: string;
  family?: ContactFamily;
  email?: string;
  phone?: string;
  birthdate?: string;
}

export default function PersonDetails({
  familyName,
  family,
  email,
  phone,
  birthdate,
}: PersonDetailsProps) {
  const age = birthdate ? calculateAge(birthdate) : null;

  return (
    <div className="space-y-2 text-sm">
      {familyName && (
        <div className="flex gap-2">
          <span className="text-lg">👨‍👩‍👧</span>
          <span>{familyName}</span>
        </div>
      )}
      {family && (family.street || family.house_number || family.zip || family.city) && (
        <div className="flex gap-2">
          <span className="text-lg">🏠</span>
          <div>
            <div>
              {family.street} {family.house_number}
            </div>
            <div>
              {family.zip} {family.city}
            </div>
            {family.country && <div>{family.country}</div>}
          </div>
        </div>
      )}
      {email && (
        <div className="flex gap-2">
          <span className="text-lg">✉️</span>
          <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
            {email}
          </a>
        </div>
      )}
      {phone && (
        <div className="flex gap-2">
          <span className="text-lg">📞</span>
          <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
            {phone}
          </a>
        </div>
      )}
      {birthdate && (
        <div className="flex gap-2">
          <span className="text-lg">🎈</span>
          <span>
            {new Date(birthdate).toLocaleDateString('de-DE')}
            {age !== null && <span className="text-gray-500"> ({age})</span>}
          </span>
        </div>
      )}
    </div>
  );
}
