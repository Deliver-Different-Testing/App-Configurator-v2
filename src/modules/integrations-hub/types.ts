export interface CarrierAccount {
  id: string;
  carrier: 'fedex' | 'ups' | 'usps' | 'dhl';
  accountNumber: string;
  accountName: string;
  isActive: boolean;
  authType: 'oauth' | 'api_key' | 'credentials';
  lastSync?: string;
  createdAt: string;
  // Primary/Secondary account support
  clientId?: string | null; // null = tenant default (primary), value = client-specific (secondary)
  clientName?: string; // Display name for client-specific accounts
}

export interface ServiceMapping {
  id: string;
  jobType: string;
  carrierService: string;
  carrier: 'fedex' | 'ups' | 'usps' | 'dhl';
  dimensionalFactor: number;
  isActive: boolean;
}

export interface FedExSetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

export type CarrierType = 'fedex' | 'ups' | 'usps' | 'dhl';
export type FinancialIntegrationType = 'quickbooks' | 'xero';
export type OtherIntegrationType = 'openforce';
export type IntegrationType = CarrierType | FinancialIntegrationType | OtherIntegrationType;
export type IntegrationCategory = 'freight' | 'financial' | 'other';

export const CARRIER_LABELS: Record<CarrierType, string> = {
  fedex: 'FedEx',
  ups: 'UPS',
  usps: 'USPS',
  dhl: 'DHL',
};

// Backend carrier type codes for API calls
export const CARRIER_CODES: Record<CarrierType, string> = {
  fedex: 'FEDEX',
  ups: 'UPS',
  usps: 'USPS',
  dhl: 'DHL',
};

export const FINANCIAL_LABELS: Record<FinancialIntegrationType, string> = {
  quickbooks: 'QuickBooks',
  xero: 'Xero',
};

export const OTHER_LABELS: Record<OtherIntegrationType, string> = {
  openforce: 'Openforce',
};

export const CARRIER_COLORS: Record<CarrierType, string> = {
  fedex: 'bg-purple-100 text-purple-700',
  ups: 'bg-amber-100 text-amber-700',
  usps: 'bg-blue-100 text-blue-700',
  dhl: 'bg-red-100 text-red-700',
};

export const FINANCIAL_COLORS: Record<FinancialIntegrationType, string> = {
  quickbooks: 'bg-green-100 text-green-700',
  xero: 'bg-sky-100 text-sky-700',
};

export const OTHER_COLORS: Record<OtherIntegrationType, string> = {
  openforce: 'bg-indigo-100 text-indigo-700',
};

// ============================================
// CONNECTION SYSTEM TYPES
// See TAG-SYSTEM-SPEC.md for documentation
// ============================================

/**
 * Source item types for Integration Hub entities
 */
export type IntegrationSourceType = 'carrier' | 'carrierAccount' | 'serviceMapping' | 'zoneMapping' | 'trackingMapping';

/**
 * Re-export connection types from territory module for consistency
 */
export type { EntityConnections, ConnectionInfo, SourceItem } from '../territory/types';
export { createEmptyConnections, countConnectedCategories, TAG_CATEGORIES } from '../territory/types';
