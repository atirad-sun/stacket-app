'use client';

import { useId } from 'react';
import { Overlay } from '@/primitives/overlay';

export interface FilterGroup {
  key: string;
  label: string;
  children: React.ReactNode;
}

export interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  groups: FilterGroup[];
  onApply: () => void;
  onReset: () => void;
}

export function FilterSheet({ open, onClose, groups, onApply, onReset }: FilterSheetProps) {
  const titleId = useId();
  return (
    <Overlay open={open} onClose={onClose} labelledBy={titleId}>
      <h2 id={titleId} className="text-heading mb-4">
        ตัวกรอง
      </h2>
      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.key}>
            <h3 className="text-label mb-2 text-text-2">{group.label}</h3>
            {group.children}
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onReset}
          className="tap-target flex-1 rounded-full border border-border-input px-4 text-label text-text"
        >
          ล้างทั้งหมด
        </button>
        <button
          type="button"
          onClick={onApply}
          className="tap-target flex-1 rounded-full border border-primary-border bg-primary px-4 text-label text-on-primary"
        >
          ใช้ตัวกรอง
        </button>
      </div>
    </Overlay>
  );
}
