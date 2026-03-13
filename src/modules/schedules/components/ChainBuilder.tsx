// src/modules/schedules/components/ChainBuilder.tsx
import { Plus, ArrowRight } from 'lucide-react';
import type { Schedule, LegType, DepotReference, SpeedReference, ZoneReference } from '../types';
import { LegNode } from './LegNode';

interface ChainBuilderProps {
  schedule: Schedule;
  selectedLegId: string | null;
  onSelectLeg: (legId: string) => void;
  onAddLeg?: (afterLegId: string, type: LegType) => void;
  onRemoveLeg?: (legId: string) => void;
  readOnly?: boolean;
  depots: DepotReference[];
  speeds: SpeedReference[];
  zones: ZoneReference[];
}

export function ChainBuilder({
  schedule,
  selectedLegId,
  onSelectLeg,
  onAddLeg,
  onRemoveLeg,
  readOnly = false,
  depots,
  speeds,
  zones,
}: ChainBuilderProps) {
  // Origin node (not a leg, just visual representation)
  const originNode = (
    <div className="flex flex-col items-center p-3 min-w-[120px] rounded-lg border-2 border-brand-dark bg-surface-cream">
      <div className="text-sm font-semibold text-text-primary text-center mb-1">
        Origin
      </div>
      <div className="text-xs text-text-secondary text-center">
        {schedule.originType === 'client_address' ? (
          'Client Address'
        ) : schedule.originDepotId ? (
          depots.find(d => d.id === schedule.originDepotId)?.code ||
          depots.find(d => d.id === schedule.originDepotId)?.name ||
          'Depot'
        ) : (
          'No origin'
        )}
      </div>
    </div>
  );

  const sortedLegs = [...schedule.legs].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-lg border border-border p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Delivery Route</h3>
        <p className="text-xs text-text-secondary">
          {readOnly ? 'Visual overview of the delivery journey' : 'Click a node to configure it. Add legs with the + button between nodes.'}
        </p>
      </div>

      {/* Chain visualization */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {/* Origin */}
        {originNode}

        {/* Arrow after origin */}
        {sortedLegs.length > 0 && (
          <div className="flex-shrink-0 text-text-muted">
            <ArrowRight size={20} />
          </div>
        )}

        {/* Legs */}
        {sortedLegs.map((leg, index) => {
          const isFirstLeg = index === 0;
          const isLastLeg = index === sortedLegs.length - 1;
          const isSelected = leg.id === selectedLegId;

          return (
            <div key={leg.id} className="flex items-center gap-2">
              {/* Add button (before this leg, except for first) */}
              {!readOnly && !isFirstLeg && onAddLeg && (
                <button
                  onClick={() => {
                    const prevLeg = sortedLegs[index - 1];
                    if (prevLeg) {
                      // Show leg type selector (simplified - just add depot for now)
                      onAddLeg(prevLeg.id, 'depot');
                    }
                  }}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-cream border-2 border-dashed border-border
                           hover:bg-brand-cyan hover:border-brand-cyan hover:text-white
                           flex items-center justify-center transition-colors group"
                  title="Add leg before"
                >
                  <Plus size={16} className="group-hover:text-white" />
                </button>
              )}

              {/* Leg node */}
              <LegNode
                leg={leg}
                isSelected={isSelected}
                isFirstLeg={isFirstLeg}
                isLastLeg={isLastLeg}
                onClick={!readOnly ? () => onSelectLeg(leg.id) : undefined}
                onDelete={
                  !readOnly && !isLastLeg && onRemoveLeg
                    ? () => onRemoveLeg(leg.id)
                    : undefined
                }
                readOnly={readOnly}
                depots={depots}
                speeds={speeds}
                zones={zones}
              />

              {/* Arrow after leg (except last) */}
              {!isLastLeg && (
                <div className="flex-shrink-0 text-text-muted">
                  <ArrowRight size={20} />
                </div>
              )}

              {/* Add button after last leg */}
              {!readOnly && isLastLeg && onAddLeg && leg.config.type !== 'delivery' && (
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 text-text-muted">
                    <ArrowRight size={20} />
                  </div>
                  <button
                    onClick={() => {
                      // Add depot or linehaul before final delivery
                      onAddLeg(leg.id, 'depot');
                    }}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-cream border-2 border-dashed border-border
                             hover:bg-brand-cyan hover:border-brand-cyan hover:text-white
                             flex items-center justify-center transition-colors group"
                    title="Add leg after"
                  >
                    <Plus size={16} className="group-hover:text-white" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {sortedLegs.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          <p className="text-sm mb-2">No legs configured</p>
          {!readOnly && onAddLeg && (
            <button
              onClick={() => onAddLeg('', 'delivery')}
              className="text-sm text-brand-cyan hover:underline"
            >
              + Add delivery leg
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-50 border border-blue-300"></div>
            <span className="text-text-secondary">Collection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-50 border border-gray-300"></div>
            <span className="text-text-secondary">Depot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-50 border border-orange-300"></div>
            <span className="text-text-secondary">Linehaul</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-50 border border-green-300"></div>
            <span className="text-text-secondary">Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
}
