import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterSheet } from '@/components/forms/filter-sheet';

const groups = [
  { key: 'game', label: 'เกม', children: <div>game options</div> },
  { key: 'condition', label: 'สภาพ', children: <div>condition options</div> },
];

describe('FilterSheet', () => {
  it('renders nothing when closed', () => {
    render(<FilterSheet open={false} onClose={vi.fn()} groups={groups} onApply={vi.fn()} onReset={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders every group label and its content when open', () => {
    render(<FilterSheet open onClose={vi.fn()} groups={groups} onApply={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByText('เกม')).toBeInTheDocument();
    expect(screen.getByText('game options')).toBeInTheDocument();
    expect(screen.getByText('สภาพ')).toBeInTheDocument();
  });

  it('calls onApply and onReset from their buttons', async () => {
    const onApply = vi.fn();
    const onReset = vi.fn();
    render(<FilterSheet open onClose={vi.fn()} groups={groups} onApply={onApply} onReset={onReset} />);
    await userEvent.click(screen.getByRole('button', { name: 'ใช้ตัวกรอง' }));
    expect(onApply).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'ล้างทั้งหมด' }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
