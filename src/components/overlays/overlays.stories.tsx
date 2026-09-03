import type { Meta, StoryObj } from '@storybook/react';
import { BottomSheet } from './bottom-sheet';
import { Dialog } from './dialog';
import { PermissionModal } from './permission-modal';
import { OfflineBanner } from './offline-banner';

const meta: Meta = { title: 'Overlays/BottomSheet+Dialog' };
export default meta;

export const Sheet: StoryObj = {
  render: () => (
    <BottomSheet open onClose={() => {}} title="ยืนยันการเสนอราคา" description="ตรวจสอบก่อนส่ง">
      <p className="text-body text-text-2">form content</p>
    </BottomSheet>
  ),
};

export const CenteredDialog: StoryObj = {
  render: () => (
    <Dialog open onClose={() => {}} title="ยกเลิกข้อเสนอ?" description="การกระทำนี้ไม่สามารถย้อนกลับได้">
      <p className="text-body text-text-2">confirmation content</p>
    </Dialog>
  ),
};

export const CameraPermission: StoryObj = {
  render: () => (
    <PermissionModal
      open
      onClose={() => {}}
      icon={<span style={{ fontSize: 40 }}>📷</span>}
      title="อนุญาตให้ใช้กล้อง"
      description="เพื่อสแกนการ์ดของคุณ"
      onAllow={() => {}}
      onDeny={() => {}}
    />
  ),
};

export const Offline: StoryObj = { render: () => <OfflineBanner offline /> };
