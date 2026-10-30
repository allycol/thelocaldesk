import type { ReactNode } from 'react';
import type { ProductCategory } from '@/lib/products';

// Simple line icons for the homepage category cards. Drawn with
// currentColor so the card CSS controls the colour.
const PATHS: Partial<Record<ProductCategory, ReactNode>> = {
  // Desk with monitor
  full_time: (
    <>
      <rect x="6" y="4" width="20" height="13" rx="1.5" />
      <path d="M16 17v4M11 21h10M3 27h26M7 27v-3h18v3" />
    </>
  ),
  // Calendar
  flexible: (
    <>
      <rect x="4" y="6" width="24" height="21" rx="2" />
      <path d="M4 13h24M10 3v6M22 3v6M10 18h4M18 18h4M10 22h4" />
    </>
  ),
  // Clock — drop in for the day
  daily: (
    <>
      <circle cx="16" cy="16" r="12" />
      <path d="M16 9v7l5 3" />
    </>
  ),
  // Envelope — business address and mail
  virtual: (
    <>
      <rect x="3" y="7" width="26" height="18" rx="2" />
      <path d="M3.5 8.5L16 18l12.5-9.5" />
    </>
  ),
};

export function CategoryIcon({ category }: { category: ProductCategory }) {
  const paths = PATHS[category];
  if (!paths) return null;
  return (
    <svg
      className="teaser-icon"
      viewBox="0 0 32 32"
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}
