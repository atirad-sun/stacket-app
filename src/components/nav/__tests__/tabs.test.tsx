import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@/components/nav/tabs';

const tabs = [
  { key: 'cards', label: 'การ์ด' },
  { key: 'sets', label: 'เซ็ต' },
];

describe('Tabs', () => {
  it('renders each tab as a tab role with the active one marked selected', () => {
    render(<Tabs tabs={tabs} activeKey="cards" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'การ์ด' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'เซ็ต' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with the clicked tab key', async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeKey="cards" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'เซ็ต' }));
    expect(onChange).toHaveBeenCalledWith('sets');
  });

  it('wraps the tabs in a tablist', () => {
    render(<Tabs tabs={tabs} activeKey="cards" onChange={vi.fn()} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { axe } = await import('vitest-axe');
    const { container } = render(<Tabs tabs={tabs} activeKey="cards" onChange={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
