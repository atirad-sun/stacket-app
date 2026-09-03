export interface AmountStepperProps {
  value: number;
  onChange: (value: number) => void;
  step: number;
  min?: number;
  formatLabel: (value: number) => string;
}

export function AmountStepper({ value, onChange, step, min, formatLabel }: AmountStepperProps) {
  const atMin = min !== undefined && value <= min;
  return (
    <div className="flex items-center justify-between gap-4 rounded-full border border-border-input px-2 py-2">
      <button
        type="button"
        aria-label="ลด"
        disabled={atMin}
        onClick={() => onChange(Math.max(value - step, min ?? -Infinity))}
        className="tap-target flex items-center justify-center rounded-full bg-surface-2 text-text disabled:opacity-40"
      >
        <span aria-hidden="true">−</span>
      </button>
      <span className="text-heading text-numeric">{formatLabel(value)}</span>
      <button
        type="button"
        aria-label="เพิ่ม"
        onClick={() => onChange(value + step)}
        className="tap-target flex items-center justify-center rounded-full bg-surface-2 text-text"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
