import { Logo } from "@/components/logo";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh water-gradient flex flex-col">
      <div className="topo-lines absolute inset-0 pointer-events-none" aria-hidden />
      <header className="relative mx-auto w-full max-w-6xl px-4 h-16 flex items-center">
        <Logo dark />
      </header>
      <main className="relative flex-1 flex items-start sm:items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="relative py-6 text-center text-sm text-tide-300">
        <Link href="/" className="hover:text-white">← Back to ReelFishHelp</Link>
      </footer>
    </div>
  );
}
