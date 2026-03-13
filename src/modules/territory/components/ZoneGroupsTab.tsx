import { useState } from 'react';
import { ExpandableRow } from '../../../components/data/ExpandableRow';
import { DataTable } from '../../../components/data/DataTable';
import { FilterBar } from '../../../components/filters/FilterBar';
import { SearchInput } from '../../../components/filters/SearchInput';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { zoneGroupsData, zipZonesData, zipZoneFilters, zipSelectionColumns, sampleZoneGroupConnections } from '../data/sampleData';
import type { ZoneGroup, ZipZone, SourceItem, EntityConnections } from '../types';

interface ZoneGroupsTabProps {
  onConnectionsClick: (sourceItem: SourceItem, connections: EntityConnections) => void;
}

export function ZoneGroupsTab({ onConnectionsClick }: ZoneGroupsTabProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>('g1');

  // State for zone group filters (per group)
  const [zoneGroupFilters, setZoneGroupFilters] = useState<Record<string, Record<string, string[]>>>({});

  // State for master search (per group)
  const [zoneGroupSearch, setZoneGroupSearch] = useState<Record<string, string>>({});

  // State for selected zips (per group)
  const [selectedZipsForGroup, setSelectedZipsForGroup] = useState<Record<string, Set<string>>>({});

  // Handle filter change for a specific group
  const handleZoneGroupFilterChange = (groupId: string, filterId: string, values: string[]) => {
    setZoneGroupFilters(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [filterId]: values,
      },
    }));
  };

  // Clear filters for a specific group
  const clearZoneGroupFilters = (groupId: string) => {
    setZoneGroupFilters(prev => ({
      ...prev,
      [groupId]: {},
    }));
  };

  // Get filtered zips for a specific group
  const getFilteredZipsForGroup = (groupId: string): ZipZone[] => {
    const groupFilters = zoneGroupFilters[groupId] || {};
    const searchQuery = zoneGroupSearch[groupId] || '';

    return zipZonesData.filter((zone: ZipZone) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          zone.zip.toLowerCase().includes(query) ||
          zone.zoneName.toLowerCase().includes(query) ||
          zone.zoneNumber.toLowerCase().includes(query) ||
          zone.depot.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Apply group-specific filters
      for (const [filterId, values] of Object.entries(groupFilters)) {
        if (values.length === 0) continue;
        const nonAllValues = values.filter(v => !v.startsWith('All '));
        if (nonAllValues.length === 0) continue;

        const zoneValue = zone[filterId as keyof ZipZone];
        if (typeof zoneValue === 'string' && !nonAllValues.includes(zoneValue)) {
          return false;
        }
      }

      return true;
    });
  };

  // Handle zip selection for a group
  const handleZipSelection = (groupId: string, ids: Set<string>) => {
    setSelectedZipsForGroup(prev => ({
      ...prev,
      [groupId]: ids,
    }));
  };

  return (
    <div className="space-y-2">
      {zoneGroupsData.map((group: ZoneGroup) => {
        const filteredZips = getFilteredZipsForGroup(group.id);
        const selectedZips = selectedZipsForGroup[group.id] || new Set();

        return (
          <ExpandableRow
            key={group.id}
            id={group.id}
            name={group.name}
            badge={{
              text: group.status === 'active' ? 'Active' : 'Inactive',
              variant: group.status === 'active' ? 'customized' : 'system',
            }}
            stats={[
              { label: 'Zones', value: group.zipCount },
              { label: 'Region', value: group.region },
            ]}
            connectionCount={sampleZoneGroupConnections[group.id]?.connectedCount ?? 0}
            hasConnectionIssues={sampleZoneGroupConnections[group.id]?.hasIssues ?? false}
            isExpanded={expandedItem === group.id}
            onToggle={() => setExpandedItem(expandedItem === group.id ? null : group.id)}
            onConnectionsClick={() => onConnectionsClick(
              { type: 'zoneGroup', id: group.id, name: group.name },
              sampleZoneGroupConnections[group.id]?.connections ?? {} as EntityConnections
            )}
          >
            <div className="p-6 bg-surface-cream space-y-4">
              {/* Group Name Input */}
              <Input label="Group Name" defaultValue={group.name} />

              {/* 9 Filters Section */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-text-primary mb-3">Zone Filters</h4>
                <FilterBar
                  filters={zipZoneFilters}
                  activeFilters={zoneGroupFilters[group.id] || {}}
                  onFilterChange={(filterId, values) => handleZoneGroupFilterChange(group.id, filterId, values)}
                  onClear={() => clearZoneGroupFilters(group.id)}
                />
              </div>

              {/* Master Search */}
              <div className="border-t border-border pt-4">
                <SearchInput
                  value={zoneGroupSearch[group.id] || ''}
                  onChange={(value) => setZoneGroupSearch(prev => ({ ...prev, [group.id]: value }))}
                  placeholder="Search zips, zones, depots..."
                />
              </div>

              {/* Zip Selection Table */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-text-primary">
                    Select Zip Zones ({selectedZips.size} selected)
                  </h4>
                  <span className="text-sm text-text-secondary">
                    Showing {filteredZips.length} of {zipZonesData.length} zones
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto border border-border rounded-lg">
                  <DataTable
                    columns={zipSelectionColumns}
                    data={filteredZips}
                    selectable
                    selectedIds={selectedZips}
                    onSelectionChange={(ids) => handleZipSelection(group.id, ids)}
                    pagination={{ page: 1, pageSize: 10, total: filteredZips.length }}
                  />
                </div>
              </div>

              {/* Save/Cancel */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    group.status === 'active'
                      ? 'bg-success/10 text-success'
                      : 'bg-text-muted/10 text-text-muted'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      group.status === 'active' ? 'bg-success' : 'bg-text-muted'
                    }`} />
                    {group.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="save" size="sm">Save Changes</Button>
                  <Button variant="secondary" size="sm">Cancel</Button>
                </div>
              </div>
            </div>
          </ExpandableRow>
        );
      })}
    </div>
  );
}
