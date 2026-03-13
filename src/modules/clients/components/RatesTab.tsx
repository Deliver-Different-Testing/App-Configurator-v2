import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import type { ClientRate } from '../types';

interface RatesTabProps {
  rates: ClientRate[];
  onSave?: (rates: ClientRate[]) => void;
}

export function RatesTab({ rates, onSave }: RatesTabProps) {
  const [localRates, setLocalRates] = useState(rates);

  const handleToggleActive = (id: string) => {
    const updated = localRates.map(r =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    );
    setLocalRates(updated);
    onSave?.(updated);
  };

  const handleRemove = (id: string) => {
    const updated = localRates.filter(r => r.id !== id);
    setLocalRates(updated);
    onSave?.(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Rate Cards</h3>
          <p className="text-sm text-text-secondary mt-1">
            Assigned rate cards and discounts for this client
          </p>
        </div>
        <Button variant="primary" size="sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Assign Rate Card
        </Button>
      </div>

      {/* Rate Cards List */}
      <div className="space-y-4">
        {localRates.map((rate) => (
          <div
            key={rate.id}
            className={`border rounded-lg p-5 transition-all ${
              rate.isActive ? 'border-border bg-white' : 'border-border bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Rate Card Icon */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  rate.isActive ? 'bg-success/10 text-success' : 'bg-gray-100 text-text-muted'
                }`}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>

                {/* Rate Card Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">{rate.rateCardName}</span>
                    <Badge variant={rate.isActive ? 'green' : 'default'}>
                      {rate.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                    <span>Effective: {new Date(rate.effectiveDate).toLocaleDateString()}</span>
                    {rate.expirationDate && (
                      <span>Expires: {new Date(rate.expirationDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Discount */}
                {rate.discountPercent && rate.discountPercent > 0 && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-success">-{rate.discountPercent}%</div>
                    <div className="text-xs text-text-muted">Discount</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToggleActive(rate.id)}
                  >
                    {rate.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <button
                    onClick={() => handleRemove(rate.id)}
                    className="p-2 text-text-muted hover:text-error transition-colors"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {localRates.length === 0 && (
        <div className="text-center py-12 text-text-secondary border border-dashed border-border rounded-lg">
          <svg className="w-12 h-12 mx-auto mb-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <p className="text-lg font-medium">No rate cards assigned</p>
          <p className="text-sm mt-1">Assign a rate card to enable pricing for this client</p>
          <Button variant="primary" size="sm" className="mt-4">
            Assign Rate Card
          </Button>
        </div>
      )}

      {/* Rate Summary */}
      {localRates.length > 0 && (
        <div className="bg-surface-light rounded-lg p-5 border border-border">
          <h4 className="text-sm font-medium text-text-secondary mb-4">Rate Summary</h4>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold text-text-primary">{localRates.length}</div>
              <div className="text-sm text-text-secondary">Total Rate Cards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">{localRates.filter(r => r.isActive).length}</div>
              <div className="text-sm text-text-secondary">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-cyan">
                {Math.max(...localRates.filter(r => r.discountPercent).map(r => r.discountPercent || 0), 0)}%
              </div>
              <div className="text-sm text-text-secondary">Max Discount</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
