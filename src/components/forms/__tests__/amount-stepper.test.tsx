import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AmountStepper } from '@/components/forms/amount-stepper';

const formatLabel = (v: number) => `฿${v.toLocaleString('en-US')}`;

describe('AmountStepper', () => {
  it('renders the formatted current value', () => {
    render(<AmountStepper value={1000} onChange={vi.fn()} step={100} formatLabel={formatLabel} />);
    expect(screen.getByText('฿1,000')).toBeInTheDocument();
  });

  it('increments by step on the plus button', async () => {
    const onChange = vi.fn();
    render(<AmountStepper value={1000} onChange={onChange} step={100} formatLabel={formatLabel} />);
    await userEvent.click(screen.getByRole('button', { name: 'เพิ่ม' }));
    expect(onChange).toHaveBeenCalledWith(1100);
  });

  it('decrements by step on the minus button', async () => {
    const onChange = vi.fn();
    render(<AmountStepper value={1000} onChange={onChange} step={100} formatLabel={formatLabel} />);
    await userEvent.click(screen.getByRole('button', { name: 'ลด' }));
    expect(onChange).toHaveBeenCalledWith(900);
  });

  it('does not decrement below min, and disables the minus button there', async () => {
    const onChange = vi.fn();
    render(<AmountStepper value={100} onChange={onChange} step={100} min={100} formatLabel={formatLabel} />);
    const minusButton = screen.getByRole('button', { name: 'ลด' });
    expect(minusButton).toBeDisabled();
    await userEvent.click(minusButton);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders the value with tabular-nums', () => {
    render(<AmountStepper value={1000} onChange={vi.fn()} step={100} formatLabel={formatLabel} />);
    expect(screen.getByText('฿1,000')).toHaveClass('text-numeric');
  });
});
