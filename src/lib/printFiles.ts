import { createHmac, randomInt, timingSafeEqual } from 'crypto';
import type { PoolConnection } from 'mysql2/promise';
import { pool } from '@/lib/db';

export { MAX_FILES, MAX_FILE_BYTES, MAX_QUANTITY } from '@/lib/printFiles-constants';
const CHUNK_BYTES = 256 * 1024;
const LINK_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Extension -> the MIME type we'll serve it back as. The browser-supplied
// type is never trusted or stored.
export const ALLOWED_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function extensionOf(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

export function cleanFilename(raw: string): string {
  const base = raw.split(/[\\/]/).pop() ?? 'file';
  return base.replace(/[^\w.\- ()]/g, '_').slice(-120) || 'file';
}

// 8 chars, no look-alikes (0/O, 1/I) since it gets read out/typed from emails.
export function newOrderRef(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)]).join('');
}

// Unpaid uploads are abandoned carts — drop them quickly. Everything else
// (incl. paid jobs) goes after 30 days, matching the download-link expiry.
// Runs on each upload; there's no cron on this host.
export async function purgeOldPrintOrders(): Promise<void> {
  await pool.query(
    `DELETE FROM print_orders
     WHERE created_at < (NOW() - INTERVAL 30 DAY)
        OR (status = 'pending' AND created_at < (NOW() - INTERVAL 2 DAY))`
  );
}

export interface UploadedFile {
  filename: string;
  mimeType: string;
  data: Buffer;
}

export async function createPrintOrder(params: {
  ref: string;
  priceId: string;
  quantity: number;
  files: UploadedFile[];
}): Promise<void> {
  const conn: PoolConnection = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [orderResult] = await conn.query('INSERT INTO print_orders (ref, price_id, quantity) VALUES (?, ?, ?)', [
      params.ref,
      params.priceId,
      params.quantity,
    ]);
    const orderId = (orderResult as { insertId: number }).insertId;

    for (const file of params.files) {
      const [fileResult] = await conn.query(
        'INSERT INTO print_files (order_id, filename, mime_type, size_bytes) VALUES (?, ?, ?, ?)',
        [orderId, file.filename, file.mimeType, file.data.length]
      );
      const fileId = (fileResult as { insertId: number }).insertId;
      for (let seq = 0, offset = 0; offset < file.data.length; seq++, offset += CHUNK_BYTES) {
        await conn.query('INSERT INTO print_file_chunks (file_id, seq, data) VALUES (?, ?, ?)', [
          fileId,
          seq,
          file.data.subarray(offset, offset + CHUNK_BYTES),
        ]);
      }
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function markPrintOrderPaid(ref: string, sessionId: string): Promise<void> {
  await pool.query("UPDATE print_orders SET status = 'paid', stripe_checkout_session_id = ? WHERE ref = ?", [
    sessionId,
    ref,
  ]);
}

export async function listPrintFiles(ref: string): Promise<Array<{ id: number; filename: string; sizeBytes: number }>> {
  const [rows] = await pool.query(
    `SELECT f.id, f.filename, f.size_bytes AS sizeBytes
     FROM print_files f JOIN print_orders o ON o.id = f.order_id
     WHERE o.ref = ? ORDER BY f.id`,
    [ref]
  );
  return rows as Array<{ id: number; filename: string; sizeBytes: number }>;
}

export async function readPrintFile(
  fileId: number
): Promise<{ filename: string; mimeType: string; data: Buffer } | null> {
  const [files] = await pool.query('SELECT filename, mime_type AS mimeType FROM print_files WHERE id = ?', [fileId]);
  const file = (files as Array<{ filename: string; mimeType: string }>)[0];
  if (!file) return null;
  const [chunks] = await pool.query('SELECT data FROM print_file_chunks WHERE file_id = ? ORDER BY seq', [fileId]);
  return { ...file, data: Buffer.concat((chunks as Array<{ data: Buffer }>).map((c) => c.data)) };
}

// Signed, expiring download links for the order email — no login system, so
// the link itself is the credential (same HMAC approach as magicLink.ts, with
// a purpose tag so a magic-link token can't be replayed as a file token).
function secret(): string {
  const value = process.env.ACCOUNT_LINK_SECRET;
  if (!value) throw new Error('ACCOUNT_LINK_SECRET is not set');
  return value;
}

function signature(fileId: number, exp: number): string {
  return createHmac('sha256', secret()).update(`printfile:${fileId}:${exp}`).digest('base64url');
}

export function printFileToken(fileId: number): string {
  const exp = Date.now() + LINK_TTL_MS;
  return `${exp}.${signature(fileId, exp)}`;
}

export function verifyPrintFileToken(fileId: number, token: string): boolean {
  const [expRaw, sig] = token.split('.');
  const exp = Number(expRaw);
  if (!sig || !Number.isFinite(exp) || Date.now() > exp) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(signature(fileId, exp));
  return a.length === b.length && timingSafeEqual(a, b);
}
