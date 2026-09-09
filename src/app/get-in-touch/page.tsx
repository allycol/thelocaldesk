import type { Metadata } from 'next';
import { ContactForm } from '@/components/ContactForm';
import { InstagramFeed } from '@/components/InstagramFeed';

export const metadata: Metadata = {
  title: 'Get in touch — The Local Desk',
};

export default function GetInTouchPage() {
  return (
    <main className="contact-page">
      <div className="container">
        <h1>Get in touch</h1>
        <p className="subtitle">Questions about memberships, tours, or anything else — reach out.</p>

        <ContactForm />

        <div className="instagram-feed">
          <InstagramFeed />
        </div>
      </div>
    </main>
  );
}
