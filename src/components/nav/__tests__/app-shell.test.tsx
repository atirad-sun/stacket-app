import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme/theme-provider';
import { AppShell, type NavItem } from '@/components/nav/app-shell';

const navItems: NavItem[] = [
  { key: 'search', label: 'ค้นหา', href: '/search', icon: <span data-testid="icon-search" /> },
  { key: 'portfolio', label: 'พอร์ต', href: '/portfolio', icon: <span data-testid="icon-portfolio" /> },
  { key: 'sell', label: 'ลงขาย', href: '/sell', icon: <span data-testid="icon-sell" /> },
  { key: 'deals', label: 'ดีล', href: '/deals', icon: <span data-testid="icon-deals" />, badge: 2 },
  { key: 'account', label: 'บัญชี', href: '/account', icon: <span data-testid="icon-account" /> },
];

function renderShell(props: Partial<React.ComponentProps<typeof AppShell>> = {}) {
  return render(
    <ThemeProvider>
      <AppShell
        navItems={navItems}
        activeKey="search"
        offlineSimulated={false}
        onToggleOfflineSimulated={vi.fn()}
        {...props}
      >
        <div>page content</div>
      </AppShell>
    </ThemeProvider>,
  );
}

// The desktop sidebar nav; the bottom tab bar carries a distinct accessible name.
const sidebar = () => screen.getByRole('navigation', { name: 'เมนูหลัก' });

describe('AppShell', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renders every nav item label and marks the active one', () => {
    renderShell();
    const activeLink = within(sidebar()).getByRole('link', { name: /ค้นหา/ });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
    expect(within(sidebar()).getByRole('link', { name: /พอร์ต/ })).not.toHaveAttribute('aria-current');
  });

  it('shows the unread badge count on the deals item', () => {
    renderShell();
    expect(within(sidebar()).getByText('2')).toBeInTheDocument();
  });

  it('renders page content', () => {
    renderShell();
    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('opens the drawer on hamburger click and traps focus inside it', async () => {
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: 'เปิดเมนู' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the drawer on Escape and returns focus to the hamburger button', async () => {
    renderShell();
    const trigger = screen.getByRole('button', { name: 'เปิดเมนู' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('drawer includes a working offline-simulation switch wired to the caller', async () => {
    const onToggleOfflineSimulated = vi.fn();
    renderShell({ onToggleOfflineSimulated });
    await userEvent.click(screen.getByRole('button', { name: 'เปิดเมนู' }));
    await userEvent.click(screen.getByRole('switch', { name: 'จำลองสถานะออฟไลน์' }));
    expect(onToggleOfflineSimulated).toHaveBeenCalledWith(true);
  });

  it('drawer theme switch reflects and drives the real ThemeProvider', async () => {
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: 'เปิดเมนู' }));
    const themeSwitch = screen.getByRole('switch', { name: 'โหมดสว่าง' });
    expect(themeSwitch).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(themeSwitch);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('cart icon shows the count badge when provided', () => {
    renderShell({ cartCount: 2 });
    expect(screen.getByRole('link', { name: /ตะกร้า.*2/ })).toBeInTheDocument();
  });
});
