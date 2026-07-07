import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { Shield, Fish, Flag, Users as UsersIcon, Trophy, Scale } from "lucide-react";
import { getDb, species, reports, users, catches } from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { PageHeader, Card, Badge } from "@/components/ui";
import { AdminReportRow } from "@/components/admin-controls";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  await requireAdmin();
  const db = await getDb();
  const [[speciesCount], [userCount], [catchCount], openReports] = await Promise.all([
    db.select({ value: count() }).from(species),
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(catches),
    db.query.reports.findMany({ where: eq(reports.status, "open"), orderBy: [desc(reports.createdAt)] }),
  ]);

  return (
    <div>
      <PageHeader
        title={<span className="inline-flex items-center gap-2.5"><Shield className="size-7 text-tide-600" /> Admin</span>}
        subtitle="Content management and community moderation."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {[
          [speciesCount.value, "Species", Fish],
          [userCount.value, "Users", UsersIcon],
          [catchCount.value, "Catches", Trophy],
          [openReports.length, "Open reports", Flag],
        ].map(([n, label, Icon]) => {
          const I = Icon as React.ComponentType<{ className?: string }>;
          return (
            <Card key={label as string} className="p-4 flex items-center gap-3">
              <span className="size-10 rounded-xl bg-tide-100 grid place-items-center"><I className="size-5 text-tide-700" /></span>
              <div>
                <div className="font-display text-xl font-extrabold text-ink-900">{n as number}</div>
                <div className="text-xs font-bold uppercase tracking-wide text-ink-500">{label as string}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        <Link href="/admin/species" className="block">
          <Card className="p-5 hover:shadow-lift transition-shadow">
            <h3 className="font-display font-bold text-ink-900 flex items-center gap-2">
              <Fish className="size-5 text-tide-600" /> Species & Catch Guides
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              Edit species data, guide content, images, regions, seasons, and activate/retire species.
            </p>
          </Card>
        </Link>
        <Card className="p-5">
          <h3 className="font-display font-bold text-ink-900 flex items-center gap-2">
            <Scale className="size-5 text-tide-600" /> State regulation links
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            All 50 state agency links are seeded in the regulation_links table — edit them from the species pages
            or directly in the database. Built to support automated regulation feeds later.
          </p>
        </Card>
      </div>

      <h2 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
        <Flag className="size-5 text-red-600" /> Reports queue
        {openReports.length > 0 && <Badge variant="orange">{openReports.length} open</Badge>}
      </h2>
      {openReports.length === 0 ? (
        <Card className="p-6 text-sm text-ink-500">No open reports — the water&apos;s calm.</Card>
      ) : (
        <div className="space-y-3">
          {openReports.map((r) => (
            <AdminReportRow
              key={r.id}
              report={{
                id: r.id,
                targetType: r.targetType,
                targetId: r.targetId,
                reason: r.reason,
                details: r.details,
                createdAt: r.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
