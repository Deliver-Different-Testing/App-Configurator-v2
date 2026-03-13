import React from 'react';
import { Check } from 'lucide-react';
import type { WizardStep } from '../types';

export interface WizardStepperProps {
  steps: WizardStep[];
  currentStepIndex: number;
  completedSteps: string[];
  skippedSteps: string[];
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function WizardStepper({
  steps,
  currentStepIndex,
  completedSteps,
  skippedSteps,
  onStepClick,
  className = '',
}: WizardStepperProps): React.ReactElement {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isSkipped = skippedSteps.includes(step.id);
        const isCurrent = index === currentStepIndex;
        const isPast = index < currentStepIndex;

        return (
          <React.Fragment key={step.id}>
            {/* Step circle */}
            <button
              type="button"
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick || index > currentStepIndex}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                text-sm font-medium transition-all duration-200
                ${isCompleted ? 'bg-green-500 text-white' : ''}
                ${isSkipped ? 'bg-gray-300 text-gray-500' : ''}
                ${isCurrent ? 'bg-brand-cyan text-white ring-4 ring-brand-cyan/20' : ''}
                ${!isCompleted && !isSkipped && !isCurrent && isPast ? 'bg-green-500 text-white' : ''}
                ${!isCompleted && !isSkipped && !isCurrent && !isPast ? 'bg-gray-200 text-gray-500' : ''}
                ${onStepClick && index <= currentStepIndex ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
              `}
              title={step.label}
            >
              {isCompleted || isPast ? <Check className="w-5 h-5" /> : index + 1}
            </button>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  w-12 h-0.5 transition-colors duration-200
                  ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
