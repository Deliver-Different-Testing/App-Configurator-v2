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
  // sch-6: GLOBEX override of Next Day Standard (sch-2)
  {
    id: 'sch-6',
    name: 'Next Day Standard (GLOBEX)',
    description: 'GLOBEX-specific override with later cutoff',
    clientVisibility: 'specific',
    clientIds: ['client-globex'],
    bookingMode: 'fixed_time',
    defaultDeliverySpeedId: 'speed-nextday',
    defaultPickupSpeedId: 'speed-standard',
    defaultLinehaulSpeedId: undefined,
    originType: 'depot',
    originDepotId: 'depot-den',
    fallbackDepotId: undefined,
    legs: [
      {
        id: 'leg-sch6-1',
        order: 0,
        config: {
          type: 'collection',
          speedId: 'speed-standard',
          pickupZoneIds: ['zone-1', 'zone-2', 'zone-3'],
          pickupMinutesBefore: 90,
          bookFromClientAddress: false,
          createPickupJob: true,
        },
      },
      {
        id: 'leg-sch6-2',
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
        mon: { enabled: true, startTime: '08:00', endTime: '18:00' },
        tue: { enabled: true, startTime: '08:00', endTime: '18:00' },
        wed: { enabled: true, startTime: '08:00', endTime: '18:00' },
        thu: { enabled: true, startTime: '08:00', endTime: '18:00' },
        fri: { enabled: true, startTime: '08:00', endTime: '18:00' },
        sat: { enabled: false, startTime: '08:00', endTime: '12:00' },
        sun: { enabled: false, startTime: '08:00', endTime: '12:00' },
      },
      cutoffValue: 3,
      cutoffUnit: 'hours',
    },
    deliveryWindow: {
      mode: 'automatic',
      rules: [
        {
          id: 'rule-6-1',
          condition: { arrivalBefore: '06:00' },
          result: { deliverSameDay: true, windowStart: '08:00', windowEnd: '12:00' },
        },
        {
          id: 'rule-6-2',
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
    baseScheduleId: 'sch-2',
    overriddenFields: ['operatingSchedule.cutoffValue', 'legs[0].config.pickupMinutesBefore', 'operatingSchedule.days'],
    connections: {
      ...createEmptyConnections(),
      customers: { hasConnections: true, count: 1 },
      services: { hasConnections: true, count: 2 },
      depots: { hasConnections: true, count: 1 },
    },
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  // sch-7: INITECH override of Express Same Day (sch-5)
  {
    id: 'sch-7',
    name: 'Express Same Day (INITECH)',
    description: 'INITECH override with tighter cutoff',
    clientVisibility: 'specific',
    clientIds: ['client-initech'],
    bookingMode: 'window',
    defaultDeliverySpeedId: 'speed-sameday',
    defaultPickupSpeedId: 'speed-express',
    defaultLinehaulSpeedId: undefined,
    originType: 'client_address',
    originDepotId: undefined,
    fallbackDepotId: 'depot-den',
    legs: [
      {
        id: 'leg-sch7-1',
        order: 0,
        config: {
          type: 'delivery',
          speedId: 'speed-sameday',
          deliveryZoneIds: ['zone-1', 'zone-2'],
          deliveryState: 'ambient',
          rateCardId: 'rate-express',
        },
      },
    ],
    operatingSchedule: {
      uniformWeekdays: false,
      days: {
        mon: { enabled: true, startTime: '06:00', endTime: '22:00' },
        tue: { enabled: true, startTime: '06:00', endTime: '22:00' },
        wed: { enabled: true, startTime: '06:00', endTime: '22:00' },
        thu: { enabled: true, startTime: '06:00', endTime: '22:00' },
        fri: { enabled: true, startTime: '06:00', endTime: '22:00' },
        sat: { enabled: true, startTime: '08:00', endTime: '18:00' },
        sun: { enabled: true, startTime: '10:00', endTime: '16:00' },
      },
      cutoffValue: 30,
      cutoffUnit: 'minutes',
    },
    deliveryWindow: {
      mode: 'fixed',
      rules: [],
      fixedDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      fixedWindowStart: '06:00',
      fixedWindowEnd: '22:00',
      fixedTransitDays: 0,
    },
    isActive: true,
    isOverride: true,
    baseScheduleId: 'sch-5',
    overriddenFields: ['operatingSchedule.cutoffValue', 'operatingSchedule.days', 'defaultPickupSpeedId'],
    connections: {
      ...createEmptyConnections(),
      customers: { hasConnections: true, count: 1 },
      services: { hasConnections: true, count: 1 },
      rateCards: { hasConnections: true, count: 1 },
    },
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
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
