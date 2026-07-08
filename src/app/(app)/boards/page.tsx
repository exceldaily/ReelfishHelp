import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Map, PlusCircle, Waves } from "lucide-react";
import { getDb } from "@/db";
import { biteBoards, biteReports } from "@/db/schema";
import { PageHeader, Badge, ButtonLink, Card } from "@/components/ui";

export const metadata = { title: "Bite Boards" };

export default async function BoardsPage() {
  const db = await getDb();
  const boards = await db.query.biteBoards.findMany({
    where: eq(biteBoards.active, true),
    orderBy: [biteBoards.water, biteBoards.name],
    with: { reports: true, members: true },
  });
  const recentReports = await db.query.biteReports.findMany({
    orderBy: [desc(biteReports.createdAt)],
    limit: 6,
    with: { board: true, species: true },
  });
  const publicRecent = recentReports.filter((r) => r.board?.active && (r.visibility === "public_area" || r.visibility === "public_no_area"));

  return (
    <div>
      <PageHeader
        title="Bite Boards"
        subtitle="Broad local fishing intel: what people are seeing, catching, and using without exposing exact spots."
        action={
          <ButtonLink href="/report-a-bite">
            <PlusCircle className="size-4" /> Report a bite
          </ButtonLink>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => {
            const publicCount = board.reports.filter((r) => r.visibility === "public_area" || r.visibility === "public_no_area").length;
            return (
              <Link
                key={board.id}
                href={`/boards/${board.slug}`}
                className="group bg-white rounded-2xl border border-sand-200 shadow-card p-4 hover:shadow-lift transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="size-10 rounded-xl bg-tide-100 grid place-items-center">
                    <Map className="size-5 text-tide-700" />
                  </div>
                  <Badge variant={board.water === "saltwater" ? "salt" : board.water === "freshwater" ? "fresh" : "both"}>
                    {board.water === "both" ? "Fresh + Salt" : board.water}
                  </Badge>
                </div>
                <h2 className="mt-3 font-display font-bold text-ink-900 group-hover:text-tide-700">{board.name}</h2>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-300">{board.regionLabel}</p>
                <p className="mt-2 text-sm text-ink-600 leading-relaxed">{board.description}</p>
                <div className="mt-3 flex gap-3 text-xs font-semibold text-ink-500">
                  <span>{publicCount} public reports</span>
                  <span>{board.members.length} members</span>
                </div>
              </Link>
            );
          })}
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="font-display font-bold text-ink-900 flex items-center gap-2">
              <Waves className="size-5 text-tide-700" />
              Fresh Reports
            </h2>
            <div className="mt-3 space-y-3">
              {publicRecent.length === 0 ? (
                <p className="text-sm text-ink-500">No public bite reports yet. Be the first to post useful local intel.</p>
              ) : (
                publicRecent.map((r) => (
                  <Link key={r.id} href={r.board ? `/boards/${r.board.slug}` : "/boards"} className="block rounded-xl bg-sand-100/70 p-3 hover:bg-sand-100">
                    <div className="text-sm font-bold text-ink-900">{r.species?.commonName ?? r.customSpecies ?? "Unknown species"}</div>
                    <div className="text-xs text-ink-500">
                      {r.board?.name ?? "Unassigned"} {r.bait ? `- ${r.bait}` : ""}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
