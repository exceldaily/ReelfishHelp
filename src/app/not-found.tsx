import Link from "next/link";
import { Fish, Compass, Home } from "lucide-react";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center app-bg px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-tide-100">
          <Fish className="size-8 text-tide-600" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-extrabold text-ink-900">Nothing biting here</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          This page doesn&apos;t exist or has moved. The fish are somewhere else, and so is what you were looking for.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/home">
            <Home className="size-4" /> Go home
          </ButtonLink>
          <ButtonLink href="/fish" variant="outline">
            <Compass className="size-4" /> Find fish
          </ButtonLink>
        </div>
        <p className="mt-4 text-xs text-ink-400">
          Think this is a broken link? <Link href="/forum" className="font-semibold text-tide-700 hover:underline">Let us know in the forum</Link>.
        </p>
      </div>
    </div>
  );
}
