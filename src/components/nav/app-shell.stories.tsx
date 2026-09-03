import type { Meta, StoryObj } from '@storybook/react';
import { AppShell, type NavItem } from './app-shell';

const navItems: NavItem[] = [
  { key: 'search', label: 'ค้นหา', href: '#', icon: <span>🔍</span> },
  { key: 'portfolio', label: 'พอร์ต', href: '#', icon: <span>💼</span> },
  { key: 'sell', label: 'ลงขาย', href: '#', icon: <span>➕</span> },
  { key: 'deals', label: 'ดีล', href: '#', icon: <span>💬</span>, badge: 2 },
  { key: 'account', label: 'บัญชี', href: '#', icon: <span>👤</span> },
];

const meta: Meta<typeof AppShell> = {
  title: 'Nav/AppShell',
  component: AppShell,
};
export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {
  args: {
    navItems,
    activeKey: 'search',
    cartCount: 2,
    userInitials: 'SZ',
    offlineSimulated: false,
    onToggleOfflineSimulated: () => {},
    children: <div className="p-4">page content</div>,
  },
};
