import { NextResponse } from 'next/server';
import { stripe, APP_BASE_URL } from '@/lib/stripe';
import { minimumQuantity } from '@/lib/products';
import {
  ALLOWED_TYPES,
  MAX_FILES,
  MAX_FILE_BYTES,
  MAX_QUANTITY,
  cleanFilename,
  createPrintOrder,
  extensionOf,
  newOrderRef,
  purgeOldPrintOrders,
  type UploadedFile,
} from '@/lib/printFiles';

// Crude per-IP throttle (in-memory, resets on restart) — uploads write to
// the DB before any payment happens, so don't let one client fill it.
const hits = new Map<string, number[]>();
function tooManyRequests(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 10;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (tooManyRequests(ip)) {
      return NextResponse.json({ error: 'Too many uploads — please try again later.' }, { status: 429 });
    }

    const form = await req.formData();
    const priceId = form.get('priceId');
    const quantity = Number(form.get('quantity'));
    const uploads = form.getAll('files').filter((f): f is File => typeof f !== 'string' && f.size > 0);

    if (typeof priceId !== 'string' || !priceId) {
      return NextResponse.json({ error: 'Missing product.' }, { status: 400 });
    }
    if (uploads.length === 0) return NextResponse.json({ error: 'Please add at least one file.' }, { status: 400 });
    if (uploads.length > MAX_FILES) {
      return NextResponse.json({ error: `You can upload up to ${MAX_FILES} files.` }, { status: 400 });
    }

    // Validate against Stripe, not the client: right category, real price, sane quantity.
    const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
    const product = price.product;
    if (
      !price.active ||
      price.type !== 'one_time' ||
      typeof product === 'string' ||
      product.deleted ||
      product.metadata.category !== 'printing'
    ) {
      return NextResponse.json({ error: 'Not a valid printing product.' }, { status: 400 });
    }
    const min = minimumQuantity(price.unit_amount ?? 0);
    if (!Number.isInteger(quantity) || quantity < min || quantity > MAX_QUANTITY) {
      return NextResponse.json({ error: `Quantity must be between ${min} and ${MAX_QUANTITY}.` }, { status: 400 });
    }

    const files: UploadedFile[] = [];
    for (const upload of uploads) {
      const ext = extensionOf(upload.name);
      if (!(ext in ALLOWED_TYPES)) {
        return NextResponse.json({ error: `${upload.name}: only PDF, JPG, PNG and Word files are accepted.` }, { status: 400 });
      }
      if (upload.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: `${upload.name} is over the 10MB limit.` }, { status: 400 });
      }
      files.push({
        filename: cleanFilename(upload.name),
        mimeType: ALLOWED_TYPES[ext],
        data: Buffer.from(await upload.arrayBuffer()),
      });
    }

    await purgeOldPrintOrders().catch((err) => console.error('purgeOldPrintOrders failed:', err));

    const ref = newOrderRef();
    await createPrintOrder({ ref, priceId, quantity, files });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity }],
      automatic_tax: { enabled: true },
      consent_collection: { terms_of_service: 'required' },
      invoice_creation: { enabled: true },
      metadata: { item_key: priceId, print_ref: ref },
      success_url: `${APP_BASE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}&print_ref=${ref}`,
      cancel_url: `${APP_BASE_URL}/printing`,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error('print upload failed:', err);
    return NextResponse.json({ error: 'Could not process your upload. Please try again.' }, { status: 500 });
  }
}
