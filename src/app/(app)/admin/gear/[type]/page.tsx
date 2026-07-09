/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { getDb } from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { PageHeader, Card, Badge, ButtonLink } from "@/components/ui";
import { TYPE_CFG, tableFor, isGearType } from "@/lib/admin/gear-admin";
import { deleteGearRow } from "@/lib/actions/admin-gear-actions";

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  return { title: isGearType(type) ? `${TYPE_CFG[type].label} · Admin` : "Admin" };
}

const STATUS_BADGE: Record<string, "neutral" | "orange" | "fresh"> = { draft: "neutral", review: "orange", published: "fresh" };

export default async function AdminGearListPage({ params }: { params: Promise<{ type: string }> }) {
  await requireAdmin();
  const { type } = await params;
  if (!isGearType(type)) notFound();
  const cfg = TYPE_CFG[type];
  const db = await getDb();
  const { table, idCol } = tableFor(type);
  const rows = (await db.select().from(table as any)) as any[];
  const idKey = (idCol as any).name === "species_slug" ? "speciesSlug" : "id";
  rows.sort((a, b) => String(a[cfg.titleField] ?? "").localeCompare(String(b[cfg.titleField] ?? "")));

  return (
    <div>
      <Link href="/admin/gear" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> Gear content
      </Link>
      <PageHeader
        title={cfg.label}
        subtitle={`${rows.length} item${rows.length === 1 ? "" : "s"}`}
        action={<ButtonLink href={`/admin/gear/${type}/new`} size="sm"><Plus className="size-4" /> New</ButtonLink>}
      />
      <Card className="p-2 sm:p-3">
        <ul className="divide-y divide-sand-100">
          {rows.map((r) => (
            <li key={r[idKey]} className="flex items-center justify-between gap-3 px-2 py-2.5">
              <div className="min-w-0 flex items-center gap-2.5">
                <Badge variant={STATUS_BADGE[r.status] ?? "neutral"} className="capitalize shrink-0">{r.status}</Badge>
                <span className="font-semibold text-sm text-ink-900 truncate">{r[cfg.titleField]}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link href={`/admin/gear/${type}/${r[idKey]}`} className="text-tide-700 hover:text-tide-900" aria-label="Edit"><Pencil className="size-4" /></Link>
                <form action={deleteGearRow}>
                  <input type="hidden" name="__type" value={type} />
                  <input type="hidden" name="__id" value={r[idKey]} />
                  <button type="submit" className="text-ink-300 hover:text-red-600" aria-label="Delete"><Trash2 className="size-4" /></button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
