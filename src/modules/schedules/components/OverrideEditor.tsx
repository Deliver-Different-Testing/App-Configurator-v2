// src/modules/schedules/components/OverrideEditor.tsx
import { useState } from 'react';
import { Toggle } from '../../../components/ui/Toggle';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { RotateCcw } from 'lucide-react';
import type { Schedule, DayOfWeek } from '../types';
import { OVERRIDABLE_FIELDS, DAYS_OF_WEEK } from '../types';
import { sampleSpeeds } from '../data/sampleData';

interface OverrideEditorProps {
  schedule: Schedule; // The override schedule
  baseSchedule: Schedule; // The parent schedule
  onSave: (schedule: Schedule) => void;
  onCancel: () => void;
}

export function OverrideEditor({
  schedule: initialSchedule,
  baseSchedule,
  onSave,
  onCancel,
}: OverrideEditorProps) {
  const [formSchedule, setFormSchedule] = useState<Schedule>(initialSchedule);
  const [overrideToggles, setOverrideToggles] = useState<Record<string, boolean>>(() => {
    // Initialize toggles based on overriddenFields
    const toggles: Record<string, boolean> = {};
    OVERRIDABLE_FIELDS.forEach((field) => {
      toggles[field.field] = formSchedule.overriddenFields.includes(field.field);
    });
    return toggles;
  });

  const isFieldOverridden = (field: string): boolean => {
    return overrideToggles[field] || false;
  };

  const handleToggleOverride = (field: string, enabled: boolean) => {
    setOverrideToggles((prev) => ({ ...prev, [field]: enabled }));

    // Update overriddenFields array
    if (enabled) {
      if (!formSchedule.overriddenFields.includes(field)) {
        setFormSchedule((prev) => ({
          ...prev,
          overriddenFields: [...prev.overriddenFields, field],
        }));
      }
    } else {
      // Reset to base value when disabled
      setFormSchedule((prev) => {
        const updated = { ...prev };
        updated.overriddenFields = updated.overriddenFields.filter((f) => f !== field);

        // Reset field value to base
        if (field === 'operatingSchedule.cutoffValue') {
          updated.operatingSchedule = {
            ...updated.operatingSchedule,
            cutoffValue: baseSchedule.operatingSchedule.cutoffValue,
          };
        } else if (field === 'operatingSchedule.days') {
          updated.operatingSchedule = {
            ...updated.operatingSchedule,
            days: { ...baseSchedule.operatingSchedule.days },
          };
        } else if (field === 'legs[0].config.pickupMinutesBefore' && updated.legs[0]?.config.type === 'collection') {
          const baseCollectionLeg = baseSchedule.legs[0];
          if (baseCollectionLeg?.config.type === 'collection') {
            updated.legs = [
              {
                ...updated.legs[0],
                config: {
                  ...updated.legs[0].config,
                  pickupMinutesBefore: baseCollectionLeg.config.pickupMinutesBefore,
                },
              },
              ...updated.legs.slice(1),
            ];
          }
        } else if (field === 'defaultDeliverySpeedId') {
          updated.defaultDeliverySpeedId = baseSchedule.defaultDeliverySpeedId;
        } else if (field === 'defaultPickupSpeedId') {
          updated.defaultPickupSpeedId = baseSchedule.defaultPickupSpeedId;
        }

        return updated;
      });
    }
  };

  const handleResetField = (field: string) => {
    handleToggleOverride(field, false);
  };

  const handleCutoffChange = (value: number) => {
    setFormSchedule((prev) => ({
      ...prev,
      operatingSchedule: {
        ...prev.operatingSchedule,
        cutoffValue: value,
      },
    }));
  };

  const handlePickupMinutesChange = (value: number) => {
    if (formSchedule.legs[0]?.config.type === 'collection') {
      setFormSchedule((prev) => ({
        ...prev,
        legs: [
          {
            ...prev.legs[0],
            config: {
              ...prev.legs[0].config,
              pickupMinutesBefore: value,
            },
          },
          ...prev.legs.slice(1),
        ],
      }));
    }
  };

  const handleSpeedChange = (
    field: 'defaultDeliverySpeedId' | 'defaultPickupSpeedId',
    value: string
  ) => {
    setFormSchedule((prev) => ({ ...prev, [field]: value || undefined }));
  };

  const handleDayChange = (day: DayOfWeek, startTime: string, endTime: string, enabled: boolean) => {
    setFormSchedule((prev) => ({
      ...prev,
      operatingSchedule: {
        ...prev.operatingSchedule,
        days: {
          ...prev.operatingSchedule.days,
          [day]: { enabled, startTime, endTime },
        },
      },
    }));
  };

  const handleSave = () => {
    onSave(formSchedule);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface-cream p-4 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Override: {formSchedule.name}
        </h3>
        <p className="text-sm text-text-secondary">
          Base Schedule: {baseSchedule.name}
        </p>
        <p className="text-xs text-text-muted mt-2">
          Toggle fields to override them. Disabled fields inherit from base schedule.
        </p>
      </div>

      {/* Overridable Fields */}
      <div className="space-y-4">
        {/* Booking Cutoff */}
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Toggle
                checked={isFieldOverridden('operatingSchedule.cutoffValue')}
                onChange={(checked) => handleToggleOverride('operatingSchedule.cutoffValue', checked)}
              />
              <label className="text-sm font-medium text-text-primary">Booking Cutoff</label>
            </div>
            {isFieldOverridden('operatingSchedule.cutoffValue') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleResetField('operatingSchedule.cutoffValue')}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset to base
              </Button>
            )}
          </div>
          <div className={!isFieldOverridden('operatingSchedule.cutoffValue') ? 'opacity-50 pointer-events-none' : ''}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">Base Value</label>
                <div className="px-3 py-2 bg-surface-cream rounded text-sm text-text-secondary">
                  {baseSchedule.operatingSchedule.cutoffValue} {baseSchedule.operatingSchedule.cutoffUnit}
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Override Value</label>
                <Input
                  type="number"
                  value={formSchedule.operatingSchedule.cutoffValue}
                  onChange={(e) => handleCutoffChange(Number(e.target.value))}
                  disabled={!isFieldOverridden('operatingSchedule.cutoffValue')}
                  className={isFieldOverridden('operatingSchedule.cutoffValue') ? 'bg-yellow-50 border-yellow-300' : ''}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operating Days */}
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Toggle
                checked={isFieldOverridden('operatingSchedule.days')}
                onChange={(checked) => handleToggleOverride('operatingSchedule.days', checked)}
              />
              <label className="text-sm font-medium text-text-primary">Operating Days</label>
            </div>
            {isFieldOverridden('operatingSchedule.days') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleResetField('operatingSchedule.days')}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset to base
              </Button>
            )}
          </div>
          <div className={!isFieldOverridden('operatingSchedule.days') ? 'opacity-50 pointer-events-none' : ''}>
            <div className="space-y-2">
              {DAYS_OF_WEEK.map((day) => {
                const baseDay = baseSchedule.operatingSchedule.days[day.value];
                const overrideDay = formSchedule.operatingSchedule.days[day.value];
                return (
                  <div
                    key={day.value}
                    className={`flex items-center gap-4 p-2 rounded ${
                      isFieldOverridden('operatingSchedule.days') ? 'bg-yellow-50' : 'bg-surface-cream'
                    }`}
                  >
                    <div className="w-20">
                      <span className="text-sm font-medium text-text-primary">{day.label}</span>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-text-muted">Base: </span>
                        {baseDay.enabled ? (
                          <span className="text-text-secondary">
                            {baseDay.startTime} - {baseDay.endTime}
                          </span>
                        ) : (
                          <span className="text-text-muted">Closed</span>
                        )}
                      </div>
                      <div>
                        <Toggle
                          checked={overrideDay.enabled}
                          onChange={(checked) =>
                            handleDayChange(
                              day.value,
                              overrideDay.startTime,
                              overrideDay.endTime,
                              checked
                            )
                          }
                          disabled={!isFieldOverridden('operatingSchedule.days')}
                          label="Enabled"
                          size="sm"
                        />
                      </div>
                      {overrideDay.enabled && (
                        <div className="flex gap-2">
                          <Input
                            type="time"
                            value={overrideDay.startTime}
                            onChange={(e) =>
                              handleDayChange(
                                day.value,
                                e.target.value,
                                overrideDay.endTime,
                                overrideDay.enabled
                              )
                            }
                            disabled={!isFieldOverridden('operatingSchedule.days')}
                            className="text-xs"
                          />
                          <Input
                            type="time"
                            value={overrideDay.endTime}
                            onChange={(e) =>
                              handleDayChange(
                                day.value,
                                overrideDay.startTime,
                                e.target.value,
                                overrideDay.enabled
                              )
                            }
                            disabled={!isFieldOverridden('operatingSchedule.days')}
                            className="text-xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pickup Time Offset */}
        {formSchedule.legs[0]?.config.type === 'collection' &&
          baseSchedule.legs[0]?.config.type === 'collection' && (
            <div className="bg-white p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={isFieldOverridden('legs[0].config.pickupMinutesBefore')}
                    onChange={(checked) =>
                      handleToggleOverride('legs[0].config.pickupMinutesBefore', checked)
                    }
                  />
                  <label className="text-sm font-medium text-text-primary">Pickup Time Offset</label>
                </div>
                {isFieldOverridden('legs[0].config.pickupMinutesBefore') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResetField('legs[0].config.pickupMinutesBefore')}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset to base
                  </Button>
                )}
              </div>
              <div
                className={
                  !isFieldOverridden('legs[0].config.pickupMinutesBefore')
                    ? 'opacity-50 pointer-events-none'
                    : ''
                }
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Base Value</label>
                    <div className="px-3 py-2 bg-surface-cream rounded text-sm text-text-secondary">
                      {baseSchedule.legs[0].config.pickupMinutesBefore} minutes
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Override Value</label>
                    <Input
                      type="number"
                      value={formSchedule.legs[0].config.pickupMinutesBefore}
                      onChange={(e) => handlePickupMinutesChange(Number(e.target.value))}
                      disabled={!isFieldOverridden('legs[0].config.pickupMinutesBefore')}
                      className={
                        isFieldOverridden('legs[0].config.pickupMinutesBefore')
                          ? 'bg-yellow-50 border-yellow-300'
                          : ''
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Delivery Speed */}
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Toggle
                checked={isFieldOverridden('defaultDeliverySpeedId')}
                onChange={(checked) => handleToggleOverride('defaultDeliverySpeedId', checked)}
              />
              <label className="text-sm font-medium text-text-primary">Delivery Speed</label>
            </div>
            {isFieldOverridden('defaultDeliverySpeedId') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleResetField('defaultDeliverySpeedId')}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset to base
              </Button>
            )}
          </div>
          <div className={!isFieldOverridden('defaultDeliverySpeedId') ? 'opacity-50 pointer-events-none' : ''}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">Base Value</label>
                <div className="px-3 py-2 bg-surface-cream rounded text-sm text-text-secondary">
                  {sampleSpeeds.find((s) => s.id === baseSchedule.defaultDeliverySpeedId)?.name || 'None'}
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Override Value</label>
                <Select
                  value={formSchedule.defaultDeliverySpeedId || ''}
                  onChange={(e) => handleSpeedChange('defaultDeliverySpeedId', e.target.value)}
                  disabled={!isFieldOverridden('defaultDeliverySpeedId')}
                  options={[
                    { value: '', label: 'None' },
                    ...sampleSpeeds.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                  className={
                    isFieldOverridden('defaultDeliverySpeedId') ? 'bg-yellow-50 border-yellow-300' : ''
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Speed */}
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Toggle
                checked={isFieldOverridden('defaultPickupSpeedId')}
                onChange={(checked) => handleToggleOverride('defaultPickupSpeedId', checked)}
              />
              <label className="text-sm font-medium text-text-primary">Pickup Speed</label>
            </div>
            {isFieldOverridden('defaultPickupSpeedId') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleResetField('defaultPickupSpeedId')}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset to base
              </Button>
            )}
          </div>
          <div className={!isFieldOverridden('defaultPickupSpeedId') ? 'opacity-50 pointer-events-none' : ''}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">Base Value</label>
                <div className="px-3 py-2 bg-surface-cream rounded text-sm text-text-secondary">
                  {sampleSpeeds.find((s) => s.id === baseSchedule.defaultPickupSpeedId)?.name || 'None'}
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Override Value</label>
                <Select
                  value={formSchedule.defaultPickupSpeedId || ''}
                  onChange={(e) => handleSpeedChange('defaultPickupSpeedId', e.target.value)}
                  disabled={!isFieldOverridden('defaultPickupSpeedId')}
                  options={[
                    { value: '', label: 'None' },
                    ...sampleSpeeds.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                  className={
                    isFieldOverridden('defaultPickupSpeedId') ? 'bg-yellow-50 border-yellow-300' : ''
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 p-4 bg-surface-cream rounded-lg border border-border">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Override
        </Button>
      </div>
    </div>
  );
}
