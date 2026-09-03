import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardRow } from '@/components/cards/card-row';

describe('CardRow', () => {
  it('renders name, subtitle, price, condition, and the provenance slot', () => {
    render(
      <CardRow
        imageAlt="Charizard VMAX"
        name="Charizard VMAX (Rainbow Rare)"
        subtitle="Champion's Path · No.074/073"
        price="฿42,000"
        conditionLabel="PSA 10"
        provenance={<span>ยืนยัน · จากการซื้อขายจริง 15 รายการ</span>}
      />,
    );
    expect(screen.getByText('Charizard VMAX (Rainbow Rare)')).toBeInTheDocument();
    expect(screen.getByText("Champion's Path · No.074/073")).toBeInTheDocument();
    expect(screen.getByText('฿42,000')).toBeInTheDocument();
    expect(screen.getByText('PSA 10')).toBeInTheDocument();
    expect(screen.getByText('ยืนยัน · จากการซื้อขายจริง 15 รายการ')).toBeInTheDocument();
  });

  it('renders an up delta with a non-colour-only up marker', () => {
    render(<CardRow imageAlt="x" name="x" subtitle="x" price="฿0" deltaLabel="8.2%" deltaDirection="up" />);
    expect(screen.getByText('▲ 8.2%')).toBeInTheDocument();
  });

  it('renders a down delta with a non-colour-only down marker', () => {
    render(<CardRow imageAlt="x" name="x" subtitle="x" price="฿0" deltaLabel="3.1%" deltaDirection="down" />);
    expect(screen.getByText('▼ 3.1%')).toBeInTheDocument();
  });

  it('calls onClick when tapped', async () => {
    const onClick = vi.fn();
    render(<CardRow imageAlt="x" name="x" subtitle="x" price="฿0" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
