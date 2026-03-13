# Schedules Module Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete Schedule Configuration module that replaces the current confusing form-based UI with an intuitive visual chain builder for configuring delivery schedules of any complexity.

**Architecture:** Modular React component structure following the existing admin-ui patterns. The Schedules module will be self-contained in `src/modules/schedules/` with its own types, components, and sample data. It integrates with the existing connection/tag system for cross-module navigation. The module supports both base schedules and client-specific overrides through an inheritance model.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vite. Uses existing shared components (ExpandableRow, SearchInput, FilterDropdown, ConnectionBadge, TagSidebar).

---

## Table of Contents

1. [Task 1: Create Types & Interfaces](#task-1-create-types--interfaces)
2. [Task 2: Create Sample Data](#task-2-create-sample-data)
3. [Task 3: Create SchedulesPage (Main Entry)](#task-3-create-schedulespage-main-entry)
4. [Task 4: Register Module in App.tsx](#task-4-register-module-in-apptsx)
5. [Task 5: Create ScheduleListTab Component](#task-5-create-schedulelisttab-component)
6. [Task 6: Create ScheduleCard Component](#task-6-create-schedulecard-component)
7. [Task 7: Create ChainBuilder Component (Visual Editor)](#task-7-create-chainbuilder-component)
8. [Task 8: Create LegNode Component](#task-8-create-legnode-component)
9. [Task 9: Create LegConfigPanel Component](#task-9-create-legconfigpanel-component)
10. [Task 10: Create OperatingScheduleSection Component](#task-10-create-operatingschedulesection-component)
11. [Task 11: Create TimelinePreview Component](#task-11-create-timelinepreview-component)
12. [Task 12: Create ScheduleEditForm (Full Editor)](#task-12-create-scheduleeditform-full-editor)
13. [Task 13: Create Override System Components](#task-13-create-override-system-components)
14. [Task 14: Create ZoneSelector Component](#task-14-create-zoneselector-component)
15. [Task 15: Create BookingSimulator Component](#task-15-create-bookingsimulator-component)
16. [Task 16: Final Integration & Polish](#task-16-final-integration--polish)

---

## Domain Context (READ FIRST)

### What is a Schedule?

A Schedule is a service template that teaches the system what to do when a customer requests delivery from Point A to Point B. It controls:

- **Visibility:** Does this delivery option appear for this route? (Based on zones)
- **Availability:** What days and times is this service offered?
- **Cutoff:** When must the booking be received to make this service?
- **Job creation:** What child jobs should the system create? (Collection, linehaul legs, delivery)
- **Routing:** Which depots does the delivery travel through?
- **Timing:** What day/time does each leg of the journey operate?

### Variable Complexity

The same module must handle:

| Type | Example | Jobs Created |
|------|---------|--------------|
| Simple | 1-Hour Shopify Delivery | 1 (direct delivery) |
| Medium | Next-Day Delivery | 2 (collection + delivery) |
| Complex | Multi-Depot Freight | 4+ (collection + linehaul + linehaul + delivery) |

### Two Booking Modes

1. **Fixed Time Mode:** "Your delivery is scheduled for 9:00 AM" - specific slot
2. **Window Mode:** "Deliveries available between 9am and 5pm" - flexible window

### The Time Model

The system calculates everything BACKWARDS from delivery date. The UI must help users understand how choices cascade backwards through the chain.

---

## Task 1: Create Types & Interfaces

**Files:**
- Create: `src/modules/schedules/types.ts`

**Step 1: Create the types file with all interfaces**

```typescript
// src/modules/schedules/types.ts
// Schedules Module Types - Complete type definitions for the schedule configuration system

import type { EntityConnections } from '../territory/types';
import { createEmptyConnections } from '../territory/types';

export type { EntityConnections };
export { createEmptyConnections };

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type BookingMode = 'fixed_time' | 'window';

export type LegType = 'collection' | 'depot' | 'linehaul' | 'delivery';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type TemperatureState = 'ambient' | 'chilled' | 'frozen';

export type TimeUnit = 'minutes' | 'hours' | 'days';

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 'mon', label: 'Monday', short: 'Mon' },
  { value: 'tue', label: 'Tuesday', short: 'Tue' },
  { value: 'wed', label: 'Wednesday', short: 'Wed' },
  { value: 'thu', label: 'Thursday', short: 'Thu' },
  { value: 'fri', label: 'Friday', short: 'Fri' },
  { value: 'sat', label: 'Saturday', short: 'Sat' },
  { value: 'sun', label: 'Sunday', short: 'Sun' },
];

export const TEMPERATURE_STATES: { value: TemperatureState; label: string }[] = [
  { value: 'ambient', label: 'Ambient' },
  { value: 'chilled', label: 'Chilled' },
  { value: 'frozen', label: 'Frozen' },
];

export const BOOKING_MODES: { value: BookingMode; label: string; description: string }[] = [
  { value: 'fixed_time', label: 'Fixed Time', description: 'Delivery at specific scheduled time' },
  { value: 'window', label: 'Window', description: 'Delivery within a time range' },
];

// ============================================
// REFERENCE TYPES (from other modules)
// ============================================

export interface DepotReference {
  id: string;
  name: string;
  code?: string;
}

export interface DropoffLocation {
  id: string;
  depotId: string;
  name: string;
  qrCode?: string;
}

export interface ZoneReference {
  id: string;
  name: string;
  code?: string;
  postcodeCount?: number;
}

export interface SpeedReference {
  id: string;
  name: string;
  code: string;
}

export interface LinehaulRunReference {
  id: string;
  name: string;
  originDepotId: string;
  destinationDepotId: string;
  departureTime: string; // HH:MM
  transitDuration: number;
  transitUnit: TimeUnit;
  activeDays: DayOfWeek[];
}

export interface RateCardReference {
  id: string;
  name: string;
}

export interface ClientReference {
  id: string;
  name: string;
  shortName?: string;
}

// ============================================
// LEG CONFIGURATION TYPES
// ============================================

export interface CollectionLegConfig {
  type: 'collection';
  speedId?: string;
  pickupZoneIds: string[];
  pickupMinutesBefore: number; // Minutes before linehaul/delivery
  bookFromClientAddress: boolean;
  createPickupJob: boolean;
}

export interface DepotLegConfig {
  type: 'depot';
  depotId: string;
  dropoffLocationId?: string;
  storageState?: TemperatureState;
}

export interface LinehaulLegConfig {
  type: 'linehaul';
  runId?: string; // Reference to predefined linehaul run
  speedId?: string;
  dayOffset: number; // Days before delivery
  activeDays: DayOfWeek[];
  transitMinutes: number; // For tracking progress display
  insertToBulk: boolean; // Route builder vs live dispatch
  rateCardId?: string;
}

export interface DeliveryLegConfig {
  type: 'delivery';
  speedId?: string;
  deliveryZoneIds: string[];
  deliveryState?: TemperatureState;
  rateCardId?: string;
}

export type LegConfig = CollectionLegConfig | DepotLegConfig | LinehaulLegConfig | DeliveryLegConfig;

// ============================================
// SCHEDULE LEG (Node in the chain)
// ============================================

export interface ScheduleLeg {
  id: string;
  order: number;
  config: LegConfig;
}

// ============================================
// OPERATING SCHEDULE (Days/Times)
// ============================================

export interface DaySchedule {
  enabled: boolean;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export interface OperatingSchedule {
  // If true, all weekdays use the same schedule
  uniformWeekdays: boolean;
  // Per-day configuration
  days: Record<DayOfWeek, DaySchedule>;
  // Cutoff configuration
  cutoffValue: number;
  cutoffUnit: TimeUnit;
}

// ============================================
// DELIVERY WINDOW RULES
// ============================================

export type DeliveryWindowMode = 'automatic' | 'fixed';

export interface DeliveryWindowRule {
  id: string;
  condition: {
    arrivalBefore: string; // HH:MM - "If final depot arrival is before X"
  };
  result: {
    deliverSameDay: boolean; // true = same day, false = next business day
    windowStart: string; // HH:MM
    windowEnd: string; // HH:MM
  };
}

export interface DeliveryWindowConfig {
  mode: DeliveryWindowMode;
  // For 'automatic' mode
  rules: DeliveryWindowRule[];
  // For 'fixed' mode
  fixedDays: DayOfWeek[];
  fixedWindowStart: string;
  fixedWindowEnd: string;
  fixedTransitDays: number;
}

// ============================================
// MAIN SCHEDULE INTERFACE
// ============================================

export interface Schedule {
  id: string;
  name: string;
  description?: string;

  // Client visibility
  clientVisibility: 'all' | 'specific';
  clientIds: string[]; // Only used if clientVisibility === 'specific'

  // Booking mode
  bookingMode: BookingMode;

  // Speed defaults
  defaultDeliverySpeedId?: string;
  defaultPickupSpeedId?: string;
  defaultLinehaulSpeedId?: string;

  // Origin configuration
  originType: 'depot' | 'client_address';
  originDepotId?: string; // Used if originType === 'depot'
  fallbackDepotId?: string; // Optional fallback if originType === 'client_address'

  // The leg chain
  legs: ScheduleLeg[];

  // Operating schedule
  operatingSchedule: OperatingSchedule;

  // Delivery window configuration
  deliveryWindow: DeliveryWindowConfig;

  // Status
  isActive: boolean;

  // Override info (for client-specific schedules)
  isOverride: boolean;
  baseScheduleId?: string; // Parent schedule if this is an override
  overriddenFields: string[]; // Which fields differ from base

  // Connections (for tag system)
  connections: EntityConnections;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// ============================================
// SCHEDULE GROUP (Optional feature)
// ============================================

export interface ScheduleGroup {
  id: string;
  name: string;
  description?: string;
  scheduleIds: string[];
  isActive: boolean;
  connections: EntityConnections;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// FILTER STATE
// ============================================

export interface ScheduleFilterState {
  search: string;
  status: 'all' | 'active' | 'inactive';
  type: 'all' | 'base' | 'override';
  clientId: string | 'all';
  originDepotId: string | 'all';
  destinationDepotId: string | 'all';
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getBookingModeLabel(mode: BookingMode): string {
  const found = BOOKING_MODES.find(m => m.value === mode);
  return found?.label ?? mode;
}

export function getDayLabel(day: DayOfWeek, short = false): string {
  const found = DAYS_OF_WEEK.find(d => d.value === day);
  return short ? (found?.short ?? day) : (found?.label ?? day);
}

export function getTemperatureLabel(state?: TemperatureState): string {
  if (!state) return '—';
  const found = TEMPERATURE_STATES.find(t => t.value === state);
  return found?.label ?? state;
}

export function getLegTypeLabel(type: LegType): string {
  const labels: Record<LegType, string> = {
    collection: 'Collection',
    depot: 'Depot Stop',
    linehaul: 'Linehaul',
    delivery: 'Delivery',
  };
  return labels[type] ?? type;
}

export function countLegs(schedule: Schedule): number {
  return schedule.legs.length;
}

export function getRouteDescription(schedule: Schedule, depots: DepotReference[]): string {
  const parts: string[] = [];

  if (schedule.originType === 'client_address') {
    parts.push('Client');
  } else if (schedule.originDepotId) {
    const depot = depots.find(d => d.id === schedule.originDepotId);
    parts.push(depot?.code ?? depot?.name ?? 'Depot');
  }

  // Add intermediate depots from legs
  schedule.legs.forEach(leg => {
    if (leg.config.type === 'depot') {
      const depot = depots.find(d => d.id === leg.config.depotId);
      if (depot) {
        parts.push(depot.code ?? depot.name);
      }
    }
  });

  // Always ends at client for delivery
  parts.push('Client');

  return parts.join(' → ');
}

export function getActiveDaysSummary(schedule: OperatingSchedule): string {
  const activeDays = DAYS_OF_WEEK.filter(d => schedule.days[d.value].enabled);

  if (activeDays.length === 7) return 'Every day';
  if (activeDays.length === 0) return 'No days';

  // Check for Mon-Fri
  const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'] as DayOfWeek[];
  const weekend = ['sat', 'sun'] as DayOfWeek[];

  const hasAllWeekdays = weekdays.every(d => schedule.days[d].enabled);
  const hasNoWeekend = weekend.every(d => !schedule.days[d].enabled);

  if (hasAllWeekdays && hasNoWeekend) return 'Mon–Fri';

  // Otherwise list short names
  return activeDays.map(d => d.short).join(', ');
}

export function createDefaultOperatingSchedule(): OperatingSchedule {
  const defaultDay: DaySchedule = {
    enabled: true,
    startTime: '09:00',
    endTime: '17:00',
  };

  const weekendDay: DaySchedule = {
    enabled: false,
    startTime: '09:00',
    endTime: '17:00',
  };

  return {
    uniformWeekdays: true,
    days: {
      mon: { ...defaultDay },
      tue: { ...defaultDay },
      wed: { ...defaultDay },
      thu: { ...defaultDay },
      fri: { ...defaultDay },
      sat: { ...weekendDay },
      sun: { ...weekendDay },
    },
    cutoffValue: 60,
    cutoffUnit: 'minutes',
  };
}

export function createDefaultDeliveryWindow(): DeliveryWindowConfig {
  return {
    mode: 'automatic',
    rules: [
      {
        id: 'rule-1',
        condition: { arrivalBefore: '10:00' },
        result: { deliverSameDay: true, windowStart: '12:00', windowEnd: '17:00' },
      },
      {
        id: 'rule-2',
        condition: { arrivalBefore: '23:59' },
        result: { deliverSameDay: false, windowStart: '08:00', windowEnd: '12:00' },
      },
    ],
    fixedDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    fixedWindowStart: '08:00',
    fixedWindowEnd: '17:00',
    fixedTransitDays: 1,
  };
}

export function createEmptySchedule(): Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    description: '',
    clientVisibility: 'all',
    clientIds: [],
    bookingMode: 'window',
    defaultDeliverySpeedId: undefined,
    defaultPickupSpeedId: undefined,
    defaultLinehaulSpeedId: undefined,
    originType: 'depot',
    originDepotId: undefined,
    fallbackDepotId: undefined,
    legs: [
      {
        id: 'leg-delivery-1',
        order: 0,
        config: {
          type: 'delivery',
          deliveryZoneIds: [],
        },
      },
    ],
    operatingSchedule: createDefaultOperatingSchedule(),
    deliveryWindow: createDefaultDeliveryWindow(),
    isActive: true,
    isOverride: false,
    baseScheduleId: undefined,
    overriddenFields: [],
    connections: createEmptyConnections(),
  };
}

export function createEmptyScheduleGroup(): Omit<ScheduleGroup, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    description: '',
    scheduleIds: [],
    isActive: true,
    connections: createEmptyConnections(),
  };
}

// ============================================
// OVERRIDE SYSTEM HELPERS
// ============================================

export const OVERRIDABLE_FIELDS: { field: string; label: string }[] = [
  { field: 'operatingSchedule.cutoffValue', label: 'Booking Cutoff' },
  { field: 'operatingSchedule.days', label: 'Operating Days' },
  { field: 'legs[0].config.pickupMinutesBefore', label: 'Pickup Time Offset' },
  { field: 'defaultDeliverySpeedId', label: 'Delivery Speed' },
  { field: 'defaultPickupSpeedId', label: 'Pickup Speed' },
];

export const NON_OVERRIDABLE_FIELDS = [
  'legs', // Route structure
  'originType',
  'originDepotId',
  'deliveryWindow.mode', // Delivery rules are route-level
];

export function isFieldOverridable(field: string): boolean {
  return !NON_OVERRIDABLE_FIELDS.some(nof => field.startsWith(nof));
}
```

**Step 2: Verify the file compiles**

Run: `cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui" && npx tsc --noEmit src/modules/schedules/types.ts`

Expected: No errors (or only import-related warnings since module isn't connected yet)

**Step 3: Commit**

```bash
git add src/modules/schedules/types.ts
git commit -m "feat(schedules): add type definitions for schedule module

Includes interfaces for Schedule, ScheduleLeg, OperatingSchedule,
DeliveryWindowConfig, and all supporting types. Follows Scope 3
specification with booking modes, leg chain model, and override system.

Generated with Claude Code"
```

---

## Task 2: Create Sample Data

**Files:**
- Create: `src/modules/schedules/data/sampleData.ts`

**Step 1: Create sample data file**

```typescript
// src/modules/schedules/data/sampleData.ts
// Sample data for Schedules module development

import type {
  Schedule,
  ScheduleGroup,
  DepotReference,
  ZoneReference,
  SpeedReference,
  LinehaulRunReference,
  ClientReference,
  DropoffLocation,
  RateCardReference,
} from '../types';
import { createEmptyConnections } from '../../territory/types';

// ============================================
// REFERENCE DATA (would come from other modules)
// ============================================

export const sampleDepots: DepotReference[] = [
  { id: 'depot-den', name: 'Denver Main Depot', code: 'DEN' },
  { id: 'depot-abq', name: 'Albuquerque Depot', code: 'ABQ' },
  { id: 'depot-phx', name: 'Phoenix Hub', code: 'PHX' },
  { id: 'depot-slc', name: 'Salt Lake City Depot', code: 'SLC' },
  { id: 'depot-las', name: 'Las Vegas Depot', code: 'LAS' },
];

export const sampleDropoffLocations: DropoffLocation[] = [
  { id: 'drop-den-1', depotId: 'depot-den', name: 'Bay 1 - Standard', qrCode: 'DEN-BAY1' },
  { id: 'drop-den-2', depotId: 'depot-den', name: 'Bay 2 - Chilled', qrCode: 'DEN-BAY2' },
  { id: 'drop-den-3', depotId: 'depot-den', name: 'Bay 3 - Frozen', qrCode: 'DEN-BAY3' },
  { id: 'drop-abq-1', depotId: 'depot-abq', name: 'Loading Dock A', qrCode: 'ABQ-DOCKA' },
  { id: 'drop-abq-2', depotId: 'depot-abq', name: 'Loading Dock B', qrCode: 'ABQ-DOCKB' },
];

export const sampleZones: ZoneReference[] = [
  { id: 'zone-1', name: 'DEN Inner City', code: '1', postcodeCount: 45 },
  { id: 'zone-2', name: 'DEN Metro', code: '2', postcodeCount: 120 },
  { id: 'zone-3', name: 'DEN Suburban', code: '3', postcodeCount: 85 },
  { id: 'zone-4', name: 'ABQ Central', code: '4', postcodeCount: 35 },
  { id: 'zone-5', name: 'ABQ Metro', code: '5', postcodeCount: 60 },
  { id: 'zone-6', name: 'PHX Central', code: '6', postcodeCount: 55 },
  { id: 'zone-7', name: 'Rural North', code: '7', postcodeCount: 200 },
  { id: 'zone-8', name: 'Rural South', code: '8', postcodeCount: 180 },
  { id: 'zone-9', name: 'Interstate Corridor', code: '9', postcodeCount: 40 },
  { id: 'zone-10', name: 'Remote Areas', code: '10', postcodeCount: 300 },
];

export const sampleSpeeds: SpeedReference[] = [
  { id: 'speed-sameday', name: 'Same Day', code: 'SD' },
  { id: 'speed-nextday', name: 'Next Day', code: 'ND' },
  { id: 'speed-overnight', name: 'Overnight', code: 'ON' },
  { id: 'speed-economy', name: 'Economy', code: 'EC' },
  { id: 'speed-express', name: 'Express', code: 'EX' },
  { id: 'speed-standard', name: 'Standard', code: 'ST' },
];

export const sampleLinehaulRuns: LinehaulRunReference[] = [
  {
    id: 'run-den-abq-night',
    name: 'DEN-ABQ Nightline',
    originDepotId: 'depot-den',
    destinationDepotId: 'depot-abq',
    departureTime: '19:00',
    transitDuration: 10,
    transitUnit: 'hours',
    activeDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  },
  {
    id: 'run-den-phx-day',
    name: 'DEN-PHX Dayline',
    originDepotId: 'depot-den',
    destinationDepotId: 'depot-phx',
    departureTime: '06:00',
    transitDuration: 12,
    transitUnit: 'hours',
    activeDays: ['mon', 'wed', 'fri'],
  },
  {
    id: 'run-phx-abq',
    name: 'PHX-ABQ Shuttle',
    originDepotId: 'depot-phx',
    destinationDepotId: 'depot-abq',
    departureTime: '14:00',
    transitDuration: 6,
    transitUnit: 'hours',
    activeDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
  },
];

export const sampleClients: ClientReference[] = [
  { id: 'client-default', name: 'DEFAULT', shortName: 'DEFAULT' },
  { id: 'client-acme', name: 'Acme Corporation', shortName: 'ACME' },
  { id: 'client-globex', name: 'Globex Industries', shortName: 'GLOBEX' },
  { id: 'client-initech', name: 'Initech', shortName: 'INITECH' },
  { id: 'client-umbrella', name: 'Umbrella Corp', shortName: 'UMBRELLA' },
];

export const sampleRateCards: RateCardReference[] = [
  { id: 'rate-standard', name: 'Standard Rates 2024' },
  { id: 'rate-express', name: 'Express Premium' },
  { id: 'rate-economy', name: 'Economy Rates' },
  { id: 'rate-acme', name: 'ACME Negotiated' },
];

// ============================================
// SAMPLE SCHEDULES
// ============================================

export const sampleSchedules: Schedule[] = [
  // SIMPLE: Direct delivery (1 leg)
  {
    id: 'sch-1',
    name: '1-Hour Local Delivery',
    description: 'Same-day 1-hour delivery for local retailers',
    clientVisibility: 'all',
    clientIds: [],
    bookingMode: 'window',
    defaultDeliverySpeedId: 'speed-sameday',
    defaultPickupSpeedId: 'speed-express',
    defaultLinehaulSpeedId: undefined,
    originType: 'client_address',
    originDepotId: undefined,
    fallbackDepotId: undefined,
    legs: [
      {
        id: 'leg-1-del',
        order: 0,
        config: {
          type: 'delivery',
          speedId: 'speed-sameday',
          deliveryZoneIds: ['zone-1', 'zone-2'],
          deliveryState: 'ambient',
        },
      },
    ],
    operatingSchedule: {
      uniformWeekdays: true,
      days: {
        mon: { enabled: true, startTime: '09:00', endTime: '18:00' },
        tue: { enabled: true, startTime: '09:00', endTime: '18:00' },
        wed: { enabled: true, startTime: '09:00', endTime: '18:00' },
        thu: { enabled: true, startTime: '09:00', endTime: '18:00' },
        fri: { enabled: true, startTime: '09:00', endTime: '18:00' },
        sat: { enabled: true, startTime: '10:00', endTime: '16:00' },
        sun: { enabled: false, startTime: '09:00', endTime: '17:00' },
      },
      cutoffValue: 30,
      cutoffUnit: 'minutes',
    },
    deliveryWindow: {
      mode: 'fixed',
      rules: [],
      fixedDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      fixedWindowStart: '09:00',
      fixedWindowEnd: '18:00',
      fixedTransitDays: 0,
    },
    isActive: true,
    isOverride: false,
    baseScheduleId: undefined,
    overriddenFields: [],
    connections: {
      ...createEmptyConnections(),
      customers: { hasConnections: true, count: 24 },
      services: { hasConnections: true, count: 2 },
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-20T14:30:00Z',
  },

  // MEDIUM: Collection + Delivery (2 legs)
  {
    id: 'sch-2',
    name: 'Next Day Standard',
    description: 'Collection in afternoon, delivery next morning',
    clientVisibility: 'all',
    clientIds: [],
    bookingMode: 'fixed_time',
    defaultDeliverySpeedId: 'speed-nextday',
    defaultPickupSpeedId: 'speed-standard',
    defaultLinehaulSpeedId: undefined,
    originType: 'depot',
    originDepotId: 'depot-den',
    fallbackDepotId: undefined,
    legs: [
      {
        id: 'leg-2-col',
        order: 0,
        config: {
          type: 'collection',
          speedId: 'speed-standard',
          pickupZoneIds: ['zone-1', 'zone-2', 'zone-3'],
          pickupMinutesBefore: 120,
          bookFromClientAddress: false,
          createPickupJob: true,
        },
      },
      {
        id: 'leg-2-del',
        order: 1,
        config: {
          type: 'delivery',
          speedId: 'speed-nextday',
          deliveryZoneIds: ['zone-1', 'zone-2', 'zone-3'],
          deliveryState: 'ambient',
        },
      },
    ],
    operatingSchedule: {
      uniformWeekdays: true,
      days: {
        mon: { enabled: true, startTime: '08:00', endTime: '17:00' },
        tue: { enabled: true, startTime: '08:00', endTime: '17:00' },
        wed: { enabled: true, startTime: '08:00', endTime: '17:00' },
        thu: { enabled: true, startTime: '08:00', endTime: '17:00' },
        fri: { enabled: true, startTime: '08:00', endTime: '17:00' },
        sat: { enabled: false, startTime: '08:00', endTime: '12:00' },
        sun: { enabled: false, startTime: '08:00', endTime: '12:00' },
      },
      cutoffValue: 60,
      cutoffUnit: 'minutes',
    },
    deliveryWindow: {
      mode: 'automatic',
      rules: [
        {
          id: 'rule-2-1',
          condition: { arrivalBefore: '06:00' },
          result: { deliverSameDay: true, windowStart: '08:00', windowEnd: '12:00' },
        },
        {
          id: 'rule-2-2',
          condition: { arrivalBefore: '23:59' },
          result: { deliverSameDay: false, windowStart: '08:00', windowEnd: '12:00' },
        },
      ],
      fixedDays: [],
      fixedWindowStart: '',
      fixedWindowEnd: '',
      fixedTransitDays: 1,
    },
    isActive: true,
    isOverride: false,
    baseScheduleId: undefined,
    overriddenFields: [],
    connections: {
      ...createEmptyConnections(),
      customers: { hasConnections: true, count: 156 },
      services: { hasConnections: true, count: 4 },
      depots: { hasConnections: true, count: 1 },
    },
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-10-15T11:45:00Z',
  },

  // COMPLEX: Multi-depot freight (4 legs)
  {
    id: 'sch-3',
    name: 'DEN → ABQ Overnight Linehaul',
    description: 'Pickup in Denver, linehaul overnight, delivery in Albuquerque next day',
    clientVisibility: 'all',
    clientIds: [],
    bookingMode: 'fixed_time',
    defaultDeliverySpeedId: 'speed-overnight',
    defaultPickupSpeedId: 'speed-standard',
    defaultLinehaulSpeedId: 'speed-overnight',
    originType: 'depot',
    originDepotId: 'depot-den',
    fallbackDepotId: undefined,
    legs: [
      {
        id: 'leg-3-col',
        order: 0,
        config: {
          type: 'collection',
          speedId: 'speed-standard',
          pickupZoneIds: ['zone-1', 'zone-2', 'zone-3'],
          pickupMinutesBefore: 180,
          bookFromClientAddress: false,
          createPickupJob: true,
        },
      },
      {
        id: 'leg-3-depot1',
        order: 1,
        config: {
          type: 'depot',
          depotId: 'depot-den',
          dropoffLocationId: 'drop-den-1',
          storageState: 'ambient',
        },
      },
      {
        id: 'leg-3-lh',
        order: 2,
        config: {
          type: 'linehaul',
          runId: 'run-den-abq-night',
          speedId: 'speed-overnight',
          dayOffset: 0,
          activeDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
          transitMinutes: 600,
          insertToBulk: true,
          rateCardId: 'rate-standard',
        },
      },
      {
        id: 'leg-3-del',
        order: 3,
        config: {
          type: 'delivery',
          speedId: 'speed-overnight',
          deliveryZoneIds: ['zone-4', 'zone-5'],
          deliveryState: 'ambient',
          rateCardId: 'rate-standard',
        },
      },
    ],
    operatingSchedule: {
      uniformWeekdays: true,
      days: {
        mon: { enabled: true, startTime: '09:00', endTime: '17:00' },
        tue: { enabled: true, startTime: '09:00', endTime: '17:00' },
        wed: { enabled: true, startTime: '09:00', endTime: '17:00' },
        thu: { enabled: true, startTime: '09:00', endTime: '17:00' },
        fri: { enabled: true, startTime: '09:00', endTime: '17:00' },
        sat: { enabled: false, startTime: '09:00', endTime: '17:00' },
        sun: { enabled: false, startTime: '09:00', endTime: '17:00' },
      },
      cutoffValue: 2,
      cutoffUnit: 'hours',
    },
    deliveryWindow: {
      mode: 'automatic',
      rules: [
        {
          id: 'rule-3-1',
          condition: { arrivalBefore: '06:00' },
          result: { deliverSameDay: true, windowStart: '08:00', windowEnd: '12:00' },
        },
        {
          id: 'rule-3-2',
          condition: { arrivalBefore: '12:00' },
          result: { deliverSameDay: true, windowStart: '14:00', windowEnd: '18:00' },
        },
        {
          id: 'rule-3-3',
          condition: { arrivalBefore: '23:59' },
          result: { deliverSameDay: false, windowStart: '08:00', windowEnd: '12:00' },
        },
      ],
      fixedDays: [],
      fixedWindowStart: '',
      fixedWindowEnd: '',
      fixedTransitDays: 1,
    },
    isActive: true,
    isOverride: false,
    baseScheduleId: undefined,
    overriddenFields: [],
    connections: {
      ...createEmptyConnections(),
      customers: { hasConnections: true, count: 89 },
      services: { hasConnections: true, count: 3 },
      depots: { hasConnections: true, count: 2 },
      linehauls: { hasConnections: true, count: 1 },
      rateCards: { hasConnections: true, count: 1 },
    },
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-12-01T09:15:00Z',
  },

  // CLIENT OVERRIDE: ACME with later cutoff
  {
    id: 'sch-4',
    name: 'DEN → ABQ Overnight (ACME)',
    description: 'ACME-specific override with later cutoff',
    clientVisibility: 'specific',
    clientIds: ['client-acme'],
    bookingMode: 'fixed_time',
    defaultDeliverySpeedId: 'speed-overnight',
    defaultPickupSpeedId: 'speed-standard',
    defaultLinehaulSpeedId: 'speed-overnight',
    originType: 'depot',
    originDepotId: 'depot-den',
    fallbackDepotId: undefined,
    legs: [
      {
        id: 'leg-4-col',
        order: 0,
        config: {
          type: 'collection',
          speedId: 'speed-standard',
          pickupZoneIds: ['zone-1', 'zone-2', 'zone-3'],
          pickupMinutesBefore: 120, // OVERRIDE: 2 hours instead of 3
          bookFromClientAddress: false,
          createPickupJob: true,
        },
      },
      {
        id: 'leg-4-depot1',
        order: 1,
        config: {
          type: 'depot',
          depotId: 'depot-den',
          dropoffLocationId: 'drop-den-1',
          storageState: 'ambient',
        },
      },
      {
        id: 'leg-4-lh',
        order: 2,
        config: {
          type: 'linehaul',
          runId: 'run-den-abq-night',
          speedId: 'speed-overnight',
          dayOffset: 0,
          activeDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
          transitMinutes: 600,
          insertToBulk: true,
          rateCardId: 'rate-acme', // OVERRIDE: ACME rate card
        },
      },
      {
        id: 'leg-4-del',
        order: 3,
        config: {
          type: 'delivery',
          speedId: 'speed-overnight',
          deliveryZoneIds: ['zone-4', 'zone-5'],
          deliveryState: 'ambient',
          rateCardId: 'rate-acme',
        },
      },
    ],
    operatingSchedule: {
      uniformWeekdays: true,
      days: {
        mon: { enabled: true, startTime: '09:00', endTime: '18:00' }, // OVERRIDE: Later end
        tue: { enabled: true, startTime: '09:00', endTime: '18:00' },
        wed: { enabled: true, startTime: '09:00', endTime: '18:00' },
        thu: { enabled: true, startTime: '09:00', endTime: '18:00' },
        fri: { enabled: true, startTime: '09:00', endTime: '18:00' },
        sat: { enabled: false, startTime: '09:00', endTime: '17:00' },
        sun: { enabled: false, startTime: '09:00', endTime: '17:00' },
      },
      cutoffValue: 1, // OVERRIDE: 1 hour instead of 2
      cutoffUnit: 'hours',
    },
    deliveryWindow: {
      mode: 'automatic',
      rules: [
        {
          id: 'rule-4-1',
          condition: { arrivalBefore: '06:00' },
          result: { deliverSameDay: true, windowStart: '08:00', windowEnd: '12:00' },
        },
        {
          id: 'rule-4-2',
          condition: { arrivalBefore: '12:00' },
          result: { deliverSameDay: true, windowStart: '14:00', windowEnd: '18:00' },
        },
        {
          id: 'rule-4-3',
          condition: { arrivalBefore: '23:59' },
          result: { deliverSameDay: false, windowStart: '08:00', windowEnd: '12:00' },
        },
      ],
      fixedDays: [],
      fixedWindowStart: '',
      fixedWindowEnd: '',
      fixedTransitDays: 1,
    },
    isActive: true,
    isOverride: true,
    baseScheduleId: 'sch-3',
    overriddenFields: [
      'operatingSchedule.cutoffValue',
      'operatingSchedule.days',
      'legs[0].config.pickupMinutesBefore',
    ],
    connections: {
      ...createEmptyConnections(),
      customers: { hasConnections: true, count: 1 },
      services: { hasConnections: true, count: 3 },
      depots: { hasConnections: true, count: 2 },
      linehauls: { hasConnections: true, count: 1 },
      rateCards: { hasConnections: true, count: 1 },
    },
    createdAt: '2024-06-15T14:00:00Z',
    updatedAt: '2024-11-28T10:30:00Z',
  },

  // Another simple one for variety
  {
    id: 'sch-5',
    name: 'Express Same Day',
    description: 'Premium same-day delivery service',
    clientVisibility: 'specific',
    clientIds: ['client-acme', 'client-globex'],
    bookingMode: 'window',
    defaultDeliverySpeedId: 'speed-express',
    defaultPickupSpeedId: 'speed-express',
    defaultLinehaulSpeedId: undefined,
    originType: 'client_address',
    originDepotId: undefined,
    fallbackDepotId: 'depot-den',
    legs: [
      {
        id: 'leg-5-del',
        order: 0,
        config: {
          type: 'delivery',
          speedId: 'speed-express',
          deliveryZoneIds: ['zone-1'],
          deliveryState: 'ambient',
          rateCardId: 'rate-express',
        },
      },
    ],
    operatingSchedule: {
      uniformWeekdays: false,
      days: {
        mon: { enabled: true, startTime: '07:00', endTime: '20:00' },
        tue: { enabled: true, startTime: '07:00', endTime: '20:00' },
        wed: { enabled: true, startTime: '07:00', endTime: '20:00' },
        thu: { enabled: true, startTime: '07:00', endTime: '20:00' },
        fri: { enabled: true, startTime: '07:00', endTime: '20:00' },
        sat: { enabled: true, startTime: '08:00', endTime: '18:00' },
        sun: { enabled: true, startTime: '10:00', endTime: '16:00' },
      },
      cutoffValue: 15,
      cutoffUnit: 'minutes',
    },
    deliveryWindow: {
      mode: 'fixed',
      rules: [],
      fixedDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      fixedWindowStart: '07:00',
      fixedWindowEnd: '20:00',
      fixedTransitDays: 0,
    },
    isActive: true,
    isOverride: false,
    baseScheduleId: undefined,
    overriddenFields: [],
    connections: {
      ...createEmptyConnections(),
      customers: { hasConnections: true, count: 2 },
      services: { hasConnections: true, count: 1 },
      rateCards: { hasConnections: true, count: 1 },
    },
    createdAt: '2024-04-20T11:00:00Z',
    updatedAt: '2024-09-05T16:20:00Z',
  },
];

// ============================================
// SAMPLE SCHEDULE GROUPS
// ============================================

export const sampleScheduleGroups: ScheduleGroup[] = [
  {
    id: 'sg-1',
    name: 'Denver Metro Services',
    description: 'All schedules servicing Denver metropolitan area',
    scheduleIds: ['sch-1', 'sch-2', 'sch-5'],
    isActive: true,
    connections: {
      ...createEmptyConnections(),
      services: { hasConnections: true, count: 3 },
      depots: { hasConnections: true, count: 1 },
    },
    createdAt: '2024-05-01T09:00:00Z',
    updatedAt: '2024-11-15T14:00:00Z',
  },
  {
    id: 'sg-2',
    name: 'Interstate Linehaul',
    description: 'Long-haul schedules between major depots',
    scheduleIds: ['sch-3', 'sch-4'],
    isActive: true,
    connections: {
      ...createEmptyConnections(),
      services: { hasConnections: true, count: 2 },
      depots: { hasConnections: true, count: 2 },
      linehauls: { hasConnections: true, count: 1 },
    },
    createdAt: '2024-05-01T09:00:00Z',
    updatedAt: '2024-11-15T14:00:00Z',
  },
];

// ============================================
// FILTER OPTIONS (for dropdowns)
// ============================================

export const scheduleFilterOptions = {
  status: [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ],
  type: [
    { value: 'all', label: 'All Types' },
    { value: 'base', label: 'Base Schedules' },
    { value: 'override', label: 'Client Overrides' },
  ],
  bookingMode: [
    { value: 'all', label: 'All Modes' },
    { value: 'fixed_time', label: 'Fixed Time' },
    { value: 'window', label: 'Window' },
  ],
};
```

**Step 2: Verify file compiles**

Run: `cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui" && npx tsc --noEmit src/modules/schedules/data/sampleData.ts`

Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/schedules/data/sampleData.ts
git commit -m "feat(schedules): add sample data for development

Includes 5 sample schedules covering simple (1-leg), medium (2-leg),
and complex (4-leg) configurations. Also includes client override
example and reference data for depots, zones, speeds, linehaul runs.

Generated with Claude Code"
```

---

## Task 3: Create SchedulesPage (Main Entry)

**Files:**
- Create: `src/modules/schedules/SchedulesPage.tsx`
- Create: `src/modules/schedules/index.ts`

**Step 1: Create the main page component**

```typescript
// src/modules/schedules/SchedulesPage.tsx
import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/layout/Tabs';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { TagSidebar } from '../../components/tags';
import type { SourceItem, EntityConnections } from '../territory/types';
import { createEmptyConnections } from '../territory/types';

// Placeholder tabs - will be replaced with actual components
function SchedulesTabPlaceholder() {
  return <div className="p-8 text-center text-text-secondary">Schedules list coming soon...</div>;
}

function ScheduleGroupsTabPlaceholder() {
  return <div className="p-8 text-center text-text-secondary">Schedule groups coming soon...</div>;
}

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
    subtitle: '',
  });
  const [sidebarConnections, setSidebarConnections] = useState<EntityConnections>(
    createEmptyConnections()
  );

  const handleConnectionsClick = (sourceItem: SourceItem, connections: EntityConnections) => {
    setSidebarSourceItem(sourceItem);
    setSidebarConnections(connections);
    setTagSidebarOpen(true);
  };

  const handleNavigate = (category: string, sourceItem: SourceItem) => {
    // In a real app, this would navigate to the related module
    console.log('Navigate to', category, 'from', sourceItem);
    setTagSidebarOpen(false);
  };

  const handleNewSchedule = () => {
    // Will open the schedule editor modal/page
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
          <div className="p-4">
            {activeTab === 'schedules' && <SchedulesTabPlaceholder />}
            {activeTab === 'groups' && <ScheduleGroupsTabPlaceholder />}
          </div>
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

**Step 2: Create the index.ts export file**

```typescript
// src/modules/schedules/index.ts
export { default } from './SchedulesPage';
export { SchedulesPage } from './SchedulesPage';
```

**Step 3: Verify files compile**

Run: `cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui" && npx tsc --noEmit src/modules/schedules/SchedulesPage.tsx`

Expected: No errors

**Step 4: Commit**

```bash
git add src/modules/schedules/SchedulesPage.tsx src/modules/schedules/index.ts
git commit -m "feat(schedules): add SchedulesPage main entry component

Basic page structure with tabs, header, and tag sidebar integration.
Uses placeholder components for tabs until full implementation.

Generated with Claude Code"
```

---

## Task 4: Register Module in App.tsx

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add import at top of file (around line 6)**

Find the existing module imports and add:

```typescript
import { SchedulesPage } from './modules/schedules';
```

**Step 2: Add 'schedules' to ModuleId type (around line 17-20)**

Find the `ModuleId` type definition and add `'schedules'`:

```typescript
type ModuleId = 'clients' | 'agents' | 'drivers' | 'holidays' | 'rates' | 'contacts' | 'billing' | 'jobSettings' | 'sources' | 'airports' | 'staff' | 'customerUsers' | 'tasks' | 'schedules' | 'notifications' | 'automations' | 'territory' | 'dashboards' | 'siteSettings';
```

**Step 3: Add 'schedules' to IMPLEMENTED_MODULES array (around line 112)**

Find `IMPLEMENTED_MODULES` and add `'schedules'`:

```typescript
const IMPLEMENTED_MODULES: ModuleId[] = ['clients', 'territory', 'notifications', 'tasks', 'automations', 'schedules'];
```

**Step 4: Add case in renderModule function (around line 187-217)**

Find the `renderModule` function and add the schedules case:

```typescript
case 'schedules':
  return <SchedulesPage />;
```

**Step 5: Add to MENU_SECTIONS in the Advanced section (around lines 36-109)**

Find the 'advanced' section in `MENU_SECTIONS` and add schedules after tasks:

```typescript
{
  id: 'advanced',
  label: 'Advanced',
  items: [
    { id: 'tasks', label: 'Tasks' },
    { id: 'schedules', label: 'Schedules' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'automations', label: 'Automations' },
    { id: 'territory', label: 'Territory & Locations' },
    { id: 'dashboards', label: 'Dashboards' },
    { id: 'siteSettings', label: 'Site Settings & Integrations' },
  ],
},
```

**Step 6: Verify app builds**

Run: `cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui" && npm run build`

Expected: Build succeeds

**Step 7: Test in browser**

Run: `cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui" && npm run dev`

Expected: Navigate to Schedules in the Advanced menu and see the placeholder page

**Step 8: Commit**

```bash
git add src/App.tsx
git commit -m "feat(schedules): register Schedules module in App.tsx

Adds Schedules to menu under Advanced section, adds to implemented
modules, and wires up routing to SchedulesPage component.

Generated with Claude Code"
```

---

## Task 5: Create ScheduleListTab Component

**Files:**
- Create: `src/modules/schedules/components/ScheduleListTab.tsx`

**Step 1: Create the list tab component**

```typescript
// src/modules/schedules/components/ScheduleListTab.tsx
import { useState, useMemo } from 'react';
import { ExpandableRow } from '../../../components/data/ExpandableRow';
import { SearchInput } from '../../../components/filters/SearchInput';
import { FilterDropdown } from '../../../components/filters/FilterDropdown';
import { Badge } from '../../../components/ui/Badge';
import { sampleSchedules, sampleDepots, scheduleFilterOptions } from '../data/sampleData';
import type { Schedule, ScheduleFilterState } from '../types';
import { getBookingModeLabel, getActiveDaysSummary, getRouteDescription, countLegs } from '../types';
import type { SourceItem, EntityConnections } from '../../territory/types';
import { countConnectedCategories } from '../../territory/types';

interface ScheduleListTabProps {
  onConnectionsClick: (sourceItem: SourceItem, connections: EntityConnections) => void;
  onEditSchedule?: (schedule: Schedule) => void;
}

export function ScheduleListTab({ onConnectionsClick, onEditSchedule }: ScheduleListTabProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>(sampleSchedules);
  const [filters, setFilters] = useState<ScheduleFilterState>({
    search: '',
    status: 'all',
    type: 'all',
    clientId: 'all',
    originDepotId: 'all',
    destinationDepotId: 'all',
  });

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = schedule.name.toLowerCase().includes(searchLower);
        const matchesDescription = schedule.description?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDescription) return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        if (filters.status === 'active' && !schedule.isActive) return false;
        if (filters.status === 'inactive' && schedule.isActive) return false;
      }

      // Type filter (base vs override)
      if (filters.type !== 'all') {
        if (filters.type === 'base' && schedule.isOverride) return false;
        if (filters.type === 'override' && !schedule.isOverride) return false;
      }

      // Origin depot filter
      if (filters.originDepotId !== 'all') {
        if (schedule.originDepotId !== filters.originDepotId) return false;
      }

      return true;
    });
  }, [schedules, filters]);

  // Group schedules: base schedules first, then their overrides nested below
  const groupedSchedules = useMemo(() => {
    const baseSchedules = filteredSchedules.filter((s) => !s.isOverride);
    const overrides = filteredSchedules.filter((s) => s.isOverride);

    return baseSchedules.map((base) => ({
      base,
      overrides: overrides.filter((o) => o.baseScheduleId === base.id),
    }));
  }, [filteredSchedules]);

  const handleScheduleUpdate = (updatedSchedule: Schedule) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    );
  };

  const handleToggle = (scheduleId: string) => {
    setExpandedItem(expandedItem === scheduleId ? null : scheduleId);
  };

  const depotOptions = [
    { value: 'all', label: 'All Depots' },
    ...sampleDepots.map((d) => ({ value: d.id, label: d.name })),
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-3">
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilters((f) => ({ ...f, search: value }))}
          placeholder="Search schedules..."
        />
        <div className="flex items-center gap-2 flex-wrap">
          <FilterDropdown
            id="status-filter"
            label="Status"
            value={filters.status}
            options={scheduleFilterOptions.status}
            onChange={(value) => setFilters((f) => ({ ...f, status: value as ScheduleFilterState['status'] }))}
          />
          <FilterDropdown
            id="type-filter"
            label="Type"
            value={filters.type}
            options={scheduleFilterOptions.type}
            onChange={(value) => setFilters((f) => ({ ...f, type: value as ScheduleFilterState['type'] }))}
          />
          <FilterDropdown
            id="depot-filter"
            label="Origin Depot"
            value={filters.originDepotId}
            options={depotOptions}
            onChange={(value) => setFilters((f) => ({ ...f, originDepotId: value }))}
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-text-secondary">
        Showing {filteredSchedules.length} of {schedules.length} schedules
      </div>

      {/* Schedule List */}
      <div className="space-y-2">
        {groupedSchedules.map(({ base, overrides }) => (
          <div key={base.id} className="space-y-1">
            {/* Base schedule row */}
            <ExpandableRow
              id={base.id}
              name={base.name}
              badge={{
                text: base.isActive ? 'Active' : 'Inactive',
                variant: base.isActive ? 'customized' : 'system',
              }}
              stats={[
                { label: 'Route', value: getRouteDescription(base, sampleDepots) },
                { label: 'Legs', value: String(countLegs(base)) },
                { label: 'Mode', value: getBookingModeLabel(base.bookingMode) },
                { label: 'Days', value: getActiveDaysSummary(base.operatingSchedule) },
              ]}
              connectionCount={countConnectedCategories(base.connections)}
              hasConnectionIssues={false}
              isExpanded={expandedItem === base.id}
              onToggle={() => handleToggle(base.id)}
              onConnectionsClick={() =>
                onConnectionsClick(
                  {
                    id: base.id,
                    type: 'schedule',
                    name: base.name,
                    subtitle: getRouteDescription(base, sampleDepots),
                  },
                  base.connections
                )
              }
            >
              {/* Expanded content - edit form will go here */}
              <div className="p-4 bg-surface-cream rounded-lg">
                <p className="text-sm text-text-secondary mb-2">
                  {base.description || 'No description'}
                </p>
                <div className="flex gap-2">
                  <Badge variant="blue" size="sm">
                    {base.clientVisibility === 'all' ? 'All Clients' : `${base.clientIds.length} Clients`}
                  </Badge>
                  {base.isOverride && (
                    <Badge variant="system" size="sm">
                      Override
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Full edit form coming in next task...
                </p>
              </div>
            </ExpandableRow>

            {/* Override schedules (indented) */}
            {overrides.length > 0 && (
              <div className="ml-6 space-y-1 border-l-2 border-border pl-4">
                {overrides.map((override) => (
                  <ExpandableRow
                    key={override.id}
                    id={override.id}
                    name={override.name}
                    badge={{
                      text: 'Override',
                      variant: 'system',
                    }}
                    stats={[
                      { label: 'Client', value: override.clientIds.length === 1 ? 'ACME' : `${override.clientIds.length} clients` },
                      { label: 'Overrides', value: `${override.overriddenFields.length} fields` },
                    ]}
                    connectionCount={countConnectedCategories(override.connections)}
                    hasConnectionIssues={false}
                    isExpanded={expandedItem === override.id}
                    onToggle={() => handleToggle(override.id)}
                    onConnectionsClick={() =>
                      onConnectionsClick(
                        {
                          id: override.id,
                          type: 'schedule',
                          name: override.name,
                          subtitle: `Override of ${base.name}`,
                        },
                        override.connections
                      )
                    }
                  >
                    <div className="p-4 bg-surface-cream rounded-lg">
                      <p className="text-sm text-text-secondary mb-2">
                        Overridden fields: {override.overriddenFields.join(', ')}
                      </p>
                    </div>
                  </ExpandableRow>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredSchedules.length === 0 && (
          <div className="py-12 text-center text-text-muted">
            No schedules found matching your filters
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Update SchedulesPage to use the new component**

Update `src/modules/schedules/SchedulesPage.tsx` to import and use `ScheduleListTab`:

```typescript
// Add import at top
import { ScheduleListTab } from './components/ScheduleListTab';

// Replace SchedulesTabPlaceholder usage in the render:
{activeTab === 'schedules' && (
  <ScheduleListTab
    onConnectionsClick={handleConnectionsClick}
    onEditSchedule={(schedule) => console.log('Edit schedule:', schedule)}
  />
)}
```

**Step 3: Verify files compile**

Run: `cd "C:\Users\dane\Documents\Mytests\Nov 25 - Admin manager menu\admin-ui" && npx tsc --noEmit`

Expected: No errors

**Step 4: Test in browser**

Run: `npm run dev` and navigate to Schedules

Expected: See list of schedules with expandable rows, filters working

**Step 5: Commit**

```bash
git add src/modules/schedules/components/ScheduleListTab.tsx src/modules/schedules/SchedulesPage.tsx
git commit -m "feat(schedules): add ScheduleListTab with filtering and grouping

Implements schedule list with:
- Search, status, type, and depot filters
- Grouped display (base schedules with nested overrides)
- Expandable rows with route description and stats
- Connection badge integration

Generated with Claude Code"
```

---

## Task 6-16: Continue with Remaining Components

The remaining tasks follow the same pattern. Each task creates a specific component:

| Task | Component | Purpose |
|------|-----------|---------|
| 6 | ScheduleCard | Collapsed view of a schedule |
| 7 | ChainBuilder | Visual leg chain editor |
| 8 | LegNode | Individual node in the chain |
| 9 | LegConfigPanel | Side panel for leg settings |
| 10 | OperatingScheduleSection | Days/times configuration |
| 11 | TimelinePreview | Backwards time cascade visualization |
| 12 | ScheduleEditForm | Full editor combining all pieces |
| 13 | OverrideEditor | Client override inheritance UI |
| 14 | ZoneSelector | Tag-based zone picker |
| 15 | BookingSimulator | "What if I book this" tool |
| 16 | Final Integration | Wire everything together, polish |

---

## Summary of File Structure

After all tasks complete:

```
src/modules/schedules/
├── index.ts                              # Module exports
├── SchedulesPage.tsx                     # Main page with tabs
├── types.ts                              # All type definitions
├── components/
│   ├── ScheduleListTab.tsx              # Schedule list with filters
│   ├── ScheduleGroupsTab.tsx            # Schedule groups list
│   ├── ScheduleCard.tsx                 # Collapsed schedule row
│   ├── ScheduleEditForm.tsx             # Full edit form
│   ├── ChainBuilder.tsx                 # Visual chain editor
│   ├── LegNode.tsx                      # Individual leg node
│   ├── LegConfigPanel.tsx               # Leg configuration panel
│   ├── OperatingScheduleSection.tsx     # Days/times config
│   ├── TimelinePreview.tsx              # Time cascade preview
│   ├── ZoneSelector.tsx                 # Zone tag picker
│   ├── OverrideEditor.tsx               # Client override UI
│   └── BookingSimulator.tsx             # Booking test tool
└── data/
    └── sampleData.ts                    # Mock data for development
```

---

## Execution Notes

1. **Tasks 1-5 are foundational** - Complete these first to have a working skeleton
2. **Tasks 6-11 build the visual editor** - The chain builder is the core innovation
3. **Tasks 12-15 add advanced features** - Override system, simulator
4. **Task 16 is final polish** - Integration, edge cases, cleanup

Each task includes exact file paths, complete code, and verification steps. Follow TDD principles where applicable.
