import Link from 'next/link';
import { CATEGORY_INFO, CATEGORY_LABELS, CATEGORY_ORDER, getProducts, productsByCategory } from '@/lib/products';

// Products are managed in Stripe, not this codebase — fetch on every
// request rather than at build time. `revalidate` alone still statically
// prerenders once during `next build`, which fails on hosts (like
// GoDaddy Node.js Hosting) that don't inject secrets until the app
// actually starts — `force-dynamic` skips build-time generation entirely.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="hero">
      <div className="container">
        <h1>
          A coworking space for <span className="accent">everyone</span>.
        </h1>
        <p>
          A thoughtfully considered shared workspace: hot-desks, dedicated workstations &amp; collaboration
          areas. Work, meet, create together.
        </p>
        <Link href="/pricing" className="hero-cta">
          View pricing
        </Link>
      </div>

      <div className="home-banner">
        <img src="/images/home-banner.jpg" alt="Members working at The Local Desk" />
      </div>

      <div className="container">
        <div className="section-heading">
          <h2>Find your space</h2>
          <Link href="/pricing">View all pricing →</Link>
        </div>
        <div className="teaser-grid">
          {CATEGORY_ORDER.map((category) => {
            const items = productsByCategory(products, category);
            if (items.length === 0) return null;
            const fromAmount = Math.min(...items.map((p) => p.unitAmount)) / 100;
            const fromPrice = Number.isInteger(fromAmount) ? `$${fromAmount}` : `$${fromAmount.toFixed(2)}`;
            const info = CATEGORY_INFO[category];

            return (
              <Link href={`/pricing?category=${category}`} className="teaser-card" key={category}>
                {info.image && (
                  <div className="teaser-image">
                    <img src={info.image} alt="" />
                  </div>
                )}
                <div className="teaser-body">
                  <h3>{CATEGORY_LABELS[category]}</h3>
                  <p className="teaser-description">{info.description}</p>
                  <span className="from-price">From {fromPrice}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="container">
        <section className="founder-note">
          <div className="founder-photo">
            <img src="/images/founder-photo.jpg" alt="Ally, founder of The Local Desk" />
          </div>
          <div className="founder-text">
            <h2>A note from Ally</h2>
            <div className="founder-note-body">
              <p>
                There was a time when working from home felt like the dream: no commute, no small talk
                you didn&rsquo;t ask for, the freedom to build your own day from scratch. We all craved
                it. And then we got it, in abundance, and something unexpected happened. We missed
                people.
              </p>
              <p>
                We&rsquo;ve come full circle. It turns out being around others, a hello at the kettle,
                overhearing someone else&rsquo;s small win, feeling like part of something bigger than
                your kitchen table, isn&rsquo;t a distraction from good work. It&rsquo;s part of what
                makes work good. Working in silo, it seems, was never quite the upgrade we thought it
                was. We lost the sense of belonging that comes from simply being around other people,
                even if we never noticed it was missing until it was gone.
              </p>
              <p>
                I&rsquo;ve lived both sides of this. As a creative, I spent years moving between
                coworking spaces, drawing energy from being around other people building their own
                things. Then, for the last ten years, I worked remotely, mostly on my own. That decade
                taught me more about what actually makes a good work day than any year before it. I
                learned that focus needs a container, that a win feels different when someone&rsquo;s
                nearby to notice it, and that the best ideas rarely turn up in isolation. They show up
                in conversation, in the in-between moments, in the company of people also trying to
                build something.
              </p>
              <p>
                The Local Desk is what I built from all of that. It&rsquo;s a way to draw a proper line
                between work and home life, so home can go back to being home, no more running a
                meeting and a household at the same time. It&rsquo;s for anyone who&rsquo;s had enough
                of working alone and missed the buzz of an office: not the commute, not the fluorescent
                lights, just the energy of people, focused, in one room. It&rsquo;s a place where
                achievement thrives because it&rsquo;s shared, where we collaborate, help each other
                out, swap ideas and knowledge, and quietly inspire one another just by getting on with
                it.
              </p>
              <p>I built this space because I needed it myself. I hope you find here what I was looking for.</p>
            </div>
            <p className="founder-signature">— Ally, Founder</p>
          </div>
        </section>
      </div>
    </main>
  );
}
