// PersonDetails component displays details for a contact
// Only comments are changed, no user-facing German content is modified
import type { ContactFamily } from '../../lib/types';
import { calculateAge } from '../../lib/contactUtils';

// Props for the PersonDetails component
interface PersonDetailsProps {
  familyName?: string;
  family?: ContactFamily;
  email?: string;
  phone?: string;
  birthdate?: string;
}

type ReadonlyPersonDetailsProps = Readonly<PersonDetailsProps>;

// Main PersonDetails component definition
export default function PersonDetails({
  familyName,
  family,
  email,
  phone,
  birthdate,
}: ReadonlyPersonDetailsProps) {
  // Calculate age if birthdate is provided
  const age = birthdate ? calculateAge(birthdate) : null;

  // Render contact details UI
  return (
    <div className="space-y-2 text-sm">
      {/* Show family name if available */}
      {familyName && (
        <div className="flex gap-2">
          <span className="text-lg">👨‍👩‍👧</span>
          <span>{familyName}</span>
        </div>
      )}
      {/* Show family address if available */}
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
      {/* Show email if available */}
      {email && (
        <div className="flex gap-2">
          <span className="text-lg">✉️</span>
          <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
            {email}
          </a>
        </div>
      )}
      {/* Show phone if available */}
      {phone && (
        <div className="flex gap-2">
          <span className="text-lg">📞</span>
          <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
            {phone}
          </a>
        </div>
      )}
      {/* Show birthdate and age if available */}
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
