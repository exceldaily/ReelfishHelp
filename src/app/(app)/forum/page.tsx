import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { CheckCircle2, MessageCircle, PlusCircle, ThumbsUp } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { biteBoards, forumQuestions } from "@/db/schema";
import { createForumQuestion } from "@/lib/actions/forum-actions";
import { Badge, Button, Card, EmptyState, Input, Label, PageHeader, Select, Textarea } from "@/components/ui";

export const metadata = { title: "Forum" };

function shortDate(value: Date) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, session, db] = await Promise.all([searchParams, auth(), getDb()]);
  const [boards, questions] = await Promise.all([
    db.query.biteBoards.findMany({ where: eq(biteBoards.active, true), orderBy: [biteBoards.name] }),
    db.query.forumQuestions.findMany({
      orderBy: [desc(forumQuestions.updatedAt)],
      limit: 40,
      with: { board: true, user: { with: { profile: true } } },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Forum"
        subtitle="Ask fishing questions and compare notes with the community."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="space-y-3">
          {questions.length === 0 ? (
            <EmptyState icon={<MessageCircle />} title="No questions yet" body="Start the first discussion." />
          ) : (
            questions.map((q) => (
              <Link
                key={q.id}
                href={`/forum/${q.id}`}
                className="block rounded-2xl border border-sand-200 bg-white p-4 shadow-card transition-shadow hover:shadow-lift"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-500">
                  <Badge variant={q.status === "resolved" ? "fresh" : "outline"}>
                    {q.status === "resolved" && <CheckCircle2 className="size-3" />}
                    {q.status}
                  </Badge>
                  {q.board && <Badge variant="neutral">{q.board.regionLabel}</Badge>}
                  <span>{shortDate(q.updatedAt)}</span>
                </div>
                <h2 className="mt-3 font-display text-lg font-bold text-ink-900">{q.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-600">{q.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-ink-500">
                  <span>{q.answerCount} answers</span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="size-3.5" />
                    {q.helpfulCount} useful
                  </span>
                  <span>by {q.user.profile?.displayName ?? "Angler"}</span>
                </div>
              </Link>
            ))
          )}
        </section>

        <aside>
          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-display font-bold text-ink-900">
              <PlusCircle className="size-5 text-tide-700" />
              Ask the Community
            </h2>
            {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
            {session?.user ? (
              <form action={createForumQuestion} className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="title">Question</Label>
                  <Input id="title" name="title" required maxLength={140} placeholder="What should I throw for..." />
                </div>
                <div>
                  <Label htmlFor="boardId">State board</Label>
                  <Select id="boardId" name="boardId" defaultValue="">
                    <option value="">No board</option>
                    {boards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="body">Details</Label>
                  <Textarea id="body" name="body" required className="min-h-32" placeholder="Water, season, target species, gear, what you have already tried..." />
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" name="tags" placeholder="redfish, pier, beginner" />
                </div>
                <Button className="w-full">
                  <PlusCircle className="size-4" />
                  Post question
                </Button>
              </form>
            ) : (
              <div className="mt-4">
                <Link href="/login" className="text-sm font-bold text-tide-700 hover:text-tide-900">
                  Log in to ask a question
                </Link>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
