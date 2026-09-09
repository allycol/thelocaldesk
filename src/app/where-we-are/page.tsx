import type { Metadata } from 'next';
import { InstagramFeed } from '@/components/InstagramFeed';

export const metadata: Metadata = {
  title: 'Where we are — The Local Desk',
};

const MAP_QUERY = '27 Collins Street, Kiama NSW 2533';
const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`;

export default function WhereWeArePage() {
  return (
    <div className="where-page">
      <div className="container">
        <h1>Where we are</h1>
        <p className="subtitle">Find us in Kiama, NSW.</p>
      </div>

      <div className="map-wrap">
        <iframe src={MAP_SRC} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="The Local Desk location" />
      </div>

      <div className="container">
        <div className="instagram-feed">
          <InstagramFeed />
        </div>
      </div>
    </div>
  );
}
