// Notification Center Module Types

export type NotificationType = 'email' | 'sms' | 'push' | 'webhook';
export type TriggerEvent = 'job_created' | 'job_assigned' | 'job_completed' | 'job_cancelled' | 'job_delayed' | 'pod_received' | 'invoice_created' | 'payment_received';

export interface NotificationGroup {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggerEvent: TriggerEvent;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    webhook: boolean;
  };
  recipients: NotificationRecipient[];
  templates: NotificationTemplate[];
  tags?: string[];
}

export interface NotificationRecipient {
  type: 'customer' | 'driver' | 'agent' | 'admin' | 'custom';
  email?: string;
  phone?: string;
  role?: string;
}

export interface NotificationTemplate {
  id: string;
  groupId: string;
  channel: NotificationType;
  subject?: string; // For email
  body: string;
  mergeFields: string[]; // e.g., [JobNumber], [CustomerName]
  isActive: boolean;
}

export interface AttachmentTemplate {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'image';
  backgroundUrl?: string;
  width: number;
  height: number;
  fields: AttachmentField[];
  isActive: boolean;
}

export interface AttachmentField {
  id: string;
  label: string;
  mergeField: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  alignment: 'left' | 'center' | 'right';
  isBold: boolean;
  isItalic: boolean;
}

// Connection system
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

export const TRIGGER_EVENT_LABELS: Record<TriggerEvent, string> = {
  job_created: 'Job Created',
  job_assigned: 'Job Assigned',
  job_completed: 'Job Completed',
  job_cancelled: 'Job Cancelled',
  job_delayed: 'Job Delayed',
  pod_received: 'POD Received',
  invoice_created: 'Invoice Created',
  payment_received: 'Payment Received',
};

export const MERGE_FIELDS = [
  '[JobNumber]',
  '[CustomerName]',
  '[PickupAddress]',
  '[DeliveryAddress]',
  '[DriverName]',
  '[ETATime]',
  '[TrackingLink]',
  '[PODLink]',
  '[InvoiceNumber]',
  '[Amount]',
  '[Date]',
  '[Time]',
];
