"use client";

import { LifeBuoy, RotateCcw, Home } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui";

/** Route-level error boundary: friendly recovery instead of a blank crash. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center app-bg px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-bait-100">
          <LifeBuoy className="size-8 text-bait-600" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-extrabold text-ink-900">Line snapped</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Something went wrong loading this page. It&apos;s us, not you. Re-cast and it usually comes right back.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>
            <RotateCcw className="size-4" /> Try again
          </Button>
          <ButtonLink href="/home" variant="outline">
            <Home className="size-4" /> Go home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
