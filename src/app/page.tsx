import Link from 'next/link';
import { CategoryIcon } from '@/components/CategoryIcon';
import { HeroSlider } from '@/components/HeroSlider';
import { CATEGORY_INFO, CATEGORY_LABELS, HOME_CATEGORY_ORDER, categoryHref, getProducts, productsByCategory } from '@/lib/products';

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
        <Link href="/coworking" className="hero-cta">
          View pricing
        </Link>
      </div>

      <div className="home-banner">
        <HeroSlider />
      </div>

      <div className="container">
        <div className="section-heading">
          <div>
            <h2>Find your space</h2>
            <p className="section-intro">
              Whether you need a desk of your own every day, a few days a week, or just somewhere to
              drop in for an afternoon, there&rsquo;s an option to suit. Choose the plan that fits the
              way you work.
            </p>
          </div>
          <Link href="/coworking">View all pricing →</Link>
        </div>
        <div className="teaser-grid">
          {HOME_CATEGORY_ORDER.map((category) => {
            const items = productsByCategory(products, category);
            if (items.length === 0) return null;
            const fromAmount = Math.min(...items.map((p) => p.unitAmount)) / 100;
            const fromPrice = Number.isInteger(fromAmount) ? `$${fromAmount}` : `$${fromAmount.toFixed(2)}`;
            const info = CATEGORY_INFO[category];

            return (
              <Link href={categoryHref(category)} className="teaser-card" key={category}>
                <div className="teaser-body">
                  <CategoryIcon category={category} />
                  <h3>{CATEGORY_LABELS[category]}</h3>
                  <p className="teaser-description">{info.description}</p>
                  <span className="from-price">From {fromPrice}</span>
                </div>
                {info.image && (
                  <div className="teaser-image">
                    <img src={info.image} alt="" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        <Link href="/coworking?category=students" className="student-promo">
          <p>
            <strong>📚 Student or tutor?</strong> Whether you need a quiet place to study or a space
            to teach, we&rsquo;ve got flexible passes built for you.
          </p>
          <span className="student-promo-cta">See student pricing →</span>
        </Link>
      </div>

      <section className="feature-band">
        <div className="container feature-modules">
          <div className="feature-module">
            <div className="feature-module-image">
              <img src="/images/home-space.jpg" alt="" />
            </div>
            <div className="feature-module-text">
              <h2>Everything you need to get on with it</h2>
              <p>
                Hot-desks and dedicated workstations, meeting rooms for when you need to talk, a kitchen
                for the all-important coffee, and flexible access that fits around your day. It&rsquo;s a
                workspace that just works, so you can focus on the work itself.
              </p>
              <Link href="/the-space" className="feature-module-link">
                Explore the space →
              </Link>
            </div>
          </div>

          <div className="feature-module feature-module-reverse">
            <div className="feature-module-image">
              <img src="/images/printing.jpg" alt="" />
            </div>
            <div className="feature-module-text">
              <h2>Printing, without the hassle</h2>
              <p>
                Printing is free for our members. Not a member? Upload your files online, pay securely,
                and we&rsquo;ll print them for you &mdash; black &amp; white or colour, A4 or A3, with no
                trip to the print shop.
              </p>
              <Link href="/printing" className="feature-module-link">
                Get something printed →
              </Link>
            </div>
          </div>

          <div className="feature-module">
            <div className="feature-module-image">
              <img src="/images/services/events-hero.jpg" alt="" />
            </div>
            <div className="feature-module-text">
              <h2>A space for your next event</h2>
              <p>
                Workshops, meetups, launches and team days, hosted in the heart of Kiama. We&rsquo;ll
                help you find the right setup so you can focus on the people in the room.
              </p>
              <Link href="/events" className="feature-module-link">
                Plan an event →
              </Link>
            </div>
          </div>
        </div>
      </section>

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
