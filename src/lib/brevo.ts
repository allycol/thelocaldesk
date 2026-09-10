// Syncs a purchaser into Brevo's CRM — separate concern from the
// transactional email API in email.ts (though it's the same Brevo account
// and API key). Existing Brevo contacts are newsletter subscribers with no
// purchase history; this is what actually distinguishes a paying customer
// there. CUSTOMER_STATUS is a plain "normal"/text contact attribute (not a
// Brevo "category" enum) — simpler to write from code, and Brevo's segment
// filters work the same either way (equals(CUSTOMER_STATUS, "Customer")).
const BREVO_CONTACTS_URL = 'https://api.brevo.com/v3/contacts';

function getApiKey(): string {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY is not set');
  return apiKey;
}

// Stripe Checkout's "name on card" comes back as a single string — split on
// the first space; a one-word name just becomes a first name with no last.
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
}

// Upserts by email (updateEnabled: true) — a customer who never subscribed
// to the newsletter still needs a contact created, not just updated.
export async function upsertBrevoCustomer(params: { email: string; name: string | null }): Promise<void> {
  const attributes: Record<string, string> = { CUSTOMER_STATUS: 'Customer' };

  if (params.name) {
    const { firstName, lastName } = splitName(params.name);
    if (firstName) attributes.FIRSTNAME = firstName;
    if (lastName) attributes.LASTNAME = lastName;
  }

  const res = await fetch(BREVO_CONTACTS_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      'api-key': getApiKey(),
    },
    body: JSON.stringify({
      email: params.email,
      attributes,
      updateEnabled: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo contact upsert failed (${res.status}): ${body}`);
  }
}
