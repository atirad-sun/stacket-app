import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfflineBanner } from '@/components/overlays/offline-banner';

describe('OfflineBanner', () => {
  it('renders nothing when online', () => {
    render(<OfflineBanner offline={false} />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('renders an offline message via a polite live region when offline', () => {
    render(<OfflineBanner offline />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveAttribute('aria-live', 'polite');
    expect(banner).toHaveTextContent('ออฟไลน์');
  });

  it('pairs the offline message with an icon, not colour alone', () => {
    render(<OfflineBanner offline />);
    expect(screen.getByRole('img', { name: 'ออฟไลน์' })).toBeInTheDocument();
  });
});
