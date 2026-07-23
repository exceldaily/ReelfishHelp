import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { eq } from "drizzle-orm";
import { biteBoards, species } from "@/db/schema";
import { createVerifiedReport } from "@/lib/actions/verified-title-actions";
import { activeTitlesFor } from "@/lib/verified";
import { titleDef } from "@/data/verified-titles";
import { Button, Card, Input, Label, PageHeader, Select, Textarea } from "@/components/ui";

export const metadata = { title: "Post a Verified Report" };

/** Extra structured fields per report kind, matching the spec. */
const KIND_FIELDS: Record<string, { id: string; label: string; textarea?: boolean }[]> = {
  fishing_guide: [
    { id: "method", label: "Fishing method" },
    { id: "bait", label: "Bait / lure working" },
    { id: "conditions", label: "Conditions" },
    { id: "tideNotes", label: "Tide notes" },
    { id: "bookingCta", label: "Booking link (optional CTA)" },
  ],
  charter_captain: [
    { id: "method", label: "Fishing method" },
    { id: "bait", label: "Bait / lure working" },
    { id: "conditions", label: "Conditions" },
    { id: "tideNotes", label: "Tide notes" },
    { id: "bookingCta", label: "Booking link (optional CTA)" },
  ],
  tackle_shop: [
    { id: "baitAvailability", label: "Bait availability" },
    { id: "gearRecommendations", label: "Gear recommendations" },
    { id: "conditions", label: "Conditions" },
    { id: "localBiteNotes", label: "Local bite notes", textarea: true },
    { id: "shopNote", label: "Shop note" },
  ],
  tournament_angler: [
    { id: "method", label: "Fishing method" },
    { id: "gearSetup", label: "Gear setup" },
    { id: "techniqueNotes", label: "Technique notes", textarea: true },
    { id: "tournamentInsight", label: "Tournament-related insight", textarea: true },
  ],
};

export default async function VerifiedReportPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const db = await getDb();
  const titles = await activeTitlesFor(db, session.user.id);
  if (titles.length === 0) redirect("/verified");
  const titleSlug = titles[0];
  const def = titleDef(titleSlug)!;
  const { error } = await searchParams;

  const [boards, allSpecies] = await Promise.all([
    db.query.biteBoards.findMany({ where: eq(biteBoards.active, true), orderBy: (b, { asc }) => [asc(b.regionLabel)] }),
    db.query.species.findMany({ where: eq(species.active, true), orderBy: (s, { asc }) => [asc(s.commonName)] }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/verified" className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700">
        <ArrowLeft className="size-4" /> Verified titles
      </Link>
      <PageHeader
        title={`Post a ${def.reportLabel}`}
        subtitle="General areas only — never post exact spots. Your report shows on the bite board, species page, and your profile."
      />
      {error && <Card className="mb-4 border-red-200 p-4 text-sm font-semibold text-red-700">{error}</Card>}
      <Card className="p-5 sm:p-6">
        <form action={createVerifiedReport} className="space-y-4">
          <input type="hidden" name="titleSlug" value={titleSlug} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="generalArea">General area *</Label>
              <Input id="generalArea" name="generalArea" required maxLength={160} placeholder="e.g. Pensacola Bay grass flats" />
            </div>
            <div>
              <Label htmlFor="speciesText">Species</Label>
              <Input id="speciesText" name="speciesText" maxLength={200} placeholder="Redfish, speckled trout…" />
            </div>
            <div>
              <Label htmlFor="boardId">Bite board (state)</Label>
              <Select id="boardId" name="boardId" defaultValue="">
                <option value="">None</option>
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>{b.regionLabel}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="speciesId">Link a species guide</Label>
              <Select id="speciesId" name="speciesId" defaultValue="">
                <option value="">None</option>
                {allSpecies.map((s) => (
                  <option key={s.id} value={s.id}>{s.commonName}</option>
                ))}
              </Select>
            </div>
            {KIND_FIELDS[titleSlug]?.map((f) =>
              f.textarea ? (
                <div key={f.id} className="sm:col-span-2">
                  <Label htmlFor={`field_${f.id}`}>{f.label}</Label>
                  <Textarea id={`field_${f.id}`} name={`field_${f.id}`} maxLength={600} className="min-h-20" />
                </div>
              ) : (
                <div key={f.id}>
                  <Label htmlFor={`field_${f.id}`}>{f.label}</Label>
                  <Input id={`field_${f.id}`} name={`field_${f.id}`} maxLength={600} />
                </div>
              )
            )}
          </div>
          <div>
            <Label htmlFor="body">Report *</Label>
            <Textarea id="body" name="body" required maxLength={4000} className="min-h-36" placeholder="What's happening on the water…" />
          </div>
          <Button>
            <Send className="size-4" /> Publish {def.reportLabel}
          </Button>
        </form>
      </Card>
    </div>
  );
}
