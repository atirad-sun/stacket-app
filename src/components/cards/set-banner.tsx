export interface SetBannerCardProps {
  name: string;
  publisher: string;
  verified?: boolean;
  imageAlt: string;
}

export function SetBannerCard({ name, publisher, verified, imageAlt }: SetBannerCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div
        role="img"
        aria-label={imageAlt}
        className="h-32 w-full"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, var(--surface-2), var(--surface-2) 10px, var(--surface) 10px, var(--surface) 20px)',
        }}
      />
      <div className="p-4">
        <div className="flex items-center gap-1.5">
          <h2 className="text-heading">{name}</h2>
          {verified ? (
            <span role="img" aria-label="ยืนยันแล้ว" className="text-pos-text">
              ✓
            </span>
          ) : null}
        </div>
        <p className="text-body text-muted-text">โดย {publisher}</p>
      </div>
    </div>
  );
}
