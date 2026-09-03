import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterChip } from '@/components/forms/filter-chip';

describe('FilterChip', () => {
  it('renders the label', () => {
    render(<FilterChip label="โปเกมอน" onRemove={vi.fn()} />);
    expect(screen.getByText('โปเกมอน')).toBeInTheDocument();
  });

  it('calls onRemove when the remove button is clicked', async () => {
    const onRemove = vi.fn();
    render(<FilterChip label="หายาก" onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: 'ลบตัวกรอง หายาก' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
