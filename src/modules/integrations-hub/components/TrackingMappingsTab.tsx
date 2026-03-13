import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Toggle } from '../../../components/ui/Toggle';
import { Badge } from '../../../components/ui/Badge';
import { trackingMappingsApi } from '../../../api/trackingMappings';
import { carrierServiceMappingsApi } from '../../../api/carrierServiceMappings';
import { sampleTrackingMappings, sampleCarrierTypes } from '../../../api/sampleData';
import { CARRIER_LABELS, CARRIER_CODES } from '../types';
import type { CarrierType } from '../types';

interface TrackingMappingsTabProps {
  carrier: CarrierType;
}

export function TrackingMappingsTab({ carrier }: TrackingMappingsTabProps) {
  const queryClient = useQueryClient();
  const carrierCode = CARRIER_CODES[carrier];

  // Fetch carrier types to get the ID
  const { data: apiCarrierTypes, error: carrierTypesError } = useQuery({
    queryKey: ['carrierTypes'],
    queryFn: () => carrierServiceMappingsApi.getCarrierTypes(),
  });

  // Use sample data if API fails or returns non-array
  const useSampleCarrierTypes = !!carrierTypesError || !Array.isArray(apiCarrierTypes) || apiCarrierTypes.length === 0;
  const carrierTypes = useSampleCarrierTypes ? sampleCarrierTypes : apiCarrierTypes;

  const carrierTypeId = carrierTypes.find(ct => ct.code === carrierCode)?.id;

  // Fetch tracking mappings for this carrier
  const { data: apiMappings, isLoading, error: mappingsError } = useQuery({
    queryKey: ['trackingMappings', carrierTypeId],
    queryFn: () => trackingMappingsApi.getAll({ carrierIntegrationTypeId: carrierTypeId }),
    enabled: !!carrierTypeId,
  });

  // Use sample data if API fails or returns empty/non-array
  const useSampleData = !!mappingsError || (!isLoading && (!Array.isArray(apiMappings) || apiMappings.length === 0));
  const mappings = useSampleData
    ? sampleTrackingMappings.filter(m => m.carrierIntegrationTypeId === carrierTypeId)
    : (apiMappings ?? []);

  // Mutation for updating mappings
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { isActive?: boolean; triggerNotification?: boolean } }) => {
      const mapping = mappings.find(m => m.id === id);
      if (!mapping) throw new Error('Mapping not found');
      return trackingMappingsApi.update(id, {
        carrierStatusCode: mapping.carrierStatusCode,
        carrierDescription: mapping.carrierDescription,
        internalStatus: mapping.internalStatus,
        triggerNotification: data.triggerNotification ?? mapping.triggerNotification,
        isActive: data.isActive ?? mapping.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackingMappings', carrierTypeId] });
    },
  });

  const handleToggleActive = (id: number) => {
    const mapping = mappings.find(m => m.id === id);
    if (mapping) {
      updateMutation.mutate({ id, data: { isActive: !mapping.isActive } });
    }
  };

  const handleToggleNotification = (id: number) => {
    const mapping = mappings.find(m => m.id === id);
    if (mapping) {
      updateMutation.mutate({ id, data: { triggerNotification: !mapping.triggerNotification } });
    }
  };

  if (isLoading && !useSampleData) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {useSampleData && (
        <div className="text-xs text-amber-600 mb-2">
          Showing sample data - connect to backend for live data
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Map {CARRIER_LABELS[carrier]} tracking statuses to your internal statuses
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
              Tracking mappings translate carrier-specific status codes to your internal status system. Enable notifications to alert customers when specific statuses are received.
            </p>
          </div>
        </div>
      </div>

      {/* Mappings Table */}
      {mappings.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {CARRIER_LABELS[carrier]} Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Internal Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Notify
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {mappings.map((mapping) => (
                <tr
                  key={mapping.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    !mapping.isActive ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <code className="px-2 py-1 rounded bg-gray-100 text-sm font-mono text-text-primary">
                      {mapping.carrierStatusCode}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-text-secondary">{mapping.carrierDescription}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={
                      mapping.internalStatus.toLowerCase().includes('delivered') ? 'bg-green-100 text-green-700' :
                      mapping.internalStatus.toLowerCase().includes('out for delivery') ? 'bg-blue-100 text-blue-700' :
                      mapping.internalStatus.toLowerCase().includes('transit') ? 'bg-gray-100 text-gray-700' :
                      mapping.internalStatus.toLowerCase().includes('exception') ? 'bg-red-100 text-red-700' :
                      mapping.internalStatus.toLowerCase().includes('cancelled') ? 'bg-gray-100 text-gray-700' :
                      'bg-amber-100 text-amber-700'
                    }>
                      {mapping.internalStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleNotification(mapping.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        mapping.triggerNotification
                          ? 'text-brand-cyan bg-brand-cyan/10'
                          : 'text-text-muted hover:bg-gray-100'
                      }`}
                      title={mapping.triggerNotification ? 'Notification enabled' : 'Notification disabled'}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Toggle
                      checked={mapping.isActive}
                      onChange={() => handleToggleActive(mapping.id)}
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
      {mappings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-1">No tracking mappings</h3>
          <p className="text-text-secondary mb-4">Configure tracking status mappings for {CARRIER_LABELS[carrier]}</p>
        </div>
      )}

      {/* Other Mappings Placeholder */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
            Other Mappings
          </h3>
          <span className="text-xs px-2 py-1 rounded-full bg-brand-cyan/10 text-brand-cyan font-medium">
            Coming Soon
          </span>
        </div>
        <div className="p-6 rounded-xl border border-dashed border-border bg-gray-50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-secondary-purple/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-secondary-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v18M3 12h18" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-text-primary mb-1">Custom Field Mappings</h4>
              <p className="text-sm text-text-muted mb-3">
                Configure additional field mappings beyond service types and tracking statuses.
                Map carrier-specific fields to your internal system for package types, payment terms,
                and other custom data.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded bg-gray-200 text-text-secondary">Package Types</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-200 text-text-secondary">Payment Terms</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-200 text-text-secondary">Accessorial Codes</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-200 text-text-secondary">Custom Fields</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
