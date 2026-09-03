import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CarrierPicker } from './carrier-picker';

const carriers = [
  { key: 'kerry', name: 'Kerry Express', etaLabel: '1-2 วัน', priceLabel: '฿40' },
  { key: 'thaipost', name: 'ไปรษณีย์ไทย', etaLabel: '3-5 วัน', priceLabel: '฿30' },
  { key: 'flash', name: 'Flash Express', etaLabel: '1 วัน', priceLabel: '฿45' },
];

function CarrierPickerDefault() {
  const [selected, setSelected] = useState('kerry');
  return <CarrierPicker carriers={carriers} selectedKey={selected} onChange={setSelected} />;
}

const meta: Meta<typeof CarrierPicker> = { title: 'Forms/CarrierPicker', component: CarrierPicker };
export default meta;
type Story = StoryObj<typeof CarrierPicker>;

export const Default: Story = {
  render: () => <CarrierPickerDefault />,
};
