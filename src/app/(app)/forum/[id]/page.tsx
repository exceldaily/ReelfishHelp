import Link from "next/link";
import { verifiedTitleMap, primaryTitle } from "@/lib/verified";
import { VerifiedTitleBadge } from "@/components/verified-badge";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { MessageCircle, ThumbsUp, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { forumAnswers, forumQuestions } from "@/db/schema";
import { createForumAnswer, deleteForumAnswer, toggleAnswerHelpful } from "@/lib/actions/forum-actions";
import { forumTopicLabel } from "@/data/forum-topics";
import { Badge, Button, ButtonLink, Card, EmptyState, Label, PageHeader, Textarea } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const question = await db.query.forumQuestions.findFirst({ where: eq(forumQuestions.id, id) });
  return { title: question?.title ?? "Forum Question" };
}

function stamp(value: Date) {
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default async function ForumQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, { error }, session, db] = await Promise.all([params, searchParams, auth(), getDb()]);
  const question = await db.query.forumQuestions.findFirst({
    where: eq(forumQuestions.id, id),
    with: { board: true, user: { with: { profile: true } } },
  });
  if (!question) notFound();

  // plain conversation order — replies post instantly for everyone
  const answers = await db.query.forumAnswers.findMany({
    where: eq(forumAnswers.questionId, question.id),
    orderBy: [forumAnswers.createdAt],
    with: { user: { with: { profile: true } }, votes: true },
  });
  const titleMap = await verifiedTitleMap(db, [question.userId, ...answers.map((a) => a.userId)]);
  const viewerId = session?.user?.id ?? null;
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={question.title}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Link href={`/forum?topic=${question.topic}`}>
              <Badge variant="salt">{forumTopicLabel(question.topic)}</Badge>
            </Link>
            {question.board && (
              <Link href={`/forum?board=${question.board.id}`}>
                <Badge variant="neutral">{question.board.regionLabel}</Badge>
              </Link>
            )}
            <span className="inline-flex items-center gap-1.5">
              Asked by {question.user.profile?.displayName ?? "Angler"}
              <VerifiedTitleBadge slug={primaryTitle(titleMap.get(question.userId))} compact /> on {stamp(question.createdAt)}
            </span>
          </span>
        }
        action={<ButtonLink href="/forum" variant="secondary">Forum</ButtonLink>}
      />

      <Card className="p-5 sm:p-6">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700">{question.body}</p>
        {question.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        )}
      </Card>

      <section className="mt-6 space-y-3">
        <h2 className="font-display text-lg font-bold text-ink-900">Answers</h2>
        {answers.length === 0 ? (
          <EmptyState icon={<MessageCircle />} title="No answers yet" body="Share what you know." />
        ) : (
          answers.map((answer) => {
            const voted = viewerId ? answer.votes.some((vote) => vote.userId === viewerId) : false;
            return (
              <Card key={answer.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-500">
                    <span className="inline-flex items-center gap-1.5">
                      {answer.user.profile?.displayName ?? "Angler"}
                      <VerifiedTitleBadge slug={primaryTitle(titleMap.get(answer.userId))} compact />
                    </span>
                    <span>{stamp(answer.createdAt)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={toggleAnswerHelpful}>
                      <input type="hidden" name="answerId" value={answer.id} />
                      <Button variant={voted ? "secondary" : "outline"} size="sm">
                        <ThumbsUp className="size-4" />
                        {answer.helpfulCount}
                      </Button>
                    </form>
                    {isAdmin && (
                      <form action={deleteForumAnswer}>
                        <input type="hidden" name="answerId" value={answer.id} />
                        <Button variant="outline" size="sm" aria-label="Delete answer (admin)" title="Delete answer (admin)">
                          <Trash2 className="size-4 text-red-700" />
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">{answer.body}</p>
              </Card>
            );
          })
        )}
      </section>

      <Card className="mt-6 p-5">
        <h2 className="font-display font-bold text-ink-900">Add an Answer</h2>
        {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
        {session?.user ? (
          <form action={createForumAnswer} className="mt-4 space-y-4">
            <input type="hidden" name="questionId" value={question.id} />
            <div>
              <Label htmlFor="body">Answer</Label>
              <Textarea id="body" name="body" required className="min-h-32" />
            </div>
            <Button>
              <MessageCircle className="size-4" />
              Post answer
            </Button>
          </form>
        ) : (
          <ButtonLink href="/login" className="mt-4">Log in to answer</ButtonLink>
        )}
      </Card>
    </div>
  );
}
