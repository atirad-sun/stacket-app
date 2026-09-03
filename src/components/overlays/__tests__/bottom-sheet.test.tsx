import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomSheet } from '@/components/overlays/bottom-sheet';

describe('BottomSheet', () => {
  it('renders nothing when closed', () => {
    render(
      <BottomSheet open={false} onClose={vi.fn()} title="ยืนยันการเสนอราคา">
        <p>content</p>
      </BottomSheet>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders the title, description, and children when open', () => {
    render(
      <BottomSheet open onClose={vi.fn()} title="ยืนยันการเสนอราคา" description="ตรวจสอบก่อนส่ง">
        <p>content</p>
      </BottomSheet>,
    );
    expect(screen.getByRole('heading', { name: 'ยืนยันการเสนอราคา' })).toBeInTheDocument();
    expect(screen.getByText('ตรวจสอบก่อนส่ง')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('wires the dialog aria-labelledby to the heading id', () => {
    render(
      <BottomSheet open onClose={vi.fn()} title="ยืนยันการเสนอราคา">
        <p>content</p>
      </BottomSheet>,
    );
    const dialog = screen.getByRole('dialog');
    const heading = screen.getByRole('heading');
    expect(dialog).toHaveAttribute('aria-labelledby', heading.getAttribute('id'));
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose} title="ยืนยันการเสนอราคา">
        <p>content</p>
      </BottomSheet>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose from the close button', async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose} title="x">
        <p>content</p>
      </BottomSheet>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ปิด' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
