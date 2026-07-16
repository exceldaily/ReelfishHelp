import Link from "next/link";
import { asc } from "drizzle-orm";
import { ArrowLeft, Lightbulb, Plus, CalendarDays, ThumbsUp, Bookmark, Share2 } from "lucide-react";
import { getDb, anglerTips } from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { pickDailyTip, utcToday } from "@/lib/tips";
import { PageHeader, Badge, Card, ButtonLink } from "@/components/ui";
import { toggleTipActive } from "@/lib/actions/admin-tip-actions";

export const metadata = { title: "Angler Tips · Admin" };

export default async function AdminTipsPage() {
  await requireAdmin();
  const db = await getDb();
  const tips = await db.query.anglerTips.findMany({
    orderBy: [asc(anglerTips.displayOrder), asc(anglerTips.createdAt)],
  });
  const todayId = pickDailyTip(tips, utcToday());

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> Admin
      </Link>
      <PageHeader
        title={<span className="inline-flex items-center gap-2.5"><Lightbulb className="size-6 text-tide-600" /> Angler Tips</span>}
        subtitle="One tip shows on every home screen per day. Scheduled tips win their date; the rest rotate in order."
        action={
          <ButtonLink href="/admin/tips/new">
            <Plus className="size-4" /> New tip
          </ButtonLink>
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-500 border-b border-sand-200">
                <th className="py-3 px-4 font-semibold">Order</th>
                <th className="py-3 px-4 font-semibold">Tip</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Scheduled</th>
                <th className="py-3 px-3 font-semibold text-right"><ThumbsUp className="inline size-3.5" aria-label="Helpful count" /></th>
                <th className="py-3 px-3 font-semibold text-right"><Bookmark className="inline size-3.5" aria-label="Save count" /></th>
                <th className="py-3 px-3 font-semibold text-right"><Share2 className="inline size-3.5" aria-label="Share count" /></th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tips.map((t) => (
                <tr key={t.id} className="border-b border-sand-100 hover:bg-sand-50/60">
                  <td className="py-2.5 px-4 text-ink-500">{t.displayOrder}</td>
                  <td className="py-2.5 px-4">
                    <Link href={`/admin/tips/${t.id}`} className="font-semibold text-ink-900 hover:text-tide-700">
                      {t.title}
                    </Link>
                    {t.id === todayId && <Badge variant="orange" className="ml-2">Showing today</Badge>}
                  </td>
                  <td className="py-2.5 px-3"><Badge variant="neutral">{t.category}</Badge></td>
                  <td className="py-2.5 px-3">
                    <form action={toggleTipActive}>
                      <input type="hidden" name="__id" value={t.id} />
                      <button
                        className={`inline-flex min-h-9 items-center rounded-full px-3 py-1 text-xs font-bold ${t.isActive ? "bg-moss-100 text-moss-700" : "bg-sand-100 text-ink-500"}`}
                        title={t.isActive ? "Click to deactivate" : "Click to activate"}
                      >
                        {t.isActive ? "Active" : "Inactive"}
                      </button>
                    </form>
                  </td>
                  <td className="py-2.5 px-3 text-ink-500 whitespace-nowrap">
                    {t.publishDate ? (
                      <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> {t.publishDate}</span>
                    ) : (
                      "rotation"
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-ink-700">{t.helpfulCount}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-ink-700">{t.saveCount}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-ink-700">{t.shareCount}</td>
                  <td className="py-2.5 px-4 text-right">
                    <Link href={`/admin/tips/${t.id}`} className="text-sm font-bold text-tide-700 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {tips.length === 0 && (
        <p className="mt-4 text-sm text-ink-500">No tips yet. Create one and it shows on the home screen tomorrow.</p>
      )}
    </div>
  );
}
