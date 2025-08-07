import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SmartNavigation } from '@/components/SmartNavigation/SmartNavigation';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'C&C CRM - Trust the Journey',
  description: 'Mobile-first operations management for moving & logistics',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'C&C CRM'
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'C&C CRM'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#00C2FF'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SmartNavigation>
          {children}
        </SmartNavigation>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E1E1E',
              color: '#EAEAEA',
              border: '1px solid #333',
            },
            success: {
              iconTheme: {
                primary: '#19FFA5',
                secondary: '#1E1E1E',
              },
            },
            error: {
              iconTheme: {
                primary: '#F44336',
                secondary: '#1E1E1E',
              },
            },
          }}
        />
      </body>
    </html>
  );
} 