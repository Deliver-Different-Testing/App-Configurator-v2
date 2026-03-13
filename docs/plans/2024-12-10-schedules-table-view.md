# Schedules Table + Side Panel Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current expand-in-place schedule list with a dense table view + persistent side panel for editing, supporting 10,000+ schedules efficiently.

**Architecture:**
- Left side: Dense data table with tree hierarchy (base schedules + nested overrides)
- Right side: Persistent detail/edit panel that shows selected schedule
- Smart filters: By customer, depot, route, status
- Improved override system: More overridable fields, better client-specific handling

**Tech Stack:** React 18, TypeScript, Tailwind CSS (existing stack)

---

## Overview

### Current Problems
1. **Sparse layout** - Only ~5 schedules visible, 30-40% whitespace
2. **Vertical explosion** - Expanding shows 7 sections, 1000+ pixels tall
3. **Limited overrides** - Only 5 fields overridable
4. **No quick actions** - Must expand to see/edit anything
5. **Flat search** - Can't filter by customer, depot, route effectively

### New Design
```
┌──────────────────────────────────────────┬─────────────────────────────────┐
│ SCHEDULE TABLE (left ~60%)               │ DETAIL PANEL (right ~40%)       │
│ ┌────────────────────────────────────┐   │                                 │
│ │ [Search...]  Status▼  Depot▼  Type▼│   │  Selected: DEN→ABQ Overnight    │
│ └────────────────────────────────────┘   │  ───────────────────────────    │
│ NAME          │ROUTE    │MODE  │CLIENTS  │  [Chain visualization]          │
│───────────────┼─────────┼──────┼─────────│                                 │
│ ● 1-Hour Local│DEN→Local│Fixed │All      │  Quick Edit:                    │
│ ● Next Day Std│DEN→ABQ  │Window│All      │  Cutoff: [2hr ▼] [Edit]         │
│ ▸ DEN→ABQ O/N │DEN→ABQ  │Window│All      │  Days: Mon-Fri [Edit]           │
│   └─ ACME     │  "      │  "   │ACME     │  Status: ● Active               │
│   └─ BigCo    │  "      │  "   │BigCo    │                                 │
│ ● Express     │DEN→Local│Fixed │All      │  [Full Edit] [+ Override]       │
│                                          │                                 │
│ Showing 6 of 847 │ ◀ 1 2 3 ... 85 ▶     │                                 │
└──────────────────────────────────────────┴─────────────────────────────────┘
```

---

## Task 1: Create ScheduleTableRow Type and Helpers

**Files:**
- Modify: `src/modules/schedules/types.ts`

**Step 1: Add new types for table display**

Add to the end of `types.ts`:

```typescript
// ============================================
// TABLE VIEW TYPES
// ============================================

export interface ScheduleTableRow {
  id: string;
  name: string;
  route: string;
  legCount: number;
  bookingMode: BookingMode;
  clientDisplay: string;  // "All" or "ACME, BigCo" or "3 clients"
  status: 'active' | 'inactive';
  isOverride: boolean;
  baseScheduleId?: string;
  overrideCount: number;  // Number of child overrides (for base schedules)
  depth: number;          // 0 for base, 1 for override
  schedule: Schedule;     // Full schedule reference for detail panel
}

export function scheduleToTableRow(
  schedule: Schedule,
  depots: DepotReference[],
  clients: ClientReference[],
  overrideCount: number = 0
): ScheduleTableRow {
  // Client display logic
  let clientDisplay = 'All';
  if (schedule.clientVisibility === 'specific') {
    if (schedule.clientIds.length === 1) {
      const client = clients.find(c => c.id === schedule.clientIds[0]);
      clientDisplay = client?.shortName || client?.name || 'Unknown';
    } else if (schedule.clientIds.length <= 3) {
      clientDisplay = schedule.clientIds
        .map(id => {
          const client = clients.find(c => c.id === id);
          return client?.shortName || client?.name || '?';
        })
        .join(', ');
    } else {
      clientDisplay = `${schedule.clientIds.length} clients`;
    }
  }

  return {
    id: schedule.id,
    name: schedule.name,
    route: getRouteDescription(schedule, depots),
    legCount: schedule.legs.length,
    bookingMode: schedule.bookingMode,
    clientDisplay,
    status: schedule.isActive ? 'active' : 'inactive',
    isOverride: schedule.isOverride,
    baseScheduleId: schedule.baseScheduleId,
    overrideCount,
    depth: schedule.isOverride ? 1 : 0,
    schedule,
  };
}

export function buildScheduleTableData(
  schedules: Schedule[],
  depots: DepotReference[],
  clients: ClientReference[]
): ScheduleTableRow[] {
  const rows: ScheduleTableRow[] = [];

  // Group: base schedules with their overrides
  const baseSchedules = schedules.filter(s => !s.isOverride);
  const overrides = schedules.filter(s => s.isOverride);

  baseSchedules.forEach(base => {
    const childOverrides = overrides.filter(o => o.baseScheduleId === base.id);

    // Add base schedule row
    rows.push(scheduleToTableRow(base, depots, clients, childOverrides.length));

    // Add override rows (indented)
    childOverrides.forEach(override => {
      rows.push(scheduleToTableRow(override, depots, clients, 0));
    });
  });

  return rows;
}
```

