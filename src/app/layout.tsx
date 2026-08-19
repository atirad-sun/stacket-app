import type { Metadata } from 'next';
import { ThemeProvider } from '@/theme/theme-provider';
import { themeScript } from '@/theme/theme-script';
import './globals.css';

export const metadata: Metadata = {
  title: 'stacket',
  description: 'ตลาดซื้อขายการ์ดสะสมสำหรับนักสะสมในประเทศไทย',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg text-text">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
