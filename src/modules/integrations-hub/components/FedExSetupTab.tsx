import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { CARRIER_LABELS } from '../types';
import type { CarrierType } from '../types';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

interface FedExSetupTabProps {
  carrier: CarrierType;
}

const setupStepsByCarrier: Record<CarrierType, SetupStep[]> = {
  fedex: [
    { id: '1', title: 'Create FedEx Developer Account', description: 'Register for a FedEx Developer Portal account to get API access', status: 'completed' },
    { id: '2', title: 'Configure OAuth Credentials', description: 'Set up Client ID and Client Secret for API authentication', status: 'completed' },
    { id: '3', title: 'Add Shipping Account', description: 'Link your FedEx shipping account number', status: 'in_progress' },
    { id: '4', title: 'Test Connection', description: 'Verify API connectivity with a test request', status: 'pending' },
    { id: '5', title: 'Enable Production Mode', description: 'Switch from sandbox to production environment', status: 'pending' },
  ],
  ups: [
    { id: '1', title: 'Create UPS Developer Account', description: 'Register at developer.ups.com for API access', status: 'completed' },
    { id: '2', title: 'Generate API Key', description: 'Create an API key in the UPS Developer Portal', status: 'in_progress' },
    { id: '3', title: 'Add UPS Account Number', description: 'Link your UPS shipper account number', status: 'pending' },
    { id: '4', title: 'Test Connection', description: 'Verify API connectivity with a test request', status: 'pending' },
  ],
  usps: [
    { id: '1', title: 'Register for USPS Web Tools', description: 'Sign up at usps.com/webtools for API access', status: 'pending' },
    { id: '2', title: 'Obtain User ID', description: 'Get your USPS Web Tools User ID', status: 'pending' },
    { id: '3', title: 'Configure Endpoints', description: 'Set up shipping and tracking endpoints', status: 'pending' },
    { id: '4', title: 'Test Connection', description: 'Verify API connectivity', status: 'pending' },
  ],
  dhl: [
    { id: '1', title: 'Create DHL Developer Account', description: 'Register at developer.dhl.com for API access', status: 'pending' },
    { id: '2', title: 'Generate API Key', description: 'Create credentials in the DHL Developer Portal', status: 'pending' },
    { id: '3', title: 'Add DHL Account Number', description: 'Link your DHL Express account', status: 'pending' },
    { id: '4', title: 'Configure Services', description: 'Select which DHL services to enable', status: 'pending' },
    { id: '5', title: 'Test Connection', description: 'Verify API connectivity with a test shipment', status: 'pending' },
  ],
};

const carrierColors: Record<CarrierType, { bg: string; text: string; border: string }> = {
  fedex: { bg: 'from-purple-50 to-purple-100', text: 'text-purple-900', border: 'border-purple-200' },
  ups: { bg: 'from-amber-50 to-amber-100', text: 'text-amber-900', border: 'border-amber-200' },
  usps: { bg: 'from-blue-50 to-blue-100', text: 'text-blue-900', border: 'border-blue-200' },
  dhl: { bg: 'from-red-50 to-red-100', text: 'text-red-900', border: 'border-red-200' },
};

const carrierLogoBg: Record<CarrierType, string> = {
  fedex: 'bg-purple-600',
  ups: 'bg-amber-600',
  usps: 'bg-blue-600',
  dhl: 'bg-red-600',
};

export function FedExSetupTab({ carrier }: FedExSetupTabProps) {
  const [steps] = useState<SetupStep[]>(setupStepsByCarrier[carrier] || []);
  const colors = carrierColors[carrier];

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const getStepIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        );
      case 'in_progress':
        return (
          <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-brand-cyan border-t-transparent animate-spin" />
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
          </div>
        );
    }
  };

  const getStepAction = (step: SetupStep) => {
    switch (step.status) {
      case 'completed':
        return <span className="text-sm text-green-600 font-medium">Completed</span>;
      case 'in_progress':
        return <Button variant="primary" size="sm">Continue</Button>;
      case 'error':
        return <Button variant="danger" size="sm">Retry</Button>;
      default:
        return <Button variant="secondary" size="sm" disabled>Start</Button>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className={`p-6 rounded-lg bg-gradient-to-r ${colors.bg} border ${colors.border}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-lg ${carrierLogoBg[carrier]} flex items-center justify-center`}>
            <span className="text-white font-bold">{CARRIER_LABELS[carrier].substring(0, 2).toUpperCase()}</span>
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${colors.text}`}>{CARRIER_LABELS[carrier]} Integration Setup</h3>
            <p className={`text-sm ${colors.text} opacity-80`}>
              {completedSteps} of {totalSteps} steps completed
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className={`h-full ${carrierLogoBg[carrier]} transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Setup Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-4 rounded-lg border transition-all ${
              step.status === 'in_progress'
                ? 'bg-brand-cyan/5 border-brand-cyan'
                : step.status === 'completed'
                ? 'bg-green-50/50 border-green-200'
                : step.status === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-white border-border'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-muted w-6">{index + 1}.</span>
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium ${step.status === 'completed' ? 'text-green-700' : 'text-text-primary'}`}>
                  {step.title}
                </h4>
                <p className="text-sm text-text-secondary">{step.description}</p>
              </div>
              <div className="flex-shrink-0">{getStepAction(step)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="p-4 rounded-lg bg-gray-50 border border-border">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-text-muted mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <h4 className="font-medium text-text-primary mb-1">Need help?</h4>
            <p className="text-sm text-text-secondary">
              Contact support or visit the {CARRIER_LABELS[carrier]} developer documentation for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
