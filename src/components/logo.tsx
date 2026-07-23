import Image from "next/image";
import Link from "next/link";


export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center shrink-0" aria-label="ReelFishHelp home">
      <Image
        src="/brand/reelfishhelp-header-logo.png"
        alt="ReelFishHelp"
        width={420}
        height={223}
        priority
        className="h-14 w-auto sm:h-16"
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
