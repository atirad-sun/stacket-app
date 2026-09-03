import { cn } from '@/lib/cn';

export interface DealStatus {
  label: string;
  tone: 'warn' | 'pos' | 'neutral';
}

export interface DealRowProps {
  dealId: string;
  imageAlt: string;
  cardName: string;
  role: 'buyer' | 'seller';
  counterpartyName: string;
  price: string;
  relativeTimeLabel: string;
  status: DealStatus;
  unreadCount?: number;
  escrowLabel?: string;
  onClick?: () => void;
}

const TONE_CLASSES: Record<DealStatus['tone'], string> = {
  warn: 'bg-warn-tint text-warn-text',
  pos: 'bg-pos-tint text-pos-text',
  neutral: 'bg-surface-2 text-text-2',
};

export function DealRow({
  dealId,
  imageAlt,
  cardName,
  role,
  counterpartyName,
  price,
  relativeTimeLabel,
  status,
  unreadCount,
  escrowLabel,
  onClick,
}: DealRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-xl border border-border bg-bg p-4 text-left"
    >
      <div className="flex items-center justify-between">
        <span className="text-body text-numeric text-muted-text">{dealId}</span>
        <span className={cn('rounded-full px-2 py-0.5 text-body', TONE_CLASSES[status.tone])}>{status.label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div role="img" aria-label={imageAlt} className="h-14 w-14 shrink-0 rounded-lg bg-surface-2" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-label text-text">{cardName}</span>
            <span className="text-body text-numeric shrink-0 text-muted-text">{relativeTimeLabel}</span>
          </div>
          <span className="text-body text-muted-text">
            {role === 'buyer' ? 'คุณเป็นผู้ซื้อ' : 'คุณเป็นผู้ขาย'} · {counterpartyName}
          </span>
          <div className="flex items-center justify-between">
            <span className="text-label text-numeric text-text">{price}</span>
            {unreadCount ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-pos px-1.5 text-[11px] text-on-primary text-numeric">
                {unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {escrowLabel ? (
        <div className="flex items-center gap-1.5 text-body text-pos-text">
          <span role="img" aria-label="เงินถูกเก็บไว้ในระบบ escrow">
            🔒
          </span>
          <span>{escrowLabel}</span>
        </div>
      ) : null}
    </button>
  );
}
