// src/modules/schedules/components/ZoneSelector.tsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { sampleZones } from '../data/sampleData';
import type { ZoneReference } from '../types';

interface ZoneSelectorProps {
  selectedZoneIds: string[];
  onChange: (zoneIds: string[]) => void;
  label: string;
  helpText?: string;
  zones?: ZoneReference[]; // Optional custom zones, defaults to sampleZones
}

export function ZoneSelector({
  selectedZoneIds,
  onChange,
  label,
  helpText,
  zones = sampleZones,
}: ZoneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredZones = zones.filter((zone) =>
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedZones = zones.filter((zone) => selectedZoneIds.includes(zone.id));

  const handleToggleZone = (zoneId: string) => {
    if (selectedZoneIds.includes(zoneId)) {
      onChange(selectedZoneIds.filter((id) => id !== zoneId));
    } else {
      onChange([...selectedZoneIds, zoneId]);
    }
  };

  const handleSelectAll = () => {
    onChange(zones.map((z) => z.id));
  };

  const handleClear = () => {
    onChange([]);
  };

  const handleRemoveZone = (zoneId: string) => {
    onChange(selectedZoneIds.filter((id) => id !== zoneId));
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-text-primary">
        {label}
      </label>

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-text-muted">{helpText}</p>
      )}

      {/* Selected Zones (Tags) */}
      {selectedZones.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-surface-cream rounded-lg border border-border">
          {selectedZones.map((zone) => (
            <Badge
              key={zone.id}
              variant="blue"
              size="sm"
              className="flex items-center gap-1 pr-1"
            >
              <span>{zone.name}</span>
              {zone.postcodeCount && (
                <span className="text-xs opacity-70">({zone.postcodeCount})</span>
              )}
              <button
                onClick={() => handleRemoveZone(zone.id)}
                className="ml-1 hover:bg-white/20 rounded p-0.5 transition-colors"
                aria-label={`Remove ${zone.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Dropdown Trigger */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-white border border-border
                   rounded-lg text-sm text-text-primary hover:border-brand-cyan transition-colors"
        >
          <span className="text-text-secondary">
            {selectedZones.length === 0
              ? 'Select zones...'
              : `${selectedZones.length} zone${selectedZones.length === 1 ? '' : 's'} selected`}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-text-muted transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-border rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-border">
              <input
                type="text"
                placeholder="Search zones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan"
                autoFocus
              />
            </div>

            {/* Select All / Clear Buttons */}
            <div className="p-2 border-b border-border flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSelectAll} className="flex-1">
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear} className="flex-1">
                Clear
              </Button>
            </div>

            {/* Zone List */}
            <div className="overflow-y-auto max-h-60">
              {filteredZones.length === 0 ? (
                <div className="p-4 text-center text-sm text-text-muted">
                  No zones found
                </div>
              ) : (
                <div className="p-1">
                  {filteredZones.map((zone) => {
                    const isSelected = selectedZoneIds.includes(zone.id);
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => handleToggleZone(zone.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded
                                  hover:bg-surface-cream transition-colors ${
                                    isSelected ? 'bg-brand-cyan/10' : ''
                                  }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 border rounded flex items-center justify-center ${
                              isSelected
                                ? 'bg-brand-cyan border-brand-cyan'
                                : 'border-border'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-text-primary">{zone.name}</span>
                          {zone.code && (
                            <span className="text-xs text-text-muted">({zone.code})</span>
                          )}
                        </div>
                        {zone.postcodeCount && (
                          <span className="text-xs text-text-muted">
                            {zone.postcodeCount} postcodes
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
