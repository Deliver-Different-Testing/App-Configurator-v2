import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/layout/Tabs';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { FilterChips } from '../../components/filters/FilterChips';
import { FilterDropdown } from '../../components/filters/FilterDropdown';
import { SearchInput } from '../../components/filters/SearchInput';
import { TagSidebar } from '../../components/tags';
import { ZipZonesTab } from './components/ZipZonesTab';
import { ZoneGroupsTab } from './components/ZoneGroupsTab';
import { DepotsTab } from './components/DepotsTab';
import { zipZoneFilters } from './data/sampleData';
import type { SourceItem, EntityConnections } from './types';
import { createEmptyConnections } from './types';

export function TerritoryPage() {
  const [activeTab, setActiveTab] = useState('zip-zones');
  const [tagSidebarOpen, setTagSidebarOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  // State for the connection sidebar
  const [sidebarSourceItem, setSidebarSourceItem] = useState<SourceItem>({
    type: 'zipZone',
    id: '',
    name: '',
  });
  const [sidebarConnections, setSidebarConnections] = useState<EntityConnections>(createEmptyConnections());

  // Handle opening the sidebar for a specific item
  const handleConnectionsClick = (sourceItem: SourceItem, connections: EntityConnections) => {
    setSidebarSourceItem(sourceItem);
    setSidebarConnections(connections);
    setTagSidebarOpen(true);
  };

  // Handle navigation from the sidebar
  const handleNavigate = (targetRoute: string, searchQuery: string) => {
    // In a real app, this would use a router
    // For now, just log and update tag search
    console.log(`Navigate to ${targetRoute}?tagSearch=${searchQuery}`);
    setTagSearch(searchQuery);
    // Could also switch tabs based on route
    if (targetRoute.includes('tab=groups')) {
      setActiveTab('zone-groups');
    } else if (targetRoute.includes('tab=depots')) {
      setActiveTab('depots');
    }
  };

  const tabs = [
    { id: 'zip-zones', label: 'All Zip Zones' },
    { id: 'zone-groups', label: 'Zone Groups' },
    { id: 'depots', label: 'Depots/Locations' },
  ];

  const handleFilterChange = (filterId: string, values: string[]) => {
    setActiveFilters({ ...activeFilters, [filterId]: values });
  };

  const getFilterChips = () => {
    const chips: { category: string; value: string }[] = [];
    Object.entries(activeFilters).forEach(([category, values]) => {
      values.forEach((value) => {
        // Don't show "All X" chips
        if (!value.startsWith('All ')) {
          chips.push({ category, value });
        }
      });
    });
    return chips;
  };

  const handleRemoveChip = (category: string, value: string) => {
    const newValues = activeFilters[category]?.filter((v) => v !== value) || [];
    setActiveFilters({ ...activeFilters, [category]: newValues });
  };

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <PageHeader
          title="Territory & Locations"
          subtitle="Manage zip zones, zone groups, and depot locations"
          actions={
            <Button variant="primary">Add New</Button>
          }
        />
      </div>

      {/* Main Content Card */}
      <div className="px-6 pb-6">
        <Card padding="none">
          {/* Sub-tabs at top of card */}
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Search + Filters Section */}
          <div className="px-4 py-3 border-b border-border bg-white space-y-3">
            {/* Search Row - Full Width */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search zones, groups, or depots..."
            />

            {/* Filter Dropdowns Row */}
            {activeTab === 'zip-zones' && (
              <div className="flex items-center gap-2 flex-wrap">
                {zipZoneFilters.map((filter) => (
                  <FilterDropdown
                    key={filter.id}
                    id={filter.id}
                    label={filter.label}
                    options={filter.options}
                    selectedValues={activeFilters[filter.id] || []}
                    onChange={(values) => handleFilterChange(filter.id, values)}
                    multiSelect
                  />
                ))}

                {/* Tag/Connection Filter - integrated into filter row */}
                <div className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-md bg-white hover:border-gray-300 transition-colors">
                  <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <input
                    type="text"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="Connected entity..."
                    className="w-32 text-sm bg-transparent border-none outline-none placeholder:text-text-muted"
                  />
                </div>

                {(Object.values(activeFilters).some(v => v.length > 0) || tagSearch) && (
                  <button
                    onClick={() => {
                      setActiveFilters({});
                      setTagSearch('');
                    }}
                    className="text-sm text-text-muted hover:text-brand-cyan ml-2 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}

            {/* Active Filter Chips */}
            {getFilterChips().length > 0 && (
              <FilterChips
                chips={getFilterChips()}
                onRemove={handleRemoveChip}
                onClearAll={() => setActiveFilters({})}
              />
            )}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'zip-zones' && (
              <ZipZonesTab
                activeFilters={activeFilters}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'zone-groups' && (
              <ZoneGroupsTab onConnectionsClick={handleConnectionsClick} />
            )}

            {activeTab === 'depots' && (
              <DepotsTab onConnectionsClick={handleConnectionsClick} />
            )}
          </div>
        </Card>
      </div>

      {/* Tag Sidebar - Connection Navigator */}
      <TagSidebar
        isOpen={tagSidebarOpen}
        onClose={() => setTagSidebarOpen(false)}
        sourceItem={sidebarSourceItem}
        connections={sidebarConnections}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default TerritoryPage;
