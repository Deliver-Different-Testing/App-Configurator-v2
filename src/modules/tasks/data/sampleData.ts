// Sample data for Tasks module development
// This will be replaced with API calls in production

import type {
  Task,
  TaskGroup,
  NotificationLink,
  EntityConnections,
} from '../types';
import {
  createEmptyConnections
} from '../types';

// ============================================
// SAMPLE NOTIFICATIONS (for autocomplete testing)
// ============================================

export const sampleNotifications: NotificationLink[] = [
  { notificationType: 'single', notificationId: 'n1', notificationName: 'Delivery Confirmation Email' },
  { notificationType: 'single', notificationId: 'n2', notificationName: 'Pickup Reminder SMS' },
  { notificationType: 'single', notificationId: 'n3', notificationName: 'ETA Update Push Notification' },
  { notificationType: 'single', notificationId: 'n4', notificationName: 'POD Received Email' },
  { notificationType: 'single', notificationId: 'n5', notificationName: 'Delivery Exception Alert' },
  { notificationType: 'group', notificationId: 'ng1', notificationName: 'Customer Update Pack' },
  { notificationType: 'group', notificationId: 'ng2', notificationName: 'Driver Notifications' },
  { notificationType: 'group', notificationId: 'ng3', notificationName: 'Dispatcher Alerts' },
  { notificationType: 'single', notificationId: 'n6', notificationName: 'Invoice Ready Email' },
  { notificationType: 'single', notificationId: 'n7', notificationName: 'Rate Quote SMS' },
];

// ============================================
// HELPER: Create connections with specific flags
// ============================================

function createConnections(overrides: Partial<Record<keyof EntityConnections, { count: number; path?: string }>>): EntityConnections {
  const base = createEmptyConnections();

  for (const [key, value] of Object.entries(overrides)) {
    const k = key as keyof EntityConnections;
    base[k] = {
      hasConnections: true,
      count: value.count,
      connectionPath: value.path,
    };
  }

  return base;
}

// ============================================
// SAMPLE TASKS
// ============================================

