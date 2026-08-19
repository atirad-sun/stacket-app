import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '@/primitives/toast';

function Fixture() {
  const { showToast } = useToast();
  return <button onClick={() => showToast('ยอมรับข้อเสนอแล้ว')}>fire</button>;
}

function renderWithProvider() {
  return render(<ToastProvider><Fixture /></ToastProvider>);
}

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('shows a message when fired', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: 'fire' }));
    expect(screen.getByText('ยอมรับข้อเสนอแล้ว')).toBeInTheDocument();
  });

  it('uses a polite live region so it never steals focus', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider();
    const trigger = screen.getByRole('button', { name: 'fire' });
    await user.click(trigger);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(trigger).toHaveFocus();
  });

  it('auto-dismisses after 2.6 seconds', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: 'fire' }));
    act(() => { vi.advanceTimersByTime(2500); });
    expect(screen.queryByText('ยอมรับข้อเสนอแล้ว')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.queryByText('ยอมรับข้อเสนอแล้ว')).toBeNull();
  });

  it('throws when used outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Fixture />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
