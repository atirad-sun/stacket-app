'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const TOAST_DURATION_MS = 2600;

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((next: string) => {
    setMessage(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), TOAST_DURATION_MS);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end"
      >
        {message && (
          <div className="motion-enter rounded-lg bg-surface-3 px-4 py-3 text-label text-text">
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context;
}

/*
  A toast is never the only record of a money event. Escrow state transitions
  render a persistent state on screen; the toast is an additional signal, never
  the sole one. See spec 2026-08-17-stacket-v1-design.md §5.5.
*/
