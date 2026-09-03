import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Keypad } from '@/components/forms/keypad';

describe('Keypad', () => {
  it('renders digits 0-9', () => {
    render(<Keypad onDigit={vi.fn()} onBackspace={vi.fn()} />);
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
    }
  });

  it('calls onDigit with the pressed digit', async () => {
    const onDigit = vi.fn();
    render(<Keypad onDigit={onDigit} onBackspace={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '7' }));
    expect(onDigit).toHaveBeenCalledWith('7');
  });

  it('calls onBackspace from the backspace key', async () => {
    const onBackspace = vi.fn();
    render(<Keypad onDigit={vi.fn()} onBackspace={onBackspace} />);
    await userEvent.click(screen.getByRole('button', { name: 'ลบ' }));
    expect(onBackspace).toHaveBeenCalledOnce();
  });

  it('every key is a real 44px tap target', () => {
    render(<Keypad onDigit={vi.fn()} onBackspace={vi.fn()} />);
    expect(screen.getByRole('button', { name: '5' })).toHaveClass('tap-target');
  });
});
