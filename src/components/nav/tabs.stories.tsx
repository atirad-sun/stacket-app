import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs } from './tabs';

const meta: Meta<typeof Tabs> = { title: 'Nav/Tabs', component: Tabs };
export default meta;
type Story = StoryObj<typeof Tabs>;

const tabs = [
  { key: 'overview', label: 'ภาพรวม' },
  { key: 'condition', label: 'ราคาตามสภาพ' },
  { key: 'attributes', label: 'คุณสมบัติ' },
  { key: 'listings', label: 'รายการขาย' },
];

function CardDetailTabsDemo() {
  const [active, setActive] = useState('overview');
  return <Tabs tabs={tabs} activeKey={active} onChange={setActive} />;
}

export const CardDetailTabs: Story = {
  render: () => <CardDetailTabsDemo />,
};
