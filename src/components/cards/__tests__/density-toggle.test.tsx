import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DensityToggle } from '@/components/cards/density-toggle';

describe('DensityToggle', () => {
  it('marks the active mode pressed', () => {
    render(<DensityToggle value="list" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'มุมมองรายการ' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'มุมมองตาราง' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with the clicked mode', async () => {
    const onChange = vi.fn();
    render(<DensityToggle value="list" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'มุมมองตาราง' }));
    expect(onChange).toHaveBeenCalledWith('grid');
  });
});
