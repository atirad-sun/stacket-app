export interface CardTileProps {
  imageAlt: string;
  name: string;
  subtitle: string;
  price: string;
  badge?: React.ReactNode;
  onClick?: () => void;
}

export function CardTile({ imageAlt, name, subtitle, price, badge, onClick }: CardTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-2 rounded-xl border border-border bg-bg p-3 text-left"
    >
      <div role="img" aria-label={imageAlt} className="aspect-[3/4] rounded-lg bg-surface-2" />
      <div className="flex items-start justify-between gap-1">
        <span className="text-label text-text">{name}</span>
        {badge}
      </div>
      <span className="text-body text-muted-text">{subtitle}</span>
      <span className="text-label text-numeric text-text">{price}</span>
    </button>
  );
}
