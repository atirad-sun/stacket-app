'use client';

import { Dialog } from './dialog';

export interface PermissionModalProps {
  open: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  onAllow: () => void;
  onDeny: () => void;
  allowLabel?: string;
  denyLabel?: string;
}

export function PermissionModal({
  open,
  onClose,
  icon,
  title,
  description,
  onAllow,
  onDeny,
  allowLabel = 'อนุญาต',
  denyLabel = 'ไม่อนุญาต',
}: PermissionModalProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <div className="mb-6 flex justify-center">{icon}</div>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onAllow}
          className="tap-target rounded-full border border-primary-border bg-primary px-4 text-label text-on-primary"
        >
          {allowLabel}
        </button>
        <button type="button" onClick={onDeny} className="tap-target rounded-full px-4 text-label text-muted-text">
          {denyLabel}
        </button>
      </div>
    </Dialog>
  );
}
