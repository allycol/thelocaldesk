import type { Metadata } from 'next';
import { Fira_Mono } from 'next/font/google';
import Script from 'next/script';
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
  description: 'Coworking memberships, day passes, and collaboration areas.',
};

// Google Analytics 4 measurement ID (public, not a secret).
const GA_ID = 'G-XWFKQ5PY03';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <head>
        {/* Effra (Adobe/Typekit) — used for H1s only, see globals.css */}
        <link rel="stylesheet" href="https://use.typekit.net/rva1hkc.css" />

        {/* Favicon: separate light/dark-mode marks, picked via prefers-color-scheme
            (favicon.ico is the static fallback for browsers/crawlers that ignore media
            queries on <link rel="icon">). Apple's webclip icon has no reliable dark-mode
            variant across iOS versions, so it always uses the full light-mode monogram. */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-light-16.png"
          sizes="16x16"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-light-32.png"
          sizes="32x32"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-dark-16.png"
          sizes="16x16"
          media="(prefers-color-scheme: dark)"
        />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-dark-32.png"
          sizes="32x32"
          media="(prefers-color-scheme: dark)"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={firaMono.variable}>
        <Masthead />
        {children}
        <SubscribeSection />
        <Footer />

        {/* Google Analytics (gtag.js). Only reports from the real domain, so
            local dev and the GoDaddy Preview URL don't pollute the data.
            Page views on client-side navigation are picked up automatically
            via GA4's built-in history-change tracking. */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            if (/(^|\\.)thelocaldesk\\.au$/.test(location.hostname)) gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
