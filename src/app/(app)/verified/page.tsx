import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, inArray, desc } from "drizzle-orm";
import { BadgeCheck, FileText, PenLine, Send } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { professionalProfiles, userVerifiedTitles, verifiedTitleRequests } from "@/db/schema";
import { withdrawTitleRequest, saveProfessionalProfile } from "@/lib/actions/verified-title-actions";
import { latestVerifiedReports } from "@/lib/verified";
import { REQUEST_STATUS_LABEL, VERIFIED_TITLES, titleDef } from "@/data/verified-titles";
import { Badge, Button, ButtonLink, Card, Input, Label, PageHeader, SectionTitle, Textarea } from "@/components/ui";
import { VerifiedTitleBadge } from "@/components/verified-badge";
import { VerifiedReportCard } from "@/components/verified-report-card";

export const metadata = { title: "Verified Titles" };

const STATUS_VARIANT: Record<string, "neutral" | "salt" | "orange" | "fresh" | "outline"> = {
  draft: "outline",
  submitted: "salt",
  under_review: "salt",
  needs_more_info: "orange",
  approved: "fresh",
  rejected: "neutral",
};

export default async function VerifiedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const db = await getDb();
  const userId = session.user.id;

  const [titles, requests, proProfile, myReports] = await Promise.all([
    db.query.userVerifiedTitles.findMany({ where: and(eq(userVerifiedTitles.userId, userId), eq(userVerifiedTitles.status, "active")) }),
    db.query.verifiedTitleRequests.findMany({ where: eq(verifiedTitleRequests.userId, userId), orderBy: [desc(verifiedTitleRequests.createdAt)], limit: 5 }),
    db.query.professionalProfiles.findFirst({ where: eq(professionalProfiles.userId, userId) }),
    latestVerifiedReports(db, { userId, limit: 3 }),
  ]);
  const openRequest = requests.find((r) => ["draft", "submitted", "under_review", "needs_more_info"].includes(r.status));
  const verified = titles.length > 0;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2.5">
            <BadgeCheck className="size-7 text-reef-500" /> Verified Titles
          </span>
        }
        subtitle="Are you a fishing guide, tackle shop, tournament angler, or charter captain? Request a verified title so the community knows who you are."
      />

      {/* active titles */}
      {verified && (
        <Card className="mb-6 p-5">
          <SectionTitle>Your verified titles</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {titles.map((t) => (
              <VerifiedTitleBadge key={t.id} slug={t.titleSlug} />
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-500">
            Your badge shows on your profile, catches, bite reports, forum posts, comments, and crew activity.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/verified/report" size="sm">
              <Send className="size-4" /> Post a {titleDef(titles[0].titleSlug)?.reportLabel ?? "report"}
            </ButtonLink>
          </div>
        </Card>
      )}

      {/* request status */}
      {openRequest ? (
        <Card className="mb-6 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <SectionTitle className="mb-0">Your request</SectionTitle>
            <Badge variant={STATUS_VARIANT[openRequest.status] ?? "neutral"}>{REQUEST_STATUS_LABEL[openRequest.status]}</Badge>
            <Badge variant="outline">{titleDef(openRequest.titleSlug)?.label}</Badge>
          </div>
          {openRequest.status === "needs_more_info" ? (
            <>
              <p className="mt-3 rounded-xl border border-bait-400/40 bg-bait-100/60 px-3 py-2 text-sm font-semibold text-bait-700">
                {openRequest.moreInfoMessage ?? "We need a little more information before approving your title."}
              </p>
              <ButtonLink href={`/verified/apply?title=${openRequest.titleSlug}`} size="sm" className="mt-3">
                <PenLine className="size-4" /> Update your application
              </ButtonLink>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-500">
              Your request is being reviewed. We may ask for more information before approving your title.
            </p>
          )}
          {openRequest.status === "draft" && (
            <ButtonLink href={`/verified/apply?title=${openRequest.titleSlug}`} size="sm" className="mt-3">
              <PenLine className="size-4" /> Continue your application
            </ButtonLink>
          )}
          <form action={withdrawTitleRequest} className="mt-3">
            <input type="hidden" name="requestId" value={openRequest.id} />
            <button className="text-xs font-bold text-red-700 hover:underline">Withdraw request</button>
          </form>
        </Card>
      ) : (
        <Card className="mb-6 p-5">
          <SectionTitle>Request a verified title</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {VERIFIED_TITLES.map((t) => (
              <Link
                key={t.slug}
                href={`/verified/apply?title=${t.slug}`}
                className="rounded-2xl border border-sand-200 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-tide-300 hover:shadow-lift"
              >
                <span className="flex items-center gap-2 font-display font-bold text-ink-900">
                  <BadgeCheck className="size-4 text-reef-500" /> {t.label}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-500">{t.description}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* past decisions */}
      {requests.some((r) => ["approved", "rejected"].includes(r.status)) && (
        <Card className="mb-6 p-5">
          <SectionTitle>History</SectionTitle>
          <div className="space-y-2">
            {requests
              .filter((r) => ["approved", "rejected"].includes(r.status))
              .map((r) => (
                <p key={r.id} className="text-sm text-ink-500">
                  <Badge variant={STATUS_VARIANT[r.status] ?? "neutral"}>{REQUEST_STATUS_LABEL[r.status]}</Badge>{" "}
                  {titleDef(r.titleSlug)?.label} · {r.decidedAt?.toLocaleDateString() ?? r.updatedAt.toLocaleDateString()}
                </p>
              ))}
          </div>
        </Card>
      )}

      {/* professional profile editor */}
      {verified && (
        <Card className="mb-6 p-5">
          <SectionTitle className="flex items-center gap-2"><FileText className="size-5 text-tide-600" /> Professional profile</SectionTitle>
          <p className="mb-4 text-sm text-ink-500">Optional public info shown on your profile. Leave anything blank to hide it.</p>
          <form action={saveProfessionalProfile} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="businessName">{titleDef(titles[0].titleSlug)?.businessNameLabel ?? "Business name"}</Label>
              <Input id="businessName" name="businessName" defaultValue={proProfile?.businessName ?? ""} maxLength={160} />
            </div>
            <div>
              <Label htmlFor="serviceArea">Service area / home region</Label>
              <Input id="serviceArea" name="serviceArea" defaultValue={proProfile?.serviceArea ?? ""} maxLength={200} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" defaultValue={proProfile?.website ?? ""} maxLength={300} />
            </div>
            <div>
              <Label htmlFor="bookingLink">Booking link</Label>
              <Input id="bookingLink" name="bookingLink" defaultValue={proProfile?.bookingLink ?? ""} maxLength={300} />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" defaultValue={proProfile?.phone ?? ""} maxLength={40} />
            </div>
            {titles[0].titleSlug === "tackle_shop" && (
              <>
                <div>
                  <Label htmlFor="address">Shop address</Label>
                  <Input id="address" name="address" defaultValue={proProfile?.address ?? ""} maxLength={240} />
                </div>
                <div>
                  <Label htmlFor="hours">Hours (optional)</Label>
                  <Input id="hours" name="hours" defaultValue={proProfile?.hours ?? ""} maxLength={200} />
                </div>
                <div>
                  <Label htmlFor="pd_brandsCarried">Brands carried</Label>
                  <Input id="pd_brandsCarried" name="pd_brandsCarried" defaultValue={proProfile?.details.brandsCarried ?? ""} maxLength={500} />
                </div>
                <div>
                  <Label htmlFor="pd_baitNotes">Bait availability notes</Label>
                  <Input id="pd_baitNotes" name="pd_baitNotes" defaultValue={proProfile?.details.baitNotes ?? ""} maxLength={500} />
                </div>
              </>
            )}
            {(titles[0].titleSlug === "fishing_guide" || titles[0].titleSlug === "charter_captain") && (
              <>
                <div>
                  <Label htmlFor="pd_targetSpecies">Target species</Label>
                  <Input id="pd_targetSpecies" name="pd_targetSpecies" defaultValue={proProfile?.details.targetSpecies ?? ""} maxLength={500} />
                </div>
                <div>
                  <Label htmlFor="pd_fishingStyles">Fishing styles</Label>
                  <Input id="pd_fishingStyles" name="pd_fishingStyles" defaultValue={proProfile?.details.fishingStyles ?? ""} maxLength={500} />
                </div>
                <div>
                  <Label htmlFor="pd_tripTypes">Trip types</Label>
                  <Input id="pd_tripTypes" name="pd_tripTypes" defaultValue={proProfile?.details.tripTypes ?? ""} maxLength={500} />
                </div>
                <div>
                  <Label htmlFor="pd_yearsExperience">Years experience</Label>
                  <Input id="pd_yearsExperience" name="pd_yearsExperience" defaultValue={proProfile?.details.yearsExperience ?? ""} maxLength={500} />
                </div>
              </>
            )}
            {titles[0].titleSlug === "tournament_angler" && (
              <>
                <div>
                  <Label htmlFor="pd_teamName">Team name</Label>
                  <Input id="pd_teamName" name="pd_teamName" defaultValue={proProfile?.details.teamName ?? ""} maxLength={500} />
                </div>
                <div>
                  <Label htmlFor="pd_circuits">Tournament circuits</Label>
                  <Input id="pd_circuits" name="pd_circuits" defaultValue={proProfile?.details.circuits ?? ""} maxLength={500} />
                </div>
                <div>
                  <Label htmlFor="pd_notableFinishes">Notable finishes</Label>
                  <Input id="pd_notableFinishes" name="pd_notableFinishes" defaultValue={proProfile?.details.notableFinishes ?? ""} maxLength={500} />
                </div>
                <div>
                  <Label htmlFor="pd_sponsors">Sponsors (optional)</Label>
                  <Input id="pd_sponsors" name="pd_sponsors" defaultValue={proProfile?.details.sponsors ?? ""} maxLength={500} />
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <Label htmlFor="socialLinks">Social links (comma or newline separated)</Label>
              <Input id="socialLinks" name="socialLinks" defaultValue={proProfile?.socialLinks.join(", ") ?? ""} maxLength={600} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="publicBio">Professional bio</Label>
              <Textarea id="publicBio" name="publicBio" defaultValue={proProfile?.publicBio ?? ""} maxLength={1500} />
            </div>
            <div className="sm:col-span-2">
              <Button size="sm">Save professional profile</Button>
            </div>
          </form>
        </Card>
      )}

      {/* recent reports */}
      {myReports.length > 0 && (
        <section className="space-y-3">
          <SectionTitle>Your recent reports</SectionTitle>
          {myReports.map((r) => (
            <VerifiedReportCard key={r.id} report={r} compact />
          ))}
        </section>
      )}
    </div>
  );
}
