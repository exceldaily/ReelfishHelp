import Link from "next/link";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Lightbulb, Search, ThumbsUp, ArrowLeft, ArrowRight } from "lucide-react";
import { getDb, anglerTips, savedTips } from "@/db";
import { currentUser } from "@/lib/auth-helpers";
import { TIP_CATEGORIES, utcToday } from "@/lib/tips";
import { PageHeader, Badge, Card, EmptyState } from "@/components/ui";

export const metadata = {
  title: "Angler Tips",
  description: "Practical daily fishing tips: bait, gear, weather, safety, and technique advice from ReelFishHelp.",
};

const PAGE_SIZE = 12;

type Params = { q?: string; category?: string; sort?: string; saved?: string; page?: string };

export default async function TipsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const user = await currentUser();
  const db = await getDb();
  const today = utcToday();

  const q = (params.q ?? "").trim();
  const category = (params.category ?? "").trim();
  const sort = params.sort === "top" ? "top" : "new";
  const savedOnly = params.saved === "1" && !!user;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const conditions = [
    eq(anglerTips.isActive, true),
    or(sql`${anglerTips.expirationDate} IS NULL`, sql`${anglerTips.expirationDate} >= ${today}`),
  ];
  if (q) conditions.push(or(ilike(anglerTips.title, `%${q}%`), ilike(anglerTips.tipText, `%${q}%`))!);
  if (category) conditions.push(eq(anglerTips.category, category));

  let savedIds: Set<string> | null = null;
  if (user) {
    const rows = await db.query.savedTips.findMany({ where: eq(savedTips.userId, user.id) });
    savedIds = new Set(rows.map((r) => r.tipId));
  }
  if (savedOnly && savedIds) {
    if (savedIds.size === 0) {
      conditions.push(sql`false`);
    } else {
      conditions.push(sql`${anglerTips.id} IN ${[...savedIds]}`);
    }
  }

  const rows = await db.query.anglerTips.findMany({
    where: and(...conditions),
    orderBy: sort === "top" ? [desc(anglerTips.helpfulCount), desc(anglerTips.createdAt)] : [desc(anglerTips.createdAt)],
    limit: PAGE_SIZE + 1, // one extra row = "has next page"
    offset: (page - 1) * PAGE_SIZE,
  });
  const hasNext = rows.length > PAGE_SIZE;
  const tips = rows.slice(0, PAGE_SIZE);

  const link = (over: Partial<Params>) => {
    const merged = { q, category, sort, saved: savedOnly ? "1" : "", page: "", ...over };
    const usp = new URLSearchParams();
    if (merged.q) usp.set("q", merged.q);
    if (merged.category) usp.set("category", merged.category);
    if (merged.sort && merged.sort !== "new") usp.set("sort", merged.sort);
    if (merged.saved === "1") usp.set("saved", "1");
    if (merged.page && merged.page !== "1") usp.set("page", merged.page);
    const s = usp.toString();
    return s ? `/tips?${s}` : "/tips";
  };

  return (
    <div>
      <PageHeader
        title="Angler Tips"
        subtitle="One practical tip every day on the home screen. The whole library lives here."
      />

      {/* search + sort */}
      <form method="GET" role="search" aria-label="Search tips" className="mb-4 flex flex-wrap items-center gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        {savedOnly && <input type="hidden" name="saved" value="1" />}
        <div className="relative flex-1 min-w-56 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-300" />
          <input
            name="q"
            defaultValue={q}
            aria-label="Search tips"
            placeholder="Search tips…"
            className="w-full rounded-xl border border-sand-300 bg-white pl-10 pr-4 py-2.5 min-h-11 text-[15px] focus:outline-2 focus:outline-tide-500"
          />
        </div>
        <select
          name="sort"
          defaultValue={sort}
          aria-label="Sort tips"
          className="rounded-xl border border-sand-300 bg-white px-3 py-2.5 min-h-11 text-sm"
        >
          <option value="new">Newest</option>
          <option value="top">Most helpful</option>
        </select>
        <button className="inline-flex min-h-11 items-center rounded-xl bg-tide-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-tide-800">
          Search
        </button>
      </form>

      {/* category chips */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        <Link
          href={link({ category: "", page: "" })}
          className={`inline-flex min-h-10 items-center rounded-full px-3.5 py-1.5 text-xs font-bold ${!category && !savedOnly ? "bg-tide-900 text-white" : "bg-white border border-sand-300 text-ink-700 hover:bg-sand-100"}`}
        >
          All
        </Link>
        {user && (
          <Link
            href={link({ saved: savedOnly ? "" : "1", category: "", page: "" })}
            className={`inline-flex min-h-10 items-center rounded-full px-3.5 py-1.5 text-xs font-bold ${savedOnly ? "bg-tide-900 text-white" : "bg-white border border-sand-300 text-ink-700 hover:bg-sand-100"}`}
          >
            My saved tips
          </Link>
        )}
        {TIP_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={link({ category: c === category ? "" : c, saved: "", page: "" })}
            className={`inline-flex min-h-10 items-center rounded-full px-3.5 py-1.5 text-xs font-bold ${category === c ? "bg-tide-900 text-white" : "bg-white border border-sand-300 text-ink-700 hover:bg-sand-100"}`}
          >
            {c}
          </Link>
        ))}
      </div>

      {tips.length === 0 ? (
        <EmptyState
          icon={<Lightbulb />}
          title={savedOnly ? "No saved tips yet" : "No tips match"}
          body={savedOnly ? "Tap Save on any tip and it lands here." : "Try a different search or category."}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tips.map((t) => (
            <Link key={t.id} href={`/tips/${t.slug}`} className="group">
              <Card className="p-5 h-full hover:shadow-lift transition-shadow">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="neutral">{t.category}</Badge>
                  {savedIds?.has(t.id) && <Badge variant="salt">Saved</Badge>}
                </div>
                <h2 className="mt-2 font-display font-bold text-ink-900 group-hover:text-tide-700 transition-colors leading-snug">
                  {t.title}
                </h2>
                <p className="mt-1.5 text-sm text-ink-600 leading-relaxed line-clamp-3">{t.tipText}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                  <ThumbsUp className="size-3.5" aria-hidden />
                  {t.helpfulCount} found this helpful
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {(page > 1 || hasNext) && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link href={link({ page: String(page - 1) })} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-sand-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-sand-100">
              <ArrowLeft className="size-4" /> Previous
            </Link>
          )}
          {hasNext && (
            <Link href={link({ page: String(page + 1) })} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-sand-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-sand-100">
              Next <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
