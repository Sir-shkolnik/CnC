import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MainNavigation } from '@/components/navigation/MainNavigation';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'C&C CRM - Trust the Journey',
  description: 'Mobile-first operations management for moving & logistics',
  manifest: '/manifest.json',
  themeColor: '#00C2FF',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'C&C CRM'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MainNavigation>
          {children}
        </MainNavigation>
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