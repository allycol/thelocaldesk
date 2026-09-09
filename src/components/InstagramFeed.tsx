'use client';

import Script from 'next/script';

declare global {
  interface Window {
    iFrameSetup?: (frame: HTMLIFrameElement) => void;
  }
}

const FEED_SRC = 'https://app.mirror-app.com/feed-instagram/81f0d370-d076-4a74-94c5-6b762a1f9940/preview';

export function InstagramFeed() {
  return (
    <>
      <iframe
        src={FEED_SRC}
        style={{ width: '100%', border: 'none', overflow: 'hidden' }}
        scrolling="no"
        onLoad={(e) => window.iFrameSetup?.(e.currentTarget)}
        title="The Local Desk on Instagram"
      />
      <Script src="https://cdn.jsdelivr.net/npm/@mirrorapp/iframe-bridge@latest/dist/index.umd.js" strategy="afterInteractive" />
    </>
  );
}
