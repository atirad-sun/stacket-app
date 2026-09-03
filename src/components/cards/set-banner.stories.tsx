import type { Meta, StoryObj } from '@storybook/react';
import { SetBannerCard } from './set-banner';
import { StatCards } from './stat-cards';

const meta: Meta = { title: 'Cards/SetBannerCard+StatCards' };
export default meta;

export const Banner: StoryObj = {
  render: () => (
    <SetBannerCard name="Champion's Path" publisher="The Pokémon Company" imageAlt="Champion's Path" verified />
  ),
};

export const Stats: StoryObj = {
  render: () => (
    <StatCards
      stats={[
        { label: 'ราคาต่ำสุด', value: '฿1,200' },
        { label: 'จำนวนการ์ด', value: '73 ใบ' },
        { label: 'มูลค่ารวม', value: '฿2.4M' },
      ]}
    />
  ),
};
