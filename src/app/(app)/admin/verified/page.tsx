import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { ArrowLeft, BadgeCheck, Eye, EyeOff } from "lucide-react";
import { getDb } from "@/db";
import { userVerifiedTitles, verifiedTitleRequests, verifiedUserReports } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";
import { adminRevokeTitle, adminToggleReportVisibility } from "@/lib/actions/verified-title-actions";
import { REQUEST_STATUS_LABEL, titleDef } from "@/data/verified-titles";
import { Badge, Button, Card, Input, PageHeader, SectionTitle } from "@/components/ui";

export const metadata = { title: "Verified Title Requests · Admin" };

export default async function AdminVerifiedPage() {
  await requireAdmin();
  const db = await getDb();
  const [pending, decided, activeTitles, reports] = await Promise.all([
    db.query.verifiedTitleRequests.findMany({
      where: inArray(verifiedTitleRequests.status, ["submitted", "under_review", "needs_more_info"]),
      orderBy: [desc(verifiedTitleRequests.updatedAt)],
      with: { user: { with: { profile: true } } },
    }),
    db.query.verifiedTitleRequests.findMany({
      where: inArray(verifiedTitleRequests.status, ["approved", "rejected"]),
      orderBy: [desc(verifiedTitleRequests.decidedAt)],
      limit: 20,
      with: { user: { with: { profile: true } } },
    }),
    db.query.userVerifiedTitles.findMany({
      where: eq(userVerifiedTitles.status, "active"),
      orderBy: [desc(userVerifiedTitles.grantedAt)],
      with: { user: { with: { profile: true } } },
    }),
    db.query.verifiedUserReports.findMany({
      orderBy: [desc(verifiedUserReports.createdAt)],
      limit: 20,
      with: { user: { with: { profile: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin" className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700">
        <ArrowLeft className="size-4" /> Admin
      </Link>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2.5">
            <BadgeCheck className="size-6 text-reef-500" /> Verified Title Requests
          </span>
        }
        subtitle="Review applications, approve or reject titles, and moderate verified-user reports."
      />

      <SectionTitle>Pending review ({pending.length})</SectionTitle>
      {pending.length === 0 ? (
        <Card className="mb-6 p-5 text-sm text-ink-500">No applications waiting.</Card>
      ) : (
        <div className="mb-6 space-y-2">
          {pending.map((r) => (
            <Link key={r.id} href={`/admin/verified/${r.id}`} className="block">
              <Card className="flex flex-wrap items-center gap-2 p-4 transition-shadow hover:shadow-lift">
                <Badge variant={r.status === "needs_more_info" ? "orange" : "salt"}>{REQUEST_STATUS_LABEL[r.status]}</Badge>
                <span className="font-bold text-ink-900">{r.user.profile?.displayName ?? r.fullName}</span>
                <Badge variant="outline">{titleDef(r.titleSlug)?.label}</Badge>
                <span className="ml-auto text-xs text-ink-500">{r.updatedAt.toLocaleString()}</span>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <SectionTitle>Verified users ({activeTitles.length})</SectionTitle>
      <div className="mb-6 space-y-2">
        {activeTitles.map((t) => (
          <Card key={t.id} className="flex flex-wrap items-center gap-2 p-4">
            {t.user.profile?.username ? (
              <Link href={`/u/${t.user.profile.username}`} className="font-bold text-tide-700 hover:underline">
                {t.user.profile.displayName}
              </Link>
            ) : (
              <span className="font-bold text-ink-900">{t.user.profile?.displayName ?? "User"}</span>
            )}
            <Badge variant="fresh">{titleDef(t.titleSlug)?.badgeLabel}</Badge>
            <span className="text-xs text-ink-500">since {t.grantedAt.toLocaleDateString()}</span>
            <form action={adminRevokeTitle} className="ml-auto flex items-center gap-2">
              <input type="hidden" name="titleId" value={t.id} />
              <Input name="reason" placeholder="Revoke reason" className="h-9 w-44 min-h-9 text-xs" />
              <Button size="sm" variant="danger">Revoke</Button>
            </form>
          </Card>
        ))}
        {activeTitles.length === 0 && <Card className="p-5 text-sm text-ink-500">No verified users yet.</Card>}
      </div>

      <SectionTitle>Latest verified reports</SectionTitle>
      <div className="mb-6 space-y-2">
        {reports.map((r) => (
          <Card key={r.id} className="flex flex-wrap items-center gap-2 p-4">
            <Badge variant="dark">{titleDef(r.titleSlug)?.reportLabel}</Badge>
            <span className="font-semibold text-ink-900">{r.user.profile?.displayName ?? "User"}</span>
            <span className="max-w-60 truncate text-xs text-ink-500">{r.generalArea} — {r.body.slice(0, 60)}</span>
            {r.moderationStatus === "hidden" && <Badge variant="orange">hidden</Badge>}
            <form action={adminToggleReportVisibility} className="ml-auto">
              <input type="hidden" name="reportId" value={r.id} />
              <Button size="sm" variant="outline">
                {r.moderationStatus === "visible" ? <><EyeOff className="size-4" /> Hide</> : <><Eye className="size-4" /> Unhide</>}
              </Button>
            </form>
          </Card>
        ))}
        {reports.length === 0 && <Card className="p-5 text-sm text-ink-500">No verified reports yet.</Card>}
      </div>

      <SectionTitle>Recent decisions</SectionTitle>
      <div className="space-y-2">
        {decided.map((r) => (
          <Link key={r.id} href={`/admin/verified/${r.id}`} className="block">
            <Card className="flex flex-wrap items-center gap-2 p-3 text-sm">
              <Badge variant={r.status === "approved" ? "fresh" : "neutral"}>{REQUEST_STATUS_LABEL[r.status]}</Badge>
              <span className="font-semibold text-ink-900">{r.user.profile?.displayName ?? r.fullName}</span>
              <Badge variant="outline">{titleDef(r.titleSlug)?.label}</Badge>
              <span className="ml-auto text-xs text-ink-500">{r.decidedAt?.toLocaleDateString()}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
