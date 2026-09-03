import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkeletonRow } from '@/components/skeletons/skeleton-row';

describe('SkeletonRow', () => {
  it('renders a thumbnail block and at least two text-line blocks, all aria-hidden', () => {
    const { container } = render(<SkeletonRow />);
    const blocks = container.querySelectorAll('[aria-hidden="true"]');
    expect(blocks.length).toBeGreaterThanOrEqual(3);
  });
});
