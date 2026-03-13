import { useState } from 'react';
import { Toggle } from '../../../components/ui/Toggle';
import { CARRIER_LABELS } from '../types';
import type { CarrierType } from '../types';

interface FuelSurcharge {
  id: string;
  service: string;
  percentage: number;
  effectiveDate: string;
  isActive: boolean;
}

interface FuelSurchargesTabProps {
  carrier: CarrierType;
}

const sampleFuelSurcharges: Record<CarrierType, FuelSurcharge[]> = {
  fedex: [
    { id: '1', service: 'FedEx Ground', percentage: 14.5, effectiveDate: '2024-01-01', isActive: true },
    { id: '2', service: 'FedEx Express', percentage: 16.0, effectiveDate: '2024-01-01', isActive: true },
    { id: '3', service: 'FedEx Freight', percentage: 28.5, effectiveDate: '2024-01-01', isActive: true },
  ],
  ups: [
    { id: '1', service: 'UPS Ground', percentage: 14.25, effectiveDate: '2024-01-01', isActive: true },
    { id: '2', service: 'UPS Air', percentage: 15.75, effectiveDate: '2024-01-01', isActive: true },
  ],
  usps: [],
  dhl: [
    { id: '1', service: 'DHL Express', percentage: 17.5, effectiveDate: '2024-01-01', isActive: false },
  ],
};

export function FuelSurchargesTab({ carrier }: FuelSurchargesTabProps) {
  const [surcharges, setSurcharges] = useState<FuelSurcharge[]>(
    sampleFuelSurcharges[carrier] || []
  );

  const handleToggleActive = (id: string) => {
    setSurcharges(surcharges.map(surcharge =>
      surcharge.id === id ? { ...surcharge, isActive: !surcharge.isActive } : surcharge
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {surcharges.length} fuel surcharge{surcharges.length !== 1 ? 's' : ''} for {CARRIER_LABELS[carrier]}
        </p>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <p className="text-sm text-blue-800">
              Fuel surcharges are updated weekly by carriers. These rates are applied automatically to shipments.
            </p>
          </div>
        </div>
      </div>

      {/* Surcharges Table */}
      {surcharges.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Service
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Surcharge %
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Effective Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Apply
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {surcharges.map((surcharge) => (
                <tr
                  key={surcharge.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    !surcharge.isActive ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-text-primary">{surcharge.service}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-text-secondary">{surcharge.percentage.toFixed(2)}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-text-secondary">{formatDate(surcharge.effectiveDate)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Toggle
                      checked={surcharge.isActive}
                      onChange={() => handleToggleActive(surcharge.id)}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {surcharges.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-1">No fuel surcharges</h3>
          <p className="text-text-secondary mb-4">Configure fuel surcharges for {CARRIER_LABELS[carrier]} services</p>
        </div>
      )}
    </div>
  );
}
