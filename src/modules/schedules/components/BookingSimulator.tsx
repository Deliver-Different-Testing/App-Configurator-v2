// src/modules/schedules/components/BookingSimulator.tsx
import { useState, useMemo } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Play, CheckCircle, XCircle, Clock, AlertCircle, AlertTriangle } from 'lucide-react';
import type { Schedule, DayOfWeek } from '../types';
import { getLegTypeLabel, DAYS_OF_WEEK } from '../types';
import { sampleZones } from '../data/sampleData';
import { zipZonesData } from '../../territory/data/sampleData';

interface BookingSimulatorProps {
  schedule: Schedule;
}

interface ZipLookupResult {
  found: boolean;
  zoneName: string | null;
  zoneId: string | null;
  errorMessage?: string;
}

interface SimulationResult {
  matches: boolean;
  reason: string;
  legs: {
    legType: string;
    scheduledTime: string;
    description: string;
  }[];
  cutoffExplanation: string;
  lateBookingImpact?: string;
}

// Lookup a zip code in the territory data
function lookupZipCode(zipCode: string): ZipLookupResult {
  if (!zipCode || zipCode.trim().length === 0) {
    return { found: false, zoneName: null, zoneId: null };
  }

  const normalizedZip = zipCode.trim();
  const zipZone = zipZonesData.find(z => z.zip === normalizedZip);

  if (!zipZone) {
    return {
      found: false,
      zoneName: null,
      zoneId: null,
      errorMessage: 'Zip code not assigned to any zone',
    };
  }

  // Try to match to a schedule zone by code or name
  const matchingZone = sampleZones.find(z =>
    z.code === zipZone.zoneNumber ||
    z.name.toLowerCase().includes(zipZone.zoneName.toLowerCase()) ||
    zipZone.zoneName.toLowerCase().includes(z.name.toLowerCase())
  );

  return {
    found: true,
    zoneName: zipZone.zoneName,
    zoneId: matchingZone?.id || null,
  };
}

