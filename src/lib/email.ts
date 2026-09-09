// Sends transactional email via Brevo's REST API — used only for purchase
// confirmations. Everything else lives elsewhere: the newsletter form
// (SubscribeSection) posts straight to Brevo's own sib-forms endpoint and
// needs no key at all; the "Get in touch" contact form uses GoDaddy's
// native email gateway (@/lib/emailGateway) instead, per the hosting
// platform's own contract, which is why this file doesn't handle it.
const BREVO_SEND_URL = 'https://api.brevo.com/v3/smtp/email';

export const SENDER_EMAIL = 'ally@thelocaldesk.au';

interface SendEmailParams {
  senderName: string;
  to: { email: string; name?: string }[];
  subject: string;
  textContent: string;
}

async function sendEmail(params: SendEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY is not set');

  const res = await fetch(BREVO_SEND_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: params.senderName, email: SENDER_EMAIL },
      to: params.to,
      subject: params.subject,
      textContent: params.textContent,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo send failed (${res.status}): ${body}`);
  }
}

export async function sendPurchaseConfirmation(params: {
  toEmail: string;
  productName: string;
  amountFormatted: string;
  isSubscription: boolean;
  invoicePdfUrl: string | null;
}): Promise<void> {
  const { toEmail, productName, amountFormatted, isSubscription, invoicePdfUrl } = params;

  const subject = isSubscription ? `You're in — welcome to The Local Desk` : `Booking confirmed — ${productName}`;

  // GST-registered sales need a real tax invoice, not just a payment
  // receipt — invoicePdfUrl is Stripe's own hosted PDF (ABN, GST
  // breakdown included), not something we generate ourselves.
  const invoiceLine = invoicePdfUrl ? `\n\nTax invoice: ${invoicePdfUrl}` : '';

  const body = isSubscription
    ? `Thanks for joining The Local Desk!\n\n` +
      `Plan: ${productName}\n` +
      `Amount: ${amountFormatted}${invoiceLine}\n\n` +
      `Your membership renews automatically until you cancel — cancelling takes effect at the end of your ` +
      `current billing cycle. See the Membership Agreement on our site for full terms.\n\n` +
      `See you at the desk,\nThe Local Desk`
    : `Thanks for your booking!\n\n` +
      `Item: ${productName}\n` +
      `Amount: ${amountFormatted}${invoiceLine}\n\n` +
      `See you soon,\nThe Local Desk`;

  await sendEmail({
    senderName: 'The Local Desk',
    to: [{ email: toEmail }],
    subject,
    textContent: body,
  });
}
