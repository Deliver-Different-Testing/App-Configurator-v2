import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Toggle } from '../../../components/ui/Toggle';
import type { ClientContact } from '../types';

interface ContactsTabProps {
  contacts: ClientContact[];
  onSave?: (contacts: ClientContact[]) => void;
}

const ROLE_COLORS: Record<string, 'blue' | 'purple' | 'green' | 'default'> = {
  primary: 'blue',
  billing: 'purple',
  operations: 'green',
  dispatch: 'default',
  admin: 'blue',
  other: 'default',
};

export function ContactsTab({ contacts, onSave }: ContactsTabProps) {
  const [localContacts, setLocalContacts] = useState(contacts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ClientContact | null>(null);

  const handleAdd = () => {
    setEditingContact({
      id: `temp-${Date.now()}`,
      clientId: contacts[0]?.clientId || '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'other',
      isPrimary: false,
      receiveNotifications: true,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (contact: ClientContact) => {
    setEditingContact({ ...contact });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingContact) return;

    const exists = localContacts.find(c => c.id === editingContact.id);
    if (exists) {
      setLocalContacts(localContacts.map(c => c.id === editingContact.id ? editingContact : c));
    } else {
      setLocalContacts([...localContacts, { ...editingContact, id: `contact-${Date.now()}` }]);
    }

    onSave?.(localContacts);
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleDelete = (id: string) => {
    const updated = localContacts.filter(c => c.id !== id);
    setLocalContacts(updated);
    onSave?.(updated);
  };

  const updateField = (field: keyof ClientContact, value: unknown) => {
    if (!editingContact) return;
    setEditingContact({ ...editingContact, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Contact Directory</h3>
          <p className="text-sm text-text-secondary mt-1">
            Manage contacts and their notification preferences
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleAdd}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Contact
        </Button>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-2 gap-4">
        {localContacts.map((contact) => (
          <div
            key={contact.id}
            className={`border rounded-lg p-5 transition-all hover:shadow-md ${
              contact.isPrimary ? 'border-brand-cyan bg-brand-cyan/5' : 'border-border'
            } ${contact.status === 'inactive' ? 'opacity-60' : ''}`}
          >
            {/* Contact Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-purple flex items-center justify-center text-white font-medium">
                  {contact.firstName[0]}{contact.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">
                      {contact.firstName} {contact.lastName}
                    </span>
                    {contact.isPrimary && (
                      <svg className="w-4 h-4 text-brand-cyan" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                  </div>
                  {contact.title && (
                    <span className="text-sm text-text-secondary">{contact.title}</span>
                  )}
                </div>
              </div>
              <Badge variant={ROLE_COLORS[contact.role] || 'default'}>
                {contact.role.charAt(0).toUpperCase() + contact.role.slice(1)}
              </Badge>
            </div>

            {/* Contact Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a href={`mailto:${contact.email}`} className="text-brand-cyan hover:underline">
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72" />
                </svg>
                <span className="text-text-primary">{contact.phone}</span>
                {contact.mobile && (
                  <span className="text-text-muted">/ {contact.mobile}</span>
                )}
              </div>
              {contact.department && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21h18M9 8h1m5 0h1m-8 4h1m5 0h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
                  </svg>
                  <span className="text-text-secondary">{contact.department}</span>
                </div>
              )}
            </div>

            {/* Notification Status */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                {contact.receiveNotifications ? (
                  <svg className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8.56 2.9A7 7 0 0 1 19 9v4m-2 4H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
                <span className={`text-xs ${contact.receiveNotifications ? 'text-success' : 'text-text-muted'}`}>
                  {contact.receiveNotifications ? 'Receives notifications' : 'Notifications off'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(contact)}
                  className="p-1.5 text-text-muted hover:text-brand-cyan transition-colors"
                  title="Edit"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-1.5 text-text-muted hover:text-error transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {localContacts.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          <svg className="w-12 h-12 mx-auto mb-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <p className="text-lg font-medium">No contacts yet</p>
          <p className="text-sm mt-1">Add a contact to get started</p>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingContact(null); }}
        title={editingContact?.id.startsWith('temp-') ? 'Add Contact' : 'Edit Contact'}
      >
        {editingContact && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">First Name</label>
                <input
                  type="text"
                  value={editingContact.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Last Name</label>
                <input
                  type="text"
                  value={editingContact.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={editingContact.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                <input
                  type="tel"
                  value={editingContact.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Mobile</label>
                <input
                  type="tel"
                  value={editingContact.mobile || ''}
                  onChange={(e) => updateField('mobile', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                <select
                  value={editingContact.role}
                  onChange={(e) => updateField('role', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                >
                  <option value="primary">Primary</option>
                  <option value="billing">Billing</option>
                  <option value="operations">Operations</option>
                  <option value="dispatch">Dispatch</option>
                  <option value="admin">Admin</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  value={editingContact.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Department</label>
              <input
                type="text"
                value={editingContact.department || ''}
                onChange={(e) => updateField('department', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-4">
                <Toggle
                  checked={editingContact.isPrimary}
                  onChange={(checked) => updateField('isPrimary', checked)}
                  label="Primary Contact"
                />
                <Toggle
                  checked={editingContact.receiveNotifications}
                  onChange={(checked) => updateField('receiveNotifications', checked)}
                  label="Receive Notifications"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => { setIsModalOpen(false); setEditingContact(null); }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                {editingContact.id.startsWith('temp-') ? 'Add Contact' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