export const sampleTasks: Task[] = [
  {
    id: 'task-1',
    name: 'Call customer to confirm delivery',
    description: 'Contact customer 30 minutes before scheduled delivery to confirm they will be available to receive the package.',
    category: 'call',
    processTargets: ['dispatcher_dashboard', 'backoffice_task_list'],
    defaultOffsetMinutes: -30,
    isAutoComplete: false,
    isActive: true,
    notificationLinks: [
      { notificationType: 'single', notificationId: 'n2', notificationName: 'Pickup Reminder SMS' },
    ],
    connections: createConnections({
      customers: { count: 847, path: 'via all active customers' },
      notifications: { count: 1 },
      services: { count: 4, path: 'Standard, Express, Same Day, Scheduled' },
    }),
    createdAt: '2024-11-20T10:00:00Z',
    updatedAt: '2024-11-25T14:30:00Z',
  },
  {
    id: 'task-2',
    name: 'Send delivery notification',
    description: 'Automated notification sent when driver is en route to delivery location.',
    category: 'system_only',
    processTargets: ['driver_app'],
    defaultOffsetMinutes: 0,
    isAutoComplete: true,
    isActive: true,
    notificationLinks: [
      { notificationType: 'single', notificationId: 'n3', notificationName: 'ETA Update Push Notification' },
      { notificationType: 'group', notificationId: 'ng1', notificationName: 'Customer Update Pack' },
    ],
    connections: createConnections({
      customers: { count: 1250, path: 'all customers with SMS enabled' },
      notifications: { count: 2 },
      vehicles: { count: 45 },
    }),
    createdAt: '2024-11-18T09:00:00Z',
    updatedAt: '2024-11-24T11:15:00Z',
  },
  {
    id: 'task-3',
    name: 'Verify vehicle checklist',
    description: 'Driver must complete pre-trip vehicle inspection checklist before departing depot.',
    category: 'driver_action',
    processTargets: ['driver_app'],
    defaultOffsetMinutes: -60,
    isAutoComplete: false,
    isActive: true,
    notificationLinks: [],
    connections: createConnections({
      vehicles: { count: 45, path: 'all active vehicles' },
      depots: { count: 6 },
    }),
    createdAt: '2024-11-15T08:00:00Z',
    updatedAt: '2024-11-22T16:45:00Z',
  },
  {
    id: 'task-4',
    name: 'Capture POD signature',
    description: 'Obtain proof of delivery signature from recipient at delivery location.',
    category: 'driver_action',
    processTargets: ['driver_app', 'job_detail'],
    defaultOffsetMinutes: 0,
    isAutoComplete: false,
    isActive: true,
    notificationLinks: [
      { notificationType: 'single', notificationId: 'n4', notificationName: 'POD Received Email' },
    ],
    connections: createConnections({
      customers: { count: 1250 },
      notifications: { count: 1 },
      services: { count: 6 },
    }),
    createdAt: '2024-11-10T14:00:00Z',
    updatedAt: '2024-11-23T09:20:00Z',
  },
  {
    id: 'task-5',
    name: 'Schedule follow-up delivery',
    description: 'If delivery attempt fails, schedule a follow-up delivery within 24 hours.',
    category: 'admin',
    processTargets: ['dispatcher_dashboard', 'backoffice_task_list'],
    defaultOffsetMinutes: 15,
    isAutoComplete: false,
    isActive: true,
    notificationLinks: [
      { notificationType: 'single', notificationId: 'n5', notificationName: 'Delivery Exception Alert' },
    ],
    connections: createConnections({
      customers: { count: 156, path: 'customers with failed deliveries this week' },
      notifications: { count: 1 },
      depots: { count: 6 },
    }),
    createdAt: '2024-11-12T11:00:00Z',
    updatedAt: '2024-11-26T10:00:00Z',
  },
  {
    id: 'task-6',
    name: 'Print shipping labels',
    description: 'Generate and print shipping labels for scheduled pickups.',
    category: 'admin',
    processTargets: ['backoffice_task_list', 'calendar_view'],
    defaultOffsetMinutes: -120,
    isAutoComplete: false,
    isActive: true,
    notificationLinks: [],
    connections: createConnections({
      depots: { count: 6 },
      services: { count: 4 },
    }),
    createdAt: '2024-11-08T13:00:00Z',
    updatedAt: '2024-11-20T15:30:00Z',
  },
  {
    id: 'task-7',
    name: 'Customer callback - escalation',
    description: 'Urgent callback required for escalated customer issues.',
    category: 'call',
    processTargets: ['dispatcher_dashboard', 'backoffice_task_list'],
    defaultOffsetMinutes: 5,
    isAutoComplete: false,
    isActive: true,
    notificationLinks: [
      { notificationType: 'group', notificationId: 'ng3', notificationName: 'Dispatcher Alerts' },
    ],
    connections: createConnections({
      customers: { count: 23, path: 'escalated cases' },
      notifications: { count: 1 },
    }),
    createdAt: '2024-11-14T16:00:00Z',
    updatedAt: '2024-11-25T08:45:00Z',
  },
  {
    id: 'task-8',
    name: 'Verify pickup location',
    description: 'Confirm pickup address and access instructions with sender.',
    category: 'reminder',
    processTargets: ['dispatcher_dashboard'],
    defaultOffsetMinutes: -45,
    isAutoComplete: false,
    isActive: true,
    notificationLinks: [],
    connections: createConnections({
      customers: { count: 340 },
      zoneGroups: { count: 12 },
    }),
    createdAt: '2024-11-16T10:30:00Z',
    updatedAt: '2024-11-24T14:00:00Z',
  },
  {
    id: 'task-9',
    name: 'End of day report',
    description: 'Automated daily summary report generation.',
    category: 'system_only',
    processTargets: ['backoffice_task_list'],
    defaultOffsetMinutes: undefined,
    isAutoComplete: true,
    isActive: true,
    notificationLinks: [
      { notificationType: 'single', notificationId: 'n6', notificationName: 'Invoice Ready Email' },
    ],
    connections: createConnections({
      notifications: { count: 1 },
      depots: { count: 6 },
    }),
    createdAt: '2024-11-05T09:00:00Z',
    updatedAt: '2024-11-21T17:00:00Z',
  },
  {
    id: 'task-10',
    name: 'Review customs documentation',
    description: 'Verify all customs paperwork is complete for international shipments.',
    category: 'admin',
    processTargets: ['backoffice_task_list', 'job_detail'],
    defaultOffsetMinutes: -240,
    isAutoComplete: false,
    isActive: false, // Inactive example
    notificationLinks: [],
    connections: createConnections({
      airports: { count: 3 },
      linehauls: { count: 2 },
      customers: { count: 89, path: 'international shipping customers' },
    }),
    createdAt: '2024-11-01T11:00:00Z',
    updatedAt: '2024-11-19T13:30:00Z',
  },
];

