import Image from "next/image";
import Link from "next/link";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden fill="none">
      <circle cx="20" cy="20" r="19" className="fill-tide-900" />
      {/* fish */}
      <path
        d="M7 20c4.5-5.5 10-8 15-8 3.6 0 6.8 1.3 9.5 3.6 1 .9 1 2 0 2.9-2.7 2.3-5.9 3.5-9.5 3.5-5 0-10.5-2.5-15-8Z"
        transform="translate(0 6) scale(0.92)"
        className="fill-tide-300"
      />
      <path d="M29.5 22.6 34 19l-4.5-3.6c.8 1.2 1.3 2.4 1.3 3.6 0 1.2-.5 2.4-1.3 3.6Z" className="fill-tide-300" />
      <circle cx="13.5" cy="23.4" r="1.3" className="fill-tide-950" />
      {/* hook */}
      <path
        d="M27 6v9.5a5 5 0 0 1-10 0v-1"
        stroke="var(--color-bait-400)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="m17 12.8-1.8 2.4 2.9.3" fill="none" stroke="var(--color-bait-400)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center shrink-0" aria-label="ReelFishHelp home">
      <Image
        src="/brand/rfh-mark.png"
        alt="ReelFishHelp"
        width={512}
        height={512}
        priority
        className="h-12 w-12 sm:h-14 sm:w-14"
      />
      <span className="sr-only">ReelFishHelp</span>
      <span
        aria-hidden
        className={`hidden font-display text-lg font-bold tracking-tight ${dark ? "text-white" : "text-ink-900"}`}
      >
        Reel<span className="text-tide-500">Fish</span>Help
      </span>
    </Link>
  );
}
