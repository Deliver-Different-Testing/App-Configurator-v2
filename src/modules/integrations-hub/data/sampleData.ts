import type { CarrierAccount, ServiceMapping, FedExSetupStep, CarrierType, EntityConnections } from '../types';
import { createEmptyConnections } from '../types';

export const sampleCarrierAccounts: CarrierAccount[] = [
  // FedEx - Primary (tenant default)
  {
    id: '1',
    carrier: 'fedex',
    accountNumber: '123456789',
    accountName: 'Primary FedEx Account',
    isActive: true,
    authType: 'oauth',
    lastSync: '2024-01-15T10:30:00Z',
    createdAt: '2023-06-01T00:00:00Z',
    clientId: null, // Primary account
  },
  // FedEx - Secondary (client-specific)
  {
    id: '1a',
    carrier: 'fedex',
    accountNumber: '555123456',
    accountName: 'Acme Corp FedEx',
    isActive: true,
    authType: 'oauth',
    lastSync: '2024-01-15T09:00:00Z',
    createdAt: '2023-09-15T00:00:00Z',
    clientId: 'client-001',
    clientName: 'Acme Corporation',
  },
  {
    id: '1b',
    carrier: 'fedex',
    accountNumber: '555789012',
    accountName: 'Beta Industries FedEx',
    isActive: true,
    authType: 'oauth',
    lastSync: '2024-01-14T14:20:00Z',
    createdAt: '2023-11-01T00:00:00Z',
    clientId: 'client-002',
    clientName: 'Beta Industries',
  },
  // UPS - Primary (tenant default)
  {
    id: '2',
    carrier: 'ups',
    accountNumber: '987654321',
    accountName: 'UPS Business Account',
    isActive: true,
    authType: 'api_key',
    lastSync: '2024-01-14T15:45:00Z',
    createdAt: '2023-08-15T00:00:00Z',
    clientId: null, // Primary account
  },
  // UPS - Secondary (client-specific)
  {
    id: '2a',
    carrier: 'ups',
    accountNumber: '111222333',
    accountName: 'Acme Corp UPS',
    isActive: false,
    authType: 'api_key',
    lastSync: '2024-01-10T11:00:00Z',
    createdAt: '2023-10-20T00:00:00Z',
    clientId: 'client-001',
    clientName: 'Acme Corporation',
  },
  // USPS - Primary only
  {
    id: '3',
    carrier: 'usps',
    accountNumber: 'USPS-001',
    accountName: 'USPS Commercial',
    isActive: false,
    authType: 'credentials',
    createdAt: '2023-10-01T00:00:00Z',
    clientId: null, // Primary account
  },
];

export const sampleServiceMappings: ServiceMapping[] = [
  {
    id: '1',
    jobType: 'Standard Delivery',
    carrierService: 'FedEx Ground',
    carrier: 'fedex',
    dimensionalFactor: 139,
    isActive: true,
  },
  {
    id: '2',
    jobType: 'Express Delivery',
    carrierService: 'FedEx Express Saver',
    carrier: 'fedex',
    dimensionalFactor: 139,
    isActive: true,
  },
  {
    id: '3',
    jobType: 'Overnight',
    carrierService: 'FedEx Priority Overnight',
    carrier: 'fedex',
    dimensionalFactor: 139,
    isActive: true,
  },
  {
    id: '4',
    jobType: 'Standard Delivery',
    carrierService: 'UPS Ground',
    carrier: 'ups',
    dimensionalFactor: 139,
    isActive: true,
  },
  {
    id: '5',
    jobType: 'Economy',
    carrierService: 'USPS Priority Mail',
    carrier: 'usps',
    dimensionalFactor: 166,
    isActive: false,
  },
];

export const fedExSetupSteps: FedExSetupStep[] = [
  {
    id: '1',
    title: 'Create FedEx Developer Account',
    description: 'Register for a FedEx Developer Portal account to get API access',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Configure OAuth Credentials',
    description: 'Set up Client ID and Client Secret for API authentication',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Add Shipping Account',
    description: 'Link your FedEx shipping account number',
    status: 'in_progress',
  },
  {
    id: '4',
    title: 'Test Connection',
    description: 'Verify API connectivity with a test request',
    status: 'pending',
  },
  {
    id: '5',
    title: 'Enable Production Mode',
    description: 'Switch from sandbox to production environment',
    status: 'pending',
  },
];

