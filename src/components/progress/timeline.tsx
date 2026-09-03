import { VisuallyHidden } from '@/primitives/visually-hidden';
import { cn } from '@/lib/cn';

export interface TimelineStep {
  label: string;
  status: 'done' | 'current' | 'upcoming';
}

export interface TimelineProps {
  steps: TimelineStep[];
}

export function Timeline({ steps }: TimelineProps) {
  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step, i) => (
        <li key={step.label} className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]',
              step.status === 'done' && 'bg-primary text-on-primary',
              step.status === 'current' && 'bg-primary-tint text-accent-text',
              step.status === 'upcoming' && 'bg-surface-2 text-muted-text',
            )}
          >
            {step.status === 'done' ? '✓' : i + 1}
          </span>
          <span className={cn('text-label', step.status === 'upcoming' ? 'text-muted-text' : 'text-text')}>
            {step.label}
          </span>
          {step.status === 'done' ? <VisuallyHidden>เสร็จสิ้น</VisuallyHidden> : null}
          {step.status === 'current' ? <VisuallyHidden>กำลังดำเนินการ</VisuallyHidden> : null}
        </li>
      ))}
    </ol>
  );
}
