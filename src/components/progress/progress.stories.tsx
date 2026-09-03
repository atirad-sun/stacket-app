import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from './stepper';
import { Timeline } from './timeline';

const meta: Meta = { title: 'Progress/Stepper+Timeline' };
export default meta;

export const SellFlowStep1: StoryObj = { render: () => <Stepper totalSteps={3} currentStep={1} /> };

export const DealTimeline: StoryObj = {
  render: () => (
    <Timeline
      steps={[
        { label: 'ยอมรับข้อเสนอ', status: 'done' },
        { label: 'จัดส่ง', status: 'current' },
        { label: 'ชำระเงิน', status: 'upcoming' },
      ]}
    />
  ),
};
