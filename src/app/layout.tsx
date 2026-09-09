import type { Metadata } from 'next';
import { Fira_Mono } from 'next/font/google';
import './globals.css';
import { Masthead } from '@/components/Masthead';
import { SubscribeSection } from '@/components/SubscribeSection';
import { Footer } from '@/components/Footer';

const firaMono = Fira_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-fira-mono',
});

export const metadata: Metadata = {
  title: 'The Local Desk',
  description: 'Coworking memberships, day passes, and meeting rooms.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <head>
        {/* Effra (Adobe/Typekit) — used for H1s only, see globals.css */}
        <link rel="stylesheet" href="https://use.typekit.net/rva1hkc.css" />
      </head>
      <body className={firaMono.variable}>
        <Masthead />
        {children}
        <SubscribeSection />
        <Footer />
      </body>
    </html>
  );
}
