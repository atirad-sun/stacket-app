import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermissionModal } from '@/components/overlays/permission-modal';

describe('PermissionModal', () => {
  it('renders the icon, title, and description', () => {
    render(
      <PermissionModal
        open
        onClose={vi.fn()}
        icon={<span data-testid="cam-icon" />}
        title="อนุญาตให้ใช้กล้อง"
        description="เพื่อสแกนการ์ดของคุณ"
        onAllow={vi.fn()}
        onDeny={vi.fn()}
      />,
    );
    expect(screen.getByTestId('cam-icon')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'อนุญาตให้ใช้กล้อง' })).toBeInTheDocument();
    expect(screen.getByText('เพื่อสแกนการ์ดของคุณ')).toBeInTheDocument();
  });

  it('calls onAllow and onDeny from their default-labelled buttons', async () => {
    const onAllow = vi.fn();
    const onDeny = vi.fn();
    render(
      <PermissionModal
        open
        onClose={vi.fn()}
        icon={<span />}
        title="x"
        description="x"
        onAllow={onAllow}
        onDeny={onDeny}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'อนุญาต' }));
    expect(onAllow).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'ไม่อนุญาต' }));
    expect(onDeny).toHaveBeenCalledOnce();
  });

  it('accepts custom button labels', () => {
    render(
      <PermissionModal
        open
        onClose={vi.fn()}
        icon={<span />}
        title="x"
        description="x"
        onAllow={vi.fn()}
        onDeny={vi.fn()}
        allowLabel="เปิดใช้งาน"
        denyLabel="ภายหลัง"
      />,
    );
    expect(screen.getByRole('button', { name: 'เปิดใช้งาน' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ภายหลัง' })).toBeInTheDocument();
  });
});
