import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline } from '@/components/progress/timeline';

const steps = [
  { label: 'ยอมรับข้อเสนอ', status: 'done' as const },
  { label: 'จัดส่ง', status: 'current' as const },
  { label: 'ชำระเงิน', status: 'upcoming' as const },
];

describe('Timeline', () => {
  it('renders every step label', () => {
    render(<Timeline steps={steps} />);
    for (const step of steps) {
      expect(screen.getByText(step.label)).toBeInTheDocument();
    }
  });

  it('marks the current step distinctly from done and upcoming (text, not colour alone)', () => {
    render(<Timeline steps={steps} />);
    expect(screen.getByText('ยอมรับข้อเสนอ').closest('li')).toHaveTextContent('เสร็จสิ้น');
    expect(screen.getByText('จัดส่ง').closest('li')).toHaveTextContent('กำลังดำเนินการ');
    expect(screen.getByText('ชำระเงิน').closest('li')).not.toHaveTextContent(/เสร็จสิ้น|กำลังดำเนินการ/);
  });

  it('renders as an ordered list for assistive tech', () => {
    render(<Timeline steps={steps} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
