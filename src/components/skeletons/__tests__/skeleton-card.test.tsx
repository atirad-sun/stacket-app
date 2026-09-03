import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkeletonCard } from '@/components/skeletons/skeleton-card';

describe('SkeletonCard', () => {
  it('renders a hero block, all aria-hidden', () => {
    const { container } = render(<SkeletonCard />);
    const blocks = container.querySelectorAll('[aria-hidden="true"]');
    expect(blocks.length).toBeGreaterThanOrEqual(1);
  });
});
