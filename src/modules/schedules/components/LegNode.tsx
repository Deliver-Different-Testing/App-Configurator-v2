// src/modules/schedules/components/LegNode.tsx
import { Package, Building2, Truck, MapPin, X } from 'lucide-react';
import type { LegType, ScheduleLeg, DepotReference, SpeedReference, ZoneReference } from '../types';

interface LegNodeProps {
  leg: ScheduleLeg;
  isSelected: boolean;
  isFirstLeg: boolean;
  isLastLeg: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
  depots: DepotReference[];
  speeds: SpeedReference[];
  zones: ZoneReference[];
}

const LEG_TYPE_STYLES: Record<LegType, { bg: string; border: string; icon: typeof Package; iconColor: string }> = {
  collection: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    icon: Package,
    iconColor: 'text-blue-600',
  },
  depot: {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    icon: Building2,
    iconColor: 'text-gray-600',
  },
  linehaul: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    icon: Truck,
    iconColor: 'text-orange-600',
  },
  delivery: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    icon: MapPin,
    iconColor: 'text-green-600',
  },
};

export function LegNode({
  leg,
  isSelected,
  isLastLeg,
  onClick,
  onDelete,
  readOnly = false,
  depots,
  speeds,
  zones,
}: LegNodeProps) {
  const { config } = leg;
  const styles = LEG_TYPE_STYLES[config.type];
  const Icon = styles.icon;

  // Get display info based on leg type
  const getDisplayInfo = () => {
    switch (config.type) {
      case 'collection': {
        const zoneNames = config.pickupZoneIds
          .map(zid => zones.find(z => z.id === zid)?.name || zid)
          .join(', ');
        const speedName = config.speedId
          ? speeds.find(s => s.id === config.speedId)?.name
          : 'No speed';
        return {
          title: 'Collection',
          subtitle: zoneNames || 'No zones',
          detail: speedName,
        };
      }
      case 'depot': {
        const depot = depots.find(d => d.id === config.depotId);
        return {
          title: depot?.code || depot?.name || 'Unknown Depot',
          subtitle: 'Depot Stop',
          detail: config.storageState || 'ambient',
        };
      }
      case 'linehaul': {
        const speedName = config.speedId
          ? speeds.find(s => s.id === config.speedId)?.name
          : 'No speed';
        return {
          title: 'Linehaul',
          subtitle: speedName,
          detail: `${config.transitMinutes} min`,
        };
      }
      case 'delivery': {
        const zoneNames = config.deliveryZoneIds
          .map(zid => zones.find(z => z.id === zid)?.name || zid)
          .join(', ');
        const speedName = config.speedId
          ? speeds.find(s => s.id === config.speedId)?.name
          : 'No speed';
        return {
          title: 'Delivery',
          subtitle: zoneNames || 'No zones',
          detail: speedName,
        };
      }
    }
  };

  const info = getDisplayInfo();

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`
          relative flex flex-col items-center p-3 min-w-[120px] rounded-lg border-2 transition-all
          ${styles.bg} ${styles.border}
          ${isSelected ? 'ring-2 ring-brand-cyan shadow-lg scale-105' : 'hover:shadow-md hover:scale-102'}
          ${readOnly ? 'cursor-default' : 'cursor-pointer'}
        `}
      >
        {/* Icon */}
        <div className={`mb-2 ${styles.iconColor}`}>
          <Icon size={24} />
        </div>

        {/* Title */}
        <div className="text-sm font-semibold text-text-primary text-center mb-1">
          {info.title}
        </div>

        {/* Subtitle */}
        <div className="text-xs text-text-secondary text-center mb-1 line-clamp-2">
          {info.subtitle}
        </div>

        {/* Detail */}
        <div className="text-xs text-text-muted text-center">
          {info.detail}
        </div>

        {/* Delete button (not for delivery leg) */}
        {!readOnly && !isLastLeg && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full
                     opacity-0 group-hover:opacity-100 transition-opacity
                     flex items-center justify-center hover:bg-red-600"
            title="Remove leg"
          >
            <X size={14} />
          </button>
        )}
      </button>
    </div>
  );
}
