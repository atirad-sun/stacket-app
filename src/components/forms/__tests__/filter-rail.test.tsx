import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterRail } from '@/components/forms/filter-rail';

const groups = [{ key: 'game', label: 'เกม', children: <div>game options</div> }];

describe('FilterRail', () => {
  it('renders every group label and content (no open/close state — always visible)', () => {
    render(<FilterRail groups={groups} onApply={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByText('เกม')).toBeInTheDocument();
    expect(screen.getByText('game options')).toBeInTheDocument();
  });

  it('calls onApply and onReset', async () => {
    const onApply = vi.fn();
    const onReset = vi.fn();
    render(<FilterRail groups={groups} onApply={onApply} onReset={onReset} />);
    await userEvent.click(screen.getByRole('button', { name: 'ใช้ตัวกรอง' }));
    expect(onApply).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'ล้างทั้งหมด' }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('renders as a labelled complementary region, not a dialog', () => {
    render(<FilterRail groups={groups} onApply={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByRole('complementary', { name: 'ตัวกรอง' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
