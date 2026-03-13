// src/modules/schedules/components/ScheduleEditForm.tsx
import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Toggle } from '../../../components/ui/Toggle';
import { Button } from '../../../components/ui/Button';
import { ChainBuilder } from './ChainBuilder';
import { LegConfigPanel } from './LegConfigPanel';
import { OperatingScheduleSection } from './OperatingScheduleSection';
import { TimelinePreview } from './TimelinePreview';
import { BookingSimulator } from './BookingSimulator';
import { ClientOverridesTab } from './ClientOverridesTab';
import type { Schedule, ScheduleLeg, LegConfig, LegType, DayOfWeek } from '../types';
import { BOOKING_MODES } from '../types';
import {
  sampleDepots,
  sampleSpeeds,
  sampleZones,
  sampleClients,
} from '../data/sampleData';

export type EditFormTab = 'config' | 'clients';

interface ScheduleEditFormProps {
  schedule: Schedule;
  allSchedules?: Schedule[];
  onSave: (schedule: Schedule) => void;
  onCancel: () => void;
  onTabChange?: (tab: EditFormTab) => void;
  isNew?: boolean;
}

export function ScheduleEditForm({
  schedule: initialSchedule,
  allSchedules = [],
  onSave,
  onCancel,
  onTabChange,
  isNew = false,
}: ScheduleEditFormProps) {
  // Local state for form values
  const [formSchedule, setFormSchedule] = useState<Schedule>(initialSchedule);
  const [selectedLegId, setSelectedLegId] = useState<string | null>(null);
  const [previewDay, setPreviewDay] = useState<DayOfWeek>('mon');
  const [activeTab, setActiveTab] = useState<EditFormTab>('config');

  // Handle tab change and notify parent
  const handleTabChange = (tab: EditFormTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Count client overrides for this schedule
  const clientOverrideCount = useMemo(() => {
    return allSchedules.filter(
      (s) => s.isOverride && s.baseScheduleId === formSchedule.id
    ).length;
  }, [allSchedules, formSchedule.id]);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    header: true,
    overview: true,
    origin: true,
    chain: true,
    operating: true,
    timeline: true,
    testSchedule: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Handlers
  const handleNameChange = (value: string) => {
    setFormSchedule((prev) => ({ ...prev, name: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormSchedule((prev) => ({ ...prev, description: value }));
  };

  const handleActiveToggle = (checked: boolean) => {
    setFormSchedule((prev) => ({ ...prev, isActive: checked }));
  };

  const handleBookingModeChange = (mode: 'fixed_time' | 'window') => {
    setFormSchedule((prev) => ({ ...prev, bookingMode: mode }));
  };

  const handleClientVisibilityChange = (visibility: 'all' | 'specific') => {
    setFormSchedule((prev) => ({ ...prev, clientVisibility: visibility }));
  };

  const handleClientIdsChange = (clientIds: string[]) => {
    setFormSchedule((prev) => ({ ...prev, clientIds }));
  };

  const handleSpeedChange = (
    field: 'defaultDeliverySpeedId' | 'defaultPickupSpeedId' | 'defaultLinehaulSpeedId',
    value: string
  ) => {
    setFormSchedule((prev) => ({ ...prev, [field]: value || undefined }));
  };

  const handleOriginTypeChange = (type: 'depot' | 'client_address') => {
    setFormSchedule((prev) => ({ ...prev, originType: type }));
  };

  const handleOriginDepotChange = (depotId: string) => {
    setFormSchedule((prev) => ({ ...prev, originDepotId: depotId || undefined }));
  };

  const handleFallbackDepotChange = (depotId: string) => {
    setFormSchedule((prev) => ({ ...prev, fallbackDepotId: depotId || undefined }));
  };

  const handleLegUpdate = (legId: string, config: LegConfig) => {
    setFormSchedule((prev) => ({
      ...prev,
      legs: prev.legs.map((leg) => (leg.id === legId ? { ...leg, config } : leg)),
    }));
  };

  const handleAddLeg = (afterLegId: string, type: LegType) => {
    // Generate new leg based on type
    const newLegId = `leg-${Date.now()}`;
    const afterLeg = formSchedule.legs.find((l) => l.id === afterLegId);
    const insertOrder = afterLeg ? afterLeg.order + 1 : formSchedule.legs.length;

    let newConfig: LegConfig;
    switch (type) {
      case 'collection':
        newConfig = {
          type: 'collection',
          speedId: formSchedule.defaultPickupSpeedId,
          pickupZoneIds: [],
          pickupMinutesBefore: 120,
          bookFromClientAddress: false,
          createPickupJob: true,
        };
        break;
      case 'depot':
        newConfig = {
          type: 'depot',
          depotId: sampleDepots[0].id,
          dropoffLocationId: undefined,
          storageState: undefined,
        };
        break;
      case 'linehaul':
        newConfig = {
          type: 'linehaul',
          runId: undefined,
          speedId: formSchedule.defaultLinehaulSpeedId,
          dayOffset: 1,
          activeDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
          transitMinutes: 600,
          insertToBulk: true,
          rateCardId: undefined,
        };
        break;
      case 'delivery':
        newConfig = {
          type: 'delivery',
          speedId: formSchedule.defaultDeliverySpeedId,
          deliveryZoneIds: [],
          deliveryState: undefined,
          rateCardId: undefined,
        };
        break;
    }

    const newLeg: ScheduleLeg = {
      id: newLegId,
      order: insertOrder,
      config: newConfig,
    };

    // Insert the new leg and reorder
    const updatedLegs = [...formSchedule.legs, newLeg]
      .sort((a, b) => a.order - b.order)
      .map((leg, index) => ({ ...leg, order: index }));

    setFormSchedule((prev) => ({ ...prev, legs: updatedLegs }));
    setSelectedLegId(newLegId);
  };

  const handleRemoveLeg = (legId: string) => {
    const updatedLegs = formSchedule.legs
      .filter((leg) => leg.id !== legId)
      .map((leg, index) => ({ ...leg, order: index }));

    setFormSchedule((prev) => ({ ...prev, legs: updatedLegs }));
    if (selectedLegId === legId) {
      setSelectedLegId(null);
    }
  };

  const handleOperatingScheduleChange = (operatingSchedule: Schedule['operatingSchedule']) => {
    setFormSchedule((prev) => ({ ...prev, operatingSchedule }));
  };

  const handleSave = () => {
    onSave(formSchedule);
  };

  const selectedLeg = formSchedule.legs.find((l) => l.id === selectedLegId) || null;

  return (
    <div className="space-y-4">
      {/* Network Map - Always visible at top (read-only overview of the delivery route) */}
      <div className="bg-gradient-to-r from-surface-cream to-white rounded-lg border-2 border-brand-cyan/20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary">Network Map</h3>
              <span className="text-xs text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded">
                {formSchedule.legs.length} legs
              </span>
            </div>
            {activeTab === 'config' && !formSchedule.isOverride && (
              <span className="text-xs text-text-muted">Click nodes to configure</span>
            )}
            {activeTab === 'clients' && (
              <span className="text-xs text-text-muted italic">Route cannot be changed per client</span>
            )}
          </div>
          <ChainBuilder
            schedule={formSchedule}
            selectedLegId={activeTab === 'config' ? selectedLegId : null}
            onSelectLeg={activeTab === 'config' ? setSelectedLegId : () => {}}
            onAddLeg={activeTab === 'config' ? handleAddLeg : undefined}
            onRemoveLeg={activeTab === 'config' ? handleRemoveLeg : undefined}
            readOnly={activeTab === 'clients' || formSchedule.isOverride}
            depots={sampleDepots}
            speeds={sampleSpeeds}
            zones={sampleZones}
          />
        </div>
      </div>

      {/* Tab Navigation - Right below Network Map */}
      {!formSchedule.isOverride && (
        <div className="flex border-b border-border bg-white rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => handleTabChange('config')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'config'
                ? 'text-brand-cyan border-b-2 border-brand-cyan bg-brand-cyan/5'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-cream'
            }`}
          >
            Schedule Config
          </button>
          <button
            onClick={() => handleTabChange('clients')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'clients'
                ? 'text-brand-purple border-b-2 border-brand-purple bg-brand-purple/5'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-cream'
            }`}
          >
            <Users className="w-4 h-4" />
            Client Overrides
            {clientOverrideCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-brand-purple/10 text-brand-purple">
                {clientOverrideCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'config' && (
        <>
          {/* Header Section - Name, Description, Active */}
          <div className="bg-white rounded-lg border border-border">
            <button
              onClick={() => toggleSection('header')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-cream transition-colors"
            >
              <h3 className="text-sm font-semibold text-text-primary">
                {isNew ? 'New Schedule' : 'Schedule Details'}
              </h3>
              {expandedSections.header ? (
                <ChevronUp className="w-5 h-5 text-text-muted" />
              ) : (
                <ChevronDown className="w-5 h-5 text-text-muted" />
              )}
            </button>
            {expandedSections.header && (
              <div className="p-4 pt-0 space-y-4">
                <Input
                  label="Schedule Name"
                  value={formSchedule.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Next Day Standard"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Description
                  </label>
                  <textarea
                    value={formSchedule.description || ''}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    placeholder="Optional description..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-text-primary
                             placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-cyan
                             focus:border-brand-cyan transition-colors resize-none"
                    rows={3}
                  />
                </div>
                <Toggle
                  label="Active"
                  checked={formSchedule.isActive}
                  onChange={handleActiveToggle}
                />
              </div>
            )}
          </div>
          {/* Overview Section */}
          <div className="bg-white rounded-lg border border-border">
            <button
              onClick={() => toggleSection('overview')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-cream transition-colors"
            >
              <h3 className="text-sm font-semibold text-text-primary">Overview</h3>
          {expandedSections.overview ? (
            <ChevronUp className="w-5 h-5 text-text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-muted" />
          )}
        </button>
        {expandedSections.overview && (
          <div className="p-4 pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Booking Mode
                </label>
                <div className="space-y-2">
                  {BOOKING_MODES.map((mode) => (
                    <label key={mode.value} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="bookingMode"
                        value={mode.value}
                        checked={formSchedule.bookingMode === mode.value}
                        onChange={() => handleBookingModeChange(mode.value)}
                        className="mt-1 border-border text-brand-cyan focus:ring-brand-cyan"
                      />
                      <div>
                        <div className="text-sm font-medium text-text-primary">{mode.label}</div>
                        <div className="text-xs text-text-muted">{mode.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Client Visibility
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="clientVisibility"
                      value="all"
                      checked={formSchedule.clientVisibility === 'all'}
                      onChange={() => handleClientVisibilityChange('all')}
                      className="border-border text-brand-cyan focus:ring-brand-cyan"
                    />
                    <span className="text-sm text-text-secondary">All Clients</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="clientVisibility"
                      value="specific"
                      checked={formSchedule.clientVisibility === 'specific'}
                      onChange={() => handleClientVisibilityChange('specific')}
                      className="border-border text-brand-cyan focus:ring-brand-cyan"
                    />
                    <span className="text-sm text-text-secondary">Specific Clients</span>
                  </label>
                </div>
                {formSchedule.clientVisibility === 'specific' && (
                  <div className="mt-3">
                    <Select
                      value=""
                      onChange={(e) => {
                        if (e.target.value && !formSchedule.clientIds.includes(e.target.value)) {
                          handleClientIdsChange([...formSchedule.clientIds, e.target.value]);
                        }
                      }}
                      options={[
                        { value: '', label: 'Select client...' },
                        ...sampleClients
                          .filter((c) => !formSchedule.clientIds.includes(c.id))
                          .map((c) => ({ value: c.id, label: c.name })),
                      ]}
                    />
                    {formSchedule.clientIds.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formSchedule.clientIds.map((clientId) => {
                          const client = sampleClients.find((c) => c.id === clientId);
                          return (
                            <span
                              key={clientId}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-brand-cyan/10 text-brand-cyan text-xs"
                            >
                              {client?.shortName || client?.name}
                              <button
                                onClick={() =>
                                  handleClientIdsChange(
                                    formSchedule.clientIds.filter((id) => id !== clientId)
                                  )
                                }
                                className="hover:text-brand-dark"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t-2 border-border pt-4">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Speed Defaults</h4>
              <div className="grid grid-cols-3 gap-4">
                <Select
                  label="Delivery Speed"
                  value={formSchedule.defaultDeliverySpeedId || ''}
                  onChange={(e) => handleSpeedChange('defaultDeliverySpeedId', e.target.value)}
                  options={[
                    { value: '', label: 'None' },
                    ...sampleSpeeds.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                />
                <Select
                  label="Pickup Speed"
                  value={formSchedule.defaultPickupSpeedId || ''}
                  onChange={(e) => handleSpeedChange('defaultPickupSpeedId', e.target.value)}
                  options={[
                    { value: '', label: 'None' },
                    ...sampleSpeeds.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                />
                <Select
                  label="Linehaul Speed"
                  value={formSchedule.defaultLinehaulSpeedId || ''}
                  onChange={(e) => handleSpeedChange('defaultLinehaulSpeedId', e.target.value)}
                  options={[
                    { value: '', label: 'None' },
                    ...sampleSpeeds.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Origin Section */}
      <div className="bg-white rounded-lg border border-border">
        <button
          onClick={() => toggleSection('origin')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-cream transition-colors"
        >
          <h3 className="text-sm font-semibold text-text-primary">Origin Configuration</h3>
          {expandedSections.origin ? (
            <ChevronUp className="w-5 h-5 text-text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-muted" />
          )}
        </button>
        {expandedSections.origin && (
          <div className="p-4 pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Origin Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="originType"
                      value="depot"
                      checked={formSchedule.originType === 'depot'}
                      onChange={() => handleOriginTypeChange('depot')}
                      className="border-border text-brand-cyan focus:ring-brand-cyan"
                    />
                    <span className="text-sm text-text-secondary">Depot</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="originType"
                      value="client_address"
                      checked={formSchedule.originType === 'client_address'}
                      onChange={() => handleOriginTypeChange('client_address')}
                      className="border-border text-brand-cyan focus:ring-brand-cyan"
                    />
                    <span className="text-sm text-text-secondary">Client Address</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                {formSchedule.originType === 'depot' && (
                  <Select
                    label="Origin Depot"
                    value={formSchedule.originDepotId || ''}
                    onChange={(e) => handleOriginDepotChange(e.target.value)}
                    options={[
                      { value: '', label: 'Select depot...' },
                      ...sampleDepots.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` })),
                    ]}
                  />
                )}
                {formSchedule.originType === 'client_address' && (
                  <Select
                    label="Fallback Depot (Optional)"
                    value={formSchedule.fallbackDepotId || ''}
                    onChange={(e) => handleFallbackDepotChange(e.target.value)}
                    options={[
                      { value: '', label: 'None' },
                      ...sampleDepots.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` })),
                    ]}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Operating Schedule Section */}
      <div className="bg-white rounded-lg border border-border">
        <button
          onClick={() => toggleSection('operating')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-cream transition-colors"
        >
          <h3 className="text-sm font-semibold text-text-primary">Operating Schedule</h3>
          {expandedSections.operating ? (
            <ChevronUp className="w-5 h-5 text-text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-muted" />
          )}
        </button>
        {expandedSections.operating && (
          <div className="p-4 pt-0">
            <OperatingScheduleSection
              schedule={formSchedule.operatingSchedule}
              onChange={handleOperatingScheduleChange}
            />
          </div>
        )}
      </div>

      {/* Timeline Preview Section */}
      <div className="bg-white rounded-lg border border-border">
        <button
          onClick={() => toggleSection('timeline')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-cream transition-colors"
        >
          <h3 className="text-sm font-semibold text-text-primary">Timeline Preview</h3>
          {expandedSections.timeline ? (
            <ChevronUp className="w-5 h-5 text-text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-muted" />
          )}
        </button>
        {expandedSections.timeline && (
          <div className="p-4 pt-0">
            <TimelinePreview
              schedule={formSchedule}
              deliveryDay={previewDay}
              onDeliveryDayChange={setPreviewDay}
            />
          </div>
        )}
      </div>

      {/* Test Schedule Section */}
      <div className="bg-white rounded-lg border border-border">
        <button
          onClick={() => toggleSection('testSchedule')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-cream transition-colors"
        >
          <h3 className="text-sm font-semibold text-text-primary">Test Schedule</h3>
          {expandedSections.testSchedule ? (
            <ChevronUp className="w-5 h-5 text-text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-muted" />
          )}
        </button>
        {expandedSections.testSchedule && (
          <div className="p-4 pt-0">
            <BookingSimulator schedule={formSchedule} />
          </div>
        )}
      </div>
        </>
      )}

      {/* Client Overrides Tab */}
      {activeTab === 'clients' && !formSchedule.isOverride && (
        <div className="bg-white rounded-lg border border-border min-h-[400px]">
          <ClientOverridesTab
            baseSchedule={formSchedule}
            allSchedules={allSchedules}
            onSaveOverride={onSave}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 p-4 bg-surface-cream rounded-lg border border-border">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {isNew ? 'Create Schedule' : 'Save Changes'}
        </Button>
      </div>

      {/* Leg Config Panel (Side Panel) */}
      {selectedLeg && (
        <LegConfigPanel leg={selectedLeg} onUpdate={handleLegUpdate} onClose={() => setSelectedLegId(null)} />
      )}
    </div>
  );
}
