import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchField } from './search-field';

const meta: Meta<typeof SearchField> = { title: 'Forms/SearchField', component: SearchField };
export default meta;
type Story = StoryObj<typeof SearchField>;

function EmptyStory() {
  const [value, setValue] = useState('');
  return <SearchField value={value} onChange={setValue} placeholder="ค้นหาการ์ด, เซ็ต, หรือผู้เล่น" />;
}

function WithValueStory() {
  const [value, setValue] = useState('Charizard');
  return <SearchField value={value} onChange={setValue} placeholder="ค้นหาการ์ด, เซ็ต, หรือผู้เล่น" />;
}

export const Empty: Story = {
  render: () => <EmptyStory />,
};

export const WithValue: Story = {
  render: () => <WithValueStory />,
};
