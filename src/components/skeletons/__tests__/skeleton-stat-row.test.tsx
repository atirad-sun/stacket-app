import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkeletonStatRow } from '@/components/skeletons/skeleton-stat-row';

describe('SkeletonStatRow', () => {
  it('renders exactly three stat blocks, all aria-hidden', () => {
    const { container } = render(<SkeletonStatRow />);
    const blocks = container.querySelectorAll('[aria-hidden="true"]');
    expect(blocks).toHaveLength(3);
  });
});
