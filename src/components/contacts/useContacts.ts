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

export function useContacts(familyId: string) {
  const [contactFamilies, setContactFamilies] = useState<ContactFamily[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchData();
  }, [familyId]);

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

  const handleDeleteFamily = async (contactFamilyId: string) => {
    await deleteContactFamily(contactFamilyId);
    await fetchData();
  };

  const handleAddPerson = async (
    firstName: string,
    lastName: string,
    contactFamilyId: string | null,
    birthdate: string | null,
    phone: string,
    phoneLandline: string,
    email: string,
    street: string,
    houseNumber: string,
    zip: string,
    city: string,
    country: string
  ) => {
    await addContact(
      familyId,
      firstName,
      lastName,
      contactFamilyId,
      birthdate || undefined,
      phone,
      phoneLandline,
      email,
      street,
      houseNumber,
      zip,
      city,
      country
    );
    await fetchData();
  };

  const handleUpdatePerson = async (
    contactId: string,
    firstName: string,
    lastName: string,
    contactFamilyId: string | null,
    birthdate: string | null,
    phone: string,
    phoneLandline: string,
    email: string,
    street: string,
    houseNumber: string,
    zip: string,
    city: string,
    country: string
  ) => {
    await updateContact(
      contactId,
      firstName,
      lastName,
      contactFamilyId,
      birthdate || undefined,
      phone,
      phoneLandline,
      email,
      street,
      houseNumber,
      zip,
      city,
      country
    );
    await fetchData();
  };

  const handleDeletePerson = async (contactId: string) => {
    await deleteContact(contactId);
    await fetchData();
  };

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
  };
}
