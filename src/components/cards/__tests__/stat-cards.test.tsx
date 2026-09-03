import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCards } from '@/components/cards/stat-cards';

const stats = [
  { label: 'ราคาต่ำสุด', value: '฿1,200' },
  { label: 'จำนวนการ์ด', value: '73 ใบ' },
  { label: 'มูลค่ารวม', value: '฿2.4M' },
];

describe('StatCards', () => {
  it('renders every stat label and value', () => {
    render(<StatCards stats={stats} />);
    for (const stat of stats) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByText(stat.value)).toBeInTheDocument();
    }
  });

  it('renders every value with tabular-nums', () => {
    render(<StatCards stats={stats} />);
    for (const stat of stats) {
      expect(screen.getByText(stat.value)).toHaveClass('text-numeric');
    }
  });
});
