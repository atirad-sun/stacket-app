import { cn } from '@/lib/cn';

export function Skeleton({
  width = '100%',
  height = '1rem',
  className,
}: { width?: string; height?: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded bg-surface-2', className)}
      style={{ width, height }}
    />
  );
}
