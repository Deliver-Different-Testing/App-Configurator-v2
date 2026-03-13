# Schedules Panel Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the schedules module panel to fix layout responsiveness, add sortable headers, implement DEFAULT/CLIENTS tabs with proper client override workflow, and integrate the tag/connections system.

**Architecture:** Replace percentage-based layout with flex-grow pattern. Panel gets DEFAULT and CLIENTS tabs - DEFAULT shows base schedule editing, CLIENTS tab has client search with override indicator and purple-tinted edit mode. Table headers become clickable for sorting.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide icons

---

## Problem Summary

1. **Layout Bug:** Table doesn't fill container width - massive white gap before panel
2. **No Sorting:** Table headers aren't clickable
3. **Confusing Panel:** Flat hierarchy, new users don't understand sections
4. **Broken Override Flow:** No way to select which client an override is for
5. **Missing Tags:** ConnectionBadge not visible in panel

## Design Decisions

- **Layout:** Table uses `flex-1`, panel uses fixed width (`w-[450px]` view, `w-[600px]` edit)
- **Client Override Mode:** Purple left border (`border-l-4 border-brand-purple`) + light purple background (`bg-brand-purple/5`)
- **Sorting:** Click header cycles: none → asc → desc → none. ChevronUp/Down icons.
- **Panel Tabs:** "Default" and "Clients" tabs below header, above content
- **Copy Override:** Opens client picker, then switches to that client with values pre-filled

---

## Task Overview

| # | Task | Files | Est. |
|---|------|-------|------|
| 1 | Fix table layout - flex-grow pattern | ScheduleTableView.tsx | 5 min |
| 2 | Add sort state and logic to ScheduleTable | ScheduleTable.tsx, types.ts | 10 min |
| 3 | Make table headers clickable with sort indicators | ScheduleTable.tsx | 10 min |
| 4 | Create PanelTabs component | PanelTabs.tsx (new) | 5 min |
| 5 | Create ClientSearch component | ClientSearch.tsx (new) | 10 min |
| 6 | Create ClientOverrideEditor wrapper | ClientOverrideEditor.tsx (new) | 15 min |
| 7 | Restructure ScheduleDetailPanel with tabs | ScheduleDetailPanel.tsx | 20 min |
| 8 | Add ConnectionBadge to panel header | ScheduleDetailPanel.tsx | 5 min |
| 9 | Wire up client override flow in ScheduleTableView | ScheduleTableView.tsx | 15 min |
| 10 | Add "Copy to Client" functionality | ClientOverrideEditor.tsx | 10 min |
| 11 | Update sample data with more client overrides | sampleData.ts | 5 min |
| 12 | Final integration and testing | All files | 10 min |

**Total: ~2 hours**

---

## Task 1: Fix Table Layout - Flex-Grow Pattern

**Files:**
- Modify: `src/modules/schedules/components/ScheduleTableView.tsx`

**Problem:** Current layout uses percentages (`w-[55%]`, `w-[45%]`) which don't properly fill container when panel has max-width constraint.

**Step 1: Update layout classes**

Replace the width calculation functions and layout div classes:

```typescript
// REMOVE these functions (lines 124-134):
// const getTableWidth = () => { ... }
// const getPanelWidth = () => { ... }

// REPLACE the return JSX (starting line 136):
return (
  <div className="flex h-[calc(100vh-200px)] min-h-[500px]">
    {/* Left: Table - grows to fill available space */}
    <div className={`
      flex-1 min-w-[400px] overflow-hidden
      border-r border-border
      transition-all duration-200
    `}>
      <ScheduleTable
        schedules={schedules}
        selectedId={selectedSchedule?.id || null}
        onSelectSchedule={handleSelectSchedule}
        collapsedBaseIds={collapsedBaseIds}
        onToggleCollapse={handleToggleCollapse}
      />
    </div>

    {/* Right: Detail/Edit Panel - fixed width */}
    {showPanel && (
      <div className={`
        ${isEditing ? 'w-[600px]' : 'w-[450px]'}
        flex-shrink-0
        transition-all duration-200
        flex flex-col h-full overflow-hidden
      `}>
        {/* ... rest of panel content unchanged ... */}
      </div>
    )}
  </div>
);
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/schedules/components/ScheduleTableView.tsx
git commit -m "fix: use flex-grow layout pattern for table/panel split

Table now uses flex-1 to fill available space, panel uses fixed width.
Eliminates white space gap between table and panel."
```

---

## Task 2: Add Sort State and Logic to ScheduleTable

**Files:**
- Modify: `src/modules/schedules/types.ts` (add SortConfig type)
- Modify: `src/modules/schedules/components/ScheduleTable.tsx` (add state and sorting)

**Step 1: Add SortConfig type to types.ts**

Add after line 276 (after ScheduleFilterState):

```typescript
// ============================================
// SORT CONFIGURATION
// ============================================

export type SortDirection = 'asc' | 'desc';

export type SortableColumn =
  | 'name'
  | 'originDepot'
  | 'destDepot'
  | 'speedDisplay'
  | 'bookingMode'
  | 'clientDisplay'
  | 'status';

export interface SortConfig {
  column: SortableColumn;
  direction: SortDirection;
}
```

