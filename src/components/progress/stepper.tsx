import { cn } from '@/lib/cn';

export interface StepperProps {
  totalSteps: number;
  currentStep: number;
}

export function Stepper({ totalSteps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        className="flex flex-1 gap-1.5"
      >
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            role="presentation"
            className={cn('h-1 flex-1 rounded-full', i < currentStep ? 'bg-primary' : 'bg-surface-3')}
          />
        ))}
      </div>
      <span className="text-body text-numeric shrink-0 text-muted-text">
        {currentStep}/{totalSteps}
      </span>
    </div>
  );
}
