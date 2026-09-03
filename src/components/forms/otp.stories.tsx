import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { OTPInput } from './otp-input';
import { Keypad } from './keypad';

const meta: Meta = { title: 'Forms/OTP' };
export default meta;

function ComposedDemo() {
  const [value, setValue] = useState('12');
  return (
    <div className="flex flex-col items-center gap-6">
      <OTPInput value={value} length={6} />
      <Keypad
        onDigit={(d) => setValue((v) => (v.length < 6 ? v + d : v))}
        onBackspace={() => setValue((v) => v.slice(0, -1))}
      />
    </div>
  );
}

export const Composed: StoryObj = {
  render: () => <ComposedDemo />,
};
