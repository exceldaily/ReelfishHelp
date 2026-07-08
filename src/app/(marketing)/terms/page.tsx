import Link from "next/link";
import { Logo } from "@/components/logo";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Terms of Service & Community Rules",
  description: "The rules for using ReelFishHelp — respect, safety, and conservation.",
};

const rules = [
  {
    h: "Be respectful",
    b: "Treat other anglers the way you'd want to be treated on the water. Disagreements about gear, spots, or technique are fine — personal attacks are not.",
  },
  {
    h: "Zero tolerance for hate and harassment",
    b: "No hate speech, slurs, or demeaning content targeting race, ethnicity, national origin, religion, gender, gender identity, sexual orientation, disability, age, or any other protected characteristic. No harassment, bullying, threats, stalking, or coordinated pile-ons. This applies to catches, comments, profiles, direct messages, spot notes — everywhere on ReelFishHelp.",
  },
  {
    h: "No sexual, violent, or illegal content",
    b: "No sexually explicit material, gratuitous violence, or content that promotes illegal activity. Don't post other people's private information.",
  },
  {
    h: "Fish responsibly and legally",
    b: "Follow your state's regulations on seasons, size and bag limits, licensing, and protected species. Don't encourage poaching, illegal harvest, or dumping. Handle and release fish with care.",
  },
  {
    h: "Protect fishing spots and privacy",
    b: "Respect that exact locations are private by default. Don't try to extract, scrape, or publicly expose another angler's precise spots. Don't share someone's location without consent.",
  },
  {
    h: "Keep it real",
    b: "No spam, scams, misleading advertising, impersonation, or fake catches. Post your own photos and honest information.",
  },
  {
    h: "You own your content — and you're responsible for it",
    b: "You keep ownership of what you post, and grant ReelFishHelp the right to display it within the app. You're responsible for having the rights to anything you upload.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-[#e7f7fb] flex flex-col">
      <header className="border-b border-neutral-800 bg-black">
        <div className="mx-auto max-w-3xl px-4 h-20 flex items-center justify-between">
          <Logo dark />
          <Link href="/" className="text-sm font-semibold text-slate-200 hover:text-white">
            ← Home
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-3xl px-4 py-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-tide-100 text-tide-800 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide mb-4">
          <ShieldCheck className="size-4" /> Community Rules & Terms
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-900">
          Fishing is better when everyone plays fair
        </h1>
        <p className="mt-3 text-ink-500 leading-relaxed">
          ReelFishHelp is a community for anglers to find fish, learn, and share catches. By creating
          an account and using the app, you agree to these rules. We enforce them: breaking them can
          get your content removed and your account suspended or banned.
        </p>

        <div className="mt-8 space-y-5">
          {rules.map((r, i) => (
            <div key={r.h} className="rounded-2xl bg-white border border-sand-200 shadow-card p-5">
              <h2 className="font-display font-bold text-ink-900 flex items-center gap-2.5">
                <span className="size-6 rounded-full bg-tide-900 text-white text-xs font-bold grid place-items-center shrink-0">
                  {i + 1}
                </span>
                {r.h}
              </h2>
              <p className="mt-1.5 text-sm text-ink-700 leading-relaxed">{r.b}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-tide-950 text-white p-6">
          <h2 className="font-display font-bold text-lg">Reporting &amp; enforcement</h2>
          <p className="mt-2 text-sm text-tide-100/90 leading-relaxed">
            Every catch, comment, profile, and conversation has a <strong>Report</strong> option — use it
            if you see something that breaks these rules. Reports go to our moderation queue and are
            reviewed. We may remove content, issue warnings, or suspend and permanently ban accounts for
            violations, with the most serious cases (threats, hate, illegal activity) actioned first and
            without warning.
          </p>
        </div>

        <div className="mt-8 text-sm text-ink-500 leading-relaxed space-y-3">
          <h2 className="font-display font-bold text-ink-900 text-base">The basics</h2>
          <p>
            ReelFishHelp is provided &quot;as is.&quot; Fishing conditions, activity ratings, species guidance, and
            regulation links are informational aids, not guarantees — always verify current regulations
            with your state agency before keeping fish, and use your own judgment for safety on the water.
          </p>
          <p>
            We may update these terms as the app grows; continued use means you accept the current
            version. You can stop using ReelFishHelp and request account deletion at any time.
          </p>
          <p className="text-ink-300">
            Questions or reports of serious abuse: contact the site owner. Last updated: {new Date().getFullYear()}.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-xl bg-bait-500 hover:bg-bait-600 px-6 py-3 font-bold text-white">
            Create an account
          </Link>
          <Link href="/" className="rounded-xl border border-sand-300 px-6 py-3 font-bold text-ink-700 hover:bg-white">
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
