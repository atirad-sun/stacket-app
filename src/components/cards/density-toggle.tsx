import { cn } from '@/lib/cn';

export interface DensityToggleProps {
  value: 'list' | 'grid';
  onChange: (value: 'list' | 'grid') => void;
}

export function DensityToggle({ value, onChange }: DensityToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-border">
      <button
        type="button"
        aria-label="มุมมองรายการ"
        aria-pressed={value === 'list'}
        onClick={() => onChange('list')}
        className={cn('tap-target rounded-l-lg px-2', value === 'list' ? 'bg-surface-2' : 'bg-bg')}
      >
        <span aria-hidden="true">☰</span>
      </button>
      <button
        type="button"
        aria-label="มุมมองตาราง"
        aria-pressed={value === 'grid'}
        onClick={() => onChange('grid')}
        className={cn('tap-target rounded-r-lg px-2', value === 'grid' ? 'bg-surface-2' : 'bg-bg')}
      >
        <span aria-hidden="true">▦</span>
      </button>
    </div>
  );
}
