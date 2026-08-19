import type { Preview } from '@storybook/react';
import { useEffect } from 'react';
import { ThemeProvider } from '../src/theme/theme-provider';
import { ToastProvider } from '../src/primitives/toast';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: 'Mobile 375', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet 768', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop 1440', styles: { width: '1440px', height: '900px' } },
      },
      defaultViewport: 'mobile',
    },
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } },
  },
  globalTypes: {
    theme: {
      description: 'Colour theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as 'light' | 'dark';
      useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
      }, [theme]);
      return (
        <ThemeProvider>
          <ToastProvider>
            <div className="min-h-dvh bg-bg p-4 text-body text-text">
              <Story />
            </div>
          </ToastProvider>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
