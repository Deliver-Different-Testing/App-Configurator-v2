import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Toggle } from '../../../components/ui/Toggle';
import { ConnectionBadge } from '../../../components/tags';
import { carrierServiceMappingsApi } from '../../../api/carrierServiceMappings';
import { sampleServiceMappings, sampleCarrierTypes } from '../../../api/sampleData';
import { sampleServiceMappingConnections } from '../data/sampleData';
import { CARRIER_LABELS, CARRIER_CODES, createEmptyConnections, countConnectedCategories } from '../types';
import type { CarrierType, EntityConnections, SourceItem } from '../types';

interface ServiceMappingsTabProps {
  carrier: CarrierType;
  onConnectionsClick?: (sourceItem: SourceItem, connections: EntityConnections) => void;
}

export function ServiceMappingsTab({ carrier, onConnectionsClick }: ServiceMappingsTabProps) {
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

  // Fetch service mappings for this carrier
  const { data: apiMappings, isLoading, error: mappingsError } = useQuery({
    queryKey: ['serviceMappings', carrierTypeId],
    queryFn: () => carrierServiceMappingsApi.getAll({ carrierIntegrationTypeId: carrierTypeId }),
    enabled: !!carrierTypeId,
  });

  // Use sample data if API fails or returns empty/non-array
  const useSampleData = !!mappingsError || (!isLoading && (!Array.isArray(apiMappings) || apiMappings.length === 0));
  const mappings = useSampleData
    ? sampleServiceMappings.filter(m => m.carrierIntegrationTypeId === carrierTypeId)
    : (apiMappings ?? []);

  // Mutation for updating mapping status
  const updateMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => {
      const mapping = mappings.find(m => m.id === id);
      if (!mapping) throw new Error('Mapping not found');
      return carrierServiceMappingsApi.update(id, {
        carrierServiceCode: mapping.carrierServiceCode,
        carrierServiceName: mapping.carrierServiceName,
        dimFactor: mapping.dimFactor,
        isDefault: mapping.isDefault,
        isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceMappings', carrierTypeId] });
    },
  });

  const handleToggleActive = (id: number, currentActive: boolean) => {
    updateMutation.mutate({ id, isActive: !currentActive });
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
          {mappings.length} service mapping{mappings.length !== 1 ? 's' : ''} for {CARRIER_LABELS[carrier]}
        </p>
      </div>

      {/* Mappings Table */}
      {mappings.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Job Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {CARRIER_LABELS[carrier]} Service
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Service Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  DIM Factor
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Default
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Connections
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Status
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
                    <span className="font-medium text-text-primary">{mapping.jobTypeName || `Job Type #${mapping.jobTypeId}`}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-text-secondary">{mapping.carrierServiceName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="px-2 py-1 rounded bg-gray-100 text-xs font-mono text-text-secondary">
                      {mapping.carrierServiceCode}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-text-secondary">{mapping.dimFactor}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {mapping.isDefault && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-cyan/10 text-brand-cyan">
                        Default
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {onConnectionsClick && (() => {
                      const connData = sampleServiceMappingConnections[String(mapping.id)];
                      const connections = connData?.connections || createEmptyConnections();
                      const connectedCount = connData?.connectedCount || countConnectedCategories(connections);
                      return (
                        <ConnectionBadge
                          connectionCount={connectedCount}
                          hasIssues={connData?.hasIssues || false}
                          onClick={() => onConnectionsClick(
                            { type: 'service', id: String(mapping.id), name: `${mapping.jobTypeName || 'Job Type'} → ${mapping.carrierServiceName}` },
                            connections
                          )}
                          size="sm"
                        />
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Toggle
                      checked={mapping.isActive}
                      onChange={() => handleToggleActive(mapping.id, mapping.isActive)}
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
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-1">No service mappings</h3>
          <p className="text-text-secondary mb-4">Map your job types to {CARRIER_LABELS[carrier]} services</p>
        </div>
      )}
    </div>
  );
}
