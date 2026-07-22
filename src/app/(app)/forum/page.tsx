import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { MessageCircle, PlusCircle, ThumbsUp } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { biteBoards, forumQuestions } from "@/db/schema";
import { createForumQuestion } from "@/lib/actions/forum-actions";
import { FORUM_TOPICS, forumTopicLabel, isForumTopic } from "@/data/forum-topics";
import { Badge, Button, Card, EmptyState, Input, Label, PageHeader, Select, Textarea } from "@/components/ui";

export const metadata = { title: "Forum" };

function shortDate(value: Date) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; topic?: string; board?: string }>;
}) {
  const [{ error, topic, board }, session, db] = await Promise.all([searchParams, auth(), getDb()]);
  const activeTopic = isForumTopic(topic) ? topic! : null;
  const activeBoardId = typeof board === "string" && board.length > 0 ? board : null;

  const filters = [
    activeTopic ? eq(forumQuestions.topic, activeTopic) : null,
    activeBoardId ? eq(forumQuestions.boardId, activeBoardId) : null,
  ].filter(Boolean) as ReturnType<typeof eq>[];

  const [boards, questions] = await Promise.all([
    db.query.biteBoards.findMany({ where: eq(biteBoards.active, true), orderBy: [biteBoards.name] }),
    db.query.forumQuestions.findMany({
      where: filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : and(...filters),
      orderBy: [desc(forumQuestions.updatedAt)],
      limit: 40,
      with: { board: true, user: { with: { profile: true } } },
    }),
  ]);
  const activeBoard = activeBoardId ? boards.find((b) => b.id === activeBoardId) ?? null : null;
  const boardQS = activeBoardId ? `&board=${activeBoardId}` : "";

  return (
    <div>
      <PageHeader
        title="Forum"
        subtitle="Ask fishing questions and compare notes with the community, by state and by topic."
      />

      {/* topic sections */}
      <nav className="mb-5 flex flex-wrap gap-2">
        <Link
          href={activeBoardId ? `/forum?board=${activeBoardId}` : "/forum"}
          className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${
            activeTopic ? "bg-sand-100 text-ink-600 hover:bg-sand-200" : "bg-tide-700 text-white"
          }`}
        >
          All topics
        </Link>
        {FORUM_TOPICS.map((t) => (
          <Link
            key={t.slug}
            href={`/forum?topic=${t.slug}${boardQS}`}
            title={t.blurb}
            className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${
              activeTopic === t.slug ? "bg-tide-700 text-white" : "bg-sand-100 text-ink-600 hover:bg-sand-200"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="space-y-3">
          {(activeTopic || activeBoard) && (
            <p className="text-sm font-semibold text-ink-500">
              Showing{" "}
              {activeTopic && <span className="text-ink-800">{forumTopicLabel(activeTopic)}</span>}
              {activeTopic && activeBoard && " in "}
              {activeBoard && <span className="text-ink-800">{activeBoard.name}</span>}
              {" · "}
              <Link href="/forum" className="text-tide-700 hover:text-tide-900">clear</Link>
            </p>
          )}
          {questions.length === 0 ? (
            <EmptyState
              icon={<MessageCircle />}
              title={
                activeTopic
                  ? `No ${forumTopicLabel(activeTopic)} questions${activeBoard ? ` in ${activeBoard.name}` : ""} yet`
                  : activeBoard
                    ? `No questions in ${activeBoard.name} yet`
                    : "No questions yet"
              }
              body="Start the first discussion."
            />
          ) : (
            questions.map((q) => (
              <Link
                key={q.id}
                href={`/forum/${q.id}`}
                className="block rounded-2xl border border-sand-200 bg-white p-4 shadow-card transition-shadow hover:shadow-lift"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-500">
                  <Badge variant="salt">{forumTopicLabel(q.topic)}</Badge>
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
                  <Label htmlFor="topic">Topic</Label>
                  <Select id="topic" name="topic" defaultValue={activeTopic ?? "general"}>
                    {FORUM_TOPICS.map((t) => (
                      <option key={t.slug} value={t.slug}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="boardId">State board</Label>
                  <Select id="boardId" name="boardId" defaultValue={activeBoardId ?? ""}>
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
