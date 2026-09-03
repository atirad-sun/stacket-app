'use client';

import { useState } from 'react';
import { Overlay } from '@/primitives/overlay';
import { useTheme } from '@/theme/use-theme';
import { Switch } from './switch';
import { cn } from '@/lib/cn';

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface AppShellProps {
  navItems: NavItem[];
  activeKey: string;
  cartCount?: number;
  userInitials?: string;
  offlineSimulated: boolean;
  onToggleOfflineSimulated: (next: boolean) => void;
  children: React.ReactNode;
}

const PRIMARY_TAB_KEYS = ['search', 'portfolio', 'sell', 'deals', 'account'];

export function AppShell({
  navItems,
  activeKey,
  cartCount,
  userInitials,
  offlineSimulated,
  onToggleOfflineSimulated,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const primaryTabs = navItems.filter((item) => PRIMARY_TAB_KEYS.includes(item.key));

  return (
    <div className="min-h-dvh bg-bg text-text">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-heading">stacket</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/cart"
            aria-label={cartCount ? `ตะกร้า ${cartCount} รายการ` : 'ตะกร้า'}
            className="tap-target relative flex items-center justify-center rounded-full"
          >
            <span aria-hidden="true">🛒</span>
            {cartCount ? (
              <span className="absolute -top-1 -right-1 rounded-full bg-primary px-1.5 text-[11px] text-on-primary text-numeric">
                {cartCount}
              </span>
            ) : null}
          </a>
          {userInitials ? (
            <span className="tap-target flex items-center justify-center rounded-full bg-surface-2 text-label text-text-2">
              {userInitials}
            </span>
          ) : null}
          <button
            type="button"
            aria-label="เปิดเมนู"
            onClick={() => setDrawerOpen(true)}
            className="tap-target flex items-center justify-center rounded-full"
          >
            <span aria-hidden="true">☰</span>
          </button>
        </div>
      </header>

      <div className="flex">
        <nav
          aria-label="เมนูหลัก"
          className="hidden w-56 shrink-0 flex-col gap-1 border-r border-border p-4 sm:flex"
        >
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              aria-current={item.key === activeKey ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-label',
                item.key === activeKey ? 'bg-primary-tint text-accent-text' : 'text-text-2',
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge ? (
                <span className="ml-auto rounded-full bg-pos px-1.5 text-[11px] text-on-primary text-numeric">
                  {item.badge}
                </span>
              ) : null}
            </a>
          ))}
        </nav>

        <main className="min-h-dvh flex-1 pb-16 sm:pb-0">{children}</main>
      </div>

      <nav
        aria-label="เมนูหลักสำหรับอุปกรณ์พกพา"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-bg sm:hidden"
      >
        {primaryTabs.map((item) => (
          <a
            key={item.key}
            href={item.href}
            aria-current={item.key === activeKey ? 'page' : undefined}
            className={cn(
              'tap-target relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]',
              item.key === activeKey ? 'text-accent-text' : 'text-muted-text',
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge ? (
              <span className="absolute top-1 right-1/4 rounded-full bg-pos px-1.5 text-[10px] text-on-primary text-numeric">
                {item.badge}
              </span>
            ) : null}
          </a>
        ))}
      </nav>

      <Overlay open={drawerOpen} onClose={() => setDrawerOpen(false)} labelledBy="app-shell-drawer-title">
        <div style={{ boxShadow: '-8px 0 24px var(--drawer-shadow)' }} className="flex flex-col gap-1">
          <h2 id="app-shell-drawer-title" className="text-heading mb-3">
            stacket
          </h2>
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-label text-text"
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge ? (
                <span className="ml-auto rounded-full bg-pos px-1.5 text-[11px] text-on-primary text-numeric">
                  {item.badge}
                </span>
              ) : null}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-label text-text">จำลองสถานะออฟไลน์</span>
              <Switch checked={offlineSimulated} onChange={onToggleOfflineSimulated} label="จำลองสถานะออฟไลน์" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-label text-text">โหมดสว่าง</span>
              <Switch
                checked={theme === 'light'}
                onChange={(next) => setTheme(next ? 'light' : 'dark')}
                label="โหมดสว่าง"
              />
            </div>
          </div>
        </div>
      </Overlay>
    </div>
  );
}
