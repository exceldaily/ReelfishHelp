import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { biteBoards, species } from "@/db/schema";
import { getProfile } from "@/lib/auth-helpers";
import { toRegion } from "@/lib/regions";
import { PageHeader } from "@/components/ui";
import { BiteReportForm } from "@/components/bite-report-form";

export const metadata = { title: "Report a Bite" };

export default async function ReportBitePage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>;
}) {
  const { board: boardSlug } = await searchParams;
  const session = await auth();
  const profile = session?.user ? await getProfile(session.user.id) : null;
  const region = toRegion(profile?.region);
  const db = await getDb();
  const boards = await db.query.biteBoards.findMany({
    where: and(eq(biteBoards.active, true), eq(biteBoards.region, region)),
    orderBy: [biteBoards.name],
  });
  const selected = boardSlug ? boards.find((b) => b.slug === boardSlug) : null;
  const speciesRows = await db.query.species.findMany({
    where: and(eq(species.active, true), eq(species.region, region)),
    orderBy: [species.commonName],
  });

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Report a Bite"
        subtitle="Share what is working right now in under a minute. Keep exact spots private; public reports only use broad areas."
      />
      <BiteReportForm
        boards={boards.map((b) => ({ id: b.id, name: b.name, regionLabel: b.regionLabel }))}
        species={speciesRows.map((s) => ({ id: s.id, name: s.commonName }))}
        selectedBoardId={selected?.id ?? null}
      />
    </div>
  );
}
