import React from 'react';
import { Rocket, Wrench } from 'lucide-react';

interface WizardModeSelectorProps {
  onSelect: (mode: 'newSetup' | 'maintainImprove') => void;
}

export function WizardModeSelector({ onSelect }: WizardModeSelectorProps): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <button
        onClick={() => onSelect('newSetup')}
        className="p-6 rounded-lg border-2 border-gray-200 hover:border-brand-cyan transition-colors text-left"
      >
        <Rocket className="w-8 h-8 text-brand-cyan mb-3" />
        <h3 className="font-semibold text-lg mb-1">New Setup</h3>
        <p className="text-sm text-text-secondary">
          Set up your system from scratch with guided steps
        </p>
      </button>

      <button
        onClick={() => onSelect('maintainImprove')}
        className="p-6 rounded-lg border-2 border-gray-200 hover:border-brand-cyan transition-colors text-left"
      >
        <Wrench className="w-8 h-8 text-brand-cyan mb-3" />
        <h3 className="font-semibold text-lg mb-1">Upload, Download or Update</h3>
        <p className="text-sm text-text-secondary">
          Download existing data, download templates, or upload new records
        </p>
      </button>
    </div>
  );
}
