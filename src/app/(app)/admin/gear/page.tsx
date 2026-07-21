/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { count } from "drizzle-orm";
import { ArrowLeft, Wrench } from "lucide-react";
import { getDb } from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { PageHeader, Card } from "@/components/ui";
import { TYPE_CFG, tableFor, type GearTypeKey } from "@/lib/admin/gear-admin";

export const metadata = { title: "Gear content · Admin" };

export default async function AdminGearPage() {
  await requireAdmin();
  const db = await getDb();
  const keys = Object.keys(TYPE_CFG) as GearTypeKey[];
  const counts = await Promise.all(
    keys.map(async (k) => {
      const { table } = tableFor(k);
      const [{ v }] = await db.select({ v: count() }).from(table as any);
      return [k, Number(v)] as const;
    })
  );

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> Admin
      </Link>
      <PageHeader
        title={<span className="inline-flex items-center gap-2.5"><Wrench className="size-6 text-tide-600" /> Gear content</span>}
        subtitle="Create and edit gear education content, knots, setups, brands, and fish gear requirements. Set draft / review / published status."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map(([k, n]) => (
          <Link key={k} href={`/admin/gear/${k}`} className="group bg-card rounded-2xl border border-edge shadow-card p-5 hover:shadow-lift transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-ink-900 group-hover:text-tide-700 transition-colors">{TYPE_CFG[k].label}</h3>
              <span className="text-2xl font-display font-extrabold text-tide-700">{n}</span>
            </div>
            <p className="mt-1 text-sm text-ink-500">Manage {TYPE_CFG[k].label.toLowerCase()}.</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
