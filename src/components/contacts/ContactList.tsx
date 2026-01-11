import { useState } from 'react';
import type { ContactFamily, Contact } from '../../lib/types';
import { useToast } from '../../hooks/useToast';
import { useContacts } from './useContacts';
import { useContactSearch } from './useContactSearch';
import Toast from '../shared/Toast';
import { PullToRefresh } from '../shared/PullToRefresh';
import ContactFamilyForm from './ContactFamilyForm';
import PersonForm from './PersonForm';
import ContactItem from './ContactItem';
import PersonDetails from './PersonDetails';
import ActionButtons from './ActionButtons';

// Props for the ContactList component
interface ContactListProps {
  familyId: string; // ID of the selected family
}

type ReadonlyContactListProps = Readonly<ContactListProps>;

export default function ContactList({ familyId }: ReadonlyContactListProps) {
  const {
    contactFamilies,
    allContacts,
    loading,
    error,
    handleAddFamily,
    handleUpdateFamily,
    handleDeleteFamily,
    handleAddPerson,
    handleUpdatePerson,
    handleDeletePerson,
    refetch,
  } = useContacts(familyId);

  const {
    familySearchQuery,
    setFamilySearchQuery,
    personSearchQuery,
    setPersonSearchQuery,
    filteredFamilies,
    filteredPersons,
  } = useContactSearch(contactFamilies, allContacts);

  const { toast, showToast } = useToast();

  const [viewMode, setViewMode] = useState<'persons' | 'families'>('persons');
  const [expandedFamilyIds, setExpandedFamilyIds] = useState<Set<string>>(new Set());
  const [expandedPersonIds, setExpandedPersonIds] = useState<Set<string>>(new Set());
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [editFamily, setEditFamily] = useState<ContactFamily | null>(null);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [preselectedFamilyId, setPreselectedFamilyId] = useState<string | null>(null);

  // Toggle expanded state for families or persons
  const toggleExpanded = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<Set<string>>>
  ) => {
    setter((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // Handler for adding a new family
  const onAddFamily = async (
    familyName: string,
    street: string,
    houseNumber: string,
    zip: string,
    city: string,
    country: string
  ) => {
    try {
      await handleAddFamily(familyName, street, houseNumber, zip, city, country);
      setShowFamilyForm(false);
      showToast('Familie hinzugefügt ✓');
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  // Handler for updating an existing family
  const onUpdateFamily = async (
    contactFamilyId: string,
    familyName: string,
    street: string,
    houseNumber: string,
    zip: string,
    city: string,
    country: string
  ) => {
    try {
      await handleUpdateFamily(
        contactFamilyId,
        familyName,
        street,
        houseNumber,
        zip,
        city,
        country
      );
      setEditFamily(null);
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  // Handler for deleting a family (with confirmation)
  const onDeleteFamily = async (contactFamilyId: string, familyName: string) => {
    if (
      !confirm(
        `Familie "${familyName}" wirklich löschen? Alle zugehörigen Personen werden ebenfalls gelöscht.`
      )
    )
      return;

    try {
      await handleDeleteFamily(contactFamilyId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Helper type for person form data
  type PersonFormData = {
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
  };

  // Handler for adding a new person (accepts a single object)
  const onAddPerson = async (data: PersonFormData) => {
    try {
      await handleAddPerson(data);
      setShowPersonForm(false);
      setPreselectedFamilyId(null);
      showToast('Person hinzugefügt ✓');
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  // Handler for updating an existing person (accepts a single object)
  const onUpdatePerson = async (data: PersonFormData) => {
    if (!editContact) return;
    try {
      await handleUpdatePerson(editContact.id, data);
      setEditContact(null);
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  // Handler for deleting a person (with confirmation)
  const onDeletePerson = async (contactId: string, name: string) => {
    if (!confirm(`"${name}" wirklich löschen?`)) return;

    try {
      await handleDeletePerson(contactId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Open the person form, optionally preselecting a family
  const openPersonForm = (contactFamilyId?: string) => {
    setPreselectedFamilyId(contactFamilyId || null);
    setShowPersonForm(true);
  };

  // Render the contact list UI with forms, tabs, and lists
  return (
    <PullToRefresh onRefresh={refetch}>
      <div>
        {/* Show form if any form is active */}
        {showFamilyForm && (
          <ContactFamilyForm onAdd={onAddFamily} onCancel={() => setShowFamilyForm(false)} />
        )}

        {editFamily && (
          <ContactFamilyForm
            family={editFamily}
            onUpdate={onUpdateFamily}
            onCancel={() => setEditFamily(null)}
          />
        )}

        {showPersonForm && (
          <PersonForm
            contactFamilies={contactFamilies}
            preselectedFamilyId={preselectedFamilyId}
            onSave={onAddPerson}
            onCancel={() => {
              setShowPersonForm(false);
              setPreselectedFamilyId(null);
            }}
          />
        )}

        {editContact && (
          <PersonForm
            contact={editContact}
            contactFamilies={contactFamilies}
            onSave={onUpdatePerson}
            onCancel={() => setEditContact(null)}
          />
        )}

        {/* Main content - hidden when any form is open */}
        {!showFamilyForm && !editFamily && !showPersonForm && !editContact && (
          <div className="max-w-4xl mx-auto mt-10 p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Kontakte</h2>
            </div>

            {/* View Mode Tabs */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setViewMode('persons')}
                className={`px-4 py-2 rounded font-medium ${
                  viewMode === 'persons'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                👤 Personen
              </button>
              <button
                onClick={() => setViewMode('families')}
                className={`px-4 py-2 rounded font-medium ${
                  viewMode === 'families'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                👨‍👩‍👧 Familien
              </button>
            </div>

            {loading && <div className="text-gray-500">🔄 Lade Kontakte…</div>}
            {error && <div className="text-red-600">Fehler: {error}</div>}

            {!loading && contactFamilies.length === 0 && allContacts.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                Noch keine Kontakte vorhanden. Füge eine Familie oder Einzelperson hinzu.
              </div>
            )}

            {/* Contact Families */}
            {viewMode === 'families' && contactFamilies.length > 0 && (
              <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-gray-700 font-medium">
                    {filteredFamilies.length}{' '}
                    {filteredFamilies.length === 1 ? 'Familie' : 'Familien'}
                  </span>
                  <button
                    onClick={() => setShowFamilyForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium flex items-center gap-2"
                  >
                    <span>+</span>
                    <span>Familie</span>
                  </button>
                </div>
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
                      family.street ||
                      family.house_number ||
                      family.zip ||
                      family.city ||
                      family.country;

                    return (
                      <div key={family.id} className="border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          className="w-full text-left p-4 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleExpanded(family.id, setExpandedFamilyIds)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">👨‍👩‍👧</span>
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
                        </button>

                        {isExpanded && (
                          <div className="p-4 bg-white">
                            <ActionButtons
                              onEdit={() => setEditFamily(family)}
                              onDelete={() => onDeleteFamily(family.id, family.family_name)}
                              onAddPerson={() => openPersonForm(family.id)}
                            />

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
                                    onEdit={() => setEditContact(contact)}
                                    onDelete={() =>
                                      onDeletePerson(
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
            {viewMode === 'persons' && allContacts.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-gray-700 font-medium">
                    {filteredPersons.length} {filteredPersons.length === 1 ? 'Person' : 'Personen'}
                  </span>
                  <button
                    onClick={() => openPersonForm()}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium flex items-center gap-2"
                  >
                    <span>+</span>
                    <span>Person</span>
                  </button>
                </div>
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

                <div className="space-y-3">
                  {filteredPersons.map((contact) => {
                    const isExpanded = expandedPersonIds.has(contact.id);
                    const family = contactFamilies.find((f) => f.id === contact.contact_family_id);
                    const familyName = family?.family_name;

                    return (
                      <div key={contact.id} className="border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          className="w-full text-left p-4 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleExpanded(contact.id, setExpandedPersonIds)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">👤</span>
                            <div>
                              <div className="font-semibold text-lg">
                                {contact.last_name}, {contact.first_name}
                              </div>
                              {familyName && (
                                <div className="text-sm text-gray-600">👨‍👩‍👧 {familyName}</div>
                              )}
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-4 bg-white">
                            <ActionButtons
                              onEdit={() => setEditContact(contact)}
                              onDelete={() =>
                                onDeletePerson(
                                  contact.id,
                                  `${contact.last_name}, ${contact.first_name}`
                                )
                              }
                            />

                            {/* Contact Details */}
                            <PersonDetails
                              familyName={familyName}
                              family={family}
                              email={contact.email}
                              phone={contact.phone}
                              birthdate={contact.birthdate}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {toast && <Toast message={toast} />}
      </div>
    </PullToRefresh>
  );
}
