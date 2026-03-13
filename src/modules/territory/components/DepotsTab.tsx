import { useState } from 'react';
import { ExpandableRow } from '../../../components/data/ExpandableRow';
import { DataTable } from '../../../components/data/DataTable';
import { FilterBar } from '../../../components/filters/FilterBar';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { depotsData, zoneGroupsData, depotZoneGroupFilters, zoneGroupColumns, sampleDepotConnections } from '../data/sampleData';
import type { Depot, ZoneGroup, SourceItem, EntityConnections } from '../types';

interface DepotsTabProps {
  onConnectionsClick: (sourceItem: SourceItem, connections: EntityConnections) => void;
}

export function DepotsTab({ onConnectionsClick }: DepotsTabProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>('d1');

  // State for depot zone group filters (per depot)
  const [depotFilters, setDepotFilters] = useState<Record<string, Record<string, string[]>>>({});

  // State for selected zone groups (per depot)
  const [selectedZoneGroupsForDepot, setSelectedZoneGroupsForDepot] = useState<Record<string, Set<string>>>({});

  // Handle filter change for a specific depot
  const handleDepotFilterChange = (depotId: string, filterId: string, values: string[]) => {
    setDepotFilters(prev => ({
      ...prev,
      [depotId]: {
        ...prev[depotId],
        [filterId]: values,
      },
    }));
  };

  // Clear filters for a specific depot
  const clearDepotFilters = (depotId: string) => {
    setDepotFilters(prev => ({
      ...prev,
      [depotId]: {},
    }));
  };

  // Get filtered zone groups for a specific depot
  const getFilteredZoneGroupsForDepot = (depotId: string): ZoneGroup[] => {
    const filters = depotFilters[depotId] || {};

    return zoneGroupsData.filter((group: ZoneGroup) => {
      // Apply filters
      for (const [filterId, values] of Object.entries(filters)) {
        if (values.length === 0) continue;
        const nonAllValues = values.filter(v => !v.startsWith('All '));
        if (nonAllValues.length === 0) continue;

        if (filterId === 'region' && !nonAllValues.includes(group.region)) {
          return false;
        }
        // Other filter logic can be added here
      }

      return true;
    });
  };

  // Handle zone group selection for a depot
  const handleZoneGroupSelection = (depotId: string, ids: Set<string>) => {
    setSelectedZoneGroupsForDepot(prev => ({
      ...prev,
      [depotId]: ids,
    }));
  };

  return (
    <div className="space-y-2">
      {depotsData.map((depot: Depot) => {
        const filteredZoneGroups = getFilteredZoneGroupsForDepot(depot.id);
        const selectedZoneGroups = selectedZoneGroupsForDepot[depot.id] || new Set();

        return (
          <ExpandableRow
            key={depot.id}
            id={depot.id}
            name={depot.name}
            badge={{
              text: depot.status === 'active' ? 'Active' : 'Inactive',
              variant: depot.status === 'active' ? 'customized' : 'system',
            }}
            stats={[
              { label: 'City', value: depot.city },
              { label: 'State', value: depot.state },
            ]}
            connectionCount={sampleDepotConnections[depot.id]?.connectedCount ?? 0}
            hasConnectionIssues={sampleDepotConnections[depot.id]?.hasIssues ?? false}
            isExpanded={expandedItem === depot.id}
            onToggle={() => setExpandedItem(expandedItem === depot.id ? null : depot.id)}
            onConnectionsClick={() => onConnectionsClick(
              { type: 'depot', id: depot.id, name: depot.name },
              sampleDepotConnections[depot.id]?.connections ?? {} as EntityConnections
            )}
          >
            <div className="p-6 bg-surface-cream space-y-4">
              {/* Depot Details Form */}
              <div className="grid grid-cols-2 gap-4">
                <Input label="Depot Name" defaultValue={depot.name} />
                <Input label="Address" defaultValue={depot.address} />
                <Input label="City" defaultValue={depot.city} />
                <Input label="State" defaultValue={depot.state} />
                <Input label="ZIP Code" defaultValue={depot.zip} />
                <Input label="Phone" type="tel" defaultValue={depot.phone} placeholder="+1 (555) 123-4567" />
                <Input label="Email" type="email" defaultValue={depot.email} className="col-span-2" />
              </div>

              {/* 4 Zone Group Filters */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-text-primary mb-3">Zone Group Filters</h4>
                <FilterBar
                  filters={depotZoneGroupFilters}
                  activeFilters={depotFilters[depot.id] || {}}
                  onFilterChange={(filterId, values) => handleDepotFilterChange(depot.id, filterId, values)}
                  onClear={() => clearDepotFilters(depot.id)}
                />
              </div>

              {/* Zone Groups Table */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-text-primary">
                    Associated Zone Groups ({selectedZoneGroups.size} selected)
                  </h4>
                  <span className="text-sm text-text-secondary">
                    {filteredZoneGroups.length} groups available
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
                  <DataTable
                    columns={zoneGroupColumns}
                    data={filteredZoneGroups}
                    selectable
                    selectedIds={selectedZoneGroups}
                    onSelectionChange={(ids) => handleZoneGroupSelection(depot.id, ids)}
                    pagination={{ page: 1, pageSize: 10, total: filteredZoneGroups.length }}
                  />
                </div>
              </div>

              {/* Drop-off Locations */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-text-primary">Drop-off Locations</h4>
                  <Button variant="secondary" size="sm">Add Location</Button>
                </div>
                <div className="space-y-2">
                  {depot.dropOffLocations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-border"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">{location.name}</p>
                        <p className="text-xs text-text-secondary">{location.address}</p>
                        {location.hours && (
                          <p className="text-xs text-text-muted">Hours: {location.hours}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">Remove</Button>
                      </div>
                    </div>
                  ))}
                  {depot.dropOffLocations.length === 0 && (
                    <p className="text-sm text-text-secondary text-center py-4">
                      No drop-off locations added yet
                    </p>
                  )}
                </div>
              </div>

              {/* Status Badge & Save/Cancel */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    depot.status === 'active'
                      ? 'bg-success/10 text-success'
                      : 'bg-text-muted/10 text-text-muted'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      depot.status === 'active' ? 'bg-success' : 'bg-text-muted'
                    }`} />
                    {depot.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="save" size="sm">Save Changes</Button>
                  <Button variant="secondary" size="sm">Cancel</Button>
                  <Button variant="danger" size="sm">Delete Depot</Button>
                </div>
              </div>
            </div>
          </ExpandableRow>
        );
      })}
    </div>
  );
}
