"use client";

import { useState, type InputHTMLAttributes } from "react";
import { compressImage, UPLOAD_BUDGET_BYTES } from "@/lib/image-client";

/**
 * A file input that transparently downscales selected images in the browser
 * before the form submits, replacing the input's FileList with compressed
 * JPEGs. If the combined payload would still exceed the upload budget
 * (Vercel caps request bodies around 4.5 MB), it keeps only the photos that
 * fit and says so — a clear message beats a mystery server error.
 */
export function ImageInput({
  onReady,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { onReady?: (busy: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    setNote(null);
    onReady?.(false);
    try {
      const compressed = await Promise.all(files.map((f) => compressImage(f)));
      // keep photos while they fit in the request budget
      const kept: File[] = [];
      let total = 0;
      let dropped = 0;
      for (const f of compressed) {
        if (total + f.size <= UPLOAD_BUDGET_BYTES) {
          kept.push(f);
          total += f.size;
        } else {
          dropped++;
        }
      }
      const dt = new DataTransfer();
      kept.forEach((f) => dt.items.add(f));
      input.files = dt.files;
      if (dropped > 0) {
        setNote(
          kept.length === 0
            ? "That photo is too large to upload even after optimizing. Try a different photo."
            : `Keeping ${kept.length} photo${kept.length === 1 ? "" : "s"}, ${dropped} didn't fit the upload limit.`
        );
      }
    } catch {
      /* leave the originals in place; server + body limit still apply */
    } finally {
      setBusy(false);
      onReady?.(true);
    }
  }

  return (
    /* max-w/min-w keep the native file input (intrinsic ~250px) from forcing
       horizontal overflow inside flex rows on phones */
    <span className="inline-flex min-w-0 max-w-full flex-1 flex-wrap items-center gap-2">
      <input
        type="file"
        accept="image/*"
        className={`min-w-0 max-w-full ${className ?? ""}`}
        onChange={handleChange}
        {...props}
      />
      {busy && <span className="text-xs text-ink-500">optimizing…</span>}
      {note && <span className="text-xs font-semibold text-bait-700">{note}</span>}
    </span>
  );
}
