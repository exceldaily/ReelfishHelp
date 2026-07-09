import Link from "next/link";
import { Fish, Disc3, Spline, Link as LinkIcon, Anchor, Wrench, Backpack, Award, Wand2, ArrowRight } from "lucide-react";
import { PageHeader, Card } from "@/components/ui";

export const metadata = {
  title: "Gear",
  description:
    "Learn fishing rods, reels, line, leaders, knots, terminal tackle, and complete setups — then use the Setup Builder to match your rig to the fish.",
};

const AREAS = [
  { href: "/gear/rods", label: "Rods", icon: Fish, blurb: "Length, power, action, and every rod type." },
  { href: "/gear/reels", label: "Reels", icon: Disc3, blurb: "Spinning, baitcasting, conventional, and sizing." },
  { href: "/gear/line", label: "Fishing Line", icon: Spline, blurb: "Mono, fluoro, braid — and what to use when." },
  { href: "/gear/leaders", label: "Leaders", icon: LinkIcon, blurb: "When to use one and how to pick the right leader." },
  { href: "/gear/knots", label: "Knots", icon: Anchor, blurb: "20 essential knots with step-by-step instructions." },
  { href: "/gear/terminal", label: "Terminal Tackle", icon: Wrench, blurb: "Hooks, weights, floats, swivels, and rigs." },
  { href: "/gear/setups", label: "Gear Setups", icon: Backpack, blurb: "Complete, situational rigs you can copy and fish." },
  { href: "/gear/brands", label: "Brands", icon: Award, blurb: "An honest directory of rod, reel, line, and tackle makers." },
];

export default function GearHubPage() {
  return (
    <div>
      <PageHeader
        title="Gear"
        subtitle="Learn your tackle and dial in the right setup — clear, practical, no affiliate-store fluff."
      />

      <Link
        href="/gear/builder"
        className="group block rounded-2xl bg-gradient-to-br from-tide-800 to-tide-950 text-white p-6 mb-8 shadow-card hover:shadow-lift transition-shadow"
      >
        <div className="flex items-center gap-4">
          <div className="grid place-items-center size-12 rounded-xl bg-white/10 shrink-0">
            <Wand2 className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-bold">Setup Builder</h2>
            <p className="text-sm text-tide-100/90">
              Build a rig and see exactly what it can catch — or answer a few questions and we&apos;ll build one for you.
            </p>
          </div>
          <ArrowRight className="size-5 shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AREAS.map(({ href, label, icon: Icon, blurb }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-2xl border border-sand-200 shadow-card p-5 hover:shadow-lift transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="grid place-items-center size-11 rounded-xl bg-tide-100 text-tide-700 shrink-0">
                <Icon className="size-5" />
              </div>
              <h3 className="font-display font-bold text-ink-900 group-hover:text-tide-700 transition-colors">{label}</h3>
            </div>
            <p className="mt-2 text-sm text-ink-500">{blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
