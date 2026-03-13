# Schedule Groups Bulk Operations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add bulk operations to Schedule Groups: Copy Group (with bulk edit), and Add Client Override (bulk apply customer-specific overrides to all schedules in a group).

**Architecture:** Enhance ScheduleGroupsTab with action buttons. Create shared BulkEditPreview component showing before/after table with warnings. Two flows: Copy Group → Bulk Edit → Create, and Add Client Override → Select Customer → Configure Override → Apply. Both use same preview table pattern.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide icons

---

## Overview

### Operation A: Copy Group + Bulk Edit
1. User clicks "Copy Group" on a schedule group
2. Modal shows schedules with checkboxes (all checked by default)
3. User names the new group, unchecks any schedules to exclude
4. Clicks "Copy & Edit" → Bulk edit interface
5. User selects field(s) to change, picks absolute or relative mode
6. Preview table shows before/after with warning indicators
7. Click schedule row → opens full schedule detail modal
8. User clicks "Create Copies" → new schedules created in new group

### Operation B: Add Client Override
1. User clicks "Add Client Override" on a schedule group
2. Modal shows customer picker (single customer for MVP)
3. User selects customer, clicks "Configure Override"
4. Same bulk edit interface: select fields, absolute/relative
5. Preview table shows before/after with warnings
6. User clicks "Apply Override" → client-specific overrides created for all schedules

### Warning System
| Level | Color | When |
|-------|-------|------|
| ✓ OK | Green/none | No detected issues |
| ⚠️ Caution | Orange | Value riskier than default (e.g., cutoff reduced) |
| ❌ Conflict | Red | Obvious logical impossibility (linehaul timing overlap) |

---

## Task 1: Add Types for Bulk Operations

**Files:**
- Modify: `src/modules/schedules/types.ts`

**Step 1: Add bulk operation types at end of file**

```typescript
// ============================================
// BULK OPERATION TYPES
// ============================================

export type BulkEditMode = 'absolute' | 'relative';

export type BulkEditFieldType =
  | 'cutoffValue'
  | 'cutoffUnit'
  | 'pickupMinutesBefore'
  | 'departureTime'
  | 'deliveryWindowStart'
  | 'deliveryWindowEnd'
  | 'operatingDays';

export interface BulkEditField {
  field: BulkEditFieldType;
  label: string;
  mode: BulkEditMode;
  value: string | number;
  unit?: TimeUnit;
}

export type WarningLevel = 'ok' | 'caution' | 'conflict';

export interface BulkEditPreviewRow {
  scheduleId: string;
  scheduleName: string;
  included: boolean;
  beforeValue: string;
  afterValue: string;
  warningLevel: WarningLevel;
  warningMessage?: string;
}

export interface BulkEditState {
  fields: BulkEditField[];
  previews: BulkEditPreviewRow[];
}

export const BULK_EDITABLE_FIELDS: { field: BulkEditFieldType; label: string; supportsRelative: boolean }[] = [
  { field: 'cutoffValue', label: 'Booking Cutoff', supportsRelative: true },
  { field: 'pickupMinutesBefore', label: 'Pickup Time Offset', supportsRelative: true },
  { field: 'departureTime', label: 'Departure Time', supportsRelative: true },
  { field: 'deliveryWindowStart', label: 'Delivery Window Start', supportsRelative: true },
  { field: 'deliveryWindowEnd', label: 'Delivery Window End', supportsRelative: true },
  { field: 'operatingDays', label: 'Operating Days', supportsRelative: false },
];
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/schedules/types.ts
git commit -m "feat(schedules): add bulk operation types

- BulkEditMode, BulkEditFieldType, BulkEditField
- WarningLevel, BulkEditPreviewRow, BulkEditState
- BULK_EDITABLE_FIELDS constant"
```

---

## Task 2: Create BulkEditPreview Component

**Files:**
- Create: `src/modules/schedules/components/BulkEditPreview.tsx`

**Step 1: Create the component**

