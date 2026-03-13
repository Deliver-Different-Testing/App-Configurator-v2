import React from 'react';
import { Download, Upload } from 'lucide-react';
import type { WizardStep } from '../types';

export interface NewSetupViewProps {
  steps: WizardStep[];
  completedSteps: string[];
  onUpload: (schemaId: string) => void;
  onDownloadTemplate: (schemaId: string) => void;
  onDownloadAllTemplates: () => void;
  onDone: () => void;
}

export function NewSetupView({
  steps,
  completedSteps,
  onUpload,
  onDownloadTemplate,
  onDownloadAllTemplates,
  onDone,
}: NewSetupViewProps): React.ReactElement {
  // Determine status for each step
  const getStepStatus = (stepId: string): 'complete' | 'pending' => {
    return completedSteps.includes(stepId) ? 'complete' : 'pending';
  };

  // Render status indicator
  const renderStatusIndicator = (status: 'complete' | 'pending') => {
    if (status === 'complete') {
      return (
        <div className="flex items-center gap-2 text-success">
          <span className="text-lg">●</span>
          <span className="text-sm font-medium">Complete</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-text-muted">
        <span className="text-lg">○</span>
        <span className="text-sm font-medium">Pending</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">New Setup - Import your data</h2>
        <p className="text-sm text-text-secondary mt-1">
          Download templates for each module and upload your data to get started
        </p>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-light border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-text-primary w-16">#</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-text-primary">Module</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-text-primary w-40">Status</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                return (
                  <tr
                    key={step.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface-cream transition-colors"
                  >
                    {/* Order number */}
                    <td className="px-4 py-4 text-sm text-text-secondary">
                      {index + 1}
                    </td>

                    {/* Module name */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-primary">
                          {step.label}
                        </span>
                        {step.description && (
                          <span className="text-xs text-text-secondary mt-1">
                            {step.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {renderStatusIndicator(status)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onDownloadTemplate(step.schemaId)}
                          className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline transition-all"
                        >
                          <Download className="w-4 h-4" />
                          Download Template
                        </button>
                        <button
                          onClick={() => onUpload(step.schemaId)}
                          className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          Upload
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
        <button
          onClick={onDownloadAllTemplates}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-cyan hover:bg-surface-light rounded-lg transition-all"
        >
          <Download className="w-4 h-4" />
          Download All Templates
        </button>
        <button
          onClick={onDone}
          className="px-6 py-2 text-sm font-medium text-white bg-brand-cyan hover:bg-opacity-90 rounded-lg transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
}
