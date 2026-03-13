// Automations Module Exports

export { AutomationsPage } from './AutomationsPage';
export { AutomationCard } from './components/AutomationCard';
export { AutomationEditForm } from './components/AutomationEditForm';
export { ConditionRow } from './components/ConditionRow';
export { ActionRow } from './components/ActionRow';
export { ScopeSelector } from './components/ScopeSelector';

// Re-export types
export * from './types';

// Re-export sample data for testing
export {
  sampleAutomations,
  sampleCustomers,
  sampleSpeeds,
  sampleJobStatuses,
  sampleTaskTemplates,
  sampleNotificationTemplates,
} from './data/sampleData';
