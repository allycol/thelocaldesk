'use client';

import { useRef, useState } from 'react';
import { ACCEPTED_EXTENSIONS, MAX_FILES, MAX_FILE_BYTES } from '@/lib/printFiles-constants';

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export function PrintUploadForm({ priceId, quantity }: { priceId: string; quantity: number }) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(picked: FileList | null) {
    if (!picked) return;
    setError(null);
    const next = [...files];
    for (const file of Array.from(picked)) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setError(`${file.name}: only PDF, JPG, PNG and Word files are accepted.`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`${file.name} is over the 10MB limit.`);
        continue;
      }
      if (next.length >= MAX_FILES) {
        setError(`You can upload up to ${MAX_FILES} files.`);
        break;
      }
      next.push(file);
    }
    setFiles(next);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please add at least one file.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body = new FormData();
      body.set('priceId', priceId);
      body.set('quantity', String(quantity));
      files.forEach((file) => body.append('files', file));

      const res = await fetch('/api/print/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed. Please try again.');
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form className="print-upload-form" onSubmit={handleSubmit}>
      <label className="print-dropzone" htmlFor="print-files">
        <span>Choose files to print</span>
        <small>
          PDF, JPG, PNG or Word · up to {MAX_FILES} files · 10MB each
        </small>
      </label>
      <input
        id="print-files"
        ref={inputRef}
        className="sr-only"
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(',')}
        onChange={(e) => addFiles(e.target.files)}
        disabled={submitting}
      />

      {files.length > 0 && (
        <ul className="print-file-list">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`}>
              <span>
                {file.name} <small>({formatSize(file.size)})</small>
              </span>
              <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} disabled={submitting}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <button className="buy-button print-upload-submit" type="submit" disabled={submitting || files.length === 0}>
        {submitting ? 'Uploading…' : 'Continue to payment'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
