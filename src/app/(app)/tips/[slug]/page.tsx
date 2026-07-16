import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getDb, anglerTips, savedTips, tipHelpful } from "@/db";
import { currentUser } from "@/lib/auth-helpers";
import { DailyTipCard } from "@/components/daily-tip-card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const tip = await db.query.anglerTips.findFirst({ where: eq(anglerTips.slug, slug) });
  if (!tip || !tip.isActive) return { title: "Angler Tips" };
  const description = tip.tipText.slice(0, 160);
  return {
    title: `${tip.title} · Angler Tips`,
    description,
    openGraph: {
      title: `ReelFishHelp Angler Tip: ${tip.title}`,
      description,
      siteName: "ReelFishHelp",
      type: "article",
    },
    twitter: { card: "summary", title: `ReelFishHelp Angler Tip: ${tip.title}`, description },
  };
}

export default async function TipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const tip = await db.query.anglerTips.findFirst({ where: eq(anglerTips.slug, slug) });
  if (!tip || !tip.isActive) notFound();

  const user = await currentUser();
  let viewerHelpful = false;
  let viewerSaved = false;
  if (user) {
    const [h, s] = await Promise.all([
      db.query.tipHelpful.findFirst({ where: and(eq(tipHelpful.userId, user.id), eq(tipHelpful.tipId, tip.id)) }),
      db.query.savedTips.findFirst({ where: and(eq(savedTips.userId, user.id), eq(savedTips.tipId, tip.id)) }),
    ]);
    viewerHelpful = !!h;
    viewerSaved = !!s;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/tips" className="mb-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-tide-700">
        <ArrowLeft className="size-4" /> All Angler Tips
      </Link>
      <DailyTipCard
        tip={{
          id: tip.id,
          slug: tip.slug,
          title: tip.title,
          tipText: tip.tipText,
          category: tip.category,
          icon: tip.icon,
          helpfulCount: tip.helpfulCount,
          viewerHelpful,
          viewerSaved,
        }}
        signedIn={!!user}
        heading="Angler Tip"
        showMoreLink
      />
      <p className="mt-4 text-sm text-ink-500">
        A new tip lands on the ReelFishHelp home screen every day. {!user && (
          <>
            <Link href="/signup" className="font-bold text-tide-700 hover:underline">Join free</Link> to save tips and mark them helpful.
          </>
        )}
      </p>
    </div>
  );
}
