import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { ArrowLeft, BadgeCheck, Upload } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { verifiedTitleRequests, verificationDocuments, profiles } from "@/db/schema";
import { saveTitleRequest } from "@/lib/actions/verified-title-actions";
import { titleDef, isVerifiedTitleSlug } from "@/data/verified-titles";
import { Button, Card, Input, Label, PageHeader, Textarea } from "@/components/ui";

export const metadata = { title: "Request Verified Title" };

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { title, error } = await searchParams;
  if (!title || !isVerifiedTitleSlug(title)) redirect("/verified");
  const def = titleDef(title)!;
  const db = await getDb();

  const [profile, existing] = await Promise.all([
    db.query.profiles.findFirst({ where: eq(profiles.userId, session.user.id) }),
    db.query.verifiedTitleRequests.findFirst({
      where: and(
        eq(verifiedTitleRequests.userId, session.user.id),
        inArray(verifiedTitleRequests.status, ["draft", "submitted", "under_review", "needs_more_info"])
      ),
    }),
  ]);
  const docs = existing
    ? await db.query.verificationDocuments.findMany({ where: eq(verificationDocuments.requestId, existing.id) })
    : [];
  const d = existing?.titleSlug === title ? existing : null;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/verified" className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700">
        <ArrowLeft className="size-4" /> Verified titles
      </Link>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2.5">
            <BadgeCheck className="size-6 text-reef-500" /> Apply: {def.label}
          </span>
        }
        subtitle={def.description}
      />
      {existing && existing.titleSlug !== title && (
        <Card className="mb-4 border-bait-400/40 p-4 text-sm text-ink-700">
          You already have an open {titleDef(existing.titleSlug)?.label} request. Submitting this form will change your
          open request to {def.label}.
        </Card>
      )}
      {error && (
        <Card className="mb-4 border-red-200 p-4 text-sm font-semibold text-red-700">{error}</Card>
      )}

      <Card className="p-5 sm:p-6">
        <form action={saveTitleRequest} className="space-y-4">
          <input type="hidden" name="titleSlug" value={title} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Full name *</Label>
              <Input id="fullName" name="fullName" defaultValue={d?.fullName ?? ""} required maxLength={120} />
            </div>
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" name="displayName" defaultValue={d?.displayName ?? profile?.displayName ?? ""} maxLength={120} />
            </div>
            <div>
              <Label htmlFor="businessName">{def.businessNameLabel ?? "Business or team name"}</Label>
              <Input id="businessName" name="businessName" defaultValue={d?.businessName ?? ""} maxLength={160} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" defaultValue={d?.state ?? profile?.homeState ?? ""} maxLength={30} placeholder="FL" />
            </div>
            <div>
              <Label htmlFor="serviceArea">General service area / home region</Label>
              <Input id="serviceArea" name="serviceArea" defaultValue={d?.serviceArea ?? ""} maxLength={200} placeholder="e.g. Pensacola Bay area" />
            </div>
            <div>
              <Label htmlFor="website">Website or booking link</Label>
              <Input id="website" name="website" defaultValue={d?.website ?? ""} maxLength={300} />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact email *</Label>
              <Input id="contactEmail" name="contactEmail" type="email" defaultValue={d?.contactEmail || session.user.email || ""} required maxLength={200} />
            </div>
            <div>
              <Label htmlFor="contactPhone">Contact phone (optional)</Label>
              <Input id="contactPhone" name="contactPhone" defaultValue={d?.contactPhone ?? ""} maxLength={40} />
            </div>
          </div>
          <div>
            <Label htmlFor="socialLinks">Social media links (comma or newline separated)</Label>
            <Input id="socialLinks" name="socialLinks" defaultValue={d?.socialLinks.join(", ") ?? ""} maxLength={600} />
          </div>
          <div>
            <Label htmlFor="bio">Short bio</Label>
            <Textarea id="bio" name="bio" defaultValue={d?.bio ?? ""} maxLength={1500} />
          </div>
          <div>
            <Label htmlFor="reason">Why are you requesting this title? *</Label>
            <Textarea id="reason" name="reason" defaultValue={d?.reason ?? ""} maxLength={1500} required />
          </div>

          <div className="border-t border-sand-100 pt-4">
            <h2 className="mb-3 font-display font-bold text-ink-900">{def.label} details</h2>
            <div className="space-y-4">
              {def.fields.map((f) =>
                f.type === "textarea" ? (
                  <div key={f.id}>
                    <Label htmlFor={`detail_${f.id}`}>{f.label}{f.required ? " *" : ""}</Label>
                    <Textarea id={`detail_${f.id}`} name={`detail_${f.id}`} defaultValue={d?.details[f.id] ?? ""} maxLength={2000} placeholder={f.placeholder} />
                  </div>
                ) : (
                  <div key={f.id}>
                    <Label htmlFor={`detail_${f.id}`}>{f.label}{f.required ? " *" : ""}</Label>
                    <Input id={`detail_${f.id}`} name={`detail_${f.id}`} defaultValue={d?.details[f.id] ?? ""} maxLength={300} placeholder={f.placeholder} />
                  </div>
                )
              )}
            </div>
          </div>

          <div className="border-t border-sand-100 pt-4">
            <Label htmlFor="proofFile" className="flex items-center gap-2">
              <Upload className="size-4 text-tide-600" /> Proof upload (license, storefront, results page…)
            </Label>
            <input
              id="proofFile"
              name="proofFile"
              type="file"
              accept="image/*"
              className="mt-1 block w-full rounded-xl border border-sand-300 bg-white px-3 py-2 text-sm text-ink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-tide-100 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-tide-800"
            />
            <p className="mt-1 text-xs text-ink-500">
              Proof is private — only you and ReelFishHelp admins can ever see it.
              {docs.length > 0 && ` ${docs.length} document${docs.length === 1 ? "" : "s"} already uploaded.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-sand-100 pt-4">
            <Button name="intent" value="submit">Submit for review</Button>
            <Button name="intent" value="draft" variant="outline">Save draft</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
