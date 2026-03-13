// src/modules/schedules/components/LegConfigPanel.tsx
import { X } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Toggle } from '../../../components/ui/Toggle';
import { ZoneSelector } from './ZoneSelector';
import type { ScheduleLeg, LegConfig } from '../types';
import {
  sampleSpeeds,
  sampleZones,
  sampleDepots,
  sampleDropoffLocations,
  sampleLinehaulRuns,
  sampleRateCards,
} from '../data/sampleData';
import { DAYS_OF_WEEK, TEMPERATURE_STATES } from '../types';

interface LegConfigPanelProps {
  leg: ScheduleLeg | null;
  onUpdate: (legId: string, config: LegConfig) => void;
  onClose: () => void;
}

export function LegConfigPanel({ leg, onUpdate, onClose }: LegConfigPanelProps) {
  if (!leg) return null;

  const handleUpdate = (updates: Partial<LegConfig>) => {
    onUpdate(leg.id, { ...leg.config, ...updates } as LegConfig);
  };

  const renderCollectionFields = () => {
    if (leg.config.type !== 'collection') return null;
    const config = leg.config;

    return (
      <div className="space-y-4">
        <Select
          label="Speed"
          value={config.speedId || ''}
          onChange={(e) => handleUpdate({ speedId: e.target.value || undefined })}
          options={[
            { value: '', label: 'Select speed...' },
            ...sampleSpeeds.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />

        <ZoneSelector
          label="Pickup Zones"
          selectedZoneIds={config.pickupZoneIds}
          onChange={(zoneIds) => handleUpdate({ pickupZoneIds: zoneIds })}
          helpText="Select zones where pickup is available"
          zones={sampleZones}
        />

        <Input
          type="number"
          label="Pickup Minutes Before"
          value={config.pickupMinutesBefore}
          onChange={(e) => handleUpdate({ pickupMinutesBefore: parseInt(e.target.value) || 0 })}
          min={0}
        />

        <Toggle
          label="Book from Client Address"
          checked={config.bookFromClientAddress}
          onChange={(checked) => handleUpdate({ bookFromClientAddress: checked })}
        />

        <Toggle
          label="Create Pickup Job"
          checked={config.createPickupJob}
          onChange={(checked) => handleUpdate({ createPickupJob: checked })}
        />
      </div>
    );
  };

  const renderDepotFields = () => {
    if (leg.config.type !== 'depot') return null;
    const config = leg.config;

    const depotDropoffs = sampleDropoffLocations.filter(
      (loc) => loc.depotId === config.depotId
    );

    return (
      <div className="space-y-4">
        <Select
          label="Depot"
          value={config.depotId}
          onChange={(e) => handleUpdate({ depotId: e.target.value })}
          options={sampleDepots.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }))}
        />

        {depotDropoffs.length > 0 && (
          <Select
            label="Dropoff Location"
            value={config.dropoffLocationId || ''}
            onChange={(e) => handleUpdate({ dropoffLocationId: e.target.value || undefined })}
            options={[
              { value: '', label: 'Select location...' },
              ...depotDropoffs.map((loc) => ({ value: loc.id, label: loc.name })),
            ]}
          />
        )}

        <Select
          label="Storage State"
          value={config.storageState || ''}
          onChange={(e) => handleUpdate({ storageState: e.target.value as any })}
          options={[
            { value: '', label: 'Select state...' },
            ...TEMPERATURE_STATES.map((t) => ({ value: t.value, label: t.label })),
          ]}
        />
      </div>
    );
  };

  const renderLinehaulFields = () => {
    if (leg.config.type !== 'linehaul') return null;
    const config = leg.config;

    return (
      <div className="space-y-4">
        <Select
          label="Linehaul Run"
          value={config.runId || ''}
          onChange={(e) => handleUpdate({ runId: e.target.value || undefined })}
          options={[
            { value: '', label: 'Select run...' },
            ...sampleLinehaulRuns.map((r) => ({ value: r.id, label: r.name })),
          ]}
        />

        <Select
          label="Speed"
          value={config.speedId || ''}
          onChange={(e) => handleUpdate({ speedId: e.target.value || undefined })}
          options={[
            { value: '', label: 'Select speed...' },
            ...sampleSpeeds.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />

        <Input
          type="number"
          label="Day Offset (days before delivery)"
          value={config.dayOffset}
          onChange={(e) => handleUpdate({ dayOffset: parseInt(e.target.value) || 0 })}
          min={0}
        />

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Active Days
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <label key={day.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.activeDays.includes(day.value)}
                  onChange={(e) => {
                    const newDays = e.target.checked
                      ? [...config.activeDays, day.value]
                      : config.activeDays.filter((d) => d !== day.value);
                    handleUpdate({ activeDays: newDays as any });
                  }}
                  className="rounded border-border text-brand-cyan focus:ring-brand-cyan"
                />
                <span className="text-sm text-text-secondary">{day.short}</span>
              </label>
            ))}
          </div>
        </div>

        <Input
          type="number"
          label="Transit Minutes"
          value={config.transitMinutes}
          onChange={(e) => handleUpdate({ transitMinutes: parseInt(e.target.value) || 0 })}
          min={0}
        />

        <Toggle
          label="Insert to Bulk"
          checked={config.insertToBulk}
          onChange={(checked) => handleUpdate({ insertToBulk: checked })}
        />

        <Select
          label="Rate Card"
          value={config.rateCardId || ''}
          onChange={(e) => handleUpdate({ rateCardId: e.target.value || undefined })}
          options={[
            { value: '', label: 'Select rate card...' },
            ...sampleRateCards.map((r) => ({ value: r.id, label: r.name })),
          ]}
        />
      </div>
    );
  };

  const renderDeliveryFields = () => {
    if (leg.config.type !== 'delivery') return null;
    const config = leg.config;

    return (
      <div className="space-y-4">
        <Select
          label="Speed"
          value={config.speedId || ''}
          onChange={(e) => handleUpdate({ speedId: e.target.value || undefined })}
          options={[
            { value: '', label: 'Select speed...' },
            ...sampleSpeeds.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />

        <ZoneSelector
          label="Delivery Zones"
          selectedZoneIds={config.deliveryZoneIds}
          onChange={(zoneIds) => handleUpdate({ deliveryZoneIds: zoneIds })}
          helpText="Select zones where delivery is available"
          zones={sampleZones}
        />

        <Select
          label="Delivery State"
          value={config.deliveryState || ''}
          onChange={(e) => handleUpdate({ deliveryState: e.target.value as any })}
          options={[
            { value: '', label: 'Select state...' },
            ...TEMPERATURE_STATES.map((t) => ({ value: t.value, label: t.label })),
          ]}
        />

        <Select
          label="Rate Card"
          value={config.rateCardId || ''}
          onChange={(e) => handleUpdate({ rateCardId: e.target.value || undefined })}
          options={[
            { value: '', label: 'Select rate card...' },
            ...sampleRateCards.map((r) => ({ value: r.id, label: r.name })),
          ]}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l-2 border-border shadow-lg z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b-2 border-border p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          Configure {leg.config.type.charAt(0).toUpperCase() + leg.config.type.slice(1)} Leg
        </h3>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        {leg.config.type === 'collection' && renderCollectionFields()}
        {leg.config.type === 'depot' && renderDepotFields()}
        {leg.config.type === 'linehaul' && renderLinehaulFields()}
        {leg.config.type === 'delivery' && renderDeliveryFields()}
      </div>
    </div>
  );
}