```typescript
// src/modules/schedules/components/BulkEditPreview.tsx
import { useState } from 'react';
import { Check, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import type { BulkEditPreviewRow, Schedule } from '../types';

interface BulkEditPreviewProps {
  rows: BulkEditPreviewRow[];
  fieldLabel: string;
  onToggleInclude: (scheduleId: string) => void;
  onViewSchedule: (scheduleId: string) => void;
  schedules: Schedule[];
}

export function BulkEditPreview({
  rows,
  fieldLabel,
  onToggleInclude,
  onViewSchedule,
  schedules,
}: BulkEditPreviewProps) {
  const includedCount = rows.filter((r) => r.included).length;
  const warningCount = rows.filter((r) => r.included && r.warningLevel === 'caution').length;
  const conflictCount = rows.filter((r) => r.included && r.warningLevel === 'conflict').length;

  const getWarningIcon = (level: BulkEditPreviewRow['warningLevel']) => {
    switch (level) {
      case 'ok':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'caution':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'conflict':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getWarningText = (level: BulkEditPreviewRow['warningLevel']) => {
    switch (level) {
      case 'ok':
        return 'OK';
      case 'caution':
        return 'Caution';
      case 'conflict':
        return 'Conflict';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-sm font-medium text-text-primary">
        Preview: {fieldLabel}
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-light">
            <tr className="border-b border-border">
              <th className="w-10 p-2 text-left"></th>
              <th className="p-2 text-left font-medium text-text-muted">Schedule</th>
              <th className="p-2 text-left font-medium text-text-muted">Before</th>
              <th className="p-2 text-left font-medium text-text-muted">After</th>
              <th className="p-2 text-left font-medium text-text-muted">Status</th>
              <th className="w-10 p-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr
                key={row.scheduleId}
                className={`
                  ${!row.included ? 'opacity-50 bg-surface-light' : 'bg-white'}
                  ${row.warningLevel === 'conflict' ? 'bg-red-50' : ''}
                  ${row.warningLevel === 'caution' ? 'bg-orange-50' : ''}
                `}
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={row.included}
                    onChange={() => onToggleInclude(row.scheduleId)}
                    className="w-4 h-4 rounded border-border text-brand-cyan focus:ring-brand-cyan"
                  />
                </td>
                <td className="p-2 font-medium text-text-primary">
                  {row.scheduleName}
                </td>
                <td className="p-2 text-text-secondary">{row.beforeValue}</td>
                <td className="p-2 text-text-primary font-medium">{row.afterValue}</td>
                <td className="p-2">
                  <div className="flex items-center gap-1.5">
                    {getWarningIcon(row.warningLevel)}
                    <span
                      className={`text-xs ${
                        row.warningLevel === 'ok'
                          ? 'text-green-600'
                          : row.warningLevel === 'caution'
                          ? 'text-orange-600'
                          : 'text-red-600'
                      }`}
                    >
                      {getWarningText(row.warningLevel)}
                    </span>
                  </div>
                  {row.warningMessage && (
                    <div className="text-xs text-text-muted mt-0.5">{row.warningMessage}</div>
                  )}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => onViewSchedule(row.scheduleId)}
                    className="p-1 hover:bg-surface-cream rounded transition-colors"
                    title="View schedule details"
                  >
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span>{includedCount} selected</span>
        {warningCount > 0 && (
          <span className="text-orange-600">{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>
        )}
        {conflictCount > 0 && (
          <span className="text-red-600">{conflictCount} conflict{conflictCount !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/schedules/components/BulkEditPreview.tsx
git commit -m "feat(schedules): create BulkEditPreview component

- Table showing before/after values for bulk edits
- Checkbox to include/exclude schedules
- Warning indicators (OK, Caution, Conflict)
- Click row to view schedule details
- Summary footer with counts"
```

---

## Task 3: Create BulkEditFieldSelector Component

**Files:**
- Create: `src/modules/schedules/components/BulkEditFieldSelector.tsx`

**Step 1: Create the component**

