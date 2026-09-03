import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('renders nothing when closed', () => {
    render(
      <Dialog open={false} onClose={vi.fn()} title="x">
        <p>content</p>
      </Dialog>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
