import Link from "next/link";
import { Logo } from "@/components/logo";
import { Lock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "What ReelFishHelp collects, how it's used, and the controls you have — including how your fishing spots stay private.",
};

const sections: { h: string; b: React.ReactNode }[] = [
  {
    h: "What we collect",
    b: (
      <>
        Your account email and a securely hashed password; the profile you create (display name, username,
        bio, home state, fishing preferences, optional avatar); content you post (catches, photos, bite
        reports, forum questions and answers, comments, gear, saved spots, trips, direct messages); and basic
        technical data your browser sends (device/browser type, and logs needed to run and secure the service).
        If you use approximate-location features, we store a <strong>rounded</strong> location, never your exact
        coordinates (except spots you explicitly mark &quot;private &amp; exact,&quot; which are only ever shown to you).
      </>
    ),
  },
  {
    h: "How we use it",
    b: "To run your account, show your content to the audiences you choose, power features like local conditions and the community boards, keep the service safe (spam, abuse, and security), and improve the app. We do not sell your personal information.",
  },
  {
    h: "Your fishing spots stay private",
    b: (
      <>
        Location privacy is built into the app, not bolted on. Stored coordinates are rounded to roughly a
        one-kilometer area before they touch our database, public content shows only broad regional labels,
        and we <strong>strip GPS and other metadata (EXIF) from every photo</strong> on upload so images can&apos;t
        leak where you were. You choose per item whether something is private, followers-only, or public.
      </>
    ),
  },
  {
    h: "Photos and storage",
    b: "Uploaded photos are processed (resized, metadata stripped) and stored in private cloud object storage; they're served through an access-checked route that honors each item's visibility. You can delete individual photos or your whole account, which removes the associated images.",
  },
  {
    h: "Services we rely on",
    b: "We use trusted infrastructure providers to operate the app — hosting (Vercel), the database (Supabase), and photo storage (Cloudflare R2) — and free public data APIs for weather, tides, geocoding, and species reference imagery. These providers process data on our behalf to deliver the service; we share only what's needed for that purpose.",
  },
  {
    h: "Cookies",
    b: "We use a single essential cookie to keep you signed in. We don't use advertising or third-party tracking cookies.",
  },
  {
    h: "Your choices and rights",
    b: (
      <>
        You can edit your profile and change the visibility of your content at any time, manage or delete your
        photos in <strong>Settings → Photos &amp; storage</strong>, block other users, and report content. You can
        request deletion of your account and its data at any time. Depending on where you live, you may have
        additional rights to access, correct, or delete your personal information — contact the site owner to
        exercise them.
      </>
    ),
  },
  {
    h: "Data retention",
    b: "We keep your data while your account is active. When you delete content or your account, we remove it from the live service; temporary and backup copies are purged on a short rolling schedule.",
  },
  {
    h: "Children",
    b: "ReelFishHelp isn't directed to children under 13, and we don't knowingly collect their information. If you believe a child has created an account, contact us and we'll remove it.",
  },
  {
    h: "Changes",
    b: "We may update this policy as the app grows. Material changes will be reflected here with a new date, and continued use means you accept the current version.",
  },
];

export default function PrivacyPage() {
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
          <Lock className="size-4" /> Privacy Policy
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-900">
          Your data — and your spots — stay yours
        </h1>
        <p className="mt-3 text-ink-500 leading-relaxed">
          This explains what ReelFishHelp collects, how we use it, and the controls you have. Plain language,
          no surprises. It works alongside our{" "}
          <Link href="/terms" className="font-semibold text-tide-700 hover:text-tide-900">
            Community Rules &amp; Terms
          </Link>
          .
        </p>

        <div className="mt-8 space-y-5">
          {sections.map((s) => (
            <div key={s.h} className="rounded-2xl bg-white border border-sand-200 shadow-card p-5">
              <h2 className="font-display font-bold text-ink-900">{s.h}</h2>
              <p className="mt-1.5 text-sm text-ink-700 leading-relaxed">{s.b}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-ink-300 leading-relaxed">
          Questions or requests about your data: contact the site owner. Last updated: {new Date().getFullYear()}.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-xl bg-bait-500 hover:bg-bait-600 px-6 py-3 font-bold text-white">
            Create an account
          </Link>
          <Link href="/terms" className="rounded-xl border border-sand-300 px-6 py-3 font-bold text-ink-700 hover:bg-white">
            Community Rules &amp; Terms
          </Link>
        </div>
      </main>
    </div>
  );
}
