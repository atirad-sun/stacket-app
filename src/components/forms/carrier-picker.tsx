'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';

export interface Carrier {
  key: string;
  name: string;
  etaLabel: string;
  priceLabel: string;
}

export interface CarrierPickerProps {
  carriers: Carrier[];
  selectedKey: string;
  onChange: (key: string) => void;
}

export function CarrierPicker({ carriers, selectedKey, onChange }: CarrierPickerProps) {
  const groupName = useId();
  return (
    <div role="radiogroup" aria-label="ผู้ให้บริการขนส่ง" className="flex flex-col gap-2">
      {carriers.map((carrier) => (
        <label
          key={carrier.key}
          className={cn(
            'flex cursor-pointer items-center justify-between rounded-xl border p-3',
            carrier.key === selectedKey ? 'border-primary bg-primary-tint' : 'border-border',
          )}
        >
          <span className="flex items-center gap-3">
            <input
              type="radio"
              name={groupName}
              checked={carrier.key === selectedKey}
              onChange={() => onChange(carrier.key)}
              aria-label={`${carrier.name} ${carrier.etaLabel} ${carrier.priceLabel}`}
              className="h-5 w-5 accent-primary"
            />
            <span>
              <span className="text-label block text-text">{carrier.name}</span>
              <span className="text-body text-muted-text">{carrier.etaLabel}</span>
            </span>
          </span>
          <span className="text-label text-numeric text-text">{carrier.priceLabel}</span>
        </label>
      ))}
    </div>
  );
}
