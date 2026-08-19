import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme/theme-provider';
import { useTheme } from '@/theme/use-theme';

function Probe() {
  const { theme, resolved, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolved}</span>
      <button onClick={() => setTheme('dark')}>dark</button>
      <button onClick={() => setTheme('system')}>system</button>
    </div>
  );
}

function mockSystem(prefersDark: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('dark') ? prefersDark : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    mockSystem(false);
  });

  it('defaults to system', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('theme')).toHaveTextContent('system');
  });

  it('resolves system to dark when the OS prefers dark', () => {
    mockSystem(true);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('writes the resolved theme to the html element', async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'dark' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('persists an explicit choice and restores it', async () => {
    const { unmount } = render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'dark' }));
    unmount();
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('clears persistence when returning to system', async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'dark' }));
    await userEvent.click(screen.getByRole('button', { name: 'system' }));
    expect(localStorage.getItem('stacket-theme')).toBeNull();
  });

  it('throws a useful error when used outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
    spy.mockRestore();
  });
});
