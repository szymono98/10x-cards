import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SupabaseProvider } from '@/lib/providers/supabase-provider';
import { Suspense } from 'react';

// Konfiguracja runtime
export const runtime = 'edge';
export const preferredRegion = 'all';
// Używamy auto dla lepszej elastyczności
export const dynamic = 'auto';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  preload: true,
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  preload: true,
  display: 'swap',
});

export const metadata: Metadata = {
  title: '10x Cards',
  description: 'Generate flashcards with AI',
  metadataBase: new URL('https://10x-cards.pages.dev'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <SupabaseProvider>{children}</SupabaseProvider>
        </Suspense>
      </body>
    </html>
  );
}
