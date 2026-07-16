import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, Trash2 } from "lucide-react";
import { getDb, anglerTips, type AnglerTip } from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { TIP_CATEGORIES } from "@/lib/tips";
import { PageHeader, Card, Input, Label, Select, Textarea, Button, FieldError } from "@/components/ui";
import { DailyTipCard } from "@/components/daily-tip-card";
import { saveTip, deleteTip } from "@/lib/actions/admin-tip-actions";

export const metadata = { title: "Edit Tip · Admin" };

const ICON_OPTIONS = ["lightbulb", "fish", "waves", "anchor", "wind", "lifebuoy", "compass", "ship"];

export default async function AdminTipEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { err } = await searchParams;
  const db = await getDb();

  let tip: AnglerTip | null = null;
  if (id !== "new") {
    tip = (await db.query.anglerTips.findFirst({ where: eq(anglerTips.id, id) })) ?? null;
    if (!tip) notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/tips" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> Angler Tips
      </Link>
      <PageHeader
        title={tip ? "Edit tip" : "New tip"}
        subtitle={tip ? `Slug: ${tip.slug}` : "The link slug is generated from the title."}
      />

      {tip && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-500">Preview (as shown on the home screen)</p>
          <DailyTipCard
            tip={{
              id: tip.id,
              slug: tip.slug,
              title: tip.title,
              tipText: tip.tipText,
              category: tip.category,
              icon: tip.icon,
              helpfulCount: tip.helpfulCount,
              viewerHelpful: false,
              viewerSaved: false,
            }}
            signedIn={false}
            showMoreLink={false}
          />
        </div>
      )}

      <Card className="p-5 sm:p-7">
        <form action={saveTip} className="space-y-4">
          <input type="hidden" name="__id" value={tip?.id ?? "new"} />
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={tip?.title ?? ""} required maxLength={120} />
          </div>
          <div>
            <Label htmlFor="tipText">Tip text</Label>
            <Textarea id="tipText" name="tipText" defaultValue={tip?.tipText ?? ""} required maxLength={600} className="min-h-28" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select id="category" name="category" defaultValue={tip?.category ?? "Beginner"}>
                {TIP_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="icon">Icon</Label>
              <Select id="icon" name="icon" defaultValue={tip?.icon ?? "lightbulb"}>
                {ICON_OPTIONS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="displayOrder">Rotation order</Label>
              <Input id="displayOrder" name="displayOrder" type="number" defaultValue={tip?.displayOrder ?? 0} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="publishDate">Scheduled date (optional)</Label>
              <Input id="publishDate" name="publishDate" type="date" defaultValue={tip?.publishDate ?? ""} />
              <p className="mt-1 text-xs text-ink-500">Shows exactly on this day, beating the rotation.</p>
            </div>
            <div>
              <Label htmlFor="expirationDate">Expires (optional)</Label>
              <Input id="expirationDate" name="expirationDate" type="date" defaultValue={tip?.expirationDate ?? ""} />
              <p className="mt-1 text-xs text-ink-500">Hidden everywhere after this day.</p>
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input id="imageUrl" name="imageUrl" defaultValue={tip?.imageUrl ?? ""} placeholder="/species/redfish.jpg" />
            </div>
          </div>
          <label className="inline-flex min-h-11 items-center gap-2.5 text-sm font-semibold text-ink-700 cursor-pointer">
            <input type="checkbox" name="isActive" defaultChecked={tip?.isActive ?? true} className="size-5 accent-tide-600" />
            Active (inactive tips never show anywhere)
          </label>
          <FieldError>{err}</FieldError>
          <div className="flex items-center gap-3">
            <Button>{tip ? "Save changes" : "Create tip"}</Button>
            <Link href="/admin/tips" className="inline-flex min-h-11 items-center rounded-xl border border-sand-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-sand-100">
              Cancel
            </Link>
          </div>
        </form>
        {tip && (
          <form action={deleteTip} className="mt-6 border-t border-sand-100 pt-4">
            <input type="hidden" name="__id" value={tip.id} />
            <button className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-red-700 hover:underline">
              <Trash2 className="size-4" /> Delete this tip permanently
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