```typescript
// src/modules/schedules/components/BulkEditFieldSelector.tsx
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { BulkEditField, BulkEditFieldType, BulkEditMode, TimeUnit } from '../types';
import { BULK_EDITABLE_FIELDS } from '../types';

interface BulkEditFieldSelectorProps {
  fields: BulkEditField[];
  onFieldsChange: (fields: BulkEditField[]) => void;
}

export function BulkEditFieldSelector({ fields, onFieldsChange }: BulkEditFieldSelectorProps) {
  const [selectedFieldType, setSelectedFieldType] = useState<BulkEditFieldType | ''>('');

  const availableFields = BULK_EDITABLE_FIELDS.filter(
    (f) => !fields.some((existing) => existing.field === f.field)
  );

  const handleAddField = () => {
    if (!selectedFieldType) return;

    const fieldDef = BULK_EDITABLE_FIELDS.find((f) => f.field === selectedFieldType);
    if (!fieldDef) return;

    const newField: BulkEditField = {
      field: selectedFieldType,
      label: fieldDef.label,
      mode: 'absolute',
      value: '',
      unit: selectedFieldType === 'cutoffValue' ? 'hours' : undefined,
    };

    onFieldsChange([...fields, newField]);
    setSelectedFieldType('');
  };

  const handleRemoveField = (field: BulkEditFieldType) => {
    onFieldsChange(fields.filter((f) => f.field !== field));
  };

  const handleFieldChange = (field: BulkEditFieldType, updates: Partial<BulkEditField>) => {
    onFieldsChange(
      fields.map((f) => (f.field === field ? { ...f, ...updates } : f))
    );
  };

  return (
    <div className="space-y-4">
      {/* Existing fields */}
      {fields.map((field) => {
        const fieldDef = BULK_EDITABLE_FIELDS.find((f) => f.field === field.field);

        return (
          <div
            key={field.field}
            className="p-4 border border-border rounded-lg bg-white space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-text-primary">{field.label}</span>
              <button
                onClick={() => handleRemoveField(field.field)}
                className="p-1 hover:bg-surface-cream rounded transition-colors"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            {/* Mode selector (if field supports relative) */}
            {fieldDef?.supportsRelative && (
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`mode-${field.field}`}
                    checked={field.mode === 'absolute'}
                    onChange={() => handleFieldChange(field.field, { mode: 'absolute' })}
                    className="text-brand-cyan focus:ring-brand-cyan"
                  />
                  <span className="text-sm">Set to</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`mode-${field.field}`}
                    checked={field.mode === 'relative'}
                    onChange={() => handleFieldChange(field.field, { mode: 'relative' })}
                    className="text-brand-cyan focus:ring-brand-cyan"
                  />
                  <span className="text-sm">Adjust by</span>
                </label>
              </div>
            )}

            {/* Value input */}
            <div className="flex items-center gap-2">
              {field.mode === 'relative' && (
                <select
                  value={typeof field.value === 'number' && field.value >= 0 ? '+' : '-'}
                  onChange={(e) => {
                    const currentVal = Math.abs(Number(field.value) || 0);
                    const newVal = e.target.value === '+' ? currentVal : -currentVal;
                    handleFieldChange(field.field, { value: newVal });
                  }}
                  className="px-2 py-1.5 border border-border rounded-lg text-sm"
                >
                  <option value="+">+</option>
                  <option value="-">-</option>
                </select>
              )}
              <input
                type={field.field === 'operatingDays' ? 'text' : 'number'}
                value={typeof field.value === 'number' ? Math.abs(field.value) : field.value}
                onChange={(e) => {
                  const val = field.field === 'operatingDays' ? e.target.value : Number(e.target.value);
                  if (field.mode === 'relative' && typeof field.value === 'number' && field.value < 0) {
                    handleFieldChange(field.field, { value: -Math.abs(Number(val)) });
                  } else {
                    handleFieldChange(field.field, { value: val });
                  }
                }}
                placeholder={field.mode === 'relative' ? 'Amount' : 'Value'}
                className="flex-1 px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
              />
              {field.unit && (
                <select
                  value={field.unit}
                  onChange={(e) => handleFieldChange(field.field, { unit: e.target.value as TimeUnit })}
                  className="px-2 py-1.5 border border-border rounded-lg text-sm"
                >
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                </select>
              )}
            </div>
          </div>
        );
      })}

      {/* Add field */}
      {availableFields.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={selectedFieldType}
            onChange={(e) => setSelectedFieldType(e.target.value as BulkEditFieldType)}
            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
          >
            <option value="">Select a field to edit...</option>
            {availableFields.map((f) => (
              <option key={f.field} value={f.field}>
                {f.label}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={handleAddField}
            disabled={!selectedFieldType}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Field
          </Button>
        </div>
      )}

      {fields.length === 0 && (
        <div className="text-center text-text-muted text-sm py-4">
          Select a field above to start editing
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
git add src/modules/schedules/components/BulkEditFieldSelector.tsx
git commit -m "feat(schedules): create BulkEditFieldSelector component

- Dropdown to add fields for bulk editing
- Absolute vs relative mode toggle
- Value input with unit selector
- Remove field button
- Supports multiple fields"
```

---

## Task 4: Create CopyGroupModal Component

**Files:**
- Create: `src/modules/schedules/components/CopyGroupModal.tsx`

**Step 1: Create the component**

