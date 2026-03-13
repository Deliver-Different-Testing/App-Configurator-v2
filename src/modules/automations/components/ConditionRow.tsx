import { X } from 'lucide-react';
import type {
  Condition,
  ConditionType,
  JobTypeFilter,
  ScheduledTimeField,
  TimeUnit,
  StatusConditionMode,
  ScanType,
  SiteOption,
  RegionOption,
} from '../types';
import {
  CONDITION_TYPE_OPTIONS,
  JOB_TYPE_OPTIONS,
  SCHEDULED_TIME_OPTIONS,
  TIME_UNIT_OPTIONS,
  STATUS_CONDITION_MODES,
  SCAN_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  createEmptyCondition,
} from '../types';
import type { JobStatus } from '../types';

interface ConditionRowProps {
  condition: Condition;
  jobStatuses: JobStatus[];
  sites: SiteOption[];
  regions: RegionOption[];
  onChange: (condition: Condition) => void;
  onRemove: () => void;
}

/** Reusable multi-select chip picker */
function ChipSelect({ label, options, selected, onToggle }: {
  label: string;
  options: { id: string; name: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-text-secondary">{label}</label>
      <div className="flex flex-wrap gap-1 mt-1">
        {options.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggle(opt.id)}
              className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                active
                  ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan font-medium'
                  : 'border-border bg-white text-text-secondary hover:border-gray-300'
              }`}
            >
              {opt.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ConditionRow({
  condition,
  jobStatuses,
  sites,
  regions,
  onChange,
  onRemove,
}: ConditionRowProps) {
  // Handle condition type change - creates new condition with defaults
  const handleTypeChange = (type: ConditionType) => {
    const newCondition = createEmptyCondition(type);
    newCondition.id = condition.id;
    newCondition.jobTypeFilter = condition.jobTypeFilter;
    // Preserve advanced filters across type changes
    newCondition.priorityFilter = condition.priorityFilter;
    newCondition.fromSiteIds = condition.fromSiteIds;
    newCondition.toSiteIds = condition.toSiteIds;
    newCondition.fromRegionIds = condition.fromRegionIds;
    newCondition.toRegionIds = condition.toRegionIds;
    newCondition.timeThresholdMinutes = condition.timeThresholdMinutes;
    onChange(newCondition);
  };

  // Handle job type filter change
  const handleJobTypeChange = (jobTypeFilter: JobTypeFilter) => {
    onChange({ ...condition, jobTypeFilter });
  };

  // Toggle helper for chip selects
  const toggleArrayItem = (field: 'fromSiteIds' | 'toSiteIds' | 'fromRegionIds' | 'toRegionIds', id: string) => {
    const current = condition[field] || [];
    const next = current.includes(id)
      ? current.filter((v) => v !== id)
      : [...current, id];
    onChange({ ...condition, [field]: next });
  };

  // Render type-specific fields
  const renderTypeFields = () => {
    switch (condition.type) {
      case 'job_unassigned':
      case 'job_assigned':
        // No additional fields needed
        return null;

      case 'before_scheduled_time':
      case 'after_scheduled_time':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={condition.offsetValue}
              onChange={(e) =>
                onChange({
                  ...condition,
                  offsetValue: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-20 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
              min={0}
            />
            <select
              value={condition.offsetUnit}
              onChange={(e) =>
                onChange({
                  ...condition,
                  offsetUnit: e.target.value as TimeUnit,
                })
              }
              className="px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              {TIME_UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="text-sm text-text-secondary">
              {condition.type === 'before_scheduled_time' ? 'before' : 'after'}
            </span>
            <select
              value={condition.scheduledTimeField}
              onChange={(e) =>
                onChange({
                  ...condition,
                  scheduledTimeField: e.target.value as ScheduledTimeField,
                })
              }
              className="px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              {SCHEDULED_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'at_scheduled_time':
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">At</span>
            <select
              value={condition.scheduledTimeField}
              onChange={(e) =>
                onChange({
                  ...condition,
                  scheduledTimeField: e.target.value as ScheduledTimeField,
                })
              }
              className="px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              {SCHEDULED_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'status':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={condition.mode}
              onChange={(e) =>
                onChange({
                  ...condition,
                  mode: e.target.value as StatusConditionMode,
                  statusId: e.target.value === 'any_change' ? undefined : condition.statusId,
                })
              }
              className="px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              {STATUS_CONDITION_MODES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {condition.mode !== 'any_change' && (
              <select
                value={condition.statusId || ''}
                onChange={(e) =>
                  onChange({
                    ...condition,
                    statusId: e.target.value,
                  })
                }
                className="px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
              >
                <option value="">Select status...</option>
                {jobStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        );

      case 'scan':
        return (
          <div className="flex flex-wrap gap-2">
            {SCAN_TYPE_OPTIONS.map((opt) => {
              const isSelected = condition.scanTypes.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    const newTypes = isSelected
                      ? condition.scanTypes.filter((t) => t !== opt.value)
                      : [...condition.scanTypes, opt.value];
                    onChange({
                      ...condition,
                      scanTypes: newTypes as ScanType[],
                    });
                  }}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    isSelected
                      ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan'
                      : 'border-border bg-white text-text-secondary hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-border rounded-lg">
      {/* Condition Type */}
      <div className="flex-shrink-0">
        <select
          value={condition.type}
          onChange={(e) => handleTypeChange(e.target.value as ConditionType)}
          className="px-3 py-1.5 text-sm border border-border rounded bg-white text-text-primary font-medium focus:outline-none focus:border-brand-cyan"
        >
          {CONDITION_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.icon} {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Condition Details */}
      <div className="flex-1 space-y-2">
        {/* Row 1: Job Type + Priority */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-secondary">Job type:</label>
            <select
              value={condition.jobTypeFilter}
              onChange={(e) => handleJobTypeChange(e.target.value as JobTypeFilter)}
              className="px-2 py-1 text-xs border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              {JOB_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-secondary">Priority:</label>
            <select
              value={condition.priorityFilter || ''}
              onChange={(e) => onChange({ ...condition, priorityFilter: e.target.value || undefined })}
              className="px-2 py-1 text-xs border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              <option value="">All priorities</option>
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type-specific fields */}
        {renderTypeFields()}

        {/* Time threshold — only for unassigned/assigned */}
        {(condition.type === 'job_unassigned' || condition.type === 'job_assigned') && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-secondary">Time in state:</label>
            <input
              type="number"
              value={condition.timeThresholdMinutes ?? ''}
              onChange={(e) => onChange({ ...condition, timeThresholdMinutes: e.target.value ? parseInt(e.target.value, 10) : undefined })}
              placeholder="minutes"
              className="w-24 px-2 py-1 text-xs border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
              min={0}
            />
            <span className="text-xs text-text-secondary">minutes</span>
          </div>
        )}

        {/* Site filters */}
        {sites.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <ChipSelect
              label="From Site"
              options={sites}
              selected={condition.fromSiteIds || []}
              onToggle={(id) => toggleArrayItem('fromSiteIds', id)}
            />
            <ChipSelect
              label="To Site"
              options={sites}
              selected={condition.toSiteIds || []}
              onToggle={(id) => toggleArrayItem('toSiteIds', id)}
            />
          </div>
        )}

        {/* Region filters */}
        {regions.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <ChipSelect
              label="From Region"
              options={regions}
              selected={condition.fromRegionIds || []}
              onToggle={(id) => toggleArrayItem('fromRegionIds', id)}
            />
            <ChipSelect
              label="To Region"
              options={regions}
              selected={condition.toRegionIds || []}
              onToggle={(id) => toggleArrayItem('toRegionIds', id)}
            />
          </div>
        )}
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        className="flex-shrink-0 p-1 text-text-muted hover:text-error transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
