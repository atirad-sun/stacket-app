import type { Metadata } from 'next';
import { Anuphan, IBM_Plex_Mono } from 'next/font/google';
import { ThemeProvider } from '@/theme/theme-provider';
import { themeScript } from '@/theme/theme-script';
import './globals.css';

const anuphan = Anuphan({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-anuphan',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'stacket',
  description: 'ตลาดซื้อขายการ์ดสะสมสำหรับนักสะสมในประเทศไทย',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${anuphan.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg text-text text-body">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
