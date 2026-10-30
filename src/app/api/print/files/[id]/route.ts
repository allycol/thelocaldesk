import { NextResponse } from 'next/server';
import { readPrintFile, verifyPrintFileToken } from '@/lib/printFiles';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fileId = Number(id);
  const token = new URL(req.url).searchParams.get('token') ?? '';

  if (!Number.isInteger(fileId) || !verifyPrintFileToken(fileId, token)) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 403 });
  }

  const file = await readPrintFile(fileId);
  if (!file) return NextResponse.json({ error: 'File not found (files are deleted after 30 days)' }, { status: 404 });

  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.filename.replace(/"/g, '')}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    },
  });
}
