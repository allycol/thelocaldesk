import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The Space — The Local Desk',
};

// Draft copy — revise freely. Layout alternates dark / gold / white bands so
// the page reads as a magazine-style spread rather than a grid of cards.
export default function TheSpacePage() {
  return (
    <main className="editorial">
      <section className="ed-hero">
        <div className="container ed-hero-grid">
          <div>
            <p className="ed-kicker">Space features</p>
            <h1>Everything you need to do your best work.</h1>
            <p className="ed-lead">
              A good work day shouldn&rsquo;t take effort. So we&rsquo;ve built The Local Desk around the
              things that actually matter: a connection you can rely on, a kettle that&rsquo;s always
              full, a proper desk, and a main street full of life right outside the door.
            </p>
          </div>
          <div className="ed-hero-image">
            <img src="/images/the-space-hero.jpg" alt="A desk in the coworking space, with a jacket over the chair" />
          </div>
        </div>
      </section>

      <section className="ed-statement">
        <div className="container">
          <p className="ed-kicker">01 &mdash; Connectivity</p>
          <h2>Lightning-fast internet.</h2>
          <p>
            Video calls that don&rsquo;t freeze, uploads that finish before your coffee does. Our
            connection is built for people who work online all day, so the technology gets out of your
            way.
          </p>
        </div>
      </section>

      <section className="feature-band ed-band">
        <div className="container feature-modules">
          <div className="feature-module">
            <div className="feature-module-image">
              <img src="/images/tea-coffee.jpg" alt="The tea and coffee station" />
            </div>
            <div className="feature-module-text">
              <p className="ed-kicker">02 &mdash; Fuel</p>
              <h2>Tea, coffee and snacks, on the house.</h2>
              <p>
                The kettle is always on. Tea, coffee and snacks are free for everyone working in the
                space, so there&rsquo;s no café run just to get through the afternoon slump &mdash; and a
                good reason to wander into the kitchen and say hello to someone new.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ed-section">
        <div className="container">
          <p className="ed-kicker">03 &mdash; Your desk</p>
          <h2 className="ed-heading">Pick the way you work.</h2>
          <div className="ed-columns">
            <article>
              <span className="ed-numeral">i.</span>
              <h3>Hot-desks</h3>
              <p>
                Choose any free desk and get straight to work. Ideal if you only need the space a few
                days a week, or you like a change of scenery.
              </p>
            </article>
            <article>
              <span className="ed-numeral">ii.</span>
              <h3>Dedicated workstations</h3>
              <p>
                A desk that&rsquo;s yours every day. Leave your setup as it is, and walk in each morning
                ready to start.
              </p>
            </article>
            <article>
              <span className="ed-numeral">iii.</span>
              <h3>Collaboration areas</h3>
              <p>
                Open, relaxed spaces to swap ideas, talk things through and work alongside other
                members. Work, meet, create together.
              </p>
            </article>
          </div>
          <p className="ed-aside">
            Flexible access, a friendly community and the occasional chat at the kettle come with every
            membership.
          </p>
        </div>
      </section>

      <section className="feature-band ed-band">
        <div className="container feature-modules">
          <div className="feature-module feature-module-reverse">
            <div className="feature-module-image">
              <img src="/images/main-street.jpg" alt="Shops and cafés along the main street" />
            </div>
            <div className="feature-module-text">
              <p className="ed-kicker">04 &mdash; Location</p>
              <h2>On the main street, with everything close by.</h2>
              <p>
                We&rsquo;re right on the main street, a short stroll from cafés, shops and the everyday
                conveniences. Take a proper lunch break, run errands between calls, or meet a client for
                coffee around the corner &mdash; it&rsquo;s all just steps away.
              </p>
              <Link href="/location" className="feature-module-link">
                Find us →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="ed-section ed-printing">
        <div className="container">
          <p className="ed-kicker">05 &mdash; Printing</p>
          <h2 className="ed-heading">Printing is free when you work here.</h2>
          <p className="ed-lead">
            A contract to sign, a draft to mark up, slides on paper. If you&rsquo;re working from The Local
            Desk, printing is included &mdash; no per-page charge.
          </p>
          <Link href="/printing" className="ed-link">
            Need prints without a desk? See printing →
          </Link>
        </div>
      </section>

      <section className="ed-cta">
        <div className="container">
          <h2>Ready to find your desk?</h2>
          <div className="ed-cta-actions">
            <Link href="/coworking" className="hero-cta">
              View pricing
            </Link>
            <Link href="/get-in-touch" className="ed-link">
              Or get in touch →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
