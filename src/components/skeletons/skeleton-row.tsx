import { Skeleton } from '@/primitives/skeleton';

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 border-b border-border py-3">
      <Skeleton width="4rem" height="4rem" className="shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton width="70%" height="1rem" />
        <Skeleton width="40%" height="0.75rem" />
      </div>
      <Skeleton width="3rem" height="1rem" />
    </div>
  );
}
