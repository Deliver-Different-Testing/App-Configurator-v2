import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Toggle';
import type { ClientSchedule } from '../types';

interface ScheduleTabProps {
  schedules: ClientSchedule[];
  onSave?: (schedules: ClientSchedule[]) => void;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
] as const;

export function ScheduleTab({ schedules, onSave }: ScheduleTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localSchedules, setLocalSchedules] = useState(schedules);

  const getScheduleForDay = (day: string) => {
    return localSchedules.find(s => s.dayOfWeek === day) || {
      id: `temp-${day}`,
      clientId: schedules[0]?.clientId || '',
      dayOfWeek: day as ClientSchedule['dayOfWeek'],
      isOpen: false,
    };
  };

  const updateSchedule = (day: string, field: keyof ClientSchedule, value: unknown) => {
    setLocalSchedules(prev => {
      const existing = prev.find(s => s.dayOfWeek === day);
      if (existing) {
        return prev.map(s => s.dayOfWeek === day ? { ...s, [field]: value } : s);
      }
      return [...prev, { ...getScheduleForDay(day), [field]: value }];
    });
  };

  const handleSave = () => {
    onSave?.(localSchedules);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalSchedules(schedules);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Operating Schedule</h3>
          <p className="text-sm text-text-secondary mt-1">
            Configure collection and delivery hours for each day of the week
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button variant="secondary" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Edit Schedule
            </Button>
          )}
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 bg-surface-light border-b border-border">
          <div className="p-4 font-medium text-sm text-text-secondary">Day</div>
          <div className="p-4 font-medium text-sm text-text-secondary text-center">Open</div>
          <div className="p-4 font-medium text-sm text-text-secondary text-center">Collection Start</div>
          <div className="p-4 font-medium text-sm text-text-secondary text-center">Collection End</div>
          <div className="p-4 font-medium text-sm text-text-secondary text-center">Delivery Start</div>
          <div className="p-4 font-medium text-sm text-text-secondary text-center">Delivery End</div>
        </div>

        {/* Schedule Rows */}
        {DAYS_OF_WEEK.map((day, index) => {
          const schedule = getScheduleForDay(day.key);
          const isWeekend = day.key === 'saturday' || day.key === 'sunday';

          return (
            <div
              key={day.key}
              className={`grid grid-cols-6 items-center ${
                index < DAYS_OF_WEEK.length - 1 ? 'border-b border-border' : ''
              } ${!schedule.isOpen ? 'bg-gray-50' : ''} ${isWeekend ? 'bg-surface-cream' : ''}`}
            >
              {/* Day Name */}
              <div className="p-4">
                <span className={`font-medium ${schedule.isOpen ? 'text-text-primary' : 'text-text-muted'}`}>
                  {day.label}
                </span>
              </div>

              {/* Open Toggle */}
              <div className="p-4 flex justify-center">
                <Toggle
                  checked={schedule.isOpen}
                  onChange={(checked) => isEditing && updateSchedule(day.key, 'isOpen', checked)}
                  disabled={!isEditing}
                />
              </div>

              {/* Collection Start */}
              <div className="p-4 flex justify-center">
                {schedule.isOpen ? (
                  isEditing ? (
                    <input
                      type="time"
                      value={schedule.collectionStart || ''}
                      onChange={(e) => updateSchedule(day.key, 'collectionStart', e.target.value)}
                      className="text-sm px-2 py-1 border border-border rounded text-center w-28"
                    />
                  ) : (
                    <span className="text-sm font-medium text-text-primary">
                      {schedule.collectionStart || '-'}
                    </span>
                  )
                ) : (
                  <span className="text-sm text-text-muted">-</span>
                )}
              </div>

              {/* Collection End */}
              <div className="p-4 flex justify-center">
                {schedule.isOpen ? (
                  isEditing ? (
                    <input
                      type="time"
                      value={schedule.collectionEnd || ''}
                      onChange={(e) => updateSchedule(day.key, 'collectionEnd', e.target.value)}
                      className="text-sm px-2 py-1 border border-border rounded text-center w-28"
                    />
                  ) : (
                    <span className="text-sm font-medium text-text-primary">
                      {schedule.collectionEnd || '-'}
                    </span>
                  )
                ) : (
                  <span className="text-sm text-text-muted">-</span>
                )}
              </div>

              {/* Delivery Start */}
              <div className="p-4 flex justify-center">
                {schedule.isOpen ? (
                  isEditing ? (
                    <input
                      type="time"
                      value={schedule.deliveryStart || ''}
                      onChange={(e) => updateSchedule(day.key, 'deliveryStart', e.target.value)}
                      className="text-sm px-2 py-1 border border-border rounded text-center w-28"
                    />
                  ) : (
                    <span className="text-sm font-medium text-text-primary">
                      {schedule.deliveryStart || '-'}
                    </span>
                  )
                ) : (
                  <span className="text-sm text-text-muted">-</span>
                )}
              </div>

              {/* Delivery End */}
              <div className="p-4 flex justify-center">
                {schedule.isOpen ? (
                  isEditing ? (
                    <input
                      type="time"
                      value={schedule.deliveryEnd || ''}
                      onChange={(e) => updateSchedule(day.key, 'deliveryEnd', e.target.value)}
                      className="text-sm px-2 py-1 border border-border rounded text-center w-28"
                    />
                  ) : (
                    <span className="text-sm font-medium text-text-primary">
                      {schedule.deliveryEnd || '-'}
                    </span>
                  )
                ) : (
                  <span className="text-sm text-text-muted">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border border-border" />
          <span>Weekday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-surface-cream border border-border" />
          <span>Weekend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-50 border border-border" />
          <span>Closed</span>
        </div>
      </div>

      {/* Quick Actions */}
      {isEditing && (
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              DAYS_OF_WEEK.slice(0, 5).forEach(day => {
                updateSchedule(day.key, 'isOpen', true);
                updateSchedule(day.key, 'collectionStart', '09:00');
                updateSchedule(day.key, 'collectionEnd', '17:00');
                updateSchedule(day.key, 'deliveryStart', '08:00');
                updateSchedule(day.key, 'deliveryEnd', '18:00');
              });
            }}
          >
            Apply Standard Hours (Mon-Fri)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              DAYS_OF_WEEK.forEach(day => {
                updateSchedule(day.key, 'isOpen', true);
                updateSchedule(day.key, 'collectionStart', '00:00');
                updateSchedule(day.key, 'collectionEnd', '23:59');
                updateSchedule(day.key, 'deliveryStart', '00:00');
                updateSchedule(day.key, 'deliveryEnd', '23:59');
              });
            }}
          >
            Apply 24/7
          </Button>
        </div>
      )}
    </div>
  );
}
