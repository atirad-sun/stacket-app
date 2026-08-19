'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusScope } from './focus-scope';

export interface OverlayProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: React.ReactNode;
}

export function Overlay({ open, onClose, labelledBy, children }: OverlayProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        data-testid="overlay-scrim"
        onClick={onClose}
        className="motion-enter absolute inset-0"
        style={{ background: 'var(--scrim)' }}
      />
      <FocusScope active onEscape={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          className="motion-enter relative z-10 w-full max-w-[480px] rounded-t-2xl bg-bg p-6 sm:rounded-2xl"
        >
          {children}
        </div>
      </FocusScope>
    </div>,
    document.body,
  );
}
