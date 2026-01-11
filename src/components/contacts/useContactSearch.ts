// Custom React hook for searching/filtering contacts and families
// Only comments are changed, no user-facing German content is modified
import { useMemo, useState } from 'react';
import type { ContactFamily, Contact } from '../../lib/types';

// useContactSearch provides search/filter state and logic for contacts and families
export function useContactSearch(
  contactFamilies: ContactFamily[],
  allContacts: Contact[]
) {
  // State for search queries
  const [familySearchQuery, setFamilySearchQuery] = useState('');
  const [personSearchQuery, setPersonSearchQuery] = useState('');

  // Filter families by search query
  const filteredFamilies = useMemo(() => {
    if (!familySearchQuery.trim()) return contactFamilies;

    const query = familySearchQuery.toLowerCase();
    return contactFamilies.filter((family) =>
      family.family_name.toLowerCase().includes(query)
    );
  }, [contactFamilies, familySearchQuery]);

  // Filter persons by search query (matches full name, last name, or first name)
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

  // Return search state and filtered results
  return {
    familySearchQuery,
    setFamilySearchQuery,
    personSearchQuery,
    setPersonSearchQuery,
    filteredFamilies,
    filteredPersons,
  };
}
