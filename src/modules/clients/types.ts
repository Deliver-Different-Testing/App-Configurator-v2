// Clients & Customers Module Types

export interface Client {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  type: 'corporate' | 'individual' | 'partner';
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website?: string;
  billingType: string;
  paymentTerms: string;
  creditLimit?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientContact {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile?: string;
  role: 'primary' | 'billing' | 'operations' | 'dispatch' | 'admin' | 'other';
  title?: string;
  department?: string;
  isPrimary: boolean;
  receiveNotifications: boolean;
  status: 'active' | 'inactive';
}

export interface ClientService {
  id: string;
  clientId: string;
  serviceName: string;
  serviceCode: string;
  description: string;
  basePrice: number;
  markupPercent: number;
  markupFlat: number;
  finalPrice: number;
  isActive: boolean;
  visibleOnApi: boolean;
  visibleOnBookingPage: boolean;
  visibleOnBulkUpload: boolean;
  minWeight?: number;
  maxWeight?: number;
  minDistance?: number;
  maxDistance?: number;
  estimatedDeliveryTime?: string;
}

export interface ClientSchedule {
  id: string;
  clientId: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isOpen: boolean;
  collectionStart?: string;
  collectionEnd?: string;
  deliveryStart?: string;
  deliveryEnd?: string;
  notes?: string;
}

export interface ClientRate {
  id: string;
  clientId: string;
  rateCardId: string;
  rateCardName: string;
  effectiveDate: string;
  expirationDate?: string;
  discountPercent?: number;
  isActive: boolean;
}

export interface ClientHistoryEntry {
  id: string;
  clientId: string;
  timestamp: string;
  action: 'created' | 'updated' | 'status_changed' | 'contact_added' | 'service_modified' | 'rate_changed' | 'note_added';
  description: string;
  userId?: string;
  userName?: string;
  details?: Record<string, unknown>;
}

// Filter options for client list
export interface ClientFilters {
  status: string[];
  type: string[];
  billingType: string[];
  region: string[];
}

// Connection system (shared with Territory)
export interface ConnectionInfo {
  hasConnections: boolean;
  count: number;
  connectionPath?: string;
}

export interface EntityConnections {
  customers: ConnectionInfo;
  zoneGroups: ConnectionInfo;
  depots: ConnectionInfo;
  rateCards: ConnectionInfo;
  services: ConnectionInfo;
  vehicles: ConnectionInfo;
  notifications: ConnectionInfo;
  airports: ConnectionInfo;
  linehauls: ConnectionInfo;
  regions: ConnectionInfo;
}

export interface SourceItem {
  type: 'zipZone' | 'zoneGroup' | 'depot' | 'customer' | 'rateCard' | 'service';
  id: string;
  name: string;
}

export function createEmptyConnections(): EntityConnections {
  return {
    customers: { hasConnections: false, count: 0 },
    zoneGroups: { hasConnections: false, count: 0 },
    depots: { hasConnections: false, count: 0 },
    rateCards: { hasConnections: false, count: 0 },
    services: { hasConnections: false, count: 0 },
    vehicles: { hasConnections: false, count: 0 },
    notifications: { hasConnections: false, count: 0 },
    airports: { hasConnections: false, count: 0 },
    linehauls: { hasConnections: false, count: 0 },
    regions: { hasConnections: false, count: 0 },
  };
}

export function countConnectedCategories(connections: EntityConnections): number {
  return Object.values(connections).filter(c => c.hasConnections).length;
}
