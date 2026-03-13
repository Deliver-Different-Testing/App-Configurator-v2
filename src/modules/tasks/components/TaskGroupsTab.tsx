import { useState, useMemo } from 'react';
import { ExpandableRow } from '../../../components/data/ExpandableRow';
import { SearchInput } from '../../../components/filters/SearchInput';
import { FilterDropdown } from '../../../components/filters/FilterDropdown';
import { TaskGroupEditForm } from './TaskGroupEditForm';
import { sampleTaskGroups, sampleTasks, resolveTaskGroupItems } from '../data/sampleData';
import type { TaskGroup, TaskGroupFilterState } from '../types';
import type { SourceItem, EntityConnections } from '../../territory/types';
import { countConnectedCategories } from '../../territory/types';

interface TaskGroupsTabProps {
  onConnectionsClick: (sourceItem: SourceItem, connections: EntityConnections) => void;
}

export function TaskGroupsTab({ onConnectionsClick }: TaskGroupsTabProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>(
    // Resolve task references for display
    sampleTaskGroups.map((group) => resolveTaskGroupItems(group, sampleTasks))
  );

  // Filter state
  const [filters, setFilters] = useState<TaskGroupFilterState>({
    status: 'all',
    search: '',
  });

  // Filter the task groups based on current filters
  const filteredTaskGroups = useMemo(() => {
    return taskGroups.filter((group) => {
      // Status filter
      if (filters.status !== 'all') {
        const isActive = filters.status === 'active';
        if (group.isActive !== isActive) {
          return false;
        }
      }

      // Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesSearch =
          group.name.toLowerCase().includes(query) ||
          group.description?.toLowerCase().includes(query);
        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });
  }, [taskGroups, filters]);

  // Handle task group update from edit form
  const handleTaskGroupUpdate = (updatedGroup: TaskGroup) => {
    setTaskGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  };

  // Build filter options
  const statusOptions = ['All Status', 'Active', 'Inactive'];

  // Handle status filter change
  const handleStatusChange = (values: string[]) => {
    const value = values[0];
    if (!value || value === 'All Status') {
      setFilters((prev) => ({ ...prev, status: 'all' }));
    } else if (value === 'Active') {
      setFilters((prev) => ({ ...prev, status: 'active' }));
    } else {
      setFilters((prev) => ({ ...prev, status: 'inactive' }));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      search: '',
    });
  };

  const hasActiveFilters = filters.status !== 'all' || filters.search !== '';

  // Get selected status for dropdown
  const getSelectedStatus = (): string[] => {
    if (filters.status === 'all') return [];
    return filters.status === 'active' ? ['Active'] : ['Inactive'];
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="space-y-3">
        {/* Search Row */}
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
          placeholder="Search task groups by name or description..."
        />

        {/* Filter Dropdowns Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <FilterDropdown
            id="status"
            label="Status"
            options={statusOptions}
            selectedValues={getSelectedStatus()}
            onChange={handleStatusChange}
          />

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-text-muted hover:text-brand-cyan ml-2 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-text-secondary">
        Showing {filteredTaskGroups.length} of {taskGroups.length} task groups
      </div>

      {/* Task Groups List */}
      <div className="space-y-2">
        {filteredTaskGroups.map((group) => (
          <ExpandableRow
            key={group.id}
            id={group.id}
            name={group.name}
            badge={{
              text: group.isActive ? 'Active' : 'Inactive',
              variant: group.isActive ? 'customized' : 'system',
            }}
            stats={[
              {
                label: 'Tasks',
                value: group.items.length.toString(),
              },
            ]}
            connectionCount={countConnectedCategories(group.connections)}
            hasConnectionIssues={false}
            isExpanded={expandedItem === group.id}
            onToggle={() =>
              setExpandedItem(expandedItem === group.id ? null : group.id)
            }
            onConnectionsClick={() =>
              onConnectionsClick(
                { type: 'service', id: group.id, name: group.name },
                group.connections
              )
            }
          >
            <TaskGroupEditForm
              taskGroup={group}
              availableTasks={sampleTasks}
              onSave={handleTaskGroupUpdate}
              onCancel={() => setExpandedItem(null)}
            />
          </ExpandableRow>
        ))}

        {filteredTaskGroups.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            No task groups found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
