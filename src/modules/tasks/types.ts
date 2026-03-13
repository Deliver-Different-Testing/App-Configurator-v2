// Tasks Module Types
// Configuration-only: defines task templates and task groups

import type { EntityConnections, ConnectionInfo } from '../territory/types';
import { createEmptyConnections } from '../territory/types';

// Re-export for convenience
export type { EntityConnections, ConnectionInfo };
export { createEmptyConnections };

// ============================================
// TASK CATEGORIES & PROCESS TARGETS
// ============================================

/**
 * Task categories for organization and filtering.
 */
export type TaskCategory = 'reminder' | 'call' | 'admin' | 'driver_action' | 'system_only';

export const TASK_CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'reminder', label: 'Reminder' },
  { value: 'call', label: 'Call' },
  { value: 'admin', label: 'Admin' },
  { value: 'driver_action', label: 'Driver Action' },
  { value: 'system_only', label: 'System Only' },
];

/**
 * Process targets - where the task is intended to appear.
 * These are flags for downstream systems, not active behavior in this UI.
 */
export type ProcessTarget =
  | 'dispatcher_dashboard'
  | 'backoffice_task_list'
  | 'job_detail'
  | 'driver_app'
  | 'calendar_view';

export const PROCESS_TARGETS: { value: ProcessTarget; label: string; icon: string }[] = [
  { value: 'dispatcher_dashboard', label: 'Dispatcher Dashboard', icon: '🖥️' },
  { value: 'backoffice_task_list', label: 'Backoffice Task List', icon: '📋' },
  { value: 'job_detail', label: 'Job Detail', icon: '📄' },
  { value: 'driver_app', label: 'Driver App', icon: '📱' },
  { value: 'calendar_view', label: 'Calendar View', icon: '📅' },
];

// ============================================
// NOTIFICATION LINKS
// ============================================

/**
 * Reference to a notification or notification group.
 * This UI only stores references - no notification sending logic.
 */
export interface NotificationLink {
  notificationType: 'single' | 'group';
  notificationId: string;
  notificationName: string; // For display purposes
}

// ============================================
// TASK (TEMPLATE)
// ============================================

/**
 * A reusable task definition/template.
 * Other systems consume these to create task instances.
 */
export interface Task {
  id: string;
  name: string;
  description?: string;
  category?: TaskCategory;
  processTargets: ProcessTarget[];
  defaultOffsetMinutes?: number; // Can be negative (before base event)
  isAutoComplete: boolean;
  isActive: boolean;
  notificationLinks: NotificationLink[];
  connections: EntityConnections;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// ============================================
// TASK GROUP
// ============================================

/**
 * A task within a task group, with optional offset override.
 */
export interface TaskGroupItem {
  id: string;
  taskId: string;
  task?: Task; // Resolved reference (populated from tasks list)
  sequenceIndex: number;
  offsetMinutesOverride?: number; // If null, use task's defaultOffsetMinutes
  notes?: string; // Group-specific notes for this task
}

/**
 * A reusable group of tasks with ordering and timing.
 */
export interface TaskGroup {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  items: TaskGroupItem[];
  connections: EntityConnections;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// ============================================
// FILTER DEFINITIONS
// ============================================

export interface TaskFilterState {
  category: TaskCategory | 'all';
  processTarget: ProcessTarget | 'all';
  status: 'all' | 'active' | 'inactive';
  search: string;
}

export interface TaskGroupFilterState {
  status: 'all' | 'active' | 'inactive';
  search: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format offset minutes for display.
 * Examples: "+10min", "-30min", "—"
 */
export function formatOffset(minutes?: number): string {
  if (minutes === undefined || minutes === null) {
    return '—';
  }
  const sign = minutes >= 0 ? '+' : '';
  return `${sign}${minutes}min`;
}

/**
 * Get effective offset for a task group item.
 * Uses override if set, otherwise falls back to task default.
 */
export function getEffectiveOffset(item: TaskGroupItem, task?: Task): number | undefined {
  if (item.offsetMinutesOverride !== undefined && item.offsetMinutesOverride !== null) {
    return item.offsetMinutesOverride;
  }
  return task?.defaultOffsetMinutes;
}

/**
 * Get category label for display.
 */
export function getCategoryLabel(category?: TaskCategory): string {
  if (!category) return '—';
  const found = TASK_CATEGORIES.find(c => c.value === category);
  return found?.label ?? category;
}

/**
 * Get process target icons for display.
 */
export function getProcessTargetIcons(targets: ProcessTarget[]): string {
  return targets
    .map(t => PROCESS_TARGETS.find(pt => pt.value === t)?.icon ?? '')
    .filter(Boolean)
    .join(' ');
}

/**
 * Create a new empty task.
 */
export function createEmptyTask(): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    description: '',
    category: undefined,
    processTargets: [],
    defaultOffsetMinutes: undefined,
    isAutoComplete: false,
    isActive: true,
    notificationLinks: [],
    connections: createEmptyConnections(),
  };
}

/**
 * Create a new empty task group.
 */
export function createEmptyTaskGroup(): Omit<TaskGroup, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    description: '',
    isActive: true,
    items: [],
    connections: createEmptyConnections(),
  };
}
