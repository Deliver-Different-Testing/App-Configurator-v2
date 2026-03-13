// src/modules/schedules/components/ClientOverrideEditor.tsx
import { useState } from 'react';
import { Copy, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { OverrideEditor } from './OverrideEditor';
import { ClientSearch } from './ClientSearch';
import type { Schedule, ClientReference } from '../types';

interface ClientOverrideEditorProps {
  /** The override schedule being edited (or new override with base values) */
  schedule: Schedule;
  /** The base schedule this overrides */
  baseSchedule: Schedule;
  /** The client this override is for */
  client: ClientReference;
  /** All clients for copy-to feature */
  allClients: ClientReference[];
  /** All schedules to check for existing overrides */
  allSchedules: Schedule[];
  onSave: (schedule: Schedule) => void;
  onCancel: () => void;
  /** Called when user wants to copy this override to another client */
  onCopyToClient: (targetClientId: string, sourceSchedule: Schedule) => void;
}

export function ClientOverrideEditor({
  schedule,
  baseSchedule,
  client,
  allClients,
  allSchedules,
  onSave,
  onCancel,
  onCopyToClient,
}: ClientOverrideEditorProps) {
  const [showCopyPicker, setShowCopyPicker] = useState(false);
  const [copyTargetClientId, setCopyTargetClientId] = useState<string | null>(null);

  const isNewOverride = !allSchedules.some((s) => s.id === schedule.id);

  // Filter out current client from copy targets
  const copyTargetClients = allClients.filter((c) => c.id !== client.id);

  const handleCopyConfirm = () => {
    if (copyTargetClientId) {
      onCopyToClient(copyTargetClientId, schedule);
      setShowCopyPicker(false);
      setCopyTargetClientId(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Client Override Banner - Purple themed (brand-purple from design system) */}
      <div className="border-l-4 border-brand-purple bg-brand-purple/5 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-brand-purple flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-brand-dark">
              {isNewOverride ? 'Creating Override for:' : 'Editing Override for:'}
            </h3>
            <p className="text-lg font-bold text-brand-purple">{client.name}</p>
            <p className="text-xs text-text-muted mt-1">
              Changes here only affect this client, not the default schedule.
            </p>
          </div>
        </div>
      </div>

      {/* Override Editor */}
      <div className="flex-1 overflow-y-auto">
        <OverrideEditor
          schedule={schedule}
          baseSchedule={baseSchedule}
          onSave={onSave}
          onCancel={onCancel}
        />
      </div>

      {/* Copy to Another Client section */}
      {!isNewOverride && (
        <div className="border-t border-border p-4 bg-surface-light">
          {!showCopyPicker ? (
            <Button
              variant="secondary"
              onClick={() => setShowCopyPicker(true)}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Override to Another Client
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-medium text-text-primary">
                Select client to copy this override to:
              </div>
              <ClientSearch
                clients={copyTargetClients}
                schedules={allSchedules}
                baseScheduleId={baseSchedule.id}
                selectedClientId={copyTargetClientId}
                onSelectClient={setCopyTargetClientId}
              />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCopyPicker(false);
                    setCopyTargetClientId(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCopyConfirm}
                  disabled={!copyTargetClientId}
                  className="flex-1"
                >
                  Copy & Edit
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
