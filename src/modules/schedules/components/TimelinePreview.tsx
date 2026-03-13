// src/modules/schedules/components/TimelinePreview.tsx
import { useMemo } from 'react';
import { Select } from '../../../components/ui/Select';
import type { Schedule, DayOfWeek } from '../types';
import { DAYS_OF_WEEK, getDayLabel } from '../types';

interface TimelinePreviewProps {
  schedule: Schedule;
  deliveryDay: DayOfWeek;
  onDeliveryDayChange?: (day: DayOfWeek) => void;
}

interface TimelineEvent {
  label: string;
  day: string;
  time: string;
  isCutoff?: boolean;
  isDelivery?: boolean;
}

export function TimelinePreview({ schedule, deliveryDay, onDeliveryDayChange }: TimelinePreviewProps) {
  const timeline = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Get delivery window
    const deliveryDaySchedule = schedule.operatingSchedule.days[deliveryDay];
    if (!deliveryDaySchedule.enabled) {
      return [];
    }

    // Delivery event (the end point)
    events.push({
      label: 'Delivery',
      day: getDayLabel(deliveryDay, false),
      time: `${deliveryDaySchedule.startTime}-${deliveryDaySchedule.endTime}`,
      isDelivery: true,
    });

    // Work backwards through the legs
    let currentDayOffset = 0;
    const reversedLegs = [...schedule.legs].reverse();

    reversedLegs.forEach((leg) => {
      if (leg.config.type === 'linehaul') {
        const linehaulConfig = leg.config;
        currentDayOffset += linehaulConfig.dayOffset;

        // Calculate arrival time (before transit)
        const arrivalDay = getDayBefore(deliveryDay, currentDayOffset);
        events.unshift({
          label: 'Arrive at Depot',
          day: getDayLabel(arrivalDay, false),
          time: '5:00 AM', // Simplified for demo
        });

        // Calculate departure time
        const departureDay = getDayBefore(deliveryDay, currentDayOffset);
        events.unshift({
          label: 'Depart Depot',
          day: getDayLabel(departureDay, false),
          time: '7:00 PM', // Simplified for demo
        });
      } else if (leg.config.type === 'collection') {
        const collectionConfig = leg.config;
        const minutesBefore = collectionConfig.pickupMinutesBefore;
        const collectionDay = getDayBefore(deliveryDay, currentDayOffset);

        // Calculate collection time (simplified)
        const collectionTime = calculateTimeBefore(deliveryDaySchedule.startTime, minutesBefore);

        events.unshift({
          label: 'Collection',
          day: getDayLabel(collectionDay, false),
          time: collectionTime,
        });
      }
    });

    // Add cutoff event
    if (events.length > 0) {
      const firstEvent = events[0];
      const cutoffMinutes = convertToMinutes(
        schedule.operatingSchedule.cutoffValue,
        schedule.operatingSchedule.cutoffUnit
      );
      const cutoffTime = calculateTimeBefore(firstEvent.time.split('-')[0], cutoffMinutes);

      events.unshift({
        label: 'Booking Cutoff',
        day: firstEvent.day,
        time: cutoffTime,
        isCutoff: true,
      });
    }

    return events;
  }, [schedule, deliveryDay]);

  if (!schedule.operatingSchedule.days[deliveryDay].enabled) {
    return (
      <div className="bg-surface-cream border-2 border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-text-primary">Timeline Preview</h4>
          {onDeliveryDayChange && (
            <Select
              value={deliveryDay}
              onChange={(e) => onDeliveryDayChange(e.target.value as DayOfWeek)}
              options={DAYS_OF_WEEK.map((d) => ({ value: d.value, label: d.label }))}
              className="w-40"
            />
          )}
        </div>
        <p className="text-sm text-text-muted">
          No deliveries scheduled for {getDayLabel(deliveryDay, false)}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-cream border-2 border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-text-primary">Timeline Preview</h4>
        {onDeliveryDayChange && (
          <Select
            value={deliveryDay}
            onChange={(e) => onDeliveryDayChange(e.target.value as DayOfWeek)}
            options={DAYS_OF_WEEK.map((d) => ({ value: d.value, label: d.label }))}
            className="w-40"
          />
        )}
      </div>

      <div className="space-y-3">
        {timeline.map((event, index) => (
          <div key={index} className="relative">
            {index < timeline.length - 1 && (
              <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-border" />
            )}
            <div className="flex items-start gap-3">
              <div
                className={`
                  w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1
                  ${event.isCutoff ? 'bg-error border-error' : ''}
                  ${event.isDelivery ? 'bg-brand-cyan border-brand-cyan' : ''}
                  ${!event.isCutoff && !event.isDelivery ? 'bg-white border-border' : ''}
                `}
              />
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <span
                    className={`
                      text-sm font-medium
                      ${event.isCutoff ? 'text-error' : ''}
                      ${event.isDelivery ? 'text-brand-cyan' : ''}
                      ${!event.isCutoff && !event.isDelivery ? 'text-text-primary' : ''}
                    `}
                  >
                    {event.label}
                  </span>
                  <span className="text-xs text-text-muted">{event.day}</span>
                </div>
                <div className="text-sm text-text-secondary mt-0.5">{event.time}</div>
                {event.isCutoff && (
                  <div className="text-xs text-error mt-1">
                    Bookings must be received by this time
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper functions
function getDayBefore(day: DayOfWeek, offset: number): DayOfWeek {
  const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const currentIndex = days.indexOf(day);
  const targetIndex = (currentIndex - offset + 7) % 7;
  return days[targetIndex];
}

function calculateTimeBefore(time: string, minutesBefore: number): string {
  // Simplified calculation for demo
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes - minutesBefore;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}

function convertToMinutes(value: number, unit: 'minutes' | 'hours' | 'days'): number {
  switch (unit) {
    case 'minutes':
      return value;
    case 'hours':
      return value * 60;
    case 'days':
      return value * 24 * 60;
    default:
      return value;
  }
}