// ============================================
// SAMPLE CONNECTION DATA
// See TAG-SYSTEM-SPEC.md for documentation
// ============================================

interface SampleConnectionData {
  connections: EntityConnections;
  connectedCount: number;
  hasIssues: boolean;
}

/**
 * Sample connection data for carrier integrations.
 * Shows which system areas each carrier connects to.
 */
export const sampleCarrierConnections: Record<CarrierType, SampleConnectionData> = {
  fedex: {
    connections: {
      customers: { hasConnections: true, count: 2, connectionPath: 'Acme Corp, Beta Industries' },
      zoneGroups: { hasConnections: true, count: 5, connectionPath: 'via zone mappings' },
      depots: { hasConnections: true, count: 3, connectionPath: 'NYC Central, Brooklyn Hub, Newark' },
      rateCards: { hasConnections: true, count: 2, connectionPath: 'Standard, Express rates' },
      services: { hasConnections: true, count: 3, connectionPath: 'Standard, Express, Overnight' },
      vehicles: { hasConnections: false, count: 0 },
      notifications: { hasConnections: true, count: 2, connectionPath: 'Tracking updates' },
      airports: { hasConnections: true, count: 1, connectionPath: 'JFK' },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1, connectionPath: 'North America' },
    },
    connectedCount: 8,
    hasIssues: false,
  },
  ups: {
    connections: {
      customers: { hasConnections: true, count: 1, connectionPath: 'Acme Corp' },
      zoneGroups: { hasConnections: true, count: 3, connectionPath: 'via zone mappings' },
      depots: { hasConnections: true, count: 2, connectionPath: 'NYC Central, Queens Hub' },
      rateCards: { hasConnections: true, count: 1, connectionPath: 'Standard rates' },
      services: { hasConnections: true, count: 1, connectionPath: 'Standard Delivery' },
      vehicles: { hasConnections: false, count: 0 },
      notifications: { hasConnections: true, count: 1, connectionPath: 'Delivery alerts' },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1, connectionPath: 'North America' },
    },
    connectedCount: 7,
    hasIssues: false,
  },
  usps: {
    connections: {
      customers: { hasConnections: false, count: 0 },
      zoneGroups: { hasConnections: false, count: 0 },
      depots: { hasConnections: false, count: 0 },
      rateCards: { hasConnections: false, count: 0 },
      services: { hasConnections: true, count: 1, connectionPath: 'Economy' },
      vehicles: { hasConnections: false, count: 0 },
      notifications: { hasConnections: false, count: 0 },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1, connectionPath: 'North America' },
    },
    connectedCount: 2,
    hasIssues: true, // Not fully configured
  },
  dhl: {
    connections: {
      ...createEmptyConnections(),
      regions: { hasConnections: true, count: 1, connectionPath: 'International' },
    },
    connectedCount: 1,
    hasIssues: true, // Setup required
  },
};

/**
 * Sample connection data for carrier accounts.
 * IDs match api/sampleData.ts: 1=FedEx Primary, 2=FedEx Secondary, 3=UPS Primary, 4=USPS Primary, 5=DHL Primary
 */
