import type { Meta, StoryObj } from '@storybook/react';
import { DealRow } from './deal-row';
import { ListingRow } from './listing-row';

const meta: Meta = { title: 'Cards/DealRow+ListingRow' };
export default meta;

export const AwaitingResponse: StoryObj = {
  render: () => (
    <DealRow
      dealId="#ST-24902"
      imageAlt="Mewtwo GX"
      cardName="Mewtwo GX (Rainbow Rare)"
      role="seller"
      counterpartyName="cardhunter_99"
      price="฿18,500"
      relativeTimeLabel="5 นาที"
      status={{ label: 'ข้อเสนอใหม่', tone: 'warn' }}
      unreadCount={1}
    />
  ),
};

export const EscrowHeld: StoryObj = {
  render: () => (
    <DealRow
      dealId="#ST-24815"
      imageAlt="Charizard VMAX"
      cardName="Charizard VMAX (Rainbow Rare)"
      role="buyer"
      counterpartyName="KanaCards"
      price="฿39,500"
      relativeTimeLabel="2 นาที"
      status={{ label: 'รอผู้ขายตอบรับ', tone: 'pos' }}
      escrowLabel="เงินถูกเก็บไว้อย่างปลอดภัย ฿40,548"
    />
  ),
};

export const Listing: StoryObj = {
  render: () => <ListingRow imageAlt="Charizard VMAX" name="Charizard VMAX" sellerName="KanaCards" price="฿39,500" verified />,
};
