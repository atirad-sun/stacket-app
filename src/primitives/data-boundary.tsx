import { VisuallyHidden } from './visually-hidden';

export type DataState<T> =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string; retry: () => void }
  | { status: 'offline' }
  | { status: 'ready'; data: T };

export interface DataBoundaryProps<T> {
  state: DataState<T>;
  skeleton: React.ReactNode;
  empty: React.ReactNode;
  offlineMessage?: string;
  children: (data: T) => React.ReactNode;
}

export function DataBoundary<T>({
  state,
  skeleton,
  empty,
  offlineMessage = 'ออฟไลน์ — ข้อมูลที่บันทึกไว้ยังอ่านได้ แต่ทำรายการไม่ได้ตอนนี้',
  children,
}: DataBoundaryProps<T>) {
  if (state.status === 'loading') {
    return (
      <div role="status" aria-busy="true" aria-live="polite">
        <VisuallyHidden>กำลังโหลด</VisuallyHidden>
        {skeleton}
      </div>
    );
  }

  if (state.status === 'empty') return <>{empty}</>;

  if (state.status === 'error') {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-body text-text-2">{state.message}</p>
        <button
          type="button"
          onClick={state.retry}
          className="tap-target rounded-lg bg-primary px-4 text-label text-on-primary"
        >
          ลองอีกครั้ง
        </button>
      </div>
    );
  }

  if (state.status === 'offline') {
    return (
      <div role="status" aria-live="polite" className="text-body text-muted-text">
        {offlineMessage}
      </div>
    );
  }

  if (state.status === 'ready') {
    return <>{children(state.data)}</>;
  }

  const exhaustiveCheck: never = state;
  return exhaustiveCheck;
}