export const sampleAccountConnections: Record<string, SampleConnectionData> = {
  // FedEx Primary (id: 1)
  '1': {
    connections: {
      customers: { hasConnections: true, count: 847, connectionPath: 'All customers (default)' },
      zoneGroups: { hasConnections: true, count: 5 },
      depots: { hasConnections: true, count: 3 },
      rateCards: { hasConnections: true, count: 2 },
      services: { hasConnections: true, count: 3 },
      vehicles: { hasConnections: false, count: 0 },
      notifications: { hasConnections: true, count: 2 },
      airports: { hasConnections: true, count: 1 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 8,
    hasIssues: false,
  },
  // FedEx Secondary - Acme (id: 2)
  '2': {
    connections: {
      customers: { hasConnections: true, count: 1, connectionPath: 'Acme Corporation' },
      zoneGroups: { hasConnections: true, count: 2, connectionPath: 'via customer zones' },
      depots: { hasConnections: true, count: 1 },
      rateCards: { hasConnections: true, count: 1 },
      services: { hasConnections: true, count: 2 },
      vehicles: { hasConnections: false, count: 0 },
      notifications: { hasConnections: true, count: 1 },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 7,
    hasIssues: false,
  },
  // UPS Primary (id: 3)
  '3': {
    connections: {
      customers: { hasConnections: true, count: 456, connectionPath: 'All customers (default)' },
      zoneGroups: { hasConnections: true, count: 3 },
      depots: { hasConnections: true, count: 2 },
      rateCards: { hasConnections: true, count: 1 },
      services: { hasConnections: true, count: 1 },
      vehicles: { hasConnections: false, count: 0 },
      notifications: { hasConnections: true, count: 1 },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 7,
    hasIssues: false,
  },
  // USPS Primary (id: 4)
  '4': {
    connections: {
      ...createEmptyConnections(),
      services: { hasConnections: true, count: 1, connectionPath: 'Economy' },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 2,
    hasIssues: true, // Not fully configured
  },
  // DHL Primary (id: 5)
  '5': {
    connections: {
      ...createEmptyConnections(),
      regions: { hasConnections: true, count: 1, connectionPath: 'International' },
    },
    connectedCount: 1,
    hasIssues: true, // Setup required
  },
};

/**
 * Sample connection data for service mappings.
 */
export const sampleServiceMappingConnections: Record<string, SampleConnectionData> = {
  '1': { // FedEx Ground - Standard
    connections: {
      customers: { hasConnections: true, count: 523 },
      zoneGroups: { hasConnections: true, count: 8 },
      depots: { hasConnections: true, count: 4 },
      rateCards: { hasConnections: true, count: 1 },
      services: { hasConnections: true, count: 1, connectionPath: 'Standard Delivery' },
      vehicles: { hasConnections: true, count: 2, connectionPath: 'Van, Truck' },
      notifications: { hasConnections: true, count: 2 },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 8,
    hasIssues: false,
  },
  '2': { // FedEx Express Saver - Express
    connections: {
      customers: { hasConnections: true, count: 234 },
      zoneGroups: { hasConnections: true, count: 5 },
      depots: { hasConnections: true, count: 3 },
      rateCards: { hasConnections: true, count: 1 },
      services: { hasConnections: true, count: 1, connectionPath: 'Express Delivery' },
      vehicles: { hasConnections: true, count: 1, connectionPath: 'Van' },
      notifications: { hasConnections: true, count: 3 },
      airports: { hasConnections: true, count: 1 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 8,
    hasIssues: false,
  },
  '3': { // FedEx Priority Overnight
    connections: {
      customers: { hasConnections: true, count: 89 },
      zoneGroups: { hasConnections: true, count: 3 },
      depots: { hasConnections: true, count: 2 },
      rateCards: { hasConnections: true, count: 1 },
      services: { hasConnections: true, count: 1, connectionPath: 'Overnight' },
      vehicles: { hasConnections: true, count: 1, connectionPath: 'Van' },
      notifications: { hasConnections: true, count: 4 },
      airports: { hasConnections: true, count: 2 },
      linehauls: { hasConnections: true, count: 2 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 9,
    hasIssues: false,
  },
  '4': { // UPS Ground - Standard
    connections: {
      customers: { hasConnections: true, count: 312 },
      zoneGroups: { hasConnections: true, count: 4 },
      depots: { hasConnections: true, count: 2 },
      rateCards: { hasConnections: true, count: 1 },
      services: { hasConnections: true, count: 1, connectionPath: 'Standard Delivery' },
      vehicles: { hasConnections: true, count: 2 },
      notifications: { hasConnections: true, count: 1 },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 8,
    hasIssues: false,
  },
  '5': { // USPS Priority - Economy (inactive)
    connections: {
      ...createEmptyConnections(),
      services: { hasConnections: true, count: 1, connectionPath: 'Economy' },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 2,
    hasIssues: true,
  },
};
