import { Skeleton } from '@/primitives/skeleton';

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
      <Skeleton width="100%" height="8rem" className="rounded-xl" />
      <Skeleton width="60%" height="1.25rem" />
      <Skeleton width="40%" height="0.875rem" />
    </div>
  );
}
