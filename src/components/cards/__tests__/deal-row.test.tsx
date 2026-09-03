import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DealRow } from '@/components/cards/deal-row';

describe('DealRow', () => {
  it('renders the deal id, card name, counterparty role/name, price, and relative time', () => {
    render(
      <DealRow
        dealId="#ST-24902"
        imageAlt="x"
        cardName="Mewtwo GX (Rainbow Rare)"
        role="seller"
        counterpartyName="cardhunter_99"
        price="฿18,500"
        relativeTimeLabel="5 นาที"
        status={{ label: 'ข้อเสนอใหม่', tone: 'warn' }}
      />,
    );
    expect(screen.getByText('#ST-24902')).toBeInTheDocument();
    expect(screen.getByText('Mewtwo GX (Rainbow Rare)')).toBeInTheDocument();
    expect(screen.getByText('คุณเป็นผู้ขาย · cardhunter_99')).toBeInTheDocument();
    expect(screen.getByText('฿18,500')).toBeInTheDocument();
    expect(screen.getByText('5 นาที')).toBeInTheDocument();
  });

  it('renders the status pill with both text and a tone (never colour alone)', () => {
    render(
      <DealRow
        dealId="x"
        imageAlt="x"
        cardName="x"
        role="buyer"
        counterpartyName="x"
        price="฿0"
        relativeTimeLabel="x"
        status={{ label: 'รอผู้ขายตอบรับ', tone: 'pos' }}
      />,
    );
    const pill = screen.getByText('รอผู้ขายตอบรับ');
    expect(pill).toHaveClass('bg-pos-tint');
  });

  it('renders the unread badge when unreadCount is set', () => {
    render(
      <DealRow
        dealId="x"
        imageAlt="x"
        cardName="x"
        role="buyer"
        counterpartyName="x"
        price="฿0"
        relativeTimeLabel="x"
        status={{ label: 'x', tone: 'neutral' }}
        unreadCount={2}
      />,
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders the escrow line with a lock icon when escrowLabel is set, and omits it otherwise', () => {
    const { rerender } = render(
      <DealRow
        dealId="x"
        imageAlt="x"
        cardName="x"
        role="buyer"
        counterpartyName="x"
        price="฿0"
        relativeTimeLabel="x"
        status={{ label: 'x', tone: 'neutral' }}
      />,
    );
    expect(screen.queryByRole('img', { name: 'เงินถูกเก็บไว้ในระบบ escrow' })).toBeNull();
    rerender(
      <DealRow
        dealId="x"
        imageAlt="x"
        cardName="x"
        role="buyer"
        counterpartyName="x"
        price="฿0"
        relativeTimeLabel="x"
        status={{ label: 'x', tone: 'neutral' }}
        escrowLabel="เงินถูกเก็บไว้อย่างปลอดภัย ฿40,548"
      />,
    );
    expect(screen.getByRole('img', { name: 'เงินถูกเก็บไว้ในระบบ escrow' })).toBeInTheDocument();
    expect(screen.getByText('เงินถูกเก็บไว้อย่างปลอดภัย ฿40,548')).toBeInTheDocument();
  });

  it('calls onClick when tapped', async () => {
    const onClick = vi.fn();
    render(
      <DealRow
        dealId="x"
        imageAlt="x"
        cardName="x"
        role="buyer"
        counterpartyName="x"
        price="฿0"
        relativeTimeLabel="x"
        status={{ label: 'x', tone: 'neutral' }}
        onClick={onClick}
      />,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
