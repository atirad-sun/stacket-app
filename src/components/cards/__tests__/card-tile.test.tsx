import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardTile } from '@/components/cards/card-tile';

describe('CardTile', () => {
  it('renders name, subtitle, and price', () => {
    render(<CardTile imageAlt="Charizard VMAX" name="Charizard VMAX" subtitle="Champion's Path" price="฿42,000" />);
    expect(screen.getByText('Charizard VMAX')).toBeInTheDocument();
    expect(screen.getByText("Champion's Path")).toBeInTheDocument();
    expect(screen.getByText('฿42,000')).toBeInTheDocument();
  });

  it('renders the price with tabular-nums via the numeric text class', () => {
    render(<CardTile imageAlt="x" name="x" subtitle="x" price="฿42,000" />);
    expect(screen.getByText('฿42,000')).toHaveClass('text-numeric');
  });

  it('calls onClick when tapped, and is keyboard-activatable', async () => {
    const onClick = vi.fn();
    render(<CardTile imageAlt="x" name="x" subtitle="x" price="฿0" onClick={onClick} />);
    const tile = screen.getByRole('button');
    await userEvent.click(tile);
    expect(onClick).toHaveBeenCalledOnce();
    tile.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('renders a caller-supplied badge slot', () => {
    render(<CardTile imageAlt="x" name="x" subtitle="x" price="฿0" badge={<span data-testid="badge">✓</span>} />);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });
});
