import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Toggle } from '../../../components/ui/Toggle';
import { CARRIER_LABELS } from '../types';
import type { CarrierType } from '../types';

interface ContractTier {
  id: string;
  name: string;
  discountPercent: number;
  minVolume: number;
  maxVolume: number | null;
  services: string[];
  isActive: boolean;
}

interface ContractTiersTabProps {
  carrier: CarrierType;
}

const sampleContractTiers: Record<CarrierType, ContractTier[]> = {
  fedex: [
    {
      id: '1',
      name: 'Standard',
      discountPercent: 0,
      minVolume: 0,
      maxVolume: 99,
      services: ['Ground', 'Express Saver'],
      isActive: true,
    },
    {
      id: '2',
      name: 'Bronze',
      discountPercent: 15,
      minVolume: 100,
      maxVolume: 499,
      services: ['Ground', 'Express Saver', '2Day'],
      isActive: true,
    },
    {
      id: '3',
      name: 'Silver',
      discountPercent: 25,
      minVolume: 500,
      maxVolume: 1999,
      services: ['Ground', 'Express Saver', '2Day', 'Priority Overnight'],
      isActive: true,
    },
    {
      id: '4',
      name: 'Gold',
      discountPercent: 40,
      minVolume: 2000,
      maxVolume: null,
      services: ['All Services'],
      isActive: true,
    },
  ],
  ups: [
    {
      id: '1',
      name: 'Standard',
      discountPercent: 0,
      minVolume: 0,
      maxVolume: 99,
      services: ['Ground', 'Surepost'],
      isActive: true,
    },
    {
      id: '2',
      name: 'Volume',
      discountPercent: 20,
      minVolume: 100,
      maxVolume: null,
      services: ['Ground', '3 Day Select', '2nd Day Air'],
      isActive: true,
    },
  ],
  usps: [],
  dhl: [],
};

export function ContractTiersTab({ carrier }: ContractTiersTabProps) {
  const [tiers, setTiers] = useState<ContractTier[]>(sampleContractTiers[carrier] || []);

  const handleToggleActive = (id: string) => {
    setTiers(tiers.map(tier =>
      tier.id === id ? { ...tier, isActive: !tier.isActive } : tier
    ));
  };

  const formatVolume = (min: number, max: number | null) => {
    if (max === null) {
      return `${min.toLocaleString()}+ packages/month`;
    }
    return `${min.toLocaleString()} - ${max.toLocaleString()} packages/month`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {tiers.length} contract tier{tiers.length !== 1 ? 's' : ''} for {CARRIER_LABELS[carrier]}
        </p>
      </div>

      {/* Contract Tiers */}
      {tiers.length > 0 && (
        <div className="space-y-3">
          {tiers.map((tier, index) => (
            <div
              key={tier.id}
              className={`p-4 rounded-lg border transition-all ${
                tier.isActive
                  ? 'bg-white border-border hover:border-brand-cyan/50'
                  : 'bg-gray-50 border-border opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-text-primary">{tier.name}</h4>
                    <Badge className={
                      tier.discountPercent >= 30 ? 'bg-green-100 text-green-700' :
                      tier.discountPercent >= 15 ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {tier.discountPercent > 0 ? `${tier.discountPercent}% off` : 'Base Rate'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-text-muted">Volume Requirement:</span>
                      <p className="text-text-secondary font-medium">{formatVolume(tier.minVolume, tier.maxVolume)}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Included Services:</span>
                      <p className="text-text-secondary">{tier.services.join(', ')}</p>
                    </div>
                  </div>

                  {/* Visual tier indicator */}
                  <div className="flex items-center gap-2">
                    {tiers.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i <= index ? 'bg-brand-cyan' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Toggle
                    checked={tier.isActive}
                    onChange={() => handleToggleActive(tier.id)}
                    label={tier.isActive ? 'Active' : 'Inactive'}
                  />
                  <button className="p-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-md transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {tiers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-1">No contract tiers</h3>
          <p className="text-text-secondary mb-4">Set up volume-based discounts for {CARRIER_LABELS[carrier]}</p>
        </div>
      )}

      {/* Info */}
      {tiers.length > 0 && (
        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <p className="text-sm text-purple-800">
                Contract tiers apply discounts based on monthly shipping volume. Higher volume = better rates. Tiers are evaluated automatically when quoting shipments.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