```typescript
// src/modules/schedules/components/CopyGroupModal.tsx
import { useState, useMemo, useCallback } from 'react';
import { X, Copy, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { BulkEditPreview } from './BulkEditPreview';
import { BulkEditFieldSelector } from './BulkEditFieldSelector';
import type { ScheduleGroup, Schedule, BulkEditField, BulkEditPreviewRow, WarningLevel } from '../types';

interface CopyGroupModalProps {
  group: ScheduleGroup;
  schedules: Schedule[];
  onClose: () => void;
  onCreateCopies: (newGroupName: string, scheduleIds: string[], edits: BulkEditField[]) => void;
  onViewSchedule: (scheduleId: string) => void;
}

type Step = 'select' | 'edit';

export function CopyGroupModal({
  group,
  schedules,
  onClose,
  onCreateCopies,
  onViewSchedule,
}: CopyGroupModalProps) {
  const [step, setStep] = useState<Step>('select');
  const [newGroupName, setNewGroupName] = useState(`${group.name} (Copy)`);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(group.scheduleIds));
  const [editFields, setEditFields] = useState<BulkEditField[]>([]);

  const memberSchedules = useMemo(
    () => schedules.filter((s) => group.scheduleIds.includes(s.id)),
    [schedules, group.scheduleIds]
  );

  const toggleSchedule = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Generate preview rows based on edit fields
  const previewRows: BulkEditPreviewRow[] = useMemo(() => {
    if (editFields.length === 0) return [];

    const firstField = editFields[0];

    return memberSchedules.map((schedule) => {
      const included = selectedIds.has(schedule.id);

      // Get before value based on field type
      let beforeValue = '';
      let afterValue = '';
      let warningLevel: WarningLevel = 'ok';
      let warningMessage: string | undefined;

      if (firstField.field === 'cutoffValue') {
        const cutoff = schedule.operatingSchedule.cutoffValue;
        const unit = schedule.operatingSchedule.cutoffUnit;
        beforeValue = `${cutoff} ${unit}`;

        if (firstField.mode === 'relative') {
          const adjustment = Number(firstField.value) || 0;
          const newValue = cutoff + adjustment;
          afterValue = `${newValue} ${firstField.unit || unit}`;

          if (newValue < cutoff) {
            warningLevel = 'caution';
            warningMessage = 'Reduced cutoff time';
          }
          if (newValue <= 0) {
            warningLevel = 'conflict';
            warningMessage = 'Invalid cutoff time';
          }
        } else {
          afterValue = `${firstField.value} ${firstField.unit || unit}`;
          if (Number(firstField.value) < cutoff) {
            warningLevel = 'caution';
            warningMessage = 'Reduced cutoff time';
          }
        }
      } else if (firstField.field === 'pickupMinutesBefore') {
        const collectionLeg = schedule.legs.find((l) => l.config.type === 'collection');
        const currentValue = collectionLeg?.config.type === 'collection'
          ? collectionLeg.config.pickupMinutesBefore
          : 60;
        beforeValue = `${currentValue} min`;

        if (firstField.mode === 'relative') {
          const adjustment = Number(firstField.value) || 0;
          const newValue = currentValue + adjustment;
          afterValue = `${newValue} min`;

          if (newValue < currentValue) {
            warningLevel = 'caution';
            warningMessage = 'Less pickup time';
          }
          if (newValue <= 0) {
            warningLevel = 'conflict';
            warningMessage = 'Invalid pickup time';
          }
        } else {
          afterValue = `${firstField.value} min`;
        }
      } else {
        beforeValue = '—';
        afterValue = String(firstField.value);
      }

      return {
        scheduleId: schedule.id,
        scheduleName: schedule.name,
        included,
        beforeValue,
        afterValue,
        warningLevel,
        warningMessage,
      };
    });
  }, [memberSchedules, selectedIds, editFields]);

  const handleCreateCopies = () => {
    onCreateCopies(newGroupName, Array.from(selectedIds), editFields);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Copy Schedule Group: {group.name}
            </h2>
            <p className="text-sm text-text-muted">
              {step === 'select' ? 'Step 1: Select schedules to copy' : 'Step 2: Configure bulk edits'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-cream rounded-lg transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 'select' ? (
            <div className="space-y-4">
              {/* New group name */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  New Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
                />
              </div>

              {/* Schedule selection table */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Select schedules to copy:
                </label>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-light">
                      <tr className="border-b border-border">
                        <th className="w-10 p-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === group.scheduleIds.length}
                            onChange={() => {
                              if (selectedIds.size === group.scheduleIds.length) {
                                setSelectedIds(new Set());
                              } else {
                                setSelectedIds(new Set(group.scheduleIds));
                              }
                            }}
                            className="w-4 h-4 rounded border-border text-brand-cyan focus:ring-brand-cyan"
                          />
                        </th>
                        <th className="p-2 text-left font-medium text-text-muted">Schedule</th>
                        <th className="p-2 text-left font-medium text-text-muted">Cutoff</th>
                        <th className="p-2 text-left font-medium text-text-muted">Speed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {memberSchedules.map((schedule) => (
                        <tr key={schedule.id} className="bg-white hover:bg-surface-cream">
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(schedule.id)}
                              onChange={() => toggleSchedule(schedule.id)}
                              className="w-4 h-4 rounded border-border text-brand-cyan focus:ring-brand-cyan"
                            />
                          </td>
                          <td className="p-2 font-medium text-text-primary">{schedule.name}</td>
                          <td className="p-2 text-text-secondary">
                            {schedule.operatingSchedule.cutoffValue} {schedule.operatingSchedule.cutoffUnit}
                          </td>
                          <td className="p-2 text-text-secondary">
                            {schedule.defaultDeliverySpeedId || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-sm text-text-muted mt-2">
                  {selectedIds.size} of {group.scheduleIds.length} selected
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Field selector */}
              <BulkEditFieldSelector fields={editFields} onFieldsChange={setEditFields} />

              {/* Preview table */}
              {editFields.length > 0 && (
                <BulkEditPreview
                  rows={previewRows}
                  fieldLabel={editFields[0].label}
                  onToggleInclude={(id) => toggleSchedule(id)}
                  onViewSchedule={onViewSchedule}
                  schedules={memberSchedules}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-surface-light">
          <div className="text-sm text-text-muted">
            {step === 'select'
              ? `${selectedIds.size} schedules will be copied`
              : editFields.length === 0
                ? 'No edits - copies will be identical'
                : `${editFields.length} field(s) will be modified`
            }
          </div>
          <div className="flex gap-2">
            {step === 'edit' && (
              <Button variant="secondary" onClick={() => setStep('select')}>
                Back
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {step === 'select' ? (
              <Button
                variant="primary"
                onClick={() => setStep('edit')}
                disabled={selectedIds.size === 0 || !newGroupName.trim()}
              >
                Copy & Edit
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="primary" onClick={handleCreateCopies}>
                <Copy className="w-4 h-4 mr-1" />
                Create Copies
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/schedules/components/CopyGroupModal.tsx
git commit -m "feat(schedules): create CopyGroupModal component

- Two-step flow: select schedules, then configure edits
- New group name input
- Checkbox selection for schedules
- Bulk edit field selector integration
- Preview table with warnings
- Create copies action"
```

