import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Toggle';
import type { Client } from '../types';

interface GeneralTabProps {
  client: Client;
  onSave?: (client: Client) => void;
}

export function GeneralTab({ client, onSave }: GeneralTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState(client);

  const handleSave = () => {
    onSave?.(editedClient);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedClient(client);
    setIsEditing(false);
  };

  const updateField = (field: keyof Client, value: string | number | boolean) => {
    setEditedClient({ ...editedClient, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header with Edit toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text-primary">Client Information</h3>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button variant="secondary" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Basic Info Card */}
        <div className="bg-surface-light rounded-lg p-6 border border-border">
          <h4 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Basic Information
          </h4>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Company Name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedClient.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="text-sm font-medium text-text-primary bg-white border border-border rounded px-2 py-1 w-48 text-right"
                />
              ) : (
                <span className="text-sm font-medium text-text-primary">{client.name}</span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Client Code</span>
              <span className="text-sm font-mono text-brand-cyan">{client.code}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Type</span>
              <Badge variant={client.type === 'corporate' ? 'blue' : client.type === 'partner' ? 'purple' : 'default'}>
                {client.type.charAt(0).toUpperCase() + client.type.slice(1)}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Status</span>
              {isEditing ? (
                <Toggle
                  checked={editedClient.status === 'active'}
                  onChange={(checked) => updateField('status', checked ? 'active' : 'inactive')}
                  label={editedClient.status === 'active' ? 'Active' : 'Inactive'}
                />
              ) : (
                <Badge variant={client.status === 'active' ? 'green' : 'red'}>
                  {client.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-surface-light rounded-lg p-6 border border-border">
          <h4 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Contact Details
          </h4>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Phone</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedClient.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="text-sm font-medium text-text-primary bg-white border border-border rounded px-2 py-1 w-48 text-right"
                />
              ) : (
                <span className="text-sm font-medium text-text-primary">{client.phone}</span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Email</span>
              {isEditing ? (
                <input
                  type="email"
                  value={editedClient.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="text-sm font-medium text-text-primary bg-white border border-border rounded px-2 py-1 w-48 text-right"
                />
              ) : (
                <a href={`mailto:${client.email}`} className="text-sm font-medium text-brand-cyan hover:underline">
                  {client.email}
                </a>
              )}
            </div>

            {client.website && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Website</span>
                <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-cyan hover:underline">
                  {client.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-surface-light rounded-lg p-6 border border-border">
          <h4 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Location
          </h4>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-sm text-text-secondary">Address</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedClient.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="text-sm font-medium text-text-primary bg-white border border-border rounded px-2 py-1 w-48 text-right"
                />
              ) : (
                <span className="text-sm font-medium text-text-primary text-right">{client.address}</span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">City</span>
              <span className="text-sm font-medium text-text-primary">{client.city}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">State / Zip</span>
              <span className="text-sm font-medium text-text-primary">{client.state} {client.zip}</span>
            </div>
          </div>
        </div>

        {/* Billing Card */}
        <div className="bg-surface-light rounded-lg p-6 border border-border">
          <h4 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Billing Information
          </h4>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Billing Type</span>
              <Badge variant="blue">{client.billingType}</Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Payment Terms</span>
              <span className="text-sm font-medium text-text-primary">{client.paymentTerms}</span>
            </div>

            {client.creditLimit && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Credit Limit</span>
                <span className="text-sm font-medium text-success">${client.creditLimit.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {(client.notes || isEditing) && (
        <div className="bg-surface-light rounded-lg p-6 border border-border">
          <h4 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Notes
          </h4>
          {isEditing ? (
            <textarea
              value={editedClient.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full h-24 text-sm text-text-primary bg-white border border-border rounded px-3 py-2 resize-none"
              placeholder="Add notes about this client..."
            />
          ) : (
            <p className="text-sm text-text-primary">{client.notes}</p>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="flex justify-between text-xs text-text-muted">
        <span>Created: {new Date(client.createdAt).toLocaleDateString()}</span>
        <span>Last Updated: {new Date(client.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
