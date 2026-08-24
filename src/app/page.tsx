'use client';

import { useState } from 'react';
import type { PlanKey } from '@/lib/plans';

const MEMBERSHIPS: Array<{ key: PlanKey; name: string; price: string }> = [
  { key: 'hot_desk', name: 'Hot Desk', price: '$199/mo' },
  { key: 'dedicated_desk', name: 'Dedicated Desk', price: '$399/mo' },
  { key: 'private_office', name: 'Private Office', price: '$899/mo' },
];

const ONE_TIME: Array<{ key: PlanKey; name: string; price: string }> = [
  { key: 'day_pass', name: 'Day Pass', price: '$35' },
  { key: 'meeting_room_hourly', name: 'Meeting Room (per hour)', price: '$25' },
];

export default function HomePage() {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(endpoint: '/api/checkout/subscription' | '/api/checkout/one-time', plan: PlanKey) {
    setError(null);
    setLoadingKey(plan);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed');
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError((err as Error).message);
      setLoadingKey(null);
    }
  }

  return (
    <main>
      <h1>The Local Desk</h1>
      <p className="subtitle">Coworking memberships, day passes, and meeting rooms — Sydney.</p>

      {error && <p className="error">{error}</p>}

      <h2>Memberships</h2>
      <section className="grid">
        {MEMBERSHIPS.map((m) => (
          <div className="card" key={m.key}>
            <h2>{m.name}</h2>
            <div className="price">
              {m.price} <span>+ GST</span>
            </div>
            <button disabled={loadingKey === m.key} onClick={() => checkout('/api/checkout/subscription', m.key)}>
              {loadingKey === m.key ? 'Redirecting…' : 'Subscribe'}
            </button>
          </div>
        ))}
      </section>

      <h2 style={{ marginTop: '2.5rem' }}>Day passes & rooms</h2>
      <section className="grid">
        {ONE_TIME.map((m) => (
          <div className="card" key={m.key}>
            <h2>{m.name}</h2>
            <div className="price">
              {m.price} <span>+ GST</span>
            </div>
            <button disabled={loadingKey === m.key} onClick={() => checkout('/api/checkout/one-time', m.key)}>
              {loadingKey === m.key ? 'Redirecting…' : 'Book now'}
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