---

## Task 5: Create AddClientOverrideModal Component

**Files:**
- Create: `src/modules/schedules/components/AddClientOverrideModal.tsx`

**Step 1: Create the component**

```typescript
// src/modules/schedules/components/AddClientOverrideModal.tsx
import { useState, useMemo } from 'react';
import { X, Users, ArrowRight, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { BulkEditPreview } from './BulkEditPreview';
import { BulkEditFieldSelector } from './BulkEditFieldSelector';
import type {
  ScheduleGroup,
  Schedule,
  ClientReference,
  BulkEditField,
  BulkEditPreviewRow,
  WarningLevel,
} from '../types';

interface AddClientOverrideModalProps {
  group: ScheduleGroup;
  schedules: Schedule[];
  clients: ClientReference[];
  onClose: () => void;
  onApplyOverrides: (clientId: string, scheduleIds: string[], edits: BulkEditField[]) => void;
  onViewSchedule: (scheduleId: string) => void;
}

type Step = 'customer' | 'configure';

export function AddClientOverrideModal({
  group,
  schedules,
  clients,
  onClose,
  onApplyOverrides,
  onViewSchedule,
}: AddClientOverrideModalProps) {
  const [step, setStep] = useState<Step>('customer');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<Set<string>>(
    new Set(group.scheduleIds)
  );
  const [editFields, setEditFields] = useState<BulkEditField[]>([]);

  const memberSchedules = useMemo(
    () => schedules.filter((s) => group.scheduleIds.includes(s.id) && !s.isOverride),
    [schedules, group.scheduleIds]
  );

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const search = clientSearch.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.shortName?.toLowerCase().includes(search)
    );
  }, [clients, clientSearch]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const toggleSchedule = (id: string) => {
    setSelectedScheduleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Generate preview rows
  const previewRows: BulkEditPreviewRow[] = useMemo(() => {
    if (editFields.length === 0) return [];

    const firstField = editFields[0];

    return memberSchedules.map((schedule) => {
      const included = selectedScheduleIds.has(schedule.id);

      let beforeValue = '';
      let afterValue = '';
      let warningLevel: WarningLevel = 'ok';
      let warningMessage: string | undefined;

      if (firstField.field === 'cutoffValue') {
        const cutoff = schedule.operatingSchedule.cutoffValue;
        const unit = schedule.operatingSchedule.cutoffUnit;
        beforeValue = `${cutoff} ${unit}`;

        if (firstField.mode === 'relative') {
          const adjustment = Number(firstField.value) || 0;
          const newValue = cutoff + adjustment;
          afterValue = `${newValue} ${firstField.unit || unit}`;

          if (newValue < cutoff) {
            warningLevel = 'caution';
            warningMessage = 'Reduced cutoff time';
          }
          if (newValue <= 0) {
            warningLevel = 'conflict';
            warningMessage = 'Invalid cutoff time';
          }
        } else {
          afterValue = `${firstField.value} ${firstField.unit || unit}`;
          if (Number(firstField.value) < cutoff) {
            warningLevel = 'caution';
            warningMessage = 'Reduced cutoff time';
          }
        }
      } else if (firstField.field === 'pickupMinutesBefore') {
        const collectionLeg = schedule.legs.find((l) => l.config.type === 'collection');
        const currentValue =
          collectionLeg?.config.type === 'collection'
            ? collectionLeg.config.pickupMinutesBefore
            : 60;
        beforeValue = `${currentValue} min`;

        if (firstField.mode === 'relative') {
          const adjustment = Number(firstField.value) || 0;
          const newValue = currentValue + adjustment;
          afterValue = `${newValue} min`;

          if (newValue < currentValue) {
            warningLevel = 'caution';
            warningMessage = 'Less pickup time';
          }
          if (newValue <= 0) {
            warningLevel = 'conflict';
            warningMessage = 'Invalid pickup time';
          }
        } else {
          afterValue = `${firstField.value} min`;
        }
      } else {
        beforeValue = '—';
        afterValue = String(firstField.value);
      }

      return {
        scheduleId: schedule.id,
        scheduleName: schedule.name,
        included,
        beforeValue,
        afterValue,
        warningLevel,
        warningMessage,
      };
    });
  }, [memberSchedules, selectedScheduleIds, editFields]);

  const handleApply = () => {
    if (!selectedClientId) return;
    onApplyOverrides(selectedClientId, Array.from(selectedScheduleIds), editFields);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Add Client Override: {group.name}
            </h2>
            <p className="text-sm text-text-muted">
              {step === 'customer'
                ? 'Step 1: Select customer'
                : `Step 2: Configure overrides for ${selectedClient?.name}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-cream rounded-lg transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 'customer' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Search customers
                </label>
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
                />
              </div>

              <div className="border border-border rounded-lg divide-y divide-border max-h-[300px] overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`
                      w-full px-4 py-3 text-left flex items-center justify-between
                      transition-colors
                      ${selectedClientId === client.id
                        ? 'bg-brand-cyan/10 border-l-2 border-l-brand-cyan'
                        : 'hover:bg-surface-cream'
                      }
                    `}
                  >
                    <div>
                      <div className="font-medium text-text-primary">{client.name}</div>
                      {client.shortName && (
                        <div className="text-sm text-text-muted">{client.shortName}</div>
                      )}
                    </div>
                    {selectedClientId === client.id && (
                      <Check className="w-5 h-5 text-brand-cyan" />
                    )}
                  </button>
                ))}
                {filteredClients.length === 0 && (
                  <div className="p-4 text-center text-text-muted">No customers found</div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Client banner */}
              <div className="bg-brand-purple/5 border-l-4 border-brand-purple p-4 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-purple" />
                  <span className="font-semibold text-text-primary">
                    Creating overrides for: {selectedClient?.name}
                  </span>
                </div>
                <p className="text-sm text-text-muted mt-1">
                  These overrides will only affect this customer's view of the schedules.
                </p>
              </div>

              {/* Field selector */}
              <BulkEditFieldSelector fields={editFields} onFieldsChange={setEditFields} />

              {/* Preview table */}
              {editFields.length > 0 && (
                <BulkEditPreview
                  rows={previewRows}
                  fieldLabel={editFields[0].label}
                  onToggleInclude={toggleSchedule}
                  onViewSchedule={onViewSchedule}
                  schedules={memberSchedules}
                />
              )}

              {editFields.length === 0 && (
                <div className="text-center text-text-muted py-8">
                  Select a field above to configure the override
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-surface-light">
          <div className="text-sm text-text-muted">
            {step === 'customer'
              ? selectedClientId
                ? `Selected: ${selectedClient?.name}`
                : 'Select a customer to continue'
              : `${selectedScheduleIds.size} schedules will receive overrides`}
          </div>
          <div className="flex gap-2">
            {step === 'configure' && (
              <Button variant="secondary" onClick={() => setStep('customer')}>
                Back
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {step === 'customer' ? (
              <Button
                variant="primary"
                onClick={() => setStep('configure')}
                disabled={!selectedClientId}
              >
                Configure Override
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleApply}
                disabled={editFields.length === 0 || selectedScheduleIds.size === 0}
              >
                <Check className="w-4 h-4 mr-1" />
                Apply Overrides
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/schedules/components/AddClientOverrideModal.tsx
git commit -m "feat(schedules): create AddClientOverrideModal component

- Two-step flow: select customer, then configure overrides
- Customer search and selection
- Purple banner for client override mode
- Bulk edit field selector integration
- Preview table with warnings
- Apply overrides action"
```