**Step 2: Verify TypeScript compiles**

Run: `cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui" && npx tsc --noEmit`

Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/schedules/types.ts
git commit -m "feat(schedules): add ScheduleTableRow type and helpers for table view"
```

---

## Task 2: Create ScheduleDetailPanel Component

**Files:**
- Create: `src/modules/schedules/components/ScheduleDetailPanel.tsx`

**Step 1: Create the detail panel component**

```typescript
// src/modules/schedules/components/ScheduleDetailPanel.tsx
import { useState } from 'react';
import { X, Edit2, Plus, Copy } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Toggle } from '../../../components/ui/Toggle';
import { ChainBuilder } from './ChainBuilder';
import type { Schedule } from '../types';
import { getBookingModeLabel, getActiveDaysSummary, getRouteDescription } from '../types';
import { sampleDepots, sampleSpeeds, sampleZones } from '../data/sampleData';

interface ScheduleDetailPanelProps {
  schedule: Schedule | null;
  onClose: () => void;
  onEdit: (schedule: Schedule) => void;
  onCreateOverride: (baseSchedule: Schedule) => void;
  onDuplicate: (schedule: Schedule) => void;
  onToggleActive: (schedule: Schedule, active: boolean) => void;
}

export function ScheduleDetailPanel({
  schedule,
  onClose,
  onEdit,
  onCreateOverride,
  onDuplicate,
  onToggleActive,
}: ScheduleDetailPanelProps) {
  if (!schedule) {
    return (
      <div className="h-full flex items-center justify-center bg-surface-light border-l border-border">
        <div className="text-center text-text-muted p-8">
          <div className="text-4xl mb-4">📋</div>
          <p>Select a schedule to view details</p>
        </div>
      </div>
    );
  }

  const route = getRouteDescription(schedule, sampleDepots);
  const days = getActiveDaysSummary(schedule.operatingSchedule);
  const mode = getBookingModeLabel(schedule.bookingMode);

  return (
    <div className="h-full flex flex-col bg-white border-l border-border">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border bg-surface-light">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-text-primary truncate">
              {schedule.name}
            </h2>
            {schedule.isOverride && (
              <Badge variant="system">Override</Badge>
            )}
          </div>
          <p className="text-sm text-text-secondary">{route}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-surface-cream rounded transition-colors"
        >
          <X className="w-5 h-5 text-text-muted" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-light rounded-lg p-3">
            <div className="text-xs text-text-muted uppercase mb-1">Mode</div>
            <div className="text-sm font-medium text-text-primary">{mode}</div>
          </div>
          <div className="bg-surface-light rounded-lg p-3">
            <div className="text-xs text-text-muted uppercase mb-1">Days</div>
            <div className="text-sm font-medium text-text-primary">{days}</div>
          </div>
          <div className="bg-surface-light rounded-lg p-3">
            <div className="text-xs text-text-muted uppercase mb-1">Cutoff</div>
            <div className="text-sm font-medium text-text-primary">
              {schedule.operatingSchedule.cutoffValue} {schedule.operatingSchedule.cutoffUnit}
            </div>
          </div>
          <div className="bg-surface-light rounded-lg p-3">
            <div className="text-xs text-text-muted uppercase mb-1">Legs</div>
            <div className="text-sm font-medium text-text-primary">{schedule.legs.length}</div>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
          <span className="text-sm font-medium text-text-primary">Active</span>
          <Toggle
            checked={schedule.isActive}
            onChange={(checked) => onToggleActive(schedule, checked)}
          />
        </div>

        {/* Chain Preview */}
        <div className="border border-border rounded-lg p-3">
          <h3 className="text-sm font-medium text-text-primary mb-3">Route Chain</h3>
          <div className="transform scale-90 origin-top-left">
            <ChainBuilder
              schedule={schedule}
              selectedLegId={null}
              onSelectLeg={() => {}}
              onAddLeg={() => {}}
              onRemoveLeg={() => {}}
              depots={sampleDepots}
              speeds={sampleSpeeds}
              zones={sampleZones}
              readOnly
            />
          </div>
        </div>

        {/* Client Visibility */}
        <div className="border border-border rounded-lg p-3">
          <h3 className="text-sm font-medium text-text-primary mb-2">Clients</h3>
          <div className="text-sm text-text-secondary">
            {schedule.clientVisibility === 'all' ? (
              'Available to all clients'
            ) : (
              <div className="flex flex-wrap gap-1">
                {schedule.clientIds.map((id) => (
                  <span
                    key={id}
                    className="px-2 py-0.5 bg-brand-cyan/10 text-brand-cyan text-xs rounded"
                  >
                    {id}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Override Info */}
        {schedule.isOverride && schedule.overriddenFields.length > 0 && (
          <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Overridden Fields</h3>
            <div className="flex flex-wrap gap-1">
              {schedule.overriddenFields.map((field) => (
                <span
                  key={field}
                  className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-surface-light">
        <div className="flex gap-2">
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => onEdit(schedule)}
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
          {!schedule.isOverride && (
            <Button
              variant="secondary"
              onClick={() => onCreateOverride(schedule)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Override
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => onDuplicate(schedule)}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Update ChainBuilder to support readOnly mode**

Modify `src/modules/schedules/components/ChainBuilder.tsx` - add `readOnly?: boolean` prop and conditionally disable interactions.

**Step 3: Verify TypeScript compiles**

Run: `cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui" && npx tsc --noEmit`

Expected: No errors

**Step 4: Commit**

```bash
git add src/modules/schedules/components/ScheduleDetailPanel.tsx src/modules/schedules/components/ChainBuilder.tsx
git commit -m "feat(schedules): add ScheduleDetailPanel component for side panel view"
```

---

## Task 3: Create ScheduleTable Component

**Files:**
- Create: `src/modules/schedules/components/ScheduleTable.tsx`

**Step 1: Create the table component**

```typescript
// src/modules/schedules/components/ScheduleTable.tsx
import { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { SearchInput } from '../../../components/filters/SearchInput';
import { FilterDropdown } from '../../../components/filters/FilterDropdown';
import type { Schedule, ScheduleTableRow, ScheduleFilterState } from '../types';
import { buildScheduleTableData, getBookingModeLabel } from '../types';
import { sampleDepots, sampleClients, scheduleFilterOptions } from '../data/sampleData';

interface ScheduleTableProps {
  schedules: Schedule[];
  selectedId: string | null;
  onSelectSchedule: (schedule: Schedule) => void;
  collapsedBaseIds: Set<string>;
  onToggleCollapse: (baseId: string) => void;
}

export function ScheduleTable({
  schedules,
  selectedId,
  onSelectSchedule,
  collapsedBaseIds,
  onToggleCollapse,
}: ScheduleTableProps) {
  const [filters, setFilters] = useState<ScheduleFilterState>({
    search: '',
    status: 'all',
    type: 'all',
    clientId: 'all',
    originDepotId: 'all',
    destinationDepotId: 'all',
  });

  // Build table data
  const allRows = useMemo(() => {
    return buildScheduleTableData(schedules, sampleDepots, sampleClients);
  }, [schedules]);

  // Apply filters
  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!row.name.toLowerCase().includes(searchLower) &&
            !row.route.toLowerCase().includes(searchLower) &&
            !row.clientDisplay.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== 'all' && row.status !== filters.status) {
        return false;
      }

      // Type filter
      if (filters.type === 'base' && row.isOverride) return false;
      if (filters.type === 'override' && !row.isOverride) return false;

      return true;
    });
  }, [allRows, filters]);

  // Apply collapse state
  const visibleRows = useMemo(() => {
    return filteredRows.filter((row) => {
      // If this is an override, check if parent is collapsed
      if (row.isOverride && row.baseScheduleId) {
        return !collapsedBaseIds.has(row.baseScheduleId);
      }
      return true;
    });
  }, [filteredRows, collapsedBaseIds]);

  // Filter options
  const statusOptions = ['All Status', 'Active', 'Inactive'];
  const typeOptions = ['All Types', 'Base Schedules', 'Overrides'];
  const depotOptions = ['All Depots', ...sampleDepots.map((d) => d.name)];

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-3 border-b border-border bg-surface-light space-y-2">
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilters((f) => ({ ...f, search: value }))}
          placeholder="Search schedules, routes, clients..."
        />
        <div className="flex items-center gap-2 flex-wrap">
          <FilterDropdown
            id="status"
            label="Status"
            options={statusOptions}
            selectedValues={filters.status === 'all' ? [] : [filters.status === 'active' ? 'Active' : 'Inactive']}
            onChange={(values) => {
              const v = values[0];
              setFilters((f) => ({
                ...f,
                status: !v || v === 'All Status' ? 'all' : v === 'Active' ? 'active' : 'inactive',
              }));
            }}
          />
          <FilterDropdown
            id="type"
            label="Type"
            options={typeOptions}
            selectedValues={
              filters.type === 'all'
                ? []
                : [filters.type === 'base' ? 'Base Schedules' : 'Overrides']
            }
            onChange={(values) => {
              const v = values[0];
              setFilters((f) => ({
                ...f,
                type: !v || v === 'All Types' ? 'all' : v === 'Base Schedules' ? 'base' : 'override',
              }));
            }}
          />
          <FilterDropdown
            id="depot"
            label="Depot"
            options={depotOptions}
            selectedValues={[]}
            onChange={() => {}}
          />
        </div>
        <div className="text-xs text-text-muted">
          Showing {visibleRows.length} of {schedules.length} schedules
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-light sticky top-0 z-10">
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-medium text-text-muted uppercase text-xs w-8"></th>
              <th className="text-left py-2 px-3 font-medium text-text-muted uppercase text-xs">Name</th>
              <th className="text-left py-2 px-3 font-medium text-text-muted uppercase text-xs">Route</th>
              <th className="text-left py-2 px-3 font-medium text-text-muted uppercase text-xs">Mode</th>
              <th className="text-left py-2 px-3 font-medium text-text-muted uppercase text-xs">Clients</th>
              <th className="text-left py-2 px-3 font-medium text-text-muted uppercase text-xs">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const isSelected = selectedId === row.id;
              const hasOverrides = !row.isOverride && row.overrideCount > 0;
              const isCollapsed = hasOverrides && collapsedBaseIds.has(row.id);

              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectSchedule(row.schedule)}
                  className={`
                    border-b border-border cursor-pointer transition-colors
                    ${isSelected ? 'bg-brand-cyan/10 border-l-2 border-l-brand-cyan' : 'hover:bg-surface-cream'}
                    ${row.depth > 0 ? 'bg-surface-cream/50' : ''}
                  `}
                >
                  {/* Expand/Collapse */}
                  <td className="py-2 px-3">
                    {hasOverrides ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCollapse(row.id);
                        }}
                        className="p-0.5 hover:bg-surface-cream rounded"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-text-muted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-text-muted" />
                        )}
                      </button>
                    ) : row.depth > 0 ? (
                      <span className="text-text-muted ml-2">└</span>
                    ) : null}
                  </td>

                  {/* Name */}
                  <td className={`py-2 px-3 font-medium text-text-primary ${row.depth > 0 ? 'pl-6' : ''}`}>
                    <div className="flex items-center gap-2">
                      {row.name}
                      {row.isOverride && (
                        <Badge variant="system" className="text-xs">Override</Badge>
                      )}
                      {hasOverrides && (
                        <span className="text-xs text-text-muted">
                          +{row.overrideCount}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Route */}
                  <td className="py-2 px-3 text-text-secondary">
                    {row.isOverride ? '—' : row.route}
                  </td>

                  {/* Mode */}
                  <td className="py-2 px-3 text-text-secondary">
                    {row.isOverride ? '—' : getBookingModeLabel(row.bookingMode)}
                  </td>

                  {/* Clients */}
                  <td className="py-2 px-3 text-text-secondary">
                    {row.clientDisplay}
                  </td>

                  {/* Status */}
                  <td className="py-2 px-3">
                    <Badge variant={row.status === 'active' ? 'customized' : 'default'}>
                      {row.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {visibleRows.length === 0 && (
          <div className="py-12 text-center text-text-muted">
            No schedules found matching your filters
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui" && npx tsc --noEmit`

Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/schedules/components/ScheduleTable.tsx
git commit -m "feat(schedules): add ScheduleTable component with hierarchical rows"
```

---

## Task 4: Create New ScheduleTableView Layout

**Files:**
- Create: `src/modules/schedules/components/ScheduleTableView.tsx`

**Step 1: Create the main layout component**

```typescript
// src/modules/schedules/components/ScheduleTableView.tsx
import { useState, useCallback } from 'react';
import { ScheduleTable } from './ScheduleTable';
import { ScheduleDetailPanel } from './ScheduleDetailPanel';
import { ScheduleEditForm } from './ScheduleEditForm';
import { OverrideEditor } from './OverrideEditor';
import { Modal } from '../../../components/ui/Modal';
import type { Schedule } from '../types';
import { sampleSchedules } from '../data/sampleData';

interface ScheduleTableViewProps {
  onConnectionsClick: (sourceItem: any, connections: any) => void;
}

export function ScheduleTableView({ onConnectionsClick }: ScheduleTableViewProps) {
  const [schedules, setSchedules] = useState<Schedule[]>(sampleSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [collapsedBaseIds, setCollapsedBaseIds] = useState<Set<string>>(new Set());

  // Edit modal state
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<'full' | 'override'>('full');

  const handleSelectSchedule = useCallback((schedule: Schedule) => {
    setSelectedSchedule(schedule);
  }, []);

  const handleToggleCollapse = useCallback((baseId: string) => {
    setCollapsedBaseIds((prev) => {
      const next = new Set(prev);
      if (next.has(baseId)) {
        next.delete(baseId);
      } else {
        next.add(baseId);
      }
      return next;
    });
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedSchedule(null);
  }, []);

  const handleEdit = useCallback((schedule: Schedule) => {
    setEditingSchedule(schedule);
    setEditMode(schedule.isOverride ? 'override' : 'full');
    setIsEditModalOpen(true);
  }, []);

  const handleCreateOverride = useCallback((baseSchedule: Schedule) => {
    // Create a new override schedule based on the base
    const newOverride: Schedule = {
      ...baseSchedule,
      id: `override-${Date.now()}`,
      name: `${baseSchedule.name} (New Override)`,
      isOverride: true,
      baseScheduleId: baseSchedule.id,
      overriddenFields: [],
      clientVisibility: 'specific',
      clientIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingSchedule(newOverride);
    setEditMode('override');
    setIsEditModalOpen(true);
  }, []);

  const handleDuplicate = useCallback((schedule: Schedule) => {
    const duplicate: Schedule = {
      ...schedule,
      id: `dup-${Date.now()}`,
      name: `${schedule.name} (Copy)`,
      isOverride: false,
      baseScheduleId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingSchedule(duplicate);
    setEditMode('full');
    setIsEditModalOpen(true);
  }, []);

  const handleToggleActive = useCallback((schedule: Schedule, active: boolean) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === schedule.id ? { ...s, isActive: active } : s))
    );
    if (selectedSchedule?.id === schedule.id) {
      setSelectedSchedule({ ...schedule, isActive: active });
    }
  }, [selectedSchedule]);

  const handleSaveSchedule = useCallback((updatedSchedule: Schedule) => {
    setSchedules((prev) => {
      const exists = prev.some((s) => s.id === updatedSchedule.id);
      if (exists) {
        return prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s));
      } else {
        return [...prev, updatedSchedule];
      }
    });
    setIsEditModalOpen(false);
    setEditingSchedule(null);
    setSelectedSchedule(updatedSchedule);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingSchedule(null);
  }, []);

  // Find base schedule for override editing
  const baseScheduleForOverride = editingSchedule?.isOverride
    ? schedules.find((s) => s.id === editingSchedule.baseScheduleId) || null
    : null;

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px]">
      {/* Left: Table */}
      <div className={`flex-1 border-r border-border ${selectedSchedule ? 'w-3/5' : 'w-full'}`}>
        <ScheduleTable
          schedules={schedules}
          selectedId={selectedSchedule?.id || null}
          onSelectSchedule={handleSelectSchedule}
          collapsedBaseIds={collapsedBaseIds}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* Right: Detail Panel */}
      {selectedSchedule && (
        <div className="w-2/5 min-w-[350px] max-w-[500px]">
          <ScheduleDetailPanel
            schedule={selectedSchedule}
            onClose={handleClosePanel}
            onEdit={handleEdit}
            onCreateOverride={handleCreateOverride}
            onDuplicate={handleDuplicate}
            onToggleActive={handleToggleActive}
          />
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title={editingSchedule ? `Edit: ${editingSchedule.name}` : 'Edit Schedule'}
        size="xl"
      >
        {editingSchedule && editMode === 'full' && (
          <ScheduleEditForm
            schedule={editingSchedule}
            onSave={handleSaveSchedule}
            onCancel={handleCancelEdit}
            isNew={!schedules.some((s) => s.id === editingSchedule.id)}
          />
        )}
        {editingSchedule && editMode === 'override' && baseScheduleForOverride && (
          <OverrideEditor
            schedule={editingSchedule}
            baseSchedule={baseScheduleForOverride}
            onSave={handleSaveSchedule}
            onCancel={handleCancelEdit}
          />
        )}
      </Modal>
    </div>
  );
}
```

**Step 2: Create Modal component if it doesn't exist**

Check `src/components/ui/Modal.tsx` - if it exists, use it. If not, create a simple one:

```typescript
// src/components/ui/Modal.tsx
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw] max-h-[90vh]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-surface-cream rounded transition-colors"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Verify TypeScript compiles**

Run: `cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui" && npx tsc --noEmit`

Expected: No errors

**Step 4: Commit**

```bash
git add src/modules/schedules/components/ScheduleTableView.tsx src/components/ui/Modal.tsx
git commit -m "feat(schedules): add ScheduleTableView with split table/panel layout"
```

---

## Task 5: Update SchedulesPage to Use New Table View

**Files:**
- Modify: `src/modules/schedules/SchedulesPage.tsx`

**Step 1: Replace ScheduleListTab with ScheduleTableView**

```typescript
// src/modules/schedules/SchedulesPage.tsx
import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/layout/Tabs';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { TagSidebar } from '../../components/tags';
import { ScheduleTableView } from './components/ScheduleTableView';
import { ScheduleGroupsTab } from './components/ScheduleGroupsTab';
import type { SourceItem, EntityConnections } from '../territory/types';
import { createEmptyConnections } from '../territory/types';

const tabs = [
  { id: 'schedules', label: 'Schedules' },
  { id: 'groups', label: 'Schedule Groups' },
];

export function SchedulesPage() {
  const [activeTab, setActiveTab] = useState('schedules');
  const [tagSidebarOpen, setTagSidebarOpen] = useState(false);
  const [sidebarSourceItem, setSidebarSourceItem] = useState<SourceItem>({
    id: '',
    type: 'schedule',
    name: '',
  });
  const [sidebarConnections, setSidebarConnections] = useState<EntityConnections>(
    createEmptyConnections()
  );

  const handleConnectionsClick = (sourceItem: SourceItem, connections: EntityConnections) => {
    setSidebarSourceItem(sourceItem);
    setSidebarConnections(connections);
    setTagSidebarOpen(true);
  };

  const handleNavigate = (targetRoute: string, searchQuery: string) => {
    console.log('Navigate to', targetRoute, 'with search', searchQuery);
    setTagSidebarOpen(false);
  };

  const handleNewSchedule = () => {
    console.log('Create new schedule');
  };

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <PageHeader
          title="Schedules"
          subtitle="Configure delivery schedule templates and routing rules"
          actions={
            <Button variant="primary" onClick={handleNewSchedule}>
              + New Schedule
            </Button>
          }
        />
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6">
        <Card padding="none">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === 'schedules' && (
            <ScheduleTableView onConnectionsClick={handleConnectionsClick} />
          )}
          {activeTab === 'groups' && (
            <div className="p-4">
              <ScheduleGroupsTab onConnectionsClick={handleConnectionsClick} />
            </div>
          )}
        </Card>
      </div>

      {/* Tag Sidebar */}
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

export default SchedulesPage;
```

**Step 2: Verify TypeScript compiles**

Run: `cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui" && npx tsc --noEmit`

Expected: No errors

**Step 3: Test in browser**

Navigate to http://localhost:5174 and click on Schedules. Verify:
- Table view shows schedules in dense rows
- Clicking a row shows detail panel on right
- Expand/collapse works for schedules with overrides
- Edit button opens modal

**Step 4: Commit**

```bash
git add src/modules/schedules/SchedulesPage.tsx
git commit -m "feat(schedules): integrate table view into SchedulesPage"
```

---

## Task 6: Add readOnly Mode to ChainBuilder

**Files:**
- Modify: `src/modules/schedules/components/ChainBuilder.tsx`

**Step 1: Add readOnly prop**

Add the prop to the interface and conditionally disable all interactions:

```typescript
interface ChainBuilderProps {
  schedule: Schedule;
  selectedLegId: string | null;
  onSelectLeg: (legId: string | null) => void;
  onAddLeg: (afterLegId: string, type: LegType) => void;
  onRemoveLeg: (legId: string) => void;
  depots: DepotReference[];
  speeds: SpeedReference[];
  zones: ZoneReference[];
  readOnly?: boolean;  // NEW
}
```

In the component body, check `readOnly` before rendering add/remove buttons and before handling clicks.

**Step 2: Verify TypeScript compiles**

Run: `cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui" && npx tsc --noEmit`

Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/schedules/components/ChainBuilder.tsx
git commit -m "feat(schedules): add readOnly mode to ChainBuilder"
```

---

## Task 7: Expand Override System with More Fields

**Files:**
- Modify: `src/modules/schedules/types.ts`
- Modify: `src/modules/schedules/components/OverrideEditor.tsx`

**Step 1: Add more overridable fields to types.ts**

Update `OVERRIDABLE_FIELDS`:

```typescript
export const OVERRIDABLE_FIELDS: { field: string; label: string; category: string }[] = [
  // Timing
  { field: 'operatingSchedule.cutoffValue', label: 'Booking Cutoff', category: 'Timing' },
  { field: 'operatingSchedule.days', label: 'Operating Days', category: 'Timing' },
  { field: 'legs[0].config.pickupMinutesBefore', label: 'Pickup Offset', category: 'Timing' },

  // Speeds
  { field: 'defaultDeliverySpeedId', label: 'Delivery Speed', category: 'Speeds' },
  { field: 'defaultPickupSpeedId', label: 'Pickup Speed', category: 'Speeds' },
  { field: 'defaultLinehaulSpeedId', label: 'Linehaul Speed', category: 'Speeds' },

  // Zones (NEW)
  { field: 'legs[0].config.pickupZoneIds', label: 'Pickup Zones', category: 'Zones' },
  { field: 'legs[-1].config.deliveryZoneIds', label: 'Delivery Zones', category: 'Zones' },

  // Pricing (NEW)
  { field: 'legs[-1].config.rateCardId', label: 'Rate Card', category: 'Pricing' },
];
```

**Step 2: Update OverrideEditor to group fields by category**

Refactor the OverrideEditor to show fields grouped by category with collapsible sections.

**Step 3: Verify TypeScript compiles**

Run: `cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui" && npx tsc --noEmit`

**Step 4: Commit**

```bash
git add src/modules/schedules/types.ts src/modules/schedules/components/OverrideEditor.tsx
git commit -m "feat(schedules): expand override system with zones and pricing fields"
```

---

## Task 8: Final Polish and Testing

**Files:**
- Various

**Step 1: Update module exports**

Update `src/modules/schedules/index.ts` to export new components.

**Step 2: Test all flows**

- [ ] Table shows all schedules with proper hierarchy
- [ ] Clicking row shows detail panel
- [ ] Clicking Edit opens modal with full form
- [ ] Creating override from base schedule works
- [ ] Duplicating schedule works
- [ ] Toggle active status works
- [ ] Search filters work
- [ ] Status filter works
- [ ] Collapse/expand overrides works

**Step 3: Verify no TypeScript errors**

Run: `cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui" && npx tsc --noEmit`

**Step 4: Final commit**

```bash
git add .
git commit -m "feat(schedules): complete table view redesign with side panel"
```

---

## Summary

This plan transforms the Schedules module from an expand-in-place list to a table + side panel layout:

| Metric | Before | After |
|--------|--------|-------|
| Rows visible | ~5 | ~15-20 |
| Whitespace | 30-40% unused | Minimal |
| Edit flow | Expand → scroll | Click → panel |
| Override fields | 5 | 9+ |
| Find schedule | Search name only | Search + filter by customer/depot |

**Total Tasks:** 8
**Estimated Components:** 4 new, 3 modified
