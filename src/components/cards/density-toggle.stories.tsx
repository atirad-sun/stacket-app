import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DensityToggle } from './density-toggle';

const meta: Meta<typeof DensityToggle> = { title: 'Cards/DensityToggle', component: DensityToggle };
export default meta;
type Story = StoryObj<typeof DensityToggle>;

function DefaultComponent() {
  const [value, setValue] = useState<'list' | 'grid'>('list');
  return <DensityToggle value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: () => <DefaultComponent />,
};
