import { supabase } from './supabaseClient';
import type { ContactFamily, Contact } from './types';

/**
 * Get all contact families with their contacts
 */
export async function getContactFamilies(familyId: string): Promise<ContactFamily[]> {
  const { data: families, error: familiesError } = await supabase
    .from('contact_families')
    .select('*')
    .eq('family_id', familyId)
    .order('family_name', { ascending: true });

  if (familiesError) throw familiesError;
  if (!families || families.length === 0) return [];

  // Fetch contacts for all families
  const familyIds = families.map((f: any) => f.id);
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('*')
    .in('contact_family_id', familyIds)
    .order('last_name', { ascending: true });

  if (contactsError) throw contactsError;

  // Attach contacts to families
  const result: ContactFamily[] = families.map((f: any) => ({
    ...f,
    contacts: (contacts || []).filter((c: any) => c.contact_family_id === f.id) as Contact[],
  }));

  return result;
}

/**
 * Get individual contacts (not assigned to a family)
 */
export async function getIndividualContacts(familyId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('family_id', familyId)
    .is('contact_family_id', null)
    .order('last_name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get all contacts (including those in families) sorted by last name, first name
 */
export async function getAllContacts(familyId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('family_id', familyId)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Add a new contact family
 */
export async function addContactFamily(
  familyId: string,
  familyName: string,
  street?: string,
  houseNumber?: string,
  zip?: string,
  city?: string,
  country?: string
): Promise<ContactFamily> {
  const { data, error } = await supabase
    .from('contact_families')
    .insert({
      family_id: familyId,
      family_name: familyName,
      street,
      house_number: houseNumber,
      zip,
      city,
      country,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a contact family
 */
export async function updateContactFamily(
  contactFamilyId: string,
  familyName: string,
  street?: string,
  houseNumber?: string,
  zip?: string,
  city?: string,
  country?: string
): Promise<void> {
  const { error } = await supabase
    .from('contact_families')
    .update({
      family_name: familyName,
      street,
      house_number: houseNumber,
      zip,
      city,
      country,
    })
    .eq('id', contactFamilyId);

  if (error) throw error;
}

/**
 * Delete a contact family (and all its contacts)
 */
export async function deleteContactFamily(contactFamilyId: string): Promise<void> {
  const { error } = await supabase.from('contact_families').delete().eq('id', contactFamilyId);

  if (error) throw error;
}

/**
 * Add a new contact
 */
export async function addContact(
  familyId: string,
  firstName: string,
  lastName: string,
  contactFamilyId?: string | null,
  birthdate?: string,
  phone?: string,
  phoneLandline?: string,
  email?: string,
  street?: string,
  houseNumber?: string,
  zip?: string,
  city?: string,
  country?: string
): Promise<Contact> {
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      family_id: familyId,
      contact_family_id: contactFamilyId || null,
      first_name: firstName,
      last_name: lastName,
      birthdate,
      phone,
      phone_landline: phoneLandline,
      email,
      street,
      house_number: houseNumber,
      zip,
      city,
      country,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a contact
 */
export async function updateContact(
  contactId: string,
  firstName: string,
  lastName: string,
  contactFamilyId?: string | null,
  birthdate?: string,
  phone?: string,
  phoneLandline?: string,
  email?: string,
  street?: string,
  houseNumber?: string,
  zip?: string,
  city?: string,
  country?: string
): Promise<void> {
  const { error } = await supabase
    .from('contacts')
    .update({
      first_name: firstName,
      last_name: lastName,
      contact_family_id: contactFamilyId,
      birthdate,
      phone,
      phone_landline: phoneLandline,
      email,
      street,
      house_number: houseNumber,
      zip,
      city,
      country,
    })
    .eq('id', contactId);

  if (error) throw error;
}

/**
 * Delete a contact
 */
export async function deleteContact(contactId: string): Promise<void> {
  const { error } = await supabase.from('contacts').delete().eq('id', contactId);

  if (error) throw error;
}
