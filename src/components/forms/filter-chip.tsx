export interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint px-3 py-1.5 text-label text-accent-text">
      {label}
      <button
        type="button"
        aria-label={`ลบตัวกรอง ${label}`}
        onClick={onRemove}
        className="tap-target -my-2.5 -mr-1 flex h-6 w-6 items-center justify-center rounded-full"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </span>
  );
}
