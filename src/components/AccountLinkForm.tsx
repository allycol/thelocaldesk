'use client';

import { useState } from 'react';

export function AccountLinkForm({ initialError }: { initialError: string | null }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(initialError);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/account/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong. Please try again.');
      setStatus('sent');
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="account-link-sent">
        <p>If that email has an active membership, we&rsquo;ve sent a link to manage it. Check your inbox.</p>
      </div>
    );
  }

  return (
    <form className="account-link-form" onSubmit={handleSubmit}>
      <div className="account-link-field">
        <label htmlFor="account-email">Email</label>
        <input
          id="account-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={320}
        />
      </div>

      <button className="account-link-submit" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Send me a link'}
      </button>

      {error && <p className="account-link-error">{error}</p>}
    </form>
  );
}
