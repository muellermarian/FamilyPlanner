// Custom React hook for managing contacts and families
// Only comments are changed, no user-facing German content is modified
import { useState, useEffect } from 'react';
import type { ContactFamily, Contact } from '../../lib/types';
import {
  getContactFamilies,
  getAllContacts,
  addContactFamily,
  updateContactFamily,
  addContact,
  updateContact,
  deleteContactFamily,
  deleteContact,
} from '../../lib/contacts';

// useContacts hook provides state and handlers for contacts and families
export function useContacts(familyId: string) {
  // State for families, contacts, loading, and error
  const [contactFamilies, setContactFamilies] = useState<ContactFamily[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch families and contacts from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [families, contacts] = await Promise.all([
        getContactFamilies(familyId),
        getAllContacts(familyId),
      ]);
      setContactFamilies(families);
      setAllContacts(contacts);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  };

  // Refetch data when familyId changes
  useEffect(() => {
    fetchData();
  }, [familyId]);

  // Handler for adding a new family
  const handleAddFamily = async (
    familyName: string,
    street: string,
    houseNumber: string,
    zip: string,
    city: string,
    country: string
  ) => {
    await addContactFamily(familyId, familyName, street, houseNumber, zip, city, country);
    await fetchData();
  };

  // Handler for updating an existing family
  const handleUpdateFamily = async (
    contactFamilyId: string,
    familyName: string,
    street: string,
    houseNumber: string,
    zip: string,
    city: string,
    country: string
  ) => {
    await updateContactFamily(contactFamilyId, familyName, street, houseNumber, zip, city, country);
    await fetchData();
  };

  // Handler for deleting a family
  const handleDeleteFamily = async (contactFamilyId: string) => {
    await deleteContactFamily(contactFamilyId);
    await fetchData();
  };

  // Handler for adding a new person
  // Accepts a single object for person data
  const handleAddPerson = async (data: {
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
  }) => {
    await addContact(
      familyId,
      data.firstName,
      data.lastName,
      data.contactFamilyId,
      data.birthdate || undefined,
      data.phone,
      data.phoneLandline,
      data.email,
      data.street,
      data.houseNumber,
      data.zip,
      data.city,
      data.country
    );
    await fetchData();
  };

  // Handler for updating an existing person
  // Accepts a single object for person data
  const handleUpdatePerson = async (
    contactId: string,
    data: {
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
    }
  ) => {
    await updateContact(
      contactId,
      data.firstName,
      data.lastName,
      data.contactFamilyId,
      data.birthdate || undefined,
      data.phone,
      data.phoneLandline,
      data.email,
      data.street,
      data.houseNumber,
      data.zip,
      data.city,
      data.country
    );
    await fetchData();
  };

  // Handler for deleting a person
  const handleDeletePerson = async (contactId: string) => {
    await deleteContact(contactId);
    await fetchData();
  };

  // Return state and handlers for use in components
  return {
    contactFamilies,
    allContacts,
    loading,
    error,
    fetchData,
    handleAddFamily,
    handleUpdateFamily,
    handleDeleteFamily,
    handleAddPerson,
    handleUpdatePerson,
    handleDeletePerson,
    refetch: fetchData,
  };
}
