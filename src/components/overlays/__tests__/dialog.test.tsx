import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '@/components/overlays/dialog';

describe('Dialog', () => {
  it('renders the title and children when open', () => {
    render(
      <Dialog open onClose={vi.fn()} title="ยกเลิกข้อเสนอ?">
        <p>content</p>
      </Dialog>,
    );
    expect(screen.getByRole('heading', { name: 'ยกเลิกข้อเสนอ?' })).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('wires the dialog aria-labelledby to the heading id', () => {
    render(
      <Dialog open onClose={vi.fn()} title="ยกเลิกข้อเสนอ?">
        <p>content</p>
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog');
    const heading = screen.getByRole('heading');
    expect(dialog).toHaveAttribute('aria-labelledby', heading.getAttribute('id'));
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="ยกเลิกข้อเสนอ?">
        <p>content</p>
      </Dialog>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('renders nothing when closed', () => {
    render(
      <Dialog open={false} onClose={vi.fn()} title="x">
        <p>content</p>
      </Dialog>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
