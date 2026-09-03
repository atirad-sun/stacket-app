import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '@/components/nav/switch';

describe('Switch', () => {
  it('renders the label and reflects the checked state via aria-checked', () => {
    render(<Switch checked={false} onChange={vi.fn()} label="โหมดสว่าง" />);
    const el = screen.getByRole('switch', { name: 'โหมดสว่าง' });
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with the inverted value on click', async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} label="จำลองสถานะออฟไลน์" />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('is a real 44px tap target', () => {
    render(<Switch checked={true} onChange={vi.fn()} label="x" />);
    expect(screen.getByRole('switch')).toHaveClass('tap-target');
  });
});
