'use client';

import { useState } from 'react';

export function BuyButton({
  priceId,
  endpoint,
  label,
}: {
  priceId: string;
  endpoint: '/api/checkout/subscription' | '/api/checkout/one-time';
  label: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed');
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="buy-button-wrap">
      <button className="buy-button" disabled={loading} onClick={checkout}>
        {loading ? 'Redirecting…' : label}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
