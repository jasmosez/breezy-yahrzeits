import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Breezy Yahrzeits',
  description: 'Yahrzeit management system for Breeze ChMS users',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 