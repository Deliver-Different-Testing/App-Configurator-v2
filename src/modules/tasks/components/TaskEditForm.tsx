import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Toggle';
import { Badge } from '../../../components/ui/Badge';
import type {
  Task,
  TaskCategory,
  ProcessTarget,
  NotificationLink,
} from '../types';
import {
  TASK_CATEGORIES,
  PROCESS_TARGETS,
} from '../types';
import { sampleNotifications } from '../data/sampleData';

interface TaskEditFormProps {
  task: Task;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

export function TaskEditForm({ task, onSave, onCancel }: TaskEditFormProps) {
  // Form state
  const [formData, setFormData] = useState({
    name: task.name,
    description: task.description || '',
    category: task.category,
    processTargets: [...task.processTargets],
    defaultOffsetMinutes: task.defaultOffsetMinutes,
    isAutoComplete: task.isAutoComplete,
    isActive: task.isActive,
    notificationLinks: [...task.notificationLinks],
  });

  // Notification autocomplete state
  const [notificationSearch, setNotificationSearch] = useState('');
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Handle form field changes
  const handleChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle process target toggle
  const toggleProcessTarget = (target: ProcessTarget) => {
    const current = formData.processTargets;
    if (current.includes(target)) {
      handleChange(
        'processTargets',
        current.filter((t) => t !== target)
      );
    } else {
      handleChange('processTargets', [...current, target]);
    }
  };

  // Handle notification linking
  const addNotification = (notification: NotificationLink) => {
    // Don't add duplicates
    if (formData.notificationLinks.some((n) => n.notificationId === notification.notificationId)) {
      return;
    }
    handleChange('notificationLinks', [...formData.notificationLinks, notification]);
    setNotificationSearch('');
    setShowNotificationDropdown(false);
  };

  const removeNotification = (notificationId: string) => {
    handleChange(
      'notificationLinks',
      formData.notificationLinks.filter((n) => n.notificationId !== notificationId)
    );
  };

  // Filter notifications for autocomplete
  const filteredNotifications = sampleNotifications.filter((n) => {
    // Don't show already linked notifications
    if (formData.notificationLinks.some((linked) => linked.notificationId === n.notificationId)) {
      return false;
    }
    // Filter by search
    if (notificationSearch) {
      return n.notificationName.toLowerCase().includes(notificationSearch.toLowerCase());
    }
    return true;
  });

  // Handle save
  const handleSave = () => {
    const updatedTask: Task = {
      ...task,
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      processTargets: formData.processTargets,
      defaultOffsetMinutes: formData.defaultOffsetMinutes,
      isAutoComplete: formData.isAutoComplete,
      isActive: formData.isActive,
      notificationLinks: formData.notificationLinks,
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedTask);
  };

  return (
    <div className="p-6 bg-surface-cream space-y-6">
      {/* Basic Info Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-text-primary">Basic Information</h4>

        <Input
          label="Task Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter task name..."
        />

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Internal notes or instructions..."
            rows={3}
            className="w-full px-3.5 py-2.5 text-base border-2 border-border rounded-md bg-white text-text-primary placeholder:text-text-muted transition-all duration-normal focus:outline-none focus:border-brand-cyan focus:shadow-cyan-glow resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Category
          </label>
          <select
            value={formData.category || ''}
            onChange={(e) =>
              handleChange('category', (e.target.value as TaskCategory) || undefined)
            }
            className="w-full px-3.5 py-2.5 text-base border-2 border-border rounded-md bg-white text-text-primary transition-all duration-normal focus:outline-none focus:border-brand-cyan focus:shadow-cyan-glow"
          >
            <option value="">No category</option>
            {TASK_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Process Targets Section */}
      <div className="border-t border-border pt-4 space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Process Targets</h4>
          <p className="text-xs text-text-muted mt-0.5">
            Select where this task should appear in downstream systems
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {PROCESS_TARGETS.map((target) => {
            const isSelected = formData.processTargets.includes(target.value);
            return (
              <button
                key={target.value}
                type="button"
                onClick={() => toggleProcessTarget(target.value)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan'
                    : 'border-border bg-white text-text-secondary hover:border-gray-300'
                  }
                `}
              >
                <span className="text-lg">{target.icon}</span>
                <span className="text-sm font-medium">{target.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timing & Behavior Section */}
      <div className="border-t border-border pt-4 space-y-4">
        <h4 className="text-sm font-semibold text-text-primary">Timing & Behavior</h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Default Offset (minutes)
            </label>
            <input
              type="number"
              value={formData.defaultOffsetMinutes ?? ''}
              onChange={(e) =>
                handleChange(
                  'defaultOffsetMinutes',
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
              placeholder="e.g., -30 (before) or 10 (after)"
              className="w-full px-3.5 py-2.5 text-base border-2 border-border rounded-md bg-white text-text-primary placeholder:text-text-muted transition-all duration-normal focus:outline-none focus:border-brand-cyan focus:shadow-cyan-glow"
            />
            <p className="text-xs text-text-muted mt-1">
              Negative = before base event, positive = after
            </p>
          </div>

          <div className="flex items-center">
            <Toggle
              checked={formData.isAutoComplete}
              onChange={(checked) => handleChange('isAutoComplete', checked)}
              label="Auto-complete when created"
            />
          </div>
        </div>
      </div>

      {/* Notification Links Section */}
      <div className="border-t border-border pt-4 space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Linked Notifications</h4>
          <p className="text-xs text-text-muted mt-0.5">
            Notifications triggered when this task completes
          </p>
        </div>

        {/* Notification Autocomplete */}
        <div className="relative">
          <Input
            placeholder="Search notifications to link..."
            value={notificationSearch}
            onChange={(e) => {
              setNotificationSearch(e.target.value);
              setShowNotificationDropdown(true);
            }}
            onFocus={() => setShowNotificationDropdown(true)}
          />

          {showNotificationDropdown && filteredNotifications.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {filteredNotifications.map((notification) => (
                <button
                  key={notification.notificationId}
                  type="button"
                  onClick={() => addNotification(notification)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-surface-cream transition-colors"
                >
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      notification.notificationType === 'group'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {notification.notificationType}
                  </span>
                  <span className="text-sm text-text-primary">
                    {notification.notificationName}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Linked Notifications List */}
        {formData.notificationLinks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.notificationLinks.map((notification) => (
              <div
                key={notification.notificationId}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-full"
              >
                <Badge
                  variant={notification.notificationType === 'group' ? 'purple' : 'blue'}
                >
                  {notification.notificationType}
                </Badge>
                <span className="text-sm text-text-primary">
                  {notification.notificationName}
                </span>
                <button
                  type="button"
                  onClick={() => removeNotification(notification.notificationId)}
                  className="text-text-muted hover:text-error transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {formData.notificationLinks.length === 0 && (
          <p className="text-sm text-text-muted italic">No notifications linked</p>
        )}
      </div>

      {/* Status & Actions Section */}
      <div className="border-t border-border pt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Toggle
            checked={formData.isActive}
            onChange={(checked) => handleChange('isActive', checked)}
            label={formData.isActive ? 'Active' : 'Inactive'}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="save" size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
