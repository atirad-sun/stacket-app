import type { FilterGroup } from './filter-sheet';

export interface FilterRailProps {
  groups: FilterGroup[];
  onApply: () => void;
  onReset: () => void;
}

export function FilterRail({ groups, onApply, onReset }: FilterRailProps) {
  return (
    <aside aria-label="ตัวกรอง" className="sticky top-4 flex w-64 shrink-0 flex-col gap-5 p-4">
      <h2 className="text-heading">ตัวกรอง</h2>
      {groups.map((group) => (
        <div key={group.key}>
          <h3 className="text-label mb-2 text-text-2">{group.label}</h3>
          {group.children}
        </div>
      ))}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onReset}
          className="tap-target flex-1 rounded-full border border-border-input px-4 text-label text-text"
        >
          ล้างทั้งหมด
        </button>
        <button
          type="button"
          onClick={onApply}
          className="tap-target flex-1 rounded-full border border-primary-border bg-primary px-4 text-label text-on-primary"
        >
          ใช้ตัวกรอง
        </button>
      </div>
    </aside>
  );
}