---

## Task 6: Update ScheduleGroupsTab with Action Buttons

**Files:**
- Modify: `src/modules/schedules/components/ScheduleGroupsTab.tsx`

**Step 1: Add imports and state**

Add to imports:
```typescript
import { Copy, UserPlus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { CopyGroupModal } from './CopyGroupModal';
import { AddClientOverrideModal } from './AddClientOverrideModal';
import type { ScheduleGroup, Schedule, BulkEditField, ClientReference } from '../types';
import { sampleClients } from '../data/sampleData';
```

Update props interface:
```typescript
interface ScheduleGroupsTabProps {
  onConnectionsClick: (sourceItem: SourceItem, connections: EntityConnections) => void;
  schedules: Schedule[];
  onCopyGroup: (newGroupName: string, scheduleIds: string[], edits: BulkEditField[]) => void;
  onApplyClientOverrides: (clientId: string, scheduleIds: string[], edits: BulkEditField[]) => void;
  onViewSchedule: (scheduleId: string) => void;
}
```

Add state after existing state:
```typescript
const [copyModalGroup, setCopyModalGroup] = useState<ScheduleGroup | null>(null);
const [overrideModalGroup, setOverrideModalGroup] = useState<ScheduleGroup | null>(null);
```

**Step 2: Add action buttons to each group row**

