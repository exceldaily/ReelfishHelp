import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, Clapperboard, Info } from "lucide-react";
import { getDb, contentItems } from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { PageHeader, Card } from "@/components/ui";
import { ContentStudio } from "@/components/studio/content-studio";
import { gatherStudioContext } from "@/lib/content-studio/context";
import { contentStudioConfigured } from "@/lib/content-studio/generate";
import { VIDEO_TEMPLATES, APP_FEATURES, BROLL_LIBRARY } from "@/data/content-studio";

export const metadata = { title: "Content Studio · Admin" };

export default async function ContentStudioPage() {
  const admin = await requireAdmin();
  const db = await getDb();

  const [rows, ctx] = await Promise.all([
    db.query.contentItems.findMany({
      where: eq(contentItems.authorId, admin.id),
      orderBy: [desc(contentItems.createdAt)],
    }),
    gatherStudioContext(db),
  ]);

  const items = rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    platform: r.platform,
    stage: r.stage,
    title: r.title,
    hook: r.hook,
    script15: r.script15,
    script30: r.script30,
    overlays: r.overlays,
    visuals: r.visuals,
    cta: r.cta,
    hashtags: r.hashtags,
    caption: r.caption,
    captions: (r.captions as Record<string, string> | null) ?? null,
    comments: r.comments,
    shotList: r.shotList,
    brollTerms: r.brollTerms,
    screenSteps: r.screenSteps,
    templateSlug: r.templateSlug,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> Admin
      </Link>
      <PageHeader
        title={<span className="inline-flex items-center gap-2.5"><Clapperboard className="size-6 text-tide-600" /> Content Studio</span>}
        subtitle="Plan short-form video content for TikTok, Reels, Shorts, and Facebook, grounded in real ReelFishHelp content. You review and post everything yourself."
      />

      <Card className="p-4 mb-5 flex items-start gap-3 bg-sand-50">
        <Info className="size-5 text-ink-500 shrink-0 mt-0.5" />
        <p className="text-sm text-ink-600">
          This is a planning and asset assistant. It does not post, like, follow, comment, or automate anything on any
          platform. Every piece is a draft for you to review and publish manually.
        </p>
      </Card>

      <ContentStudio
        items={items}
        aiConfigured={contentStudioConfigured()}
        templates={VIDEO_TEMPLATES}
        features={APP_FEATURES}
        broll={BROLL_LIBRARY}
        context={{
          season: ctx.season,
          month: ctx.month,
          popularSpecies: ctx.popularSpecies.map((s) => ({ slug: s.slug, name: s.name, water: s.water })),
          setups: ctx.setups.map((s) => ({ slug: s.slug, name: s.name })),
          activeCrews: ctx.activeCrews,
          featurableCatches: ctx.featurableCatches,
        }}
      />
    </div>
  );
}
