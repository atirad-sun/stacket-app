'use client';

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onSubmit?: () => void;
}

export function SearchField({ value, onChange, placeholder, onSubmit }: SearchFieldProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-3 focus-within:border-primary">
      <span aria-hidden="true" className="text-muted-text">
        🔍
      </span>
      <input
        type="search"
        role="searchbox"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit?.();
        }}
        className="text-body flex-1 bg-transparent text-text outline-none placeholder:text-muted-text"
      />
      {value ? (
        <button
          type="button"
          aria-label="ล้างการค้นหา"
          onClick={() => onChange('')}
          className="tap-target flex items-center justify-center rounded-full text-muted-text"
        >
          <span aria-hidden="true">✕</span>
        </button>
      ) : null}
    </div>
  );
}
