'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const SERVICE_LINKS = [
  { href: '/coworking', label: 'Coworking' },
  { href: '/virtual-office', label: 'Virtual office' },
  { href: '/printing', label: 'Printing' },
  { href: '/graphic-design', label: 'Graphic design' },
  { href: '/events', label: 'Events' },
];

export function Masthead() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function closeAll() {
    setOpen(false);
    setServicesOpen(false);
  }

  useEffect(() => {
    if (!servicesOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) setServicesOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setServicesOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [servicesOpen]);

  return (
    <header className="masthead">
      <div className="masthead-inner">
        <Link href="/" className="masthead-logo" onClick={closeAll}>
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
          <Link href="/the-space" onClick={closeAll}>
            The space
          </Link>

          <div className={`nav-dropdown ${servicesOpen ? 'is-open' : ''}`} ref={dropdownRef}>
            <button
              type="button"
              className="nav-dropdown-toggle"
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              onClick={() => setServicesOpen((v) => !v)}
            >
              Services
            </button>
            <div className="nav-dropdown-menu">
              {SERVICE_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={closeAll}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/location" onClick={closeAll}>
            Location
          </Link>
          <Link href="/get-in-touch" onClick={closeAll}>
            Get in touch
          </Link>
          <Link href="/account" className="nav-account" onClick={closeAll}>
            Manage membership
          </Link>
        </nav>
      </div>
    </header>
  );
}
