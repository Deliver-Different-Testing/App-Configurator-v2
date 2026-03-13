// src/modules/schedules/components/ScheduleTableView.tsx
import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { ScheduleTable } from './ScheduleTable';
import { ScheduleEditForm } from './ScheduleEditForm';
import { OverrideEditor } from './OverrideEditor';
import { ClientOverrideEditor } from './ClientOverrideEditor';
import type { Schedule } from '../types';
import type { SourceItem, EntityConnections } from '../../territory/types';
import { sampleSchedules, sampleClients } from '../data/sampleData';

interface ScheduleTableViewProps {
  onConnectionsClick: (sourceItem: SourceItem, connections: EntityConnections) => void;
  searchQuery?: string;
  tagSearch?: string;
}

// Removed 'view' mode - clicking a schedule now opens edit directly
type PanelMode = 'edit' | 'override';

export function ScheduleTableView({
  onConnectionsClick,
  searchQuery = '',
  tagSearch = '',
}: ScheduleTableViewProps) {
  const [schedules, setSchedules] = useState<Schedule[]>(sampleSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Panel mode: edit (default), override (for client overrides)
  const [panelMode, setPanelMode] = useState<PanelMode>('edit');
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Client override editing
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // Clicking a schedule opens it directly in edit mode (no intermediate view)
  const handleSelectSchedule = useCallback((schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setEditingSchedule({ ...schedule });
    setPanelMode(schedule.isOverride ? 'override' : 'edit');
    setEditingClientId(null);
  }, []);

  const handleCopyToClient = useCallback((targetClientId: string, sourceSchedule: Schedule) => {
    const targetClient = sampleClients.find((c) => c.id === targetClientId);
    const baseSchedule = schedules.find((s) => s.id === sourceSchedule.baseScheduleId);

    if (!baseSchedule) return;

    const copiedOverride: Schedule = {
      ...sourceSchedule,
      id: `override-${Date.now()}`,
      name: `${baseSchedule.name} (${targetClient?.shortName || targetClient?.name || targetClientId})`,
      clientIds: [targetClientId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingSchedule(copiedOverride);
    setEditingClientId(targetClientId);
    setPanelMode('override');
  }, [schedules]);

  const handleSaveSchedule = useCallback((updatedSchedule: Schedule) => {
    setSchedules((prev) => {
      const exists = prev.some((s) => s.id === updatedSchedule.id);
      if (exists) {
        return prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s));
      } else {
        return [...prev, updatedSchedule];
      }
    });
    // Stay in edit mode after saving, update the editing state with saved data
    setSelectedSchedule(updatedSchedule);
    setEditingSchedule({ ...updatedSchedule });
    setEditingClientId(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedSchedule(null);
    setEditingSchedule(null);
    setEditingClientId(null);
  }, []);

  // Handle connections badge click - opens TagSidebar with client connections
  const handleScheduleConnectionsClick = useCallback((schedule: Schedule) => {
    const sourceItem: SourceItem = {
      type: 'schedule',
      id: schedule.id,
      name: schedule.name,
      subtitle: schedule.clientVisibility === 'all' ? 'All Clients' : `${schedule.clientIds.length} clients`,
    };

    // Build connections showing client associations
    const clientCount = schedule.clientVisibility === 'all'
      ? sampleClients.length
      : schedule.clientIds.length;

    const connections: EntityConnections = {
      customers: {
        hasConnections: schedule.clientVisibility === 'specific',
        count: clientCount,
        connectionPath: '/clients',
      },
      zoneGroups: { hasConnections: false, count: 0 },
      depots: { hasConnections: !!schedule.originDepotId, count: schedule.originDepotId ? 1 : 0 },
      rateCards: { hasConnections: false, count: 0 },
      services: { hasConnections: false, count: 0 },
      vehicles: { hasConnections: false, count: 0 },
      notifications: { hasConnections: false, count: 0 },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: schedule.legs.some(l => l.config.type === 'linehaul'), count: schedule.legs.filter(l => l.config.type === 'linehaul').length },
      regions: { hasConnections: false, count: 0 },
    };

    onConnectionsClick(sourceItem, connections);
  }, [onConnectionsClick]);

  // Find base schedule for override editing
  const baseScheduleForOverride = editingSchedule?.isOverride
    ? schedules.find((s) => s.id === editingSchedule.baseScheduleId) || null
    : null;

  const isModalOpen = editingSchedule !== null;

  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px] relative">
      {/* Table - always visible */}
      <ScheduleTable
        schedules={schedules}
        selectedId={selectedSchedule?.id || null}
        onSelectSchedule={handleSelectSchedule}
        externalSearchQuery={searchQuery}
        externalTagSearch={tagSearch}
        onConnectionsClick={handleScheduleConnectionsClick}
      />

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-2xl w-[90vw] max-w-6xl h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-light">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-text-primary">
                  {panelMode === 'edit'
                    ? (schedules.some((s) => s.id === editingSchedule.id) ? 'Edit Schedule' : 'New Schedule')
                    : (schedules.some((s) => s.id === editingSchedule.id) ? 'Edit Override' : 'New Override')
                  }
                </h2>
                <span className="text-sm text-text-muted px-2 py-0.5 bg-surface-cream rounded">
                  {editingSchedule.name}
                </span>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-cream rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {panelMode === 'edit' && (
                <ScheduleEditForm
                  schedule={editingSchedule}
                  allSchedules={schedules}
                  onSave={handleSaveSchedule}
                  onCancel={handleCloseModal}
                  isNew={!schedules.some((s) => s.id === editingSchedule.id)}
                />
              )}

              {panelMode === 'override' && baseScheduleForOverride && (
                <>
                  {editingClientId ? (
                    <ClientOverrideEditor
                      schedule={editingSchedule}
                      baseSchedule={baseScheduleForOverride}
                      client={sampleClients.find((c) => c.id === editingClientId) || { id: editingClientId, name: editingClientId }}
                      allClients={sampleClients}
                      allSchedules={schedules}
                      onSave={handleSaveSchedule}
                      onCancel={handleCloseModal}
                      onCopyToClient={handleCopyToClient}
                    />
                  ) : (
                    <OverrideEditor
                      schedule={editingSchedule}
                      baseSchedule={baseScheduleForOverride}
                      onSave={handleSaveSchedule}
                      onCancel={handleCloseModal}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