**Step 2: Add sort state and sorting logic to ScheduleTable.tsx**

Add imports at top:

```typescript
import type { Schedule, ScheduleFilterState, SortConfig, SortableColumn, SortDirection } from '../types';
```

Add state after filters state (around line 34):

```typescript
const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
```

Add sort handler after filter state:

```typescript
const handleSort = (column: SortableColumn) => {
  setSortConfig((prev) => {
    if (!prev || prev.column !== column) {
      // New column or no previous sort: start with ascending
      return { column, direction: 'asc' };
    }
    if (prev.direction === 'asc') {
      // Was ascending: switch to descending
      return { column, direction: 'desc' };
    }
    // Was descending: clear sort
    return null;
  });
};
```

Add sorted rows computation after filteredRows (around line 65):

```typescript
// Apply sorting
const sortedRows = useMemo(() => {
  if (!sortConfig) return filteredRows;

  const { column, direction } = sortConfig;
  const multiplier = direction === 'asc' ? 1 : -1;

  return [...filteredRows].sort((a, b) => {
    // Keep base schedules and their overrides grouped
    // Only sort among base schedules, overrides stay under their parent
    if (a.isOverride !== b.isOverride) {
      // Don't reorder base vs override
      if (a.baseScheduleId === b.id) return 1; // a is override of b
      if (b.baseScheduleId === a.id) return -1; // b is override of a
    }

    // Both are base schedules or both are overrides of different bases
    let aVal = a[column] ?? '';
    let bVal = b[column] ?? '';

    // Handle booleans
    if (typeof aVal === 'boolean') {
      aVal = aVal ? 1 : 0;
      bVal = bVal ? 1 : 0;
    }

    // String comparison
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * multiplier;
    }

    // Number comparison
    return ((aVal as number) - (bVal as number)) * multiplier;
  });
}, [filteredRows, sortConfig]);
```

Update visibleRows to use sortedRows:

```typescript
// Apply collapse state
const visibleRows = useMemo(() => {
  return sortedRows.filter((row) => {  // Changed from filteredRows
    if (row.isOverride && row.baseScheduleId) {
      return !collapsedBaseIds.has(row.baseScheduleId);
    }
    return true;
  });
}, [sortedRows, collapsedBaseIds]);  // Changed dependency
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/modules/schedules/types.ts src/modules/schedules/components/ScheduleTable.tsx
git commit -m "feat: add sort state and logic to ScheduleTable

- Add SortConfig, SortableColumn, SortDirection types
- Add sortConfig state and handleSort function
- Sort maintains base/override grouping
- Cycles: none -> asc -> desc -> none"
```

---

## Task 3: Make Table Headers Clickable with Sort Indicators

**Files:**
- Modify: `src/modules/schedules/components/ScheduleTable.tsx`

**Step 1: Add ChevronUp, ChevronDown to imports**

Update lucide-react import:

```typescript
import { ChevronRight, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
```

**Step 2: Create SortableHeader helper component**

Add inside ScheduleTable function, before the return statement:

```typescript
// Sortable header helper
const SortableHeader = ({
  column,
  children,
  className = ''
}: {
  column: SortableColumn;
  children: React.ReactNode;
  className?: string;
}) => {
  const isActive = sortConfig?.column === column;
  const direction = isActive ? sortConfig.direction : null;

  return (
    <th
      onClick={() => handleSort(column)}
      className={`
        text-left py-2 px-2 font-medium text-text-muted uppercase text-xs
        cursor-pointer hover:text-text-primary hover:bg-surface-cream
        select-none transition-colors
        ${isActive ? 'text-brand-dark bg-brand-cyan/5' : ''}
        ${className}
      `}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        <span className="w-4 h-4 flex items-center justify-center">
          {direction === 'asc' && <ChevronUp className="w-3 h-3" />}
          {direction === 'desc' && <ChevronDown className="w-3 h-3" />}
        </span>
      </div>
    </th>
  );
};
```

**Step 3: Replace table headers with SortableHeader**

Replace the `<thead>` section (around lines 138-149):

```typescript
<thead className="bg-surface-light sticky top-0 z-10">
  <tr className="border-b border-border">
    {/* Expand column - not sortable */}
    <th className="text-left py-2 px-2 font-medium text-text-muted uppercase text-xs w-10"></th>

    <SortableHeader column="name" className="w-[25%]">Name</SortableHeader>
    <SortableHeader column="originDepot" className="w-[10%]">Origin</SortableHeader>
    <SortableHeader column="destDepot" className="w-[10%]">Dest</SortableHeader>

    {/* LH column - not sortable (boolean, less useful) */}
    <th className="text-center py-2 px-2 font-medium text-text-muted uppercase text-xs w-12">LH</th>

    <SortableHeader column="speedDisplay" className="w-[10%]">Speed</SortableHeader>
    <SortableHeader column="bookingMode" className="w-[12%]">Mode</SortableHeader>
    <SortableHeader column="clientDisplay" className="w-[18%]">Clients</SortableHeader>
    <SortableHeader column="status" className="text-center w-16">Status</SortableHeader>
  </tr>
</thead>
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/modules/schedules/components/ScheduleTable.tsx
git commit -m "feat: add clickable sortable headers to schedule table

- Headers show hover state and active state when sorting
- Sort indicator chevron (up/down) shown on active column
- Non-sortable columns: expand toggle, linehaul boolean"
```

