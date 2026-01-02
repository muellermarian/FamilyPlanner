import { useState, useEffect } from 'react';
import type { ContactFamily, Contact } from '../../lib/types';
import {
  getContactFamilies,
  getAllContacts,
  addContactFamily,
  addContact,
  updateContact,
  deleteContactFamily,
  deleteContact,
} from '../../lib/contacts';
import ContactFamilyForm from './ContactFamilyForm';
import ContactPersonForm from './ContactPersonForm';
import ContactPersonEditForm from './ContactPersonEditForm';
import ContactItem from './ContactItem';

interface ContactListProps {
  familyId: string;
}

export default function ContactList({ familyId }: ContactListProps) {
  const [contactFamilies, setContactFamilies] = useState<ContactFamily[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [expandedFamilyIds, setExpandedFamilyIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [familySearchQuery, setFamilySearchQuery] = useState('');
  const [personSearchQuery, setPersonSearchQuery] = useState('');

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
      console.error(err);
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
    try {
      await addContactFamily(familyId, familyName, street, houseNumber, zip, city, country);
      await fetchData();
      setShowFamilyForm(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleAddPerson = async (
    firstName: string,
    lastName: string,
    birthdate: string,
    phone: string,
    email: string
  ) => {
    try {
      await addContact(familyId, firstName, lastName, selectedFamilyId, birthdate, phone, email);
      await fetchData();
      setShowPersonForm(false);
      setSelectedFamilyId(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleUpdatePerson = async (
    firstName: string,
    lastName: string,
    contactFamilyId: string | null,
    birthdate: string,
    phone: string,
    email: string
  ) => {
    if (!editContact) return;

    try {
      await updateContact(
        editContact.id,
        firstName,
        lastName,
        contactFamilyId,
        birthdate,
        phone,
        email
      );
      await fetchData();
      setEditContact(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleDeleteFamily = async (contactFamilyId: string, familyName: string) => {
    if (
      !confirm(
        `Familie "${familyName}" wirklich löschen? Alle zugehörigen Personen werden ebenfalls gelöscht.`
      )
    )
      return;

    try {
      await deleteContactFamily(contactFamilyId);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDeletePerson = async (contactId: string, name: string) => {
    if (!confirm(`"${name}" wirklich löschen?`)) return;

    try {
      await deleteContact(contactId);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const toggleFamily = (familyId: string) => {
    setExpandedFamilyIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(familyId)) {
        newSet.delete(familyId);
      } else {
        newSet.add(familyId);
      }
      return newSet;
    });
  };

  const openPersonForm = (contactFamilyId?: string) => {
    setSelectedFamilyId(contactFamilyId || null);
    setShowPersonForm(true);
  };

  // Filter families by search query
  const filteredFamilies = contactFamilies.filter((family) => {
    if (!familySearchQuery.trim()) return true;
    const query = familySearchQuery.toLowerCase();
    return family.family_name.toLowerCase().includes(query);
  });

  // Filter persons by search query
  const filteredPersons = allContacts.filter((contact) => {
    if (!personSearchQuery.trim()) return true;
    const query = personSearchQuery.toLowerCase();
    const fullName = `${contact.last_name} ${contact.first_name}`.toLowerCase();
    return (
      fullName.includes(query) ||
      contact.last_name.toLowerCase().includes(query) ||
      contact.first_name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Kontakte</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFamilyForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
          >
            + Familie
          </button>
          <button
            onClick={() => openPersonForm()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
          >
            + Person
          </button>
        </div>
      </div>

      {loading && <div className="text-gray-500">🔄 Lade Kontakte…</div>}
      {error && <div className="text-red-600">Fehler: {error}</div>}

      {!loading && contactFamilies.length === 0 && allContacts.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Noch keine Kontakte vorhanden. Füge eine Familie oder Einzelperson hinzu.
        </div>
      )}

      {/* Contact Families */}
      {contactFamilies.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Familien ({contactFamilies.length})</h3>

          <div className="mb-4">
            <input
              type="text"
              value={familySearchQuery}
              onChange={(e) => setFamilySearchQuery(e.target.value)}
              placeholder="Suche nach Familienname..."
              className="w-full border rounded px-4 py-2"
            />
          </div>

          {filteredFamilies.length === 0 && familySearchQuery && (
            <div className="text-gray-500 text-sm mb-4">Keine Familien gefunden</div>
          )}

          <div className="space-y-3">
            {filteredFamilies.map((family) => {
              const isExpanded = expandedFamilyIds.has(family.id);
              const hasAddress =
                family.street || family.house_number || family.zip || family.city || family.country;

              return (
                <div key={family.id} className="border rounded-lg overflow-hidden">
                  <div
                    className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleFamily(family.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{isExpanded ? '👨‍👩‍👧‍👦' : '👨‍👩‍👧'}</span>
                      <div>
                        <div className="font-semibold text-lg">{family.family_name}</div>
                        {hasAddress && (
                          <div className="text-sm text-gray-600">
                            {family.street} {family.house_number}
                            {family.zip || family.city ? ', ' : ''}
                            {family.zip} {family.city}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openPersonForm(family.id)}
                        className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm font-medium"
                        title="Person hinzufügen"
                      >
                        +Person
                      </button>
                      <button
                        onClick={() => handleDeleteFamily(family.id, family.family_name)}
                        className="text-red-500 font-bold ml-3"
                        title="Familie löschen"
                      >
                        X
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-white">
                      {hasAddress && (
                        <div className="mb-4 p-3 bg-gray-50 rounded border text-sm">
                          <div className="font-medium mb-1">Anschrift:</div>
                          <div>
                            {family.street} {family.house_number}
                          </div>
                          <div>
                            {family.zip} {family.city}
                          </div>
                          {family.country && <div>{family.country}</div>}
                        </div>
                      )}

                      <div className="font-medium mb-2">
                        Personen ({family.contacts?.length || 0}):
                      </div>

                      {!family.contacts || family.contacts.length === 0 ? (
                        <div className="text-gray-500 text-sm italic">
                          Keine Personen in dieser Familie
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {family.contacts.map((contact) => (
                            <ContactItem
                              key={contact.id}
                              contact={contact}
                              contactFamilies={contactFamilies}
                              onEdit={() => setEditContact(contact)}
                              onDelete={() =>
                                handleDeletePerson(
                                  contact.id,
                                  `${contact.last_name}, ${contact.first_name}`
                                )
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Individual Contacts */}
      {allContacts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Personen ({allContacts.length})</h3>

          <div className="mb-4">
            <input
              type="text"
              value={personSearchQuery}
              onChange={(e) => setPersonSearchQuery(e.target.value)}
              placeholder="Suche nach Name, E-Mail oder Telefon..."
              className="w-full border rounded px-4 py-2"
            />
          </div>

          {filteredPersons.length === 0 && personSearchQuery && (
            <div className="text-gray-500 text-sm mb-4">Keine Personen gefunden</div>
          )}

          <div className="space-y-2">
            {filteredPersons.map((contact) => (
              <ContactItem
                key={contact.id}
                contact={contact}
                contactFamilies={contactFamilies}
                onEdit={() => setEditContact(contact)}
                onDelete={() =>
                  handleDeletePerson(contact.id, `${contact.last_name}, ${contact.first_name}`)
                }
              />
            ))}
          </div>
        </div>
      )}

      {showFamilyForm && (
        <ContactFamilyForm onAdd={handleAddFamily} onCancel={() => setShowFamilyForm(false)} />
      )}

      {showPersonForm && (
        <ContactPersonForm
          contactFamilyId={selectedFamilyId}
          onAdd={handleAddPerson}
          onCancel={() => {
            setShowPersonForm(false);
            setSelectedFamilyId(null);
          }}
        />
      )}

      {editContact && (
        <ContactPersonEditForm
          contact={editContact}
          contactFamilies={contactFamilies}
          onUpdate={handleUpdatePerson}
          onCancel={() => setEditContact(null)}
        />
      )}
    </div>
  );
}
