import { useMemo, useState } from 'react';
import type { ContactFamily, Contact } from '../../lib/types';

export function useContactSearch(
  contactFamilies: ContactFamily[],
  allContacts: Contact[]
) {
  const [familySearchQuery, setFamilySearchQuery] = useState('');
  const [personSearchQuery, setPersonSearchQuery] = useState('');

  const filteredFamilies = useMemo(() => {
    if (!familySearchQuery.trim()) return contactFamilies;

    const query = familySearchQuery.toLowerCase();
    return contactFamilies.filter((family) =>
      family.family_name.toLowerCase().includes(query)
    );
  }, [contactFamilies, familySearchQuery]);

  const filteredPersons = useMemo(() => {
    if (!personSearchQuery.trim()) return allContacts;

    const query = personSearchQuery.toLowerCase();
    return allContacts.filter((contact) => {
      const fullName = `${contact.last_name} ${contact.first_name}`.toLowerCase();
      return (
        fullName.includes(query) ||
        contact.last_name.toLowerCase().includes(query) ||
        contact.first_name.toLowerCase().includes(query)
      );
    });
  }, [allContacts, personSearchQuery]);

  return {
    familySearchQuery,
    setFamilySearchQuery,
    personSearchQuery,
    setPersonSearchQuery,
    filteredFamilies,
    filteredPersons,
  };
}
