"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LifeBuoy, RotateCcw } from "lucide-react";

/**
 * Friendly in-app error boundary. Catches anything a page or server action
 * throws (including oversized uploads rejected by the platform) and gives the
 * angler a way back instead of a blank "Application error" screen.
 */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-tide-100">
        <LifeBuoy className="size-7 text-tide-700" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">That one got off the hook</h1>
      <p className="mt-2 text-sm text-ink-500 leading-relaxed">
        Something went wrong on our end. If you were uploading photos, try fewer or smaller ones.
        Otherwise give it another cast.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-bait-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-bait-600"
        >
          <RotateCcw className="size-4" /> Try again
        </button>
        <Link
          href="/home"
          className="inline-flex min-h-11 items-center rounded-xl border border-sand-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-sand-100"
        >
          Back to Home
        </Link>
      </div>
      {error.digest && <p className="mt-4 text-[11px] text-ink-300">Error code: {error.digest}</p>}
    </div>
  );
}
