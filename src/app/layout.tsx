import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'stacket',
  description: 'ตลาดซื้อขายการ์ดสะสมสำหรับนักสะสมในประเทศไทย',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
