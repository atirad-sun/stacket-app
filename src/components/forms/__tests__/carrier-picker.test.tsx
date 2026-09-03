import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CarrierPicker } from '@/components/forms/carrier-picker';

const carriers = [
  { key: 'kerry', name: 'Kerry Express', etaLabel: '1-2 วัน', priceLabel: '฿40' },
  { key: 'thaipost', name: 'ไปรษณีย์ไทย', etaLabel: '3-5 วัน', priceLabel: '฿30' },
];

describe('CarrierPicker', () => {
  it('renders every carrier with its eta and price', () => {
    render(<CarrierPicker carriers={carriers} selectedKey="kerry" onChange={vi.fn()} />);
    expect(screen.getByText('Kerry Express')).toBeInTheDocument();
    expect(screen.getByText('1-2 วัน')).toBeInTheDocument();
    expect(screen.getByText('฿40')).toBeInTheDocument();
  });

  it('marks the selected carrier as checked via radio semantics', () => {
    render(<CarrierPicker carriers={carriers} selectedKey="kerry" onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: /Kerry Express/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /ไปรษณีย์ไทย/ })).not.toBeChecked();
  });

  it('calls onChange with the clicked carrier key', async () => {
    const onChange = vi.fn();
    render(<CarrierPicker carriers={carriers} selectedKey="kerry" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: /ไปรษณีย์ไทย/ }));
    expect(onChange).toHaveBeenCalledWith('thaipost');
  });
});