Replace the ExpandableRow children content with:
```typescript
{/* Expanded content - show member schedules and actions */}
<div className="p-4 bg-surface-cream rounded-lg space-y-4">
  {/* Action buttons */}
  <div className="flex gap-2">
    <Button
      variant="secondary"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        setCopyModalGroup(group);
      }}
    >
      <Copy className="w-4 h-4 mr-1" />
      Copy Group
    </Button>
    <Button
      variant="secondary"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        setOverrideModalGroup(group);
      }}
    >
      <UserPlus className="w-4 h-4 mr-1" />
      Add Client Override
    </Button>
  </div>

  {/* Member schedules list */}
  <div>
    <h4 className="text-sm font-semibold text-text-primary mb-3">
      Member Schedules ({memberSchedules.length})
    </h4>
    {memberSchedules.length === 0 ? (
      <div className="text-sm text-text-muted text-center py-4">
        No schedules in this group
      </div>
    ) : (
      <div className="space-y-2">
        {memberSchedules.map((schedule) => (
          <div
            key={schedule.id}
            onClick={() => onViewSchedule(schedule.id)}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-border hover:border-brand-cyan cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <Badge
                variant={schedule.isActive ? 'customized' : 'system'}
                size="sm"
              >
                {schedule.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {schedule.name}
                </div>
                {schedule.description && (
                  <div className="text-xs text-text-muted">
                    {schedule.description}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-text-muted">
                {schedule.legs.length} legs
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
```

**Step 3: Add modals at end of component return**

Add before the closing `</div>`:
```typescript
{/* Copy Group Modal */}
{copyModalGroup && (
  <CopyGroupModal
    group={copyModalGroup}
    schedules={schedules}
    onClose={() => setCopyModalGroup(null)}
    onCreateCopies={(name, ids, edits) => {
      onCopyGroup(name, ids, edits);
      setCopyModalGroup(null);
    }}
    onViewSchedule={onViewSchedule}
  />
)}

{/* Add Client Override Modal */}
{overrideModalGroup && (
  <AddClientOverrideModal
    group={overrideModalGroup}
    schedules={schedules}
    clients={sampleClients}
    onClose={() => setOverrideModalGroup(null)}
    onApplyOverrides={(clientId, ids, edits) => {
      onApplyClientOverrides(clientId, ids, edits);
      setOverrideModalGroup(null);
    }}
    onViewSchedule={onViewSchedule}
  />
)}
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/modules/schedules/components/ScheduleGroupsTab.tsx
git commit -m "feat(schedules): add bulk operation buttons to ScheduleGroupsTab

- Copy Group button opens CopyGroupModal
- Add Client Override button opens AddClientOverrideModal
- Click schedule row to view details
- Pass required props for modals"
```

---

## Task 7: Wire Up in SchedulesPage

**Files:**
- Modify: `src/modules/schedules/SchedulesPage.tsx`

**Step 1: Add handler functions**

Add these handlers in the component:

```typescript
const handleCopyGroup = useCallback(
  (newGroupName: string, scheduleIds: string[], edits: BulkEditField[]) => {
    // Create copies of selected schedules
    const newSchedules: Schedule[] = scheduleIds.map((id) => {
      const original = schedules.find((s) => s.id === id);
      if (!original) return null;

      const copy: Schedule = {
        ...original,
        id: `${original.id}-copy-${Date.now()}`,
        name: `${original.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Apply edits
      edits.forEach((edit) => {
        if (edit.field === 'cutoffValue') {
          if (edit.mode === 'relative') {
            copy.operatingSchedule.cutoffValue += Number(edit.value);
          } else {
            copy.operatingSchedule.cutoffValue = Number(edit.value);
          }
          if (edit.unit) {
            copy.operatingSchedule.cutoffUnit = edit.unit;
          }
        }
        // Add more field handlers as needed
      });

      return copy;
    }).filter(Boolean) as Schedule[];

    // Create new group
    const newGroup: ScheduleGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName,
      description: `Copied from original group`,
      scheduleIds: newSchedules.map((s) => s.id),
      isActive: true,
      connections: createEmptyConnections(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update state
    setSchedules((prev) => [...prev, ...newSchedules]);
    setScheduleGroups((prev) => [...prev, newGroup]);

    console.log('Created group:', newGroup.name, 'with', newSchedules.length, 'schedules');
  },
  [schedules]
);

