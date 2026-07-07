"use client";

import { useState, type InputHTMLAttributes } from "react";
import { compressImage } from "@/lib/image-client";

/**
 * A file input that transparently downscales selected images in the browser
 * before the form submits, replacing the input's FileList with compressed
 * JPEGs. Drop-in replacement for <input type="file" name=... accept="image/*">.
 */
export function ImageInput({
  onReady,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { onReady?: (busy: boolean) => void }) {
  const [busy, setBusy] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    onReady?.(false);
    try {
      const compressed = await Promise.all(files.map((f) => compressImage(f)));
      const dt = new DataTransfer();
      compressed.forEach((f) => dt.items.add(f));
      input.files = dt.files;
    } catch {
      /* leave the originals in place; server + body limit still apply */
    } finally {
      setBusy(false);
      onReady?.(true);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <input type="file" accept="image/*" className={className} onChange={handleChange} {...props} />
      {busy && <span className="text-xs text-ink-500">optimizing…</span>}
    </span>
  );
}
