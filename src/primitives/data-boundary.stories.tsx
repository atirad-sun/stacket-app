import type { Meta, StoryObj } from '@storybook/react';
import { DataBoundary } from './data-boundary';
import { Skeleton } from './skeleton';

const meta: Meta<typeof DataBoundary<string[]>> = {
  title: 'Primitives/DataBoundary',
  component: DataBoundary,
};

export default meta;
type Story = StoryObj<typeof DataBoundary<string[]>>;

const shared = {
  skeleton: <Skeleton height="3rem" />,
  empty: <p>ยังไม่มีการ์ดในพอร์ต — เพิ่มใบแรกของคุณ</p>,
  children: (data: string[]) => <ul>{data.map((d) => <li key={d}>{d}</li>)}</ul>,
};

export const Loading: Story = { args: { ...shared, state: { status: 'loading' } } };
export const Empty: Story = { args: { ...shared, state: { status: 'empty' } } };
export const Error: Story = {
  args: {
    ...shared,
    state: { status: 'error', message: 'เชื่อมต่อไม่สำเร็จ', retry: () => {} },
  },
};
export const Offline: Story = { args: { ...shared, state: { status: 'offline' } } };
export const Ready: Story = {
  args: { ...shared, state: { status: 'ready', data: ['Charizard VMAX', 'Umbreon VMAX'] } },
};
