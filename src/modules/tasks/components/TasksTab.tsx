import { useState, useMemo } from 'react';
import { ExpandableRow } from '../../../components/data/ExpandableRow';
import { SearchInput } from '../../../components/filters/SearchInput';
import { FilterDropdown } from '../../../components/filters/FilterDropdown';
import { TaskEditForm } from './TaskEditForm';
import { sampleTasks } from '../data/sampleData';
import type {
  Task,
  TaskFilterState,
} from '../types';
import {
  TASK_CATEGORIES,
  PROCESS_TARGETS,
  formatOffset,
  getCategoryLabel,
  getProcessTargetIcons,
} from '../types';
import type { SourceItem, EntityConnections } from '../../territory/types';
import { countConnectedCategories } from '../../territory/types';

interface TasksTabProps {
  onConnectionsClick: (sourceItem: SourceItem, connections: EntityConnections) => void;
}

export function TasksTab({ onConnectionsClick }: TasksTabProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);

  // Filter state
  const [filters, setFilters] = useState<TaskFilterState>({
    category: 'all',
    processTarget: 'all',
    status: 'all',
    search: '',
  });

  // Filter the tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Category filter
      if (filters.category !== 'all' && task.category !== filters.category) {
        return false;
      }

      // Process target filter
      if (filters.processTarget !== 'all' && !task.processTargets.includes(filters.processTarget)) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        const isActive = filters.status === 'active';
        if (task.isActive !== isActive) {
          return false;
        }
      }

      // Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesSearch =
          task.name.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.category?.toLowerCase().includes(query);
        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  // Handle task update from edit form
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  // Build filter options
  const categoryOptions = ['All Categories', ...TASK_CATEGORIES.map((c) => c.label)];
  const processTargetOptions = ['All Targets', ...PROCESS_TARGETS.map((p) => p.label)];
  const statusOptions = ['All Status', 'Active', 'Inactive'];

  // Convert selected filter value back to internal representation
  const handleCategoryChange = (values: string[]) => {
    const value = values[0];
    if (!value || value === 'All Categories') {
      setFilters((prev) => ({ ...prev, category: 'all' }));
    } else {
      const found = TASK_CATEGORIES.find((c) => c.label === value);
      setFilters((prev) => ({ ...prev, category: found?.value || 'all' }));
    }
  };

  const handleProcessTargetChange = (values: string[]) => {
    const value = values[0];
    if (!value || value === 'All Targets') {
      setFilters((prev) => ({ ...prev, processTarget: 'all' }));
    } else {
      const found = PROCESS_TARGETS.find((p) => p.label === value);
      setFilters((prev) => ({ ...prev, processTarget: found?.value || 'all' }));
    }
  };

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
      category: 'all',
      processTarget: 'all',
      status: 'all',
      search: '',
    });
  };

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.processTarget !== 'all' ||
    filters.status !== 'all' ||
    filters.search !== '';

  // Get selected values for dropdowns
  const getSelectedCategory = (): string[] => {
    if (filters.category === 'all') return [];
    const found = TASK_CATEGORIES.find((c) => c.value === filters.category);
    return found ? [found.label] : [];
  };

  const getSelectedProcessTarget = (): string[] => {
    if (filters.processTarget === 'all') return [];
    const found = PROCESS_TARGETS.find((p) => p.value === filters.processTarget);
    return found ? [found.label] : [];
  };

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
          placeholder="Search tasks by name or description..."
        />

        {/* Filter Dropdowns Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <FilterDropdown
            id="category"
            label="Category"
            options={categoryOptions}
            selectedValues={getSelectedCategory()}
            onChange={handleCategoryChange}
          />

          <FilterDropdown
            id="processTarget"
            label="Process Target"
            options={processTargetOptions}
            selectedValues={getSelectedProcessTarget()}
            onChange={handleProcessTargetChange}
          />

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
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => (
          <ExpandableRow
            key={task.id}
            id={task.id}
            name={task.name}
            badge={
              task.category
                ? {
                    text: getCategoryLabel(task.category),
                    variant: task.isActive ? 'customized' : 'system',
                  }
                : undefined
            }
            stats={[
              {
                label: 'Targets',
                value: getProcessTargetIcons(task.processTargets) || '—',
              },
              {
                label: 'Offset',
                value: formatOffset(task.defaultOffsetMinutes),
              },
              ...(task.isAutoComplete
                ? [{ label: '', value: 'Auto' }]
                : []),
            ]}
            connectionCount={countConnectedCategories(task.connections)}
            hasConnectionIssues={false}
            isExpanded={expandedItem === task.id}
            onToggle={() =>
              setExpandedItem(expandedItem === task.id ? null : task.id)
            }
            onConnectionsClick={() =>
              onConnectionsClick(
                { type: 'service', id: task.id, name: task.name }, // Using 'service' as closest match for now
                task.connections
              )
            }
          >
            <TaskEditForm
              task={task}
              onSave={handleTaskUpdate}
              onCancel={() => setExpandedItem(null)}
            />
          </ExpandableRow>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            No tasks found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
