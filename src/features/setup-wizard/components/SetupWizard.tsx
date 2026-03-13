import React, { useState, useMemo } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { WizardModeSelector } from './WizardModeSelector';
import { NewSetupView } from './NewSetupView';
import { DataManagementView } from './DataManagementView';
import { ImportWizardModal } from '../../import-export/components';
import { getSchema } from '../../import-export/schemas';
import { generateTemplate, generateCSV, downloadCSV } from '../../import-export/engine/CSVGenerator';
import wizardConfig from '../config/wizard-config.json';
import type { WizardState, WizardStep } from '../types';

export interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  existingData?: Record<string, Record<string, unknown>[]>;  // { clients: [...], depots: [...] }
  onComplete?: () => void;
}

export function SetupWizard({
  isOpen,
  onClose,
  existingData = {},
  onComplete,
}: SetupWizardProps): React.ReactElement {
  // State
  const [state, setState] = useState<WizardState>({
    mode: null,
    currentStepIndex: 0,
    completedSteps: [],
    skippedSteps: [],
  });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [currentSchemaId, setCurrentSchemaId] = useState<string | null>(null);

  // Get steps for current mode
  const steps = useMemo(() => {
    if (state.mode === 'newSetup') {
      return (wizardConfig.modes.newSetup.steps || []) as WizardStep[];
    }
    return [];
  }, [state.mode]);

  // Handlers
  const handleModeSelect = (mode: 'newSetup' | 'maintainImprove') => {
    setState(prev => ({ ...prev, mode, currentStepIndex: 0 }));
  };

  const handleUpload = (schemaId: string) => {
    setCurrentSchemaId(schemaId);
    setImportModalOpen(true);
  };

  const handleDownloadTemplate = (schemaId: string) => {
    const schema = getSchema(schemaId);
    if (schema) {
      const template = generateTemplate(schema, { includeHintRow: true });
      downloadCSV(template, `${schemaId}-template.csv`);
    }
  };

  const handleDownloadAllTemplates = () => {
    steps.forEach(step => {
      handleDownloadTemplate(step.schemaId);
    });
  };

  const handleDownloadData = (schemaId: string) => {
    const schema = getSchema(schemaId);
    const data = existingData[schemaId] || [];
    if (schema && data.length > 0) {
      const csv = generateCSV(data, schema);
      downloadCSV(csv, `${schemaId}-data.csv`);
    }
  };

  const handleImportComplete = () => {
    setImportModalOpen(false);
    // Find the step that matches the current schema and mark it complete
    const step = steps.find(s => s.schemaId === currentSchemaId);
    if (step) {
      setState(prev => ({
        ...prev,
        completedSteps: [...prev.completedSteps, step.id],
      }));
    }
  };

  const handleBack = () => {
    setState(prev => ({ ...prev, mode: null }));
  };

  const handleFinish = () => {
    onComplete?.();
    onClose();
  };

  // Render mode selector if no mode chosen
  if (!state.mode) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Setup Wizard" size="md">
        <WizardModeSelector onSelect={handleModeSelect} />
      </Modal>
    );
  }

  // Render "Upload, Download or Update" mode (formerly Maintain & Improve)
  if (state.mode === 'maintainImprove') {
    return (
      <>
        <Modal
          isOpen={isOpen && !importModalOpen}
          onClose={onClose}
          title="Upload, Download or Update"
          size="xl"
          footer={
            <div className="flex justify-between w-full">
              <Button variant="secondary" onClick={handleBack}>
                Back
              </Button>
            </div>
          }
        >
          <DataManagementView
            existingData={existingData}
            onUpload={handleUpload}
            onDownloadData={handleDownloadData}
            onDownloadTemplate={handleDownloadTemplate}
            onDone={handleFinish}
          />
        </Modal>

        {/* Import Modal */}
        {currentSchemaId && (
          <ImportWizardModal
            isOpen={importModalOpen}
            onClose={() => setImportModalOpen(false)}
            schema={getSchema(currentSchemaId)!}
            existingData={existingData[currentSchemaId] || []}
            onComplete={handleImportComplete}
          />
        )}
      </>
    );
  }

  // Render new setup mode - table view showing ALL steps at once
  return (
    <>
      <Modal
        isOpen={isOpen && !importModalOpen}
        onClose={onClose}
        title="New Setup"
        size="xl"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
          </div>
        }
      >
        <NewSetupView
          steps={steps}
          completedSteps={state.completedSteps}
          onUpload={handleUpload}
          onDownloadTemplate={handleDownloadTemplate}
          onDownloadAllTemplates={handleDownloadAllTemplates}
          onDone={handleFinish}
        />
      </Modal>

      {/* Import Modal */}
      {currentSchemaId && (
        <ImportWizardModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          schema={getSchema(currentSchemaId)!}
          existingData={existingData[currentSchemaId] || []}
          onComplete={handleImportComplete}
        />
      )}
    </>
  );
}
