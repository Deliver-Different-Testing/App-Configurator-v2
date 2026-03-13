import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { CARRIER_LABELS } from '../types';
import type { CarrierType } from '../types';

interface ZoneMapping {
  id: string;
  originZip: string;
  destinationZip: string;
  zone: string;
  transitDays: number;
}

interface ZoneMappingsTabProps {
  carrier: CarrierType;
}

const sampleZoneMappings: Record<CarrierType, ZoneMapping[]> = {
  fedex: [
    { id: '1', originZip: '90210', destinationZip: '10001', zone: '8', transitDays: 5 },
    { id: '2', originZip: '90210', destinationZip: '60601', zone: '6', transitDays: 4 },
    { id: '3', originZip: '90210', destinationZip: '85001', zone: '3', transitDays: 2 },
    { id: '4', originZip: '90210', destinationZip: '98101', zone: '4', transitDays: 3 },
    { id: '5', originZip: '90210', destinationZip: '33101', zone: '8', transitDays: 5 },
  ],
  ups: [
    { id: '1', originZip: '90210', destinationZip: '10001', zone: '8', transitDays: 5 },
    { id: '2', originZip: '90210', destinationZip: '60601', zone: '6', transitDays: 4 },
  ],
  usps: [],
  dhl: [],
};

export function ZoneMappingsTab({ carrier }: ZoneMappingsTabProps) {
  const [mappings] = useState<ZoneMapping[]>(sampleZoneMappings[carrier] || []);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMappings = mappings.filter(m =>
    m.originZip.includes(searchQuery) ||
    m.destinationZip.includes(searchQuery) ||
    m.zone.includes(searchQuery)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {mappings.length} zone mapping{mappings.length !== 1 ? 's' : ''} for {CARRIER_LABELS[carrier]}
        </p>
        <Button variant="secondary" size="sm">
          <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Import Zones
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by ZIP code or zone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-cyan"
        />
      </div>

      {/* Zone Mappings Table */}
      {filteredMappings.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Origin ZIP
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Destination ZIP
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Transit Days
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {filteredMappings.map((mapping) => (
                <tr key={mapping.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-text-primary">{mapping.originZip}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-text-primary">{mapping.destinationZip}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-cyan/10 text-brand-cyan font-semibold text-sm">
                      {mapping.zone}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-text-secondary">{mapping.transitDays} day{mapping.transitDays !== 1 ? 's' : ''}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {mappings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-1">No zone mappings</h3>
          <p className="text-text-secondary mb-4">Import zone data for {CARRIER_LABELS[carrier]} to calculate shipping rates</p>
          <Button variant="primary">Import Zone Chart</Button>
        </div>
      )}

      {/* Info */}
      {mappings.length > 0 && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <p className="text-sm text-blue-800">
                Zone mappings determine shipping rates based on origin and destination. Import the latest zone chart from {CARRIER_LABELS[carrier]} to ensure accurate pricing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
