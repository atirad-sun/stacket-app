export interface OfflineBannerProps {
  offline: boolean;
}

export function OfflineBanner({ offline }: OfflineBannerProps) {
  if (!offline) return null;
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 bg-warn-tint px-4 py-2 text-body text-warn-text">
      <span role="img" aria-label="ออฟไลน์">
        ⚠️
      </span>
      <span>ออฟไลน์ — ข้อมูลที่บันทึกไว้ยังอ่านได้ แต่ทำรายการไม่ได้ตอนนี้</span>
    </div>
  );
}
