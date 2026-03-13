import { useState, useMemo } from 'react';
import { DataTable } from '../../../components/data/DataTable';
import { Button } from '../../../components/ui/Button';
import { zipZonesData, zipZoneColumns } from '../data/sampleData';
import type { ZipZone } from '../types';

interface ZipZonesTabProps {
  activeFilters: Record<string, string[]>;
  searchQuery: string;
}

const PAGE_SIZE = 15;

export function ZipZonesTab({ activeFilters, searchQuery }: ZipZonesTabProps) {
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Filter zip zones based on active filters and search query
  const filteredZones = useMemo(() => {
    return zipZonesData.filter((zone: ZipZone) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          zone.zip.toLowerCase().includes(query) ||
          zone.zoneName.toLowerCase().includes(query) ||
          zone.zoneNumber.toLowerCase().includes(query) ||
          zone.depot.toLowerCase().includes(query) ||
          zone.customer.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Apply active filters
      for (const [filterId, values] of Object.entries(activeFilters)) {
        if (values.length === 0) continue;
        // Skip "All" options
        const nonAllValues = values.filter(v => !v.startsWith('All '));
        if (nonAllValues.length === 0) continue;

        const zoneValue = zone[filterId as keyof ZipZone];
        if (typeof zoneValue === 'string' && !nonAllValues.includes(zoneValue)) {
          return false;
        }
      }

      return true;
    });
  }, [activeFilters, searchQuery]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [activeFilters, searchQuery]);

  // Paginate the data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredZones.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredZones, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <DataTable
      columns={zipZoneColumns}
      data={paginatedData}
      selectable
      selectedIds={selectedZones}
      onSelectionChange={setSelectedZones}
      pagination={{ page: currentPage, pageSize: PAGE_SIZE, total: filteredZones.length }}
      onPageChange={handlePageChange}
      actions={() => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm">Delete</Button>
        </div>
      )}
    />
  );
}
