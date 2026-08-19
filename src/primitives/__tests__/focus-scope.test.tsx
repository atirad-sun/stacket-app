import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FocusScope } from '@/primitives/focus-scope';

function Fixture({ onEscape }: { onEscape?: () => void }) {
  return (
    <div>
      <button>outside</button>
      <FocusScope active onEscape={onEscape}>
        <button>first</button>
        <button>second</button>
      </FocusScope>
    </div>
  );
}

describe('FocusScope', () => {
  it('moves focus to the first focusable child on activation', () => {
    render(<Fixture />);
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  it('wraps focus forward from the last child to the first', async () => {
    render(<Fixture />);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'second' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  it('wraps focus backward from the first child to the last', async () => {
    render(<Fixture />);
    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'second' })).toHaveFocus();
  });

  it('calls onEscape when Escape is pressed', async () => {
    const onEscape = vi.fn();
    render(<Fixture onEscape={onEscape} />);
    await userEvent.keyboard('{Escape}');
    expect(onEscape).toHaveBeenCalledOnce();
  });

  it('restores focus to the previously focused element on unmount', async () => {
    function Toggle() {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button onClick={() => setOpen(true)}>trigger</button>
          {open && (
            <FocusScope active onEscape={() => setOpen(false)}>
              <button>inside</button>
            </FocusScope>
          )}
        </div>
      );
    }
    render(<Toggle />);
    const trigger = screen.getByRole('button', { name: 'trigger' });
    await userEvent.click(trigger);
    expect(screen.getByRole('button', { name: 'inside' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });
});
