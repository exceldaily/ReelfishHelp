import { PageHeader } from "@/components/ui";
import { CrewForm } from "@/components/crew-form";
import { createCrew } from "@/lib/actions/crew-actions";
import { US_STATES } from "@/data/regulations";
import { requireUser } from "@/lib/auth-helpers";

export const metadata = { title: "Create a crew" };

export default async function NewCrewPage() {
  await requireUser();
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Create a crew"
        subtitle="You'll be the owner. Open crews show up in the directory; private crews are invite-only."
      />
      <CrewForm action={createCrew} submitLabel="Create crew" states={US_STATES} />
    </div>
  );
}
