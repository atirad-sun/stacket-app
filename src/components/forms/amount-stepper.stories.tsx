import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AmountStepper } from './amount-stepper';

const meta: Meta<typeof AmountStepper> = { title: 'Forms/AmountStepper', component: AmountStepper };
export default meta;
type Story = StoryObj<typeof AmountStepper>;

function OfferAmountStory() {
  const [value, setValue] = useState(35000);
  return (
    <AmountStepper
      value={value}
      onChange={setValue}
      step={500}
      min={0}
      formatLabel={(v) => `฿${v.toLocaleString('en-US')}`}
    />
  );
}

export const OfferAmount: Story = {
  render: () => <OfferAmountStory />,
};
