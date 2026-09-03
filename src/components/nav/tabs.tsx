'use client';

import { cn } from '@/lib/cn';

export interface Tab {
  key: string;
  label: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex gap-1 rounded-xl bg-surface p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === activeKey}
          onClick={() => onChange(tab.key)}
          className={cn(
            'tap-target flex-1 rounded-lg px-3 text-label',
            tab.key === activeKey ? 'bg-bg text-text shadow-sm' : 'text-muted-text',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
