import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Overlay } from '@/primitives/overlay';

function Fixture({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Overlay open={open} onClose={onClose} labelledBy="title">
      <h2 id="title">ยืนยันตัวตน</h2>
      <button>ตกลง</button>
    </Overlay>
  );
}

describe('Overlay', () => {
  it('renders nothing when closed', () => {
    render(<Fixture open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('exposes a modal dialog labelled by its heading', () => {
    render(<Fixture open onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'title');
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(<Fixture open onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes when the scrim is clicked', async () => {
    const onClose = vi.fn();
    render(<Fixture open onClose={onClose} />);
    await userEvent.click(screen.getByTestId('overlay-scrim'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when the panel itself is clicked', async () => {
    const onClose = vi.fn();
    render(<Fixture open onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'ตกลง' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    render(<Fixture open onClose={vi.fn()} />);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
