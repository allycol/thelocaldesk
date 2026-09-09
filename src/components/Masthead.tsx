'use client';

import Link from 'next/link';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/where-we-are', label: 'Where we are' },
  { href: '/get-in-touch', label: 'Get in touch' },
];

export function Masthead() {
  const [open, setOpen] = useState(false);

  return (
    <header className="masthead">
      <div className="masthead-inner">
        <Link href="/" className="masthead-logo" onClick={() => setOpen(false)}>
          <img
            src="/images/thelocaldesk-logo.svg"
            alt="The Local Desk"
            width={48}
            height={50}
            className="masthead-logo-mobile"
          />
          <img
            src="/images/thelocaldesk-logo-wide.svg"
            alt="The Local Desk"
            width={245}
            height={60}
            className="masthead-logo-desktop"
          />
        </Link>

        <button
          className="masthead-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`masthead-nav ${open ? 'is-open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
