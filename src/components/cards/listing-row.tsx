'use client';

export interface ListingRowProps {
  imageAlt: string;
  name: string;
  sellerName: string;
  price: string;
  verified?: boolean;
  onClick?: () => void;
}

export function ListingRow({ imageAlt, name, sellerName, price, verified, onClick }: ListingRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-border py-3 text-left"
    >
      <span role="img" aria-label={imageAlt} className="block h-16 w-16 shrink-0 rounded-lg bg-surface-2" />
      <span className="block min-w-0 flex-1">
        <span className="text-label block text-text">{name}</span>
        <span className="flex items-center gap-1 text-body text-muted-text">
          {sellerName}
          {verified ? (
            <span role="img" aria-label="ผู้ขายยืนยันแล้ว" className="text-pos-text">
              ✓
            </span>
          ) : null}
        </span>
      </span>
      <span className="text-label shrink-0 text-numeric text-text">{price}</span>
    </button>
  );
}
