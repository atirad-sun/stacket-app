import { Skeleton } from '@/primitives/skeleton';

export function SkeletonStatRow() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Skeleton width="100%" height="3.5rem" className="rounded-xl" />
      <Skeleton width="100%" height="3.5rem" className="rounded-xl" />
      <Skeleton width="100%" height="3.5rem" className="rounded-xl" />
    </div>
  );
}
