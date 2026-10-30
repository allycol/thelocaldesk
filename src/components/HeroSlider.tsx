'use client';

import { useEffect, useState } from 'react';

const SLIDES = [
  { src: '/images/services/coworking-hero.jpg', alt: 'Members at their desks in the coworking space', position: 'center 55%' },
  { src: '/images/home-banner.jpg', alt: 'Members working at The Local Desk', position: 'center' },
  { src: '/images/services/events-hero.jpg', alt: 'A talk in progress in the events space', position: 'center 35%' },
];

const INTERVAL_MS = 6000;

// Crossfading banner for the homepage. Auto-advances, pauses while hovered or
// focused, and doesn't auto-advance at all for visitors who prefer reduced
// motion (they can still use the dots).
export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, index]);

  return (
    <div
      className="hero-slider"
      role="group"
      aria-roledescription="carousel"
      aria-label="Photos of The Local Desk"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          className={`hero-slide${i === index ? ' is-active' : ''}`}
          style={{ objectPosition: slide.position }}
          aria-hidden={i !== index}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}
      <div className="hero-slider-dots">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show photo ${i + 1} of ${SLIDES.length}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