// ============================================
// SAMPLE TASK GROUPS
// ============================================

export const sampleTaskGroups: TaskGroup[] = [
  {
    id: 'group-1',
    name: 'Standard delivery sequence',
    description: 'Default task sequence for standard door-to-door deliveries.',
    isActive: true,
    items: [
      { id: 'gi-1', taskId: 'task-8', sequenceIndex: 0, offsetMinutesOverride: -60 },
      { id: 'gi-2', taskId: 'task-1', sequenceIndex: 1, offsetMinutesOverride: -30 },
      { id: 'gi-3', taskId: 'task-2', sequenceIndex: 2, offsetMinutesOverride: 0 },
      { id: 'gi-4', taskId: 'task-4', sequenceIndex: 3, offsetMinutesOverride: undefined },
    ],
    connections: createConnections({
      customers: { count: 847 },
      services: { count: 2, path: 'Standard, Scheduled' },
      zoneGroups: { count: 8 },
    }),
    createdAt: '2024-11-10T09:00:00Z',
    updatedAt: '2024-11-25T11:00:00Z',
  },
  {
    id: 'group-2',
    name: 'Express delivery sequence',
    description: 'Streamlined task sequence for express and same-day deliveries.',
    isActive: true,
    items: [
      { id: 'gi-5', taskId: 'task-2', sequenceIndex: 0, offsetMinutesOverride: -15 },
      { id: 'gi-6', taskId: 'task-4', sequenceIndex: 1, offsetMinutesOverride: 0 },
    ],
    connections: createConnections({
      customers: { count: 312 },
      services: { count: 2, path: 'Express, Same Day' },
      zoneGroups: { count: 12 },
    }),
    createdAt: '2024-11-12T14:00:00Z',
    updatedAt: '2024-11-24T16:30:00Z',
  },
  {
    id: 'group-3',
    name: 'Driver start of day',
    description: 'Tasks for drivers at the beginning of each shift.',
    isActive: true,
    items: [
      { id: 'gi-7', taskId: 'task-3', sequenceIndex: 0, offsetMinutesOverride: -60 },
      { id: 'gi-8', taskId: 'task-6', sequenceIndex: 1, offsetMinutesOverride: -45 },
    ],
    connections: createConnections({
      vehicles: { count: 45 },
      depots: { count: 6 },
    }),
    createdAt: '2024-11-08T08:00:00Z',
    updatedAt: '2024-11-22T09:15:00Z',
  },
  {
    id: 'group-4',
    name: 'Failed delivery handling',
    description: 'Task sequence triggered when a delivery attempt fails.',
    isActive: true,
    items: [
      { id: 'gi-9', taskId: 'task-7', sequenceIndex: 0, offsetMinutesOverride: 5 },
      { id: 'gi-10', taskId: 'task-5', sequenceIndex: 1, offsetMinutesOverride: 15 },
      { id: 'gi-11', taskId: 'task-1', sequenceIndex: 2, offsetMinutesOverride: 30, notes: 'Confirm new delivery time' },
    ],
    connections: createConnections({
      customers: { count: 156 },
      notifications: { count: 2 },
    }),
    createdAt: '2024-11-14T10:00:00Z',
    updatedAt: '2024-11-26T08:00:00Z',
  },
];

// ============================================
// HELPER: Resolve task references in groups
// ============================================

/**
 * Populate task references in task group items.
 */
export function resolveTaskGroupItems(group: TaskGroup, tasks: Task[]): TaskGroup {
  return {
    ...group,
    items: group.items.map(item => ({
      ...item,
      task: tasks.find(t => t.id === item.taskId),
    })),
  };
}

/**
 * Get all task groups with resolved task references.
 */
export function getResolvedTaskGroups(): TaskGroup[] {
  return sampleTaskGroups.map(group => resolveTaskGroupItems(group, sampleTasks));
}

// ============================================
// UTILITY: Time formatting
// ============================================

/**
 * Format relative time for "Updated X ago" display.
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
