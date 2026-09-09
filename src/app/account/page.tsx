import type { Metadata } from 'next';
import { AccountLinkForm } from '@/components/AccountLinkForm';

export const metadata: Metadata = {
  title: 'Manage your membership — The Local Desk',
};

const ERROR_MESSAGES: Record<string, string> = {
  expired: 'That link has expired — request a new one below.',
  not_found: "We couldn't find an active membership for that email.",
  unknown: 'Something went wrong. Please try again.',
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.unknown) : null;

  return (
    <main className="account-page">
      <div className="container">
        <h1>Manage your membership</h1>
        <p className="subtitle">
          Enter the email you signed up with and we&rsquo;ll send you a secure link to view your billing
          history, update your payment method, or cancel your membership.
        </p>

        <AccountLinkForm initialError={errorMessage} />
      </div>
    </main>
  );
}
