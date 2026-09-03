import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SetBannerCard } from '@/components/cards/set-banner';

describe('SetBannerCard', () => {
  it('renders the set name and publisher', () => {
    render(<SetBannerCard name="Champion's Path" publisher="The Pokémon Company" imageAlt="Champion's Path" verified />);
    expect(screen.getByText("Champion's Path")).toBeInTheDocument();
    expect(screen.getByText('โดย The Pokémon Company')).toBeInTheDocument();
  });

  it('shows a verified marker (icon + accessible text, not colour alone) when verified', () => {
    render(<SetBannerCard name="x" publisher="x" imageAlt="x" verified />);
    expect(screen.getByRole('img', { name: 'ยืนยันแล้ว' })).toBeInTheDocument();
  });

  it('omits the verified marker when not verified', () => {
    render(<SetBannerCard name="x" publisher="x" imageAlt="x" verified={false} />);
    expect(screen.queryByRole('img', { name: 'ยืนยันแล้ว' })).toBeNull();
  });
});