export function BookingSimulator({ schedule }: BookingSimulatorProps) {
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('09:00');
  const [pickupZip, setPickupZip] = useState('');
  const [deliveryZip, setDeliveryZip] = useState('');
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Real-time zip lookups
  const pickupLookup = useMemo(() => lookupZipCode(pickupZip), [pickupZip]);
  const deliveryLookup = useMemo(() => lookupZipCode(deliveryZip), [deliveryZip]);

  const handleRunTest = () => {
    // Parse booking date/time
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][
      bookingDateTime.getDay()
    ] as DayOfWeek;

    // Check if schedule operates on this day
    const daySchedule = schedule.operatingSchedule.days[dayOfWeek];
    if (!daySchedule.enabled) {
      setResult({
        matches: false,
        reason: `Schedule does not operate on ${DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)?.label}`,
        legs: [],
        cutoffExplanation: 'N/A',
      });
      return;
    }

    // Check zone coverage using resolved zone IDs
    const collectionLeg = schedule.legs.find((leg) => leg.config.type === 'collection');
    const deliveryLeg = schedule.legs.find((leg) => leg.config.type === 'delivery');

    if (collectionLeg?.config.type === 'collection' && pickupLookup.zoneId) {
      if (!collectionLeg.config.pickupZoneIds.includes(pickupLookup.zoneId)) {
        setResult({
          matches: false,
          reason: `Pickup zone (${pickupLookup.zoneName}) not covered by this schedule`,
          legs: [],
          cutoffExplanation: 'N/A',
        });
        return;
      }
    }

    if (deliveryLeg?.config.type === 'delivery' && deliveryLookup.zoneId) {
      if (!deliveryLeg.config.deliveryZoneIds.includes(deliveryLookup.zoneId)) {
        setResult({
          matches: false,
          reason: `Delivery zone (${deliveryLookup.zoneName}) not covered by this schedule`,
          legs: [],
          cutoffExplanation: 'N/A',
        });
        return;
      }
    }

    // Calculate cutoff time
    const cutoffMinutes = schedule.operatingSchedule.cutoffValue;
    const cutoffUnit = schedule.operatingSchedule.cutoffUnit;

    let cutoffOffset: number;
    if (cutoffUnit === 'minutes') {
      cutoffOffset = cutoffMinutes;
    } else if (cutoffUnit === 'hours') {
      cutoffOffset = cutoffMinutes * 60;
    } else {
      cutoffOffset = cutoffMinutes * 24 * 60; // days
    }

    // For simplicity, assume delivery window starts at day schedule start
    const deliveryStartTime = new Date(bookingDateTime);
    const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number);
    deliveryStartTime.setHours(startHour, startMinute, 0, 0);

    const cutoffTime = new Date(deliveryStartTime.getTime() - cutoffOffset * 60 * 1000);

    const isMeetsCutoff = bookingDateTime <= cutoffTime;

    // Build leg timeline (simplified)
    const legs = schedule.legs.map((leg) => {
      let scheduledTime = '';
      let description = '';

      if (leg.config.type === 'collection') {
        const collectionTime = new Date(
          deliveryStartTime.getTime() - leg.config.pickupMinutesBefore * 60 * 1000
        );
        scheduledTime = collectionTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        description = `Pickup from ${pickupZip} (${pickupLookup.zoneName || 'Unknown zone'})`;
      } else if (leg.config.type === 'depot') {
        scheduledTime = 'TBD';
        description = 'Arrive at depot for processing';
      } else if (leg.config.type === 'linehaul') {
        scheduledTime = 'TBD';
        description = `Transit (${leg.config.transitMinutes} minutes)`;
      } else if (leg.config.type === 'delivery') {
        scheduledTime = `${daySchedule.startTime} - ${daySchedule.endTime}`;
        description = `Deliver to ${deliveryZip} (${deliveryLookup.zoneName || 'Unknown zone'})`;
      }

      return {
        legType: getLegTypeLabel(leg.config.type),
        scheduledTime,
        description,
      };
    });

    const cutoffExplanation = `Cutoff: ${cutoffTime.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}. Booking must be received ${cutoffMinutes} ${cutoffUnit} before delivery window.`;

    const lateBookingImpact = !isMeetsCutoff
      ? `This booking is ${Math.round((bookingDateTime.getTime() - cutoffTime.getTime()) / 60000)} minutes late. It would not appear for this delivery window. Next available window would be calculated based on delivery window rules.`
      : undefined;

    setResult({
      matches: isMeetsCutoff,
      reason: isMeetsCutoff
        ? 'Booking meets all criteria'
        : 'Booking received after cutoff time',
      legs,
      cutoffExplanation,
      lateBookingImpact,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface-cream p-4 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Booking Simulator</h3>
        <p className="text-sm text-text-secondary">
          Test what happens if a booking is made at a specific date/time for a route.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white p-4 rounded-lg border border-border space-y-4">
        <h4 className="text-sm font-semibold text-text-primary">Test Inputs</h4>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Booking Date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
          />
          <Input
            type="time"
            label="Booking Time"
            value={bookingTime}
            onChange={(e) => setBookingTime(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Pickup Zip Code */}
          <div className="space-y-2">
            <Input
              type="text"
              label="Pickup Zip Code"
              placeholder="Enter zip code..."
              value={pickupZip}
              onChange={(e) => setPickupZip(e.target.value)}
            />
            {pickupZip && pickupLookup.found && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700">Zone: {pickupLookup.zoneName}</span>
              </div>
            )}
            {pickupZip && !pickupLookup.found && pickupLookup.errorMessage && (
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-orange-600">{pickupLookup.errorMessage}</span>
              </div>
            )}
          </div>

          {/* Delivery Zip Code */}
          <div className="space-y-2">
            <Input
              type="text"
              label="Delivery Zip Code"
              placeholder="Enter zip code..."
              value={deliveryZip}
              onChange={(e) => setDeliveryZip(e.target.value)}
            />
            {deliveryZip && deliveryLookup.found && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700">Zone: {deliveryLookup.zoneName}</span>
              </div>
            )}
            {deliveryZip && !deliveryLookup.found && deliveryLookup.errorMessage && (
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-orange-600">{deliveryLookup.errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        <Button variant="primary" onClick={handleRunTest} className="w-full">
          <Play className="w-4 h-4 mr-2" />
          Run Test
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Match Result */}
          <div
            className={`p-4 rounded-lg border ${
              result.matches
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {result.matches ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <h4 className="text-sm font-semibold text-text-primary">
                  {result.matches ? 'Schedule Matches' : 'Schedule Does Not Match'}
                </h4>
                <p className="text-sm text-text-secondary">{result.reason}</p>
              </div>
            </div>
          </div>

          {/* Cutoff Explanation */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-1">Cutoff Time</h4>
                <p className="text-sm text-text-secondary">{result.cutoffExplanation}</p>
              </div>
            </div>
          </div>

          {/* Late Booking Impact */}
          {result.lateBookingImpact && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">
                    Late Booking Impact
                  </h4>
                  <p className="text-sm text-text-secondary">{result.lateBookingImpact}</p>
                </div>
              </div>
            </div>
          )}

          {/* Leg Breakdown */}
          {result.legs.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-border">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Leg Breakdown</h4>
              <div className="space-y-2">
                {result.legs.map((leg, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-surface-cream rounded-lg"
                  >
                    <div>
                      <Badge variant="blue" size="sm" className="mb-1">
                        {leg.legType}
                      </Badge>
                      <p className="text-sm text-text-secondary">{leg.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-text-primary">
                        {leg.scheduledTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
