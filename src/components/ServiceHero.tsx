import type { ReactNode } from 'react';

// Hero banner + H1 + intro copy shared by the service pages. Kept short on
// purpose — the product listing follows straight after and shouldn't be
// pushed far down the page. Use inside `<main className="service-page has-hero">`.
export function ServiceHero({
  title,
  image,
  position = 'center',
  children,
}: {
  title: string;
  image: string;
  position?: string; // CSS object-position, to keep the subject in the crop
  children: ReactNode;
}) {
  return (
    <>
      <div className="service-banner">
        <img src={image} alt="" style={{ objectPosition: position }} />
      </div>
      <div className="container service-intro">
        <h1>{title}</h1>
        <p className="subtitle">{children}</p>
      </div>
    </>
  );
}
