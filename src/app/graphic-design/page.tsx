import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Graphic design — The Local Desk',
};

// Draft copy — revise freely, and swap the stock images. Same editorial
// treatment as /the-space: image banner, big type, gold statement band.
export default function GraphicDesignPage() {
  return (
    <main className="editorial">
      <div className="service-banner">
        <img src="/images/services/graphic-design-hero.jpg" alt="" />
      </div>

      <section className="ed-hero">
        <div className="container">
          <p className="ed-kicker">Graphic design</p>
          <h1>Design that gets you noticed.</h1>
          <p className="ed-lead">
            Whether you&rsquo;re launching something new or giving your business a fresh look, good design
            helps people understand what you do &mdash; and remember you. From websites and social to print,
            we design it and get it ready to go.
          </p>
        </div>
      </section>

      <section className="ed-statement">
        <div className="container ed-statement-grid">
          <div>
            <p className="ed-kicker">01 &mdash; Our approach</p>
            <h2>Simple, considered and made to work.</h2>
            <p>
              We start with what you need the design to do, then keep everything else out of the way. The
              result is work that looks good and does its job, without the fuss.
            </p>
          </div>
          <div className="ed-statement-image">
            <img
              src="/images/services/work-tender-document.jpg"
              alt="A printed tender response document, cover and inside spread"
            />
          </div>
        </div>
      </section>

      <section className="ed-section">
        <div className="container">
          <p className="ed-kicker">02 &mdash; What we do</p>
          <h2 className="ed-heading">Design for every part of your business.</h2>
          <div className="ed-columns">
            <article>
              <span className="ed-numeral">i.</span>
              <h3>Brand identity</h3>
              <p>
                Logos, colours and typography that give your business a clear, consistent look from the
                very first impression.
              </p>
            </article>
            <article>
              <span className="ed-numeral">ii.</span>
              <h3>Digital &amp; social</h3>
              <p>
                Graphics for your website, social media and email, so your brand looks the same wherever
                people find you.
              </p>
            </article>
            <article>
              <span className="ed-numeral">iii.</span>
              <h3>Print &amp; stationery</h3>
              <p>
                Business cards, flyers, brochures, menus and posters, designed with the finished piece
                in mind and prepared for print.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="feature-band ed-band">
        <div className="container feature-modules">
          <div className="feature-module">
            <div className="feature-module-image feature-module-image-natural">
              <img
                src="/images/services/work-trifold-brochure.jpg"
                alt="A tri-fold brochure, outside and inside panels with a pricing table"
              />
            </div>
            <div className="feature-module-text">
              <p className="ed-kicker">03 &mdash; Digital and print</p>
              <h2>Digital first, and just as happy in print.</h2>
              <p>
                Most of what we do lives on screen, but we&rsquo;re comfortable designing for print too. We
                design with the finished piece in mind and prepare your artwork to your printer&rsquo;s
                specifications, so it goes to press without surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ed-section">
        <div className="container">
          <p className="ed-kicker">04 &mdash; How it works</p>
          <h2 className="ed-heading">From first chat to finished files.</h2>
          <div className="ed-columns">
            <article>
              <span className="ed-numeral">i.</span>
              <h3>Tell us about it</h3>
              <p>
                Get in touch with a few details: what you need, who it&rsquo;s for and when you need it
                by. We&rsquo;ll come back with questions and a quote.
              </p>
            </article>
            <article>
              <span className="ed-numeral">ii.</span>
              <h3>See the first draft</h3>
              <p>
                We send through initial ideas for you to react to. Tell us what works and what
                doesn&rsquo;t, and we&rsquo;ll refine from there.
              </p>
            </article>
            <article>
              <span className="ed-numeral">iii.</span>
              <h3>Get your files</h3>
              <p>
                Once you&rsquo;re happy, you get the final files, ready to go live online or to send to
                your printer.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="ed-cta">
        <div className="container ed-cta-split">
          <div className="ed-cta-profile">
            <div className="ed-profile-photo">
              {/* Placeholder — swap for a larger portrait */}
              <img src="/images/founder-photo.jpg" alt="Ally, founder of The Local Desk" />
            </div>
            <h2>Hi, I&rsquo;m Ally.</h2>
            <p>
              I&rsquo;m the founder of The Local Desk, and I&rsquo;ve spent years working as a creative.
              I&rsquo;m the one who&rsquo;ll be working on your project, from the first conversation to the
              final files. To see my digital design work, have a look at my portfolio.
            </p>
            <a href="https://allycolquhoun.au" className="ed-link" target="_blank" rel="noopener noreferrer">
              View my digital design portfolio →
            </a>
          </div>

          <div className="ed-cta-contact">
            <h2>Got a project in mind?</h2>
            <p>Tell us what you need and we&rsquo;ll come back with questions and a quote.</p>
            <div className="ed-cta-actions">
              <Link href="/get-in-touch" className="hero-cta">
                Enquire about design
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
