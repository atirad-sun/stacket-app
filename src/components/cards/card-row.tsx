'use client';

import { cn } from '@/lib/cn';

export interface CardRowProps {
  imageAlt: string;
  name: string;
  subtitle: string;
  price: string;
  deltaLabel?: string;
  deltaDirection?: 'up' | 'down';
  badge?: React.ReactNode;
  provenance?: React.ReactNode;
  conditionLabel?: string;
  onClick?: () => void;
}

export function CardRow({
  imageAlt,
  name,
  subtitle,
  price,
  deltaLabel,
  deltaDirection,
  badge,
  provenance,
  conditionLabel,
  onClick,
}: CardRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-border py-3 text-left"
    >
      <span role="img" aria-label={imageAlt} className="block h-16 w-16 shrink-0 rounded-lg bg-surface-2" />
      <span className="block min-w-0 flex-1">
        <span className="flex items-center gap-1">
          <span className="text-label text-text">{name}</span>
          {badge}
        </span>
        <span className="text-body text-muted-text">{subtitle}</span>
        {provenance ? <span className="text-body mt-0.5 block">{provenance}</span> : null}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        {conditionLabel ? (
          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-body text-text-2">{conditionLabel}</span>
        ) : null}
        <span className="text-label text-numeric text-text">{price}</span>
        {deltaLabel ? (
          <span
            className={cn(
              'text-body text-numeric',
              deltaDirection === 'up' ? 'text-pos-text' : 'text-neg-text',
            )}
          >
            {deltaDirection === 'up' ? '▲' : '▼'} {deltaLabel}
          </span>
        ) : null}
      </span>
    </button>
  );
}
