import { Overlay } from '@/primitives/overlay';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, description, children }: BottomSheetProps) {
  return (
    <Overlay open={open} onClose={onClose} labelledBy="bottom-sheet-title">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="bottom-sheet-title" className="text-heading">
            {title}
          </h2>
          {description ? <p className="text-body mt-1 text-muted-text">{description}</p> : null}
        </div>
        <button
          type="button"
          aria-label="ปิด"
          onClick={onClose}
          className="tap-target flex shrink-0 items-center justify-center rounded-full text-text-2"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
      {children}
    </Overlay>
  );
}
