import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, CheckCircle2, CircleAlert, Eye, XCircle } from "lucide-react";
import { getDb } from "@/db";
import { badgeAuditLogs, verifiedTitleRequests } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";
import { adminAddRequestNote, adminSetRequestStatus } from "@/lib/actions/verified-title-actions";
import { REQUEST_STATUS_LABEL, titleDef } from "@/data/verified-titles";
import { Badge, Button, Card, Input, PageHeader, SectionTitle, Textarea } from "@/components/ui";

export const metadata = { title: "Review Request · Admin" };

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="text-sm">
      <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-ink-900">{value}</dd>
    </div>
  );
}

export default async function AdminVerifiedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const db = await getDb();
  const request = await db.query.verifiedTitleRequests.findFirst({
    where: eq(verifiedTitleRequests.id, id),
    with: { user: { with: { profile: true } }, documents: { with: { media: true } } },
  });
  if (!request) notFound();
  const def = titleDef(request.titleSlug);
  const auditRows = await db.query.badgeAuditLogs.findMany({
    where: eq(badgeAuditLogs.subjectUserId, request.userId),
    orderBy: [desc(badgeAuditLogs.createdAt)],
    limit: 15,
  });
  const open = ["submitted", "under_review", "needs_more_info"].includes(request.status);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/verified" className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700">
        <ArrowLeft className="size-4" /> Verified requests
      </Link>
      <PageHeader
        title={`${request.user.profile?.displayName ?? request.fullName} — ${def?.label}`}
        subtitle={
          <span className="inline-flex items-center gap-2">
            <Badge variant={request.status === "approved" ? "fresh" : request.status === "needs_more_info" ? "orange" : "salt"}>
              {REQUEST_STATUS_LABEL[request.status]}
            </Badge>
            {request.user.profile?.username && (
              <Link className="font-semibold text-tide-700 hover:underline" href={`/u/${request.user.profile.username}`}>
                @{request.user.profile.username}
              </Link>
            )}
            <span>applied {request.createdAt.toLocaleDateString()}</span>
          </span>
        }
      />

      <Card className="mb-4 p-5">
        <SectionTitle>Application</SectionTitle>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Row label="Full name" value={request.fullName} />
          <Row label="Display name" value={request.displayName} />
          <Row label={def?.businessNameLabel ?? "Business"} value={request.businessName} />
          <Row label="State" value={request.state} />
          <Row label="Service area" value={request.serviceArea} />
          <Row label="Website / booking" value={[request.website, request.bookingLink].filter(Boolean).join("  ·  ")} />
          <Row label="Contact email" value={request.contactEmail} />
          <Row label="Contact phone" value={request.contactPhone} />
          <Row label="Social links" value={request.socialLinks.join("\n")} />
        </dl>
        <dl className="mt-3 grid gap-3">
          <Row label="Bio" value={request.bio} />
          <Row label="Reason for requesting" value={request.reason} />
          {def?.fields.map((f) => <Row key={f.id} label={f.label} value={request.details[f.id]} />)}
        </dl>
      </Card>

      {/* private proof — admin-only via the protected media proxy */}
      <Card className="mb-4 p-5">
        <SectionTitle className="flex items-center gap-2"><Eye className="size-5 text-tide-600" /> Proof documents (private)</SectionTitle>
        {request.documents.length === 0 ? (
          <p className="text-sm text-ink-500">No documents uploaded. Check the proof links in the application answers above.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {request.documents.map((doc) => (
              <a key={doc.id} href={`/api/media/${doc.mediaId}/detail`} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative h-44 overflow-hidden rounded-xl border border-sand-200 bg-sand-50">
                  <Image src={`/api/media/${doc.mediaId}/feed`} alt={doc.label} fill sizes="300px" className="object-contain" unoptimized />
                </div>
                <p className="mt-1 truncate text-xs font-semibold text-ink-500">{doc.label}</p>
              </a>
            ))}
          </div>
        )}
      </Card>

      {open && (
        <Card className="mb-4 p-5">
          <SectionTitle>Decision</SectionTitle>
          <div className="flex flex-wrap gap-2">
            <form action={adminSetRequestStatus}>
              <input type="hidden" name="requestId" value={request.id} />
              <input type="hidden" name="action" value="approve" />
              <Button size="sm"><CheckCircle2 className="size-4" /> Approve {def?.badgeLabel}</Button>
            </form>
            {request.status !== "under_review" && (
              <form action={adminSetRequestStatus}>
                <input type="hidden" name="requestId" value={request.id} />
                <input type="hidden" name="action" value="under_review" />
                <Button size="sm" variant="secondary">Mark under review</Button>
              </form>
            )}
          </div>
          <form action={adminSetRequestStatus} className="mt-3 flex flex-wrap items-end gap-2">
            <input type="hidden" name="requestId" value={request.id} />
            <input type="hidden" name="action" value="needs_more_info" />
            <div className="min-w-60 flex-1">
              <Input name="message" placeholder="What do you need from them?" maxLength={1000} />
            </div>
            <Button size="sm" variant="outline"><CircleAlert className="size-4" /> Request more info</Button>
          </form>
          <form action={adminSetRequestStatus} className="mt-2 flex flex-wrap items-end gap-2">
            <input type="hidden" name="requestId" value={request.id} />
            <input type="hidden" name="action" value="reject" />
            <div className="min-w-60 flex-1">
              <Input name="message" placeholder="Rejection note shown to the applicant (optional)" maxLength={1000} />
            </div>
            <Button size="sm" variant="danger"><XCircle className="size-4" /> Reject</Button>
          </form>
        </Card>
      )}

      <Card className="mb-4 p-5">
        <SectionTitle>Internal notes</SectionTitle>
        {request.adminNotes.length > 0 && (
          <div className="mb-3 space-y-2">
            {request.adminNotes.map((n, i) => (
              <p key={i} className="rounded-xl bg-sand-50 px-3 py-2 text-sm text-ink-700">
                {n.note} <span className="text-xs text-ink-500">· {new Date(n.at).toLocaleString()}</span>
              </p>
            ))}
          </div>
        )}
        <form action={adminAddRequestNote} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="requestId" value={request.id} />
          <div className="min-w-60 flex-1">
            <Textarea name="note" placeholder="Note for other admins — never shown to the applicant" maxLength={1000} className="min-h-16" />
          </div>
          <Button size="sm" variant="outline">Add note</Button>
        </form>
      </Card>

      <Card className="p-5">
        <SectionTitle>Title history</SectionTitle>
        <div className="space-y-1.5">
          {auditRows.map((a) => (
            <p key={a.id} className="text-xs text-ink-500">
              <span className="font-bold text-ink-700">{a.action.replaceAll("_", " ")}</span> · {a.createdAt.toLocaleString()}
            </p>
          ))}
          {auditRows.length === 0 && <p className="text-sm text-ink-500">No history yet.</p>}
        </div>
      </Card>
    </div>
  );
}
