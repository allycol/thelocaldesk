import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Local Desk',
  description: 'Coworking memberships, day passes, and meeting rooms.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