---

## Task 4: Create PanelTabs Component

**Files:**
- Create: `src/modules/schedules/components/PanelTabs.tsx`

**Step 1: Create the component file**

```typescript
// src/modules/schedules/components/PanelTabs.tsx
import { ReactNode } from 'react';

export type PanelTab = 'default' | 'clients';

interface PanelTabsProps {
  activeTab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  /** Optional badge count for clients tab (number of overrides) */
  clientOverrideCount?: number;
}

export function PanelTabs({ activeTab, onTabChange, clientOverrideCount }: PanelTabsProps) {
  const tabs: { id: PanelTab; label: string; badge?: number }[] = [
    { id: 'default', label: 'Default' },
    { id: 'clients', label: 'Clients', badge: clientOverrideCount },
  ];

  return (
    <div className="flex border-b border-border bg-surface-light">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-4 py-2.5 text-sm font-medium transition-colors relative
            ${activeTab === tab.id
              ? 'text-brand-dark border-b-2 border-brand-cyan -mb-px bg-white'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-cream'
            }
          `}
        >
          <span className="flex items-center gap-2">
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-brand-purple/10 text-brand-purple">
                {tab.badge}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/schedules/components/PanelTabs.tsx
git commit -m "feat: create PanelTabs component for Default/Clients tabs

- Two tabs: Default and Clients
- Active tab has cyan underline
- Clients tab shows badge count of existing overrides"
```

---

## Task 5: Create ClientSearch Component

**Files:**
- Create: `src/modules/schedules/components/ClientSearch.tsx`

**Step 1: Create the component file**

```typescript
// src/modules/schedules/components/ClientSearch.tsx
import { useState, useMemo } from 'react';
import { Search, Check, X } from 'lucide-react';
import type { ClientReference, Schedule } from '../types';

interface ClientSearchProps {
  clients: ClientReference[];
  schedules: Schedule[]; // To check which clients have overrides
  baseScheduleId: string;
  selectedClientId: string | null;
  onSelectClient: (clientId: string | null) => void;
}

