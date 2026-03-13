# Import/Export UX Redesign Plan

## Problem Summary

The current implementation has UX issues:
1. **New Setup** forces step-by-step navigation - users must skip through to see each step
2. **Maintain & Improve** shows "working" message instead of actual UI
3. No clear Download Data/Template options at appropriate points
4. Entry point (sidebar button) goes straight to mode selector without quick actions

## Redesigned UX

### Mode 1: "New Setup" (Guided Onboarding)

**Purpose:** Help new users import their initial data in the recommended order.

**UI: Table/List View showing ALL steps at once**

```
┌─────────────────────────────────────────────────────────────────────┐
│ New Setup - Import your data                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  #   Module          Status      Actions                            │
│  ─────────────────────────────────────────────────────────────────  │
│  1   Depots          ○ Pending   [Download Template] [Upload]       │
│  2   Zip Zones       ○ Pending   [Download Template] [Upload]       │
│  3   Rate Cards      ○ Pending   [Download Template] [Upload]       │
│  4   Clients         ○ Pending   [Download Template] [Upload]       │
│  5   Services        ○ Pending   [Download Template] [Upload]       │
│  6   Notifications   ○ Pending   [Download Template] [Upload]       │
│                                                                     │
│  [Download All Templates]                      [Done]               │
└─────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- All steps visible immediately - no clicking through
- Status shows: ○ Pending, ● Complete, ⚠ Has Warnings
- "Download Template" downloads CSV with headers + example hints
- "Upload" opens the import wizard for that specific schema
- "Download All Templates" downloads a ZIP of all templates
- Order is recommended but not enforced - user can do any step
- Steps with missing references show warning icon but aren't blocked

---

### Mode 2: "Upload, Download or Update" (Data Management)

**Purpose:** Day-to-day data management - export existing, import updates.

**UI: Same table structure but with Download Data option**

```
┌─────────────────────────────────────────────────────────────────────┐
│ Upload, Download or Update                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Module          Records   Actions                                  │
│  ─────────────────────────────────────────────────────────────────  │
│  Clients         247       [Download Data] [Download Template] [Upload] │
│  Depots          12        [Download Data] [Download Template] [Upload] │
│  Zip Zones       89        [Download Data] [Download Template] [Upload] │
│  Rate Cards      34        [Download Data] [Download Template] [Upload] │
│  Services        156       [Download Data] [Download Template] [Upload] │
│  Notifications   8         [Download Data] [Download Template] [Upload] │
│                                                                     │
│                                                    [Done]           │
└─────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Shows record count for each module (from existing data)
- "Download Data" exports all existing records as CSV
- "Download Template" downloads blank template with hints
- "Upload" opens import wizard (shows new/modified/unchanged)

---

## Implementation Tasks

### Task 1: Create NewSetupView component
**File:** `src/features/setup-wizard/components/NewSetupView.tsx`

- Table with all wizard steps from config
- Status column (pending/complete/warning)
- Download Template button per row → calls `generateTemplate()` + `downloadCSV()`
- Upload button per row → opens ImportWizardModal for that schema
- "Download All Templates" button at bottom

### Task 2: Create DataManagementView component
**File:** `src/features/setup-wizard/components/DataManagementView.tsx`

- Table with all registered schemas
- Record count column (passed as prop or fetched)
- Download Data button → calls `generateCSV()` + `downloadCSV()`
- Download Template button → same as NewSetupView
- Upload button → opens ImportWizardModal

### Task 3: Update SetupWizard to use new views
**File:** `src/features/setup-wizard/components/SetupWizard.tsx`

- When mode = 'newSetup' → render NewSetupView
- When mode = 'maintainImprove' → render DataManagementView (renamed)
- Remove the old step-by-step WizardStepper flow
- Keep WizardModeSelector as the initial screen

### Task 4: Update WizardModeSelector labels
**File:** `src/features/setup-wizard/components/WizardModeSelector.tsx`

- Change "Maintain & Improve" to "Upload, Download or Update"
- Update descriptions to match new UX

### Task 5: Wire up download functions
- Import `generateTemplate`, `generateCSV`, `downloadCSV` from engine
- Connect buttons to actual download functionality
- Each row needs to know which schema to use

### Task 6: Track completion state (optional enhancement)
- Store which steps have been completed (localStorage or state)
- Show visual progress indicator
- Could persist across sessions

---

## Files to Modify/Create

| Action | File |
|--------|------|
| CREATE | `src/features/setup-wizard/components/NewSetupView.tsx` |
| CREATE | `src/features/setup-wizard/components/DataManagementView.tsx` |
| MODIFY | `src/features/setup-wizard/components/SetupWizard.tsx` |
| MODIFY | `src/features/setup-wizard/components/WizardModeSelector.tsx` |
| MODIFY | `src/features/setup-wizard/components/index.ts` |
| DELETE | Can remove old step-by-step logic if no longer needed |

---

## Success Criteria

1. User can see ALL steps/modules at once (no clicking through)
2. Download Template works for each module individually
3. Download Data works for modules with existing records
4. Upload opens the import wizard for the selected module
5. UI matches brand guidelines (brand-cyan accent, proper typography)
6. No "working" or broken states - everything renders properly

---

## Execution Approach: Parallel Subagent Development

### Batch 1 (parallel - 2 agents)
```
├── Agent A: Task 1 (NewSetupView.tsx)
└── Agent B: Task 2 (DataManagementView.tsx)
```
These are independent components with similar structure.

### Batch 2 (sequential - after Batch 1)
```
└── Agent A: Task 3 + 4 (Update SetupWizard + WizardModeSelector)
```
Depends on the new views being created first.

### Batch 3 (single agent)
```
└── Agent A: Task 5 (Wire up download functions)
```
Integration work across components.

### Batch 4 (optional, single agent)
```
└── Agent A: Task 6 (Track completion state)
```
Enhancement after core functionality works.

---

### Subagent Prompt Template

```
You are implementing Task X for the Import/Export UX Redesign.

PROJECT: C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui

YOUR TASK:
[Task description]

REFERENCE FILES TO READ FIRST:
- src/features/setup-wizard/components/SetupWizard.tsx (current implementation)
- src/features/import-export/engine/CSVGenerator.ts (download functions)
- src/features/import-export/schemas/index.ts (schema registry)
- tailwind.config.js (brand colors)

REQUIREMENTS:
- Use brand-cyan for accent colors
- Follow existing component patterns
- Table should be responsive

RETURN FORMAT:
1. Files created/modified (paths only)
2. Key decisions made
3. Any blockers or questions
4. Build status (pass/fail)

DO NOT return full code - just the summary above.
```

---

## Out of Scope (for this iteration)

- "Download All Templates" as ZIP (nice-to-have)
- Persisting completion state across sessions
- Drag-and-drop reordering of steps
- Progress percentage indicator
