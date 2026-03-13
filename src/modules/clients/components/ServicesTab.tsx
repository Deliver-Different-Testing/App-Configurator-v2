import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Toggle';
import type { ClientService } from '../types';

interface ServicesTabProps {
  services: ClientService[];
  onSave?: (services: ClientService[]) => void;
}

export function ServicesTab({ services, onSave }: ServicesTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localServices, setLocalServices] = useState(services);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    if (editingId && editingId !== id) {
      setEditingId(null);
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    if (expandedId !== id) {
      setExpandedId(id);
    }
  };

  const handleSave = () => {
    setEditingId(null);
    onSave?.(localServices);
  };

  const updateService = (id: string, field: keyof ClientService, value: unknown) => {
    setLocalServices(localServices.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const getService = (id: string) => localServices.find(s => s.id === id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Services Configuration</h3>
          <p className="text-sm text-text-secondary mt-1">
            Configure pricing, visibility, and availability for each service
          </p>
        </div>
        <Button variant="primary" size="sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Service
        </Button>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {localServices.map((service) => {
          const isExpanded = expandedId === service.id;
          const isEditing = editingId === service.id;
          const currentService = getService(service.id) || service;

          return (
            <div
              key={service.id}
              className={`border rounded-lg transition-all duration-200 ${
                isExpanded ? 'border-brand-cyan shadow-md' : 'border-border'
              }`}
            >
              {/* Row Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-light"
                onClick={() => toggleExpand(service.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${currentService.isActive ? 'bg-success' : 'bg-text-muted'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">{currentService.serviceName}</span>
                      <span className="text-xs font-mono text-text-muted">{currentService.serviceCode}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-0.5">{currentService.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Pricing Summary */}
                  <div className="text-right">
                    <div className="text-sm font-medium text-text-primary">${currentService.finalPrice.toFixed(2)}</div>
                    <div className="text-xs text-text-muted">
                      Base: ${currentService.basePrice.toFixed(2)}
                      {currentService.markupPercent > 0 && ` + ${currentService.markupPercent}%`}
                      {currentService.markupFlat > 0 && ` + $${currentService.markupFlat}`}
                    </div>
                  </div>

                  {/* Visibility Icons */}
                  <div className="flex gap-2">
                    <span title="API" className={`text-xs ${currentService.visibleOnApi ? 'text-brand-cyan' : 'text-text-muted'}`}>API</span>
                    <span title="Booking Page" className={`text-xs ${currentService.visibleOnBookingPage ? 'text-brand-cyan' : 'text-text-muted'}`}>WEB</span>
                    <span title="Bulk Upload" className={`text-xs ${currentService.visibleOnBulkUpload ? 'text-brand-cyan' : 'text-text-muted'}`}>CSV</span>
                  </div>

                  {/* Status Badge */}
                  <Badge variant={currentService.isActive ? 'green' : 'default'}>
                    {currentService.isActive ? 'Active' : 'Inactive'}
                  </Badge>

                  {/* Chevron */}
                  <svg
                    className={`w-5 h-5 text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-border p-6 bg-surface-light">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Pricing Section */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-text-secondary">Pricing</h4>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-text-secondary">Base Price</label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={currentService.basePrice}
                              onChange={(e) => updateService(service.id, 'basePrice', parseFloat(e.target.value))}
                              className="w-24 text-sm text-right px-2 py-1 border border-border rounded"
                            />
                          ) : (
                            <span className="text-sm font-medium">${currentService.basePrice.toFixed(2)}</span>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <label className="text-sm text-text-secondary">Markup %</label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={currentService.markupPercent}
                              onChange={(e) => updateService(service.id, 'markupPercent', parseFloat(e.target.value))}
                              className="w-24 text-sm text-right px-2 py-1 border border-border rounded"
                            />
                          ) : (
                            <span className="text-sm font-medium">{currentService.markupPercent}%</span>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <label className="text-sm text-text-secondary">Markup Flat</label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={currentService.markupFlat}
                              onChange={(e) => updateService(service.id, 'markupFlat', parseFloat(e.target.value))}
                              className="w-24 text-sm text-right px-2 py-1 border border-border rounded"
                            />
                          ) : (
                            <span className="text-sm font-medium">${currentService.markupFlat.toFixed(2)}</span>
                          )}
                        </div>

                        <div className="pt-2 border-t border-border flex justify-between items-center">
                          <label className="text-sm font-medium text-text-primary">Final Price</label>
                          <span className="text-lg font-bold text-success">${currentService.finalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Visibility Section */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-text-secondary">Visibility</h4>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-text-secondary">Show on API</label>
                          <Toggle
                            checked={currentService.visibleOnApi}
                            onChange={(checked) => isEditing && updateService(service.id, 'visibleOnApi', checked)}
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <label className="text-sm text-text-secondary">Show on Booking Page</label>
                          <Toggle
                            checked={currentService.visibleOnBookingPage}
                            onChange={(checked) => isEditing && updateService(service.id, 'visibleOnBookingPage', checked)}
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <label className="text-sm text-text-secondary">Show on Bulk Upload</label>
                          <Toggle
                            checked={currentService.visibleOnBulkUpload}
                            onChange={(checked) => isEditing && updateService(service.id, 'visibleOnBulkUpload', checked)}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Settings Section */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-text-secondary">Settings</h4>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-text-secondary">Status</label>
                          <Toggle
                            checked={currentService.isActive}
                            onChange={(checked) => isEditing && updateService(service.id, 'isActive', checked)}
                            disabled={!isEditing}
                            label={currentService.isActive ? 'Active' : 'Inactive'}
                          />
                        </div>

                        {currentService.estimatedDeliveryTime && (
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-text-secondary">Est. Delivery</label>
                            <span className="text-sm text-text-primary">{currentService.estimatedDeliveryTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                    {isEditing ? (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleSave}>
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(service.id); }}>
                          Edit
                        </Button>
                        <Button variant="secondary" size="sm">
                          Duplicate
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {localServices.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          <svg className="w-12 h-12 mx-auto mb-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <p className="text-lg font-medium">No services configured</p>
          <p className="text-sm mt-1">Add a service to get started</p>
        </div>
      )}
    </div>
  );
}
