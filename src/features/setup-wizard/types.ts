export interface WizardStep {
  id: string;
  label: string;
  schemaId: string;
  order: number;
  required?: boolean;
  description?: string;
}

export interface WizardMode {
  label: string;
  description: string;
  steps?: WizardStep[];
  scans?: string[];
}

export interface WizardConfig {
  version: string;
  modes: {
    newSetup: WizardMode;
    maintainImprove: WizardMode;
  };
}

export interface WizardState {
  mode: 'newSetup' | 'maintainImprove' | null;
  currentStepIndex: number;
  completedSteps: string[];
  skippedSteps: string[];
}

export interface MissingLink {
  tableName: string;
  field: string;
  count: number;
  description: string;
}