const handleApplyClientOverrides = useCallback(
  (clientId: string, scheduleIds: string[], edits: BulkEditField[]) => {
    const client = sampleClients.find((c) => c.id === clientId);

    const newOverrides: Schedule[] = scheduleIds.map((id) => {
      const base = schedules.find((s) => s.id === id);
      if (!base) return null;

      const override: Schedule = {
        ...base,
        id: `${base.id}-override-${clientId}-${Date.now()}`,
        name: `${base.name} (${client?.shortName || client?.name || clientId})`,
        isOverride: true,
        baseScheduleId: base.id,
        clientVisibility: 'specific',
        clientIds: [clientId],
        overriddenFields: edits.map((e) => e.field),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Apply edits
      edits.forEach((edit) => {
        if (edit.field === 'cutoffValue') {
          if (edit.mode === 'relative') {
            override.operatingSchedule.cutoffValue += Number(edit.value);
          } else {
            override.operatingSchedule.cutoffValue = Number(edit.value);
          }
          if (edit.unit) {
            override.operatingSchedule.cutoffUnit = edit.unit;
          }
        }
        // Add more field handlers as needed
      });

      return override;
    }).filter(Boolean) as Schedule[];

    setSchedules((prev) => [...prev, ...newOverrides]);

    console.log('Created', newOverrides.length, 'overrides for client:', client?.name);
  },
  [schedules]
);

const handleViewScheduleFromGroup = useCallback((scheduleId: string) => {
  const schedule = schedules.find((s) => s.id === scheduleId);
  if (schedule) {
    setSelectedSchedule(schedule);
    setActiveTab('schedules'); // Switch to schedules tab to show detail
  }
}, [schedules]);
```

**Step 2: Update ScheduleGroupsTab usage**

Pass the new props to ScheduleGroupsTab:

```typescript
<ScheduleGroupsTab
  onConnectionsClick={handleConnectionsClick}
  schedules={schedules}
  onCopyGroup={handleCopyGroup}
  onApplyClientOverrides={handleApplyClientOverrides}
  onViewSchedule={handleViewScheduleFromGroup}
/>
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/modules/schedules/SchedulesPage.tsx
git commit -m "feat(schedules): wire up bulk operations in SchedulesPage

- handleCopyGroup creates new schedules and group
- handleApplyClientOverrides creates client-specific overrides
- handleViewScheduleFromGroup switches tab and selects schedule
- Pass all handlers to ScheduleGroupsTab"
```

---

## Task 8: Add Component Exports

**Files:**
- Modify: `src/modules/schedules/components/index.ts`

**Step 1: Add exports**

```typescript
export { BulkEditPreview } from './BulkEditPreview';
export { BulkEditFieldSelector } from './BulkEditFieldSelector';
export { CopyGroupModal } from './CopyGroupModal';
export { AddClientOverrideModal } from './AddClientOverrideModal';
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/schedules/components/index.ts
git commit -m "feat(schedules): export bulk operation components"
```

---

## Task 9: Final Integration Test

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Manual test checklist**

- [ ] Navigate to Schedules → Schedule Groups tab
- [ ] Expand a group → see "Copy Group" and "Add Client Override" buttons
- [ ] Click "Copy Group" → modal opens with schedule selection
- [ ] Uncheck some schedules, change group name
- [ ] Click "Copy & Edit" → bulk edit interface appears
- [ ] Add a field (e.g., Cutoff), set relative +30 minutes
- [ ] See preview table with before/after values
- [ ] Click a schedule row → detail modal opens
- [ ] Click "Create Copies" → new group created
- [ ] Click "Add Client Override" → customer picker appears
- [ ] Select a customer → configure override interface
- [ ] Add a field, see preview with warnings
- [ ] Click "Apply Overrides" → overrides created

**Step 3: Fix any issues found**

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(schedules): complete bulk operations for schedule groups

- Copy Group: duplicate schedules with bulk edits
- Add Client Override: bulk apply customer-specific overrides
- Preview table with before/after and warnings
- Absolute and relative edit modes
- Integration with existing schedule detail views"
```

---

## Summary

| Task | Component | Est. Time |
|------|-----------|-----------|
| 1 | Types | 5 min |
| 2 | BulkEditPreview | 15 min |
| 3 | BulkEditFieldSelector | 15 min |
| 4 | CopyGroupModal | 20 min |
| 5 | AddClientOverrideModal | 20 min |
| 6 | ScheduleGroupsTab updates | 15 min |
| 7 | SchedulesPage wiring | 15 min |
| 8 | Exports | 2 min |
| 9 | Integration test | 15 min |

**Total: ~2 hours**

---

## Future Enhancements (Out of Scope)

- Multi-select from main schedules table
- Multi-customer selection in override modal
- More field types (operating days, zones, speeds)
- Undo/rollback for bulk operations
- Conflict detection for linehaul timing
