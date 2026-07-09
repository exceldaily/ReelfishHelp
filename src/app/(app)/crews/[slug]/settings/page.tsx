import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { getDb, crews } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { US_STATES } from "@/data/regulations";
import { PageHeader, Card, Button, ButtonLink, SectionTitle } from "@/components/ui";
import { CrewForm } from "@/components/crew-form";
import { updateCrew, deleteCrew, rotateInviteCode } from "@/lib/actions/crew-actions";

export const metadata = { title: "Crew settings" };

export default async function CrewSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  const db = await getDb();
  const crew = await db.query.crews.findFirst({ where: eq(crews.slug, slug) });
  if (!crew) notFound();
  if (crew.ownerId !== user.id) redirect(`/crews/${crew.slug}`);

  return (
    <div className="max-w-2xl mx-auto">
      <ButtonLink href={`/crews/${crew.slug}`} variant="ghost" size="sm" className="mb-2">
        <ArrowLeft className="size-4" /> Back to crew
      </ButtonLink>
      <PageHeader title="Crew settings" subtitle={crew.name} />

      <CrewForm
        action={updateCrew}
        crew={{ id: crew.id, name: crew.name, description: crew.description, homeState: crew.homeState, privacy: crew.privacy }}
        submitLabel="Save changes"
        states={US_STATES}
      />

      <Card className="p-5 mt-6">
        <SectionTitle className="mb-1">Invite code</SectionTitle>
        <p className="text-sm text-ink-500 mb-3">
          Share this code so anglers can join {crew.privacy === "private" ? "this private crew" : "directly"}. Rotate it to revoke old invites.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <code className="rounded-lg bg-sand-100 px-3 py-2 font-mono text-sm text-ink-900 tracking-wider">{crew.inviteCode}</code>
          <form action={rotateInviteCode}>
            <input type="hidden" name="crewId" value={crew.id} />
            <Button type="submit" variant="outline" size="sm"><RefreshCw className="size-4" /> Rotate</Button>
          </form>
        </div>
      </Card>

      <Card className="p-5 mt-6 border-red-200">
        <SectionTitle className="mb-1">Danger zone</SectionTitle>
        <p className="text-sm text-ink-500 mb-3">Deleting a crew removes its feed and membership for everyone. This can&apos;t be undone.</p>
        <details>
          <summary className="text-sm font-semibold text-red-700 cursor-pointer">Delete this crew</summary>
          <form action={deleteCrew} className="mt-3">
            <input type="hidden" name="crewId" value={crew.id} />
            <Button type="submit" variant="danger" size="sm">Permanently delete {crew.name}</Button>
          </form>
        </details>
      </Card>
    </div>
  );
}
