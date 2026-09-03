import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListingRow } from '@/components/cards/listing-row';

describe('ListingRow', () => {
  it('renders card name, seller, and price', () => {
    render(<ListingRow imageAlt="x" name="Charizard VMAX" sellerName="KanaCards" price="฿39,500" />);
    expect(screen.getByText('Charizard VMAX')).toBeInTheDocument();
    expect(screen.getByText('KanaCards')).toBeInTheDocument();
    expect(screen.getByText('฿39,500')).toBeInTheDocument();
  });

  it('shows a verified marker next to the seller name when verified', () => {
    render(<ListingRow imageAlt="x" name="x" sellerName="KanaCards" price="฿0" verified />);
    expect(screen.getByRole('img', { name: 'ผู้ขายยืนยันแล้ว' })).toBeInTheDocument();
  });

  it('calls onClick when tapped', async () => {
    const onClick = vi.fn();
    render(<ListingRow imageAlt="x" name="x" sellerName="x" price="฿0" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