export function ClientSearch({
  clients,
  schedules,
  baseScheduleId,
  selectedClientId,
  onSelectClient,
}: ClientSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Find which clients have overrides for this base schedule
  const clientsWithOverrides = useMemo(() => {
    const overrideClientIds = new Set<string>();
    schedules.forEach((s) => {
      if (s.isOverride && s.baseScheduleId === baseScheduleId) {
        s.clientIds.forEach((cid) => overrideClientIds.add(cid));
      }
    });
    return overrideClientIds;
  }, [schedules, baseScheduleId]);

  // Filter clients by search
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.shortName?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  // Get override schedule for a client (if exists)
  const getClientOverride = (clientId: string): Schedule | undefined => {
    return schedules.find(
      (s) =>
        s.isOverride &&
        s.baseScheduleId === baseScheduleId &&
        s.clientIds.includes(clientId)
    );
  };

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent
                     bg-white placeholder-text-muted"
        />
      </div>

      {/* Client list */}
      <div className="max-h-[200px] overflow-y-auto border border-border rounded-lg divide-y divide-border">
        {filteredClients.length === 0 ? (
          <div className="p-3 text-sm text-text-muted text-center">
            No clients found
          </div>
        ) : (
          filteredClients.map((client) => {
            const hasOverride = clientsWithOverrides.has(client.id);
            const isSelected = selectedClientId === client.id;
            const override = hasOverride ? getClientOverride(client.id) : undefined;

            return (
              <button
                key={client.id}
                onClick={() => onSelectClient(isSelected ? null : client.id)}
                className={`
                  w-full px-3 py-2.5 text-left text-sm transition-colors
                  flex items-center justify-between
                  ${isSelected
                    ? 'bg-brand-cyan/10 border-l-2 border-l-brand-cyan'
                    : 'hover:bg-surface-cream'
                  }
                `}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-text-primary truncate">
                    {client.name}
                  </span>
                  {client.shortName && (
                    <span className="text-text-muted text-xs">
                      ({client.shortName})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasOverride ? (
                    <span className="flex items-center gap-1 text-xs text-brand-purple">
                      <Check className="w-3 h-3" />
                      Override
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted">
                      No override
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Selected client info */}
      {selectedClientId && (
        <div className="text-xs text-text-muted">
          {clientsWithOverrides.has(selectedClientId)
            ? 'Click to edit existing override'
            : 'Click to create new override for this client'
          }
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/schedules/components/ClientSearch.tsx
git commit -m "feat: create ClientSearch component for client selection

- Search input filters client list
- Shows override indicator (check/no override) per client
- Selected state with cyan highlight
- Indicates whether editing existing or creating new"
```

---

## Task 6: Create ClientOverrideEditor Wrapper

**Files:**
- Create: `src/modules/schedules/components/ClientOverrideEditor.tsx`

This wraps the existing OverrideEditor with:
- Purple client-mode visual styling
- Client name prominently displayed
- "Copy to Another Client" button

**Step 1: Create the component file**

```typescript
// src/modules/schedules/components/ClientOverrideEditor.tsx
import { useState } from 'react';
import { Copy, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { OverrideEditor } from './OverrideEditor';
import { ClientSearch } from './ClientSearch';
import type { Schedule, ClientReference } from '../types';

interface ClientOverrideEditorProps {
  /** The override schedule being edited (or new override with base values) */
  schedule: Schedule;
  /** The base schedule this overrides */
  baseSchedule: Schedule;
  /** The client this override is for */
  client: ClientReference;
  /** All clients for copy-to feature */
  allClients: ClientReference[];
  /** All schedules to check for existing overrides */
  allSchedules: Schedule[];
  onSave: (schedule: Schedule) => void;
  onCancel: () => void;
  /** Called when user wants to copy this override to another client */
  onCopyToClient: (targetClientId: string, sourceSchedule: Schedule) => void;
}

export function ClientOverrideEditor({
  schedule,
  baseSchedule,
  client,
  allClients,
  allSchedules,
  onSave,
  onCancel,
  onCopyToClient,
}: ClientOverrideEditorProps) {
  const [showCopyPicker, setShowCopyPicker] = useState(false);
  const [copyTargetClientId, setCopyTargetClientId] = useState<string | null>(null);

  const isNewOverride = !allSchedules.some((s) => s.id === schedule.id);

  // Filter out current client from copy targets
  const copyTargetClients = allClients.filter((c) => c.id !== client.id);

  const handleCopyConfirm = () => {
    if (copyTargetClientId) {
      onCopyToClient(copyTargetClientId, schedule);
      setShowCopyPicker(false);
      setCopyTargetClientId(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Client Override Banner - Purple themed */}
      <div className="border-l-4 border-brand-purple bg-brand-purple/5 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-brand-purple flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-brand-dark">
              {isNewOverride ? 'Creating Override for:' : 'Editing Override for:'}
            </h3>
            <p className="text-lg font-bold text-brand-purple">{client.name}</p>
            <p className="text-xs text-text-muted mt-1">
              Changes here only affect this client, not the default schedule.
            </p>
          </div>
        </div>
      </div>

      {/* Override Editor */}
      <div className="flex-1 overflow-y-auto">
        <OverrideEditor
          schedule={schedule}
          baseSchedule={baseSchedule}
          onSave={onSave}
          onCancel={onCancel}
        />
      </div>

      {/* Copy to Another Client section */}
      {!isNewOverride && (
        <div className="border-t border-border p-4 bg-surface-light">
          {!showCopyPicker ? (
            <Button
              variant="secondary"
              onClick={() => setShowCopyPicker(true)}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Override to Another Client
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-medium text-text-primary">
                Select client to copy this override to:
              </div>
              <ClientSearch
                clients={copyTargetClients}
                schedules={allSchedules}
                baseScheduleId={baseSchedule.id}
                selectedClientId={copyTargetClientId}
                onSelectClient={setCopyTargetClientId}
              />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCopyPicker(false);
                    setCopyTargetClientId(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCopyConfirm}
                  disabled={!copyTargetClientId}
                  className="flex-1"
                >
                  Copy & Edit
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/schedules/components/ClientOverrideEditor.tsx
git commit -m "feat: create ClientOverrideEditor with purple client-mode styling

- Purple left border and background tint for visual distinction
- Prominent client name display
- 'Copy to Another Client' feature with client picker
- Wraps existing OverrideEditor"
```

---

## Task 7: Restructure ScheduleDetailPanel with Tabs

**Files:**
- Modify: `src/modules/schedules/components/ScheduleDetailPanel.tsx`

This is the largest change. We're restructuring the panel to:
1. Move ChainBuilder higher (right after header)
2. Add DEFAULT/CLIENTS tabs
3. Show client search in CLIENTS tab
4. Better section headings

**Step 1: Update imports**

```typescript
// src/modules/schedules/components/ScheduleDetailPanel.tsx
import { useState, useMemo } from 'react';
import { X, Edit2, Plus, Copy, Link2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Toggle } from '../../../components/ui/Toggle';
import { ConnectionBadge } from '../../../components/tags/ConnectionBadge';
import { ChainBuilder } from './ChainBuilder';
import { PanelTabs, PanelTab } from './PanelTabs';
import { ClientSearch } from './ClientSearch';
import type { Schedule, ClientReference, EntityConnections } from '../types';
import { getBookingModeLabel, getActiveDaysSummary, getRouteDescription } from '../types';
import { sampleDepots, sampleSpeeds, sampleZones, sampleClients } from '../data/sampleData';
```

**Step 2: Update props interface**

```typescript
interface ScheduleDetailPanelProps {
  schedule: Schedule | null;
  /** All schedules (needed for checking client overrides) */
  allSchedules: Schedule[];
  onClose: () => void;
  onEdit: (schedule: Schedule) => void;
  onCreateOverride: (baseSchedule: Schedule) => void;
  onDuplicate: (schedule: Schedule) => void;
  onToggleActive: (schedule: Schedule, active: boolean) => void;
  /** Called when user wants to edit/create a client-specific override */
  onEditClientOverride: (baseSchedule: Schedule, clientId: string) => void;
  /** Called when ConnectionBadge is clicked */
  onConnectionsClick: (schedule: Schedule) => void;
}
```

**Step 3: Replace the entire component body**

```typescript
export function ScheduleDetailPanel({
  schedule,
  allSchedules,
  onClose,
  onEdit,
  onCreateOverride,
  onDuplicate,
  onToggleActive,
  onEditClientOverride,
  onConnectionsClick,
}: ScheduleDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('default');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

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

  // For overrides, we show the override itself, not tabs
  if (schedule.isOverride) {
    return renderOverrideView();
  }

  const route = getRouteDescription(schedule, sampleDepots);
  const days = getActiveDaysSummary(schedule.operatingSchedule);
  const mode = getBookingModeLabel(schedule.bookingMode);

  // Count client overrides for this schedule
  const clientOverrideCount = allSchedules.filter(
    (s) => s.isOverride && s.baseScheduleId === schedule.id
  ).length;

  // Count connected categories
  const connectionCount = Object.values(schedule.connections).filter(
    (c) => c.hasConnections
  ).length;

  function renderOverrideView() {
    // Simplified view for when an override is selected directly
    const baseSchedule = allSchedules.find((s) => s.id === schedule.baseScheduleId);
    const route = getRouteDescription(schedule, sampleDepots);

    return (
      <div className="h-full flex flex-col bg-white border-l border-border">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-border bg-brand-purple/5 border-l-4 border-l-brand-purple">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="system" className="bg-brand-purple text-white">Override</Badge>
            </div>
            <h2 className="text-lg font-semibold text-text-primary truncate">
              {schedule.name}
            </h2>
            <p className="text-sm text-text-secondary">
              Base: {baseSchedule?.name || 'Unknown'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-cream rounded transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Overridden fields list */}
          <div className="border border-brand-purple/20 bg-brand-purple/5 rounded-lg p-3">
            <h3 className="text-sm font-medium text-brand-purple mb-2">Overridden Fields</h3>
            <div className="flex flex-wrap gap-1">
              {schedule.overriddenFields.map((field) => (
                <span key={field} className="px-2 py-0.5 bg-brand-purple/10 text-brand-purple text-xs rounded">
                  {field.split('.').pop()}
                </span>
              ))}
            </div>
          </div>

          {/* Client info */}
          <div className="border border-border rounded-lg p-3">
            <h3 className="text-sm font-medium text-text-primary mb-2">Assigned Clients</h3>
            <div className="flex flex-wrap gap-1">
              {schedule.clientIds.map((id) => {
                const client = sampleClients.find((c) => c.id === id);
                return (
                  <span key={id} className="px-2 py-0.5 bg-brand-cyan/10 text-brand-dark text-xs rounded">
                    {client?.name || id}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-light">
          <Button variant="primary" className="w-full" onClick={() => onEdit(schedule)}>
            <Edit2 className="w-4 h-4 mr-1" />
            Edit Override
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-border">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border bg-surface-light">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-text-primary truncate">
              {schedule.name}
            </h2>
            <Toggle
              checked={schedule.isActive}
              onChange={(checked) => onToggleActive(schedule, checked)}
              size="sm"
            />
          </div>
          <p className="text-sm text-text-secondary">{route}</p>
          <div className="mt-2">
            <ConnectionBadge
              connectionCount={connectionCount}
              onClick={() => onConnectionsClick(schedule)}
              size="sm"
            />
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-surface-cream rounded transition-colors">
          <X className="w-5 h-5 text-text-muted" />
        </button>
      </div>

      {/* Route Chain - Prominent position */}
      <div className="p-4 border-b border-border bg-surface-cream/50">
        <div className="text-xs text-text-muted uppercase font-medium mb-2">Route Chain</div>
        <div className="overflow-x-auto">
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

      {/* Tabs */}
      <PanelTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        clientOverrideCount={clientOverrideCount}
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'default' ? (
          <div className="p-4 space-y-4">
            {/* Timing Section */}
            <div className="space-y-2">
              <h3 className="text-xs text-text-muted uppercase font-medium">Timing</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-surface-light rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">Mode</div>
                  <div className="text-sm font-medium text-text-primary">{mode}</div>
                </div>
                <div className="bg-surface-light rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">Days</div>
                  <div className="text-sm font-medium text-text-primary">{days}</div>
                </div>
                <div className="bg-surface-light rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">Cutoff</div>
                  <div className="text-sm font-medium text-text-primary">
                    {schedule.operatingSchedule.cutoffValue} {schedule.operatingSchedule.cutoffUnit}
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Section */}
            <div className="space-y-2">
              <h3 className="text-xs text-text-muted uppercase font-medium">Availability</h3>
              <div className="bg-surface-light rounded-lg p-3">
                <div className="text-xs text-text-muted mb-1">Clients</div>
                <div className="text-sm font-medium text-text-primary">
                  {schedule.clientVisibility === 'all'
                    ? 'Available to all clients'
                    : `${schedule.clientIds.length} specific clients`}
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-2">
              <h3 className="text-xs text-text-muted uppercase font-medium">Details</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface-light rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">Legs</div>
                  <div className="text-sm font-medium text-text-primary">{schedule.legs.length}</div>
                </div>
                <div className="bg-surface-light rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">Overrides</div>
                  <div className="text-sm font-medium text-text-primary">{clientOverrideCount}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Clients Tab */
          <div className="p-4 space-y-4">
            <div className="text-sm text-text-secondary">
              Select a client to view or create an override for this schedule.
            </div>
            <ClientSearch
              clients={sampleClients}
              schedules={allSchedules}
              baseScheduleId={schedule.id}
              selectedClientId={selectedClientId}
              onSelectClient={setSelectedClientId}
            />
            {selectedClientId && (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => onEditClientOverride(schedule, selectedClientId)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {allSchedules.some(
                  (s) =>
                    s.isOverride &&
                    s.baseScheduleId === schedule.id &&
                    s.clientIds.includes(selectedClientId)
                )
                  ? 'Edit Client Override'
                  : 'Create Client Override'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions - Only show on Default tab */}
      {activeTab === 'default' && (
        <div className="p-4 border-t border-border bg-surface-light">
          <div className="flex gap-2">
            <Button variant="primary" className="flex-1" onClick={() => onEdit(schedule)}>
              <Edit2 className="w-4 h-4 mr-1" />
              Edit Default
            </Button>
            <Button variant="ghost" onClick={() => onDuplicate(schedule)}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/modules/schedules/components/ScheduleDetailPanel.tsx
git commit -m "feat: restructure ScheduleDetailPanel with tabs and better hierarchy

- Route Chain moved to prominent position below header
- DEFAULT/CLIENTS tabs for switching views
- Client search with override indicators in Clients tab
- ConnectionBadge in header
- Better section headings (Timing, Availability, Details)
- Purple styling for override view"
```

---

## Task 8: Add ConnectionBadge to Panel Header

This was done in Task 7. Verify it's working.

**Verification:**
- Panel header should show ConnectionBadge with count
- Clicking it should trigger onConnectionsClick

**Already complete in Task 7.**

---

## Task 9: Wire Up Client Override Flow in ScheduleTableView

**Files:**
- Modify: `src/modules/schedules/components/ScheduleTableView.tsx`

**Step 1: Add new state and imports**

Add to imports:

```typescript
import { ClientOverrideEditor } from './ClientOverrideEditor';
import { sampleClients } from '../data/sampleData';
import type { ClientReference } from '../types';
```

Add new state after existing state:

```typescript
// Client override editing
const [editingClientId, setEditingClientId] = useState<string | null>(null);
```

**Step 2: Add handleEditClientOverride callback**

Add after handleDuplicate:

```typescript
const handleEditClientOverride = useCallback((baseSchedule: Schedule, clientId: string) => {
  // Find existing override for this client, or create new
  const existingOverride = schedules.find(
    (s) => s.isOverride && s.baseScheduleId === baseSchedule.id && s.clientIds.includes(clientId)
  );

  if (existingOverride) {
    // Edit existing
    setEditingSchedule({ ...existingOverride });
  } else {
    // Create new override
    const client = sampleClients.find((c) => c.id === clientId);
    const newOverride: Schedule = {
      ...baseSchedule,
      id: `override-${Date.now()}`,
      name: `${baseSchedule.name} (${client?.shortName || client?.name || clientId})`,
      isOverride: true,
      baseScheduleId: baseSchedule.id,
      overriddenFields: [],
      clientVisibility: 'specific',
      clientIds: [clientId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingSchedule(newOverride);
  }
  setEditingClientId(clientId);
  setPanelMode('override');
}, [schedules]);
```

**Step 3: Add handleCopyToClient callback**

```typescript
const handleCopyToClient = useCallback((targetClientId: string, sourceSchedule: Schedule) => {
  const targetClient = sampleClients.find((c) => c.id === targetClientId);
  const baseSchedule = schedules.find((s) => s.id === sourceSchedule.baseScheduleId);

  if (!baseSchedule) return;

  // Create new override with copied values
  const copiedOverride: Schedule = {
    ...sourceSchedule,
    id: `override-${Date.now()}`,
    name: `${baseSchedule.name} (${targetClient?.shortName || targetClient?.name || targetClientId})`,
    clientIds: [targetClientId],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setEditingSchedule(copiedOverride);
  setEditingClientId(targetClientId);
  setPanelMode('override');
}, [schedules]);
```

**Step 4: Add handleConnectionsClick callback**

```typescript
const handleConnectionsClick = useCallback((schedule: Schedule) => {
  // This would open the TagSidebar - for now just log
  console.log('Connections clicked for:', schedule.name, schedule.connections);
  // In full implementation, this would call a prop passed from SchedulesPage
}, []);
```

**Step 5: Update handleCancelEdit to clear client state**

```typescript
const handleCancelEdit = useCallback(() => {
  setPanelMode('view');
  setEditingSchedule(null);
  setEditingClientId(null);  // Add this line
}, []);
```

**Step 6: Update handleSaveSchedule to clear client state**

```typescript
const handleSaveSchedule = useCallback((updatedSchedule: Schedule) => {
  setSchedules((prev) => {
    const exists = prev.some((s) => s.id === updatedSchedule.id);
    if (exists) {
      return prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s));
    } else {
      return [...prev, updatedSchedule];
    }
  });
  setPanelMode('view');
  setEditingSchedule(null);
  setEditingClientId(null);  // Add this line
  setSelectedSchedule(updatedSchedule);
}, []);
```

**Step 7: Update ScheduleDetailPanel props**

In the JSX, update the ScheduleDetailPanel to pass new props:

```typescript
{panelMode === 'view' && selectedSchedule && (
  <ScheduleDetailPanel
    schedule={selectedSchedule}
    allSchedules={schedules}
    onClose={handleClosePanel}
    onEdit={handleEdit}
    onCreateOverride={handleCreateOverride}
    onDuplicate={handleDuplicate}
    onToggleActive={handleToggleActive}
    onEditClientOverride={handleEditClientOverride}
    onConnectionsClick={handleConnectionsClick}
  />
)}
```

**Step 8: Update override panel rendering**

Replace the override panel section with ClientOverrideEditor when editingClientId is set:

```typescript
{panelMode === 'override' && editingSchedule && baseScheduleForOverride && (
  <div className="h-full flex flex-col bg-white">
    {editingClientId ? (
      // Client-specific override editing
      <ClientOverrideEditor
        schedule={editingSchedule}
        baseSchedule={baseScheduleForOverride}
        client={sampleClients.find((c) => c.id === editingClientId) || { id: editingClientId, name: editingClientId }}
        allClients={sampleClients}
        allSchedules={schedules}
        onSave={handleSaveSchedule}
        onCancel={handleCancelEdit}
        onCopyToClient={handleCopyToClient}
      />
    ) : (
      // Generic override editing (old flow)
      <>
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-light">
          <h2 className="text-lg font-semibold text-text-primary">
            {schedules.some((s) => s.id === editingSchedule.id) ? 'Edit Override' : 'New Override'}
          </h2>
          <button onClick={handleCancelEdit} className="text-sm text-text-muted hover:text-text-primary">
            Cancel
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <OverrideEditor
            schedule={editingSchedule}
            baseSchedule={baseScheduleForOverride}
            onSave={handleSaveSchedule}
            onCancel={handleCancelEdit}
          />
        </div>
      </>
    )}
  </div>
)}
```

**Step 9: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 10: Commit**

```bash
git add src/modules/schedules/components/ScheduleTableView.tsx
git commit -m "feat: wire up client override flow with ClientOverrideEditor

- handleEditClientOverride creates or edits client-specific override
- handleCopyToClient duplicates override to another client
- ClientOverrideEditor shown when editingClientId is set
- Pass allSchedules and new callbacks to ScheduleDetailPanel"
```

---

## Task 10: Add "Copy to Client" Functionality

This was implemented in Task 6 (ClientOverrideEditor) and Task 9 (handleCopyToClient).

**Verification:**
- In ClientOverrideEditor, "Copy Override to Another Client" button appears for existing overrides
- Clicking it shows ClientSearch picker
- Selecting a client and clicking "Copy & Edit" calls onCopyToClient
- The override is duplicated and user can edit before saving

**Already complete.**

---

## Task 11: Update Sample Data with More Client Overrides

**Files:**
- Modify: `src/modules/schedules/data/sampleData.ts`

**Step 1: Add more sample client overrides**

Add after sch-4 (around line 460):

```typescript
// Additional client overrides for testing
{
  id: 'sch-6',
  name: 'Next Day Standard (GLOBEX)',
  description: 'GLOBEX-specific override with later cutoff',
  clientVisibility: 'specific',
  clientIds: ['client-globex'],
  bookingMode: 'fixed_time',
  defaultDeliverySpeedId: 'speed-next-day',
  defaultPickupSpeedId: 'speed-standard',
  originType: 'client_address',
  legs: [
    {
      id: 'leg-sch6-1',
      order: 1,
      config: {
        type: 'collection',
        pickupZoneIds: ['zone-1', 'zone-2', 'zone-3'],
        pickupMinutesBefore: 90, // Different from base
        speedId: 'speed-standard',
      },
    },
    {
      id: 'leg-sch6-2',
      order: 2,
      config: {
        type: 'delivery',
        deliveryZoneIds: ['zone-1', 'zone-2', 'zone-3'],
        speedId: 'speed-next-day',
      },
    },
  ],
  operatingSchedule: {
    days: {
      mon: { enabled: true, startTime: '08:00', endTime: '18:00' },
      tue: { enabled: true, startTime: '08:00', endTime: '18:00' },
      wed: { enabled: true, startTime: '08:00', endTime: '18:00' },
      thu: { enabled: true, startTime: '08:00', endTime: '18:00' },
      fri: { enabled: true, startTime: '08:00', endTime: '18:00' },
      sat: { enabled: false, startTime: '09:00', endTime: '13:00' },
      sun: { enabled: false, startTime: '00:00', endTime: '00:00' },
    },
    cutoffValue: 3, // Different from base (was 4)
    cutoffUnit: 'hours',
  },
  deliveryWindow: {
    mode: 'auto',
    autoRules: {
      sameDay: { windowMinutes: 60 },
      nextDay: { windowMinutes: 120 },
      multiDay: { windowMinutes: 240 },
    },
  },
  isActive: true,
  isOverride: true,
  baseScheduleId: 'sch-2',
  overriddenFields: ['operatingSchedule.cutoffValue', 'legs[0].config.pickupMinutesBefore'],
  connections: createEmptyConnections(),
  createdAt: '2024-02-01T00:00:00Z',
  updatedAt: '2024-02-01T00:00:00Z',
},
{
  id: 'sch-7',
  name: 'Express Same Day (INITECH)',
  description: 'INITECH override with different speed',
  clientVisibility: 'specific',
  clientIds: ['client-initech'],
  bookingMode: 'window',
  defaultDeliverySpeedId: 'speed-same-day',
  defaultPickupSpeedId: 'speed-express',
  originType: 'client_address',
  legs: [
    {
      id: 'leg-sch7-1',
      order: 1,
      config: {
        type: 'delivery',
        deliveryZoneIds: ['zone-1', 'zone-2'],
        speedId: 'speed-same-day',
      },
    },
  ],
  operatingSchedule: {
    days: {
      mon: { enabled: true, startTime: '06:00', endTime: '22:00' },
      tue: { enabled: true, startTime: '06:00', endTime: '22:00' },
      wed: { enabled: true, startTime: '06:00', endTime: '22:00' },
      thu: { enabled: true, startTime: '06:00', endTime: '22:00' },
      fri: { enabled: true, startTime: '06:00', endTime: '22:00' },
      sat: { enabled: true, startTime: '08:00', endTime: '18:00' },
      sun: { enabled: true, startTime: '10:00', endTime: '16:00' },
    },
    cutoffValue: 30, // Tighter cutoff
    cutoffUnit: 'minutes',
  },
  deliveryWindow: {
    mode: 'fixed',
    fixedWindowMinutes: 30, // Tighter window
  },
  isActive: true,
  isOverride: true,
  baseScheduleId: 'sch-5',
  overriddenFields: ['operatingSchedule.cutoffValue', 'deliveryWindow.fixedWindowMinutes', 'defaultPickupSpeedId'],
  connections: createEmptyConnections(),
  createdAt: '2024-02-15T00:00:00Z',
  updatedAt: '2024-02-15T00:00:00Z',
},
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/schedules/data/sampleData.ts
git commit -m "feat: add more sample client overrides for testing

- sch-6: GLOBEX override of Next Day Standard
- sch-7: INITECH override of Express Same Day
- Shows different override patterns (cutoff, speed, window)"
```

---

## Task 12: Final Integration and Testing

**Files:**
- All modified files

**Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Start dev server and test manually**

Run: `npm run dev`

Test checklist:
- [ ] Table fills width properly (no white gap)
- [ ] Click header to sort - cycles asc/desc/none
- [ ] Sort indicator shows chevron on active column
- [ ] Click schedule row - panel opens at fixed width
- [ ] Panel shows ConnectionBadge in header
- [ ] Route Chain is visible below header
- [ ] DEFAULT tab shows timing/availability/details sections
- [ ] CLIENTS tab shows client search
- [ ] Client search shows override indicator
- [ ] Select client - "Edit/Create Client Override" button appears
- [ ] Click button - ClientOverrideEditor opens with purple styling
- [ ] Save override - returns to view mode
- [ ] "Copy to Another Client" works for existing overrides
- [ ] Override schedules show purple-tinted header when selected

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete schedules panel redesign

- Fixed table layout with flex-grow pattern
- Sortable table headers with visual indicators
- Panel tabs: Default and Clients
- Client search with override status indicators
- Client override editing with purple visual distinction
- Copy override to another client feature
- ConnectionBadge integration
- Better panel hierarchy with section headings"
```

---

## File Change Summary

| File | Action | Lines Changed |
|------|--------|---------------|
| `types.ts` | Modify | +15 (SortConfig types) |
| `ScheduleTableView.tsx` | Modify | ~80 (layout, new handlers) |
| `ScheduleTable.tsx` | Modify | ~60 (sorting, headers) |
| `ScheduleDetailPanel.tsx` | Modify | ~200 (complete restructure) |
| `PanelTabs.tsx` | Create | ~45 |
| `ClientSearch.tsx` | Create | ~110 |
| `ClientOverrideEditor.tsx` | Create | ~130 |
| `sampleData.ts` | Modify | ~80 (new overrides) |

**Total: ~720 lines changed/added**

---

## Rollback Plan

If issues arise, each task has its own commit. Rollback to specific commits:
- Layout only: revert Task 1
- Sorting only: revert Tasks 2-3
- Panel tabs only: revert Tasks 4, 7
- Client flow only: revert Tasks 5, 6, 9, 10
