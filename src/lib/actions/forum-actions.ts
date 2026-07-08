"use server";

import { and, eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { biteBoards, forumAnswers, forumAnswerVotes, forumQuestions } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { DEFAULT_FORUM_TOPIC, isForumTopic } from "@/data/forum-topics";

function cleanText(value: FormDataEntryValue | null, max: number) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

function parseTags(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase().replace(/[^a-z0-9 -]/g, ""))
    .filter(Boolean)
    .slice(0, 6);
}

function forumError(message: string) {
  redirect(`/forum?error=${encodeURIComponent(message)}`);
}

export async function createForumQuestion(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const title = cleanText(formData.get("title"), 140);
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  if (title.length < 8) forumError("Add a clearer question title.");
  if (body.length < 20) forumError("Add a little more detail so people can help.");

  const boardId = cleanText(formData.get("boardId"), 80) || null;
  const board = boardId
    ? await db.query.biteBoards.findFirst({ where: and(eq(biteBoards.id, boardId), eq(biteBoards.active, true)) })
    : null;

  const requestedTopic = cleanText(formData.get("topic"), 40);
  const topic = isForumTopic(requestedTopic) ? requestedTopic : DEFAULT_FORUM_TOPIC;

  const questionId = randomUUID();
  await db.insert(forumQuestions).values({
    id: questionId,
    userId: user.id,
    boardId: board?.id ?? null,
    topic,
    title,
    body,
    tags: parseTags(formData.get("tags")),
  });

  revalidatePath("/forum");
  redirect(`/forum/${questionId}`);
}

export async function createForumAnswer(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const questionId = cleanText(formData.get("questionId"), 80);
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  if (!questionId) redirect("/forum");
  if (body.length < 10) redirect(`/forum/${questionId}?error=${encodeURIComponent("Add a more useful answer.")}`);

  const question = await db.query.forumQuestions.findFirst({ where: eq(forumQuestions.id, questionId) });
  if (!question) redirect("/forum");

  await db.insert(forumAnswers).values({ questionId, userId: user.id, body });
  await db
    .update(forumQuestions)
    .set({ answerCount: sql`${forumQuestions.answerCount} + 1`, updatedAt: new Date() })
    .where(eq(forumQuestions.id, questionId));

  revalidatePath("/forum");
  revalidatePath(`/forum/${questionId}`);
  redirect(`/forum/${questionId}`);
}

export async function toggleAnswerHelpful(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const answerId = cleanText(formData.get("answerId"), 80);
  const answer = answerId
    ? await db.query.forumAnswers.findFirst({ where: eq(forumAnswers.id, answerId), with: { question: true } })
    : null;
  if (!answer) redirect("/forum");

  const existing = await db.query.forumAnswerVotes.findFirst({
    where: and(eq(forumAnswerVotes.answerId, answer.id), eq(forumAnswerVotes.userId, user.id)),
  });
  if (existing) {
    await db
      .delete(forumAnswerVotes)
      .where(and(eq(forumAnswerVotes.answerId, answer.id), eq(forumAnswerVotes.userId, user.id)));
    await db
      .update(forumAnswers)
      .set({ helpfulCount: sql`greatest(${forumAnswers.helpfulCount} - 1, 0)` })
      .where(eq(forumAnswers.id, answer.id));
    await db
      .update(forumQuestions)
      .set({ helpfulCount: sql`greatest(${forumQuestions.helpfulCount} - 1, 0)`, updatedAt: new Date() })
      .where(eq(forumQuestions.id, answer.questionId));
  } else {
    await db.insert(forumAnswerVotes).values({ answerId: answer.id, userId: user.id });
    await db
      .update(forumAnswers)
      .set({ helpfulCount: sql`${forumAnswers.helpfulCount} + 1` })
      .where(eq(forumAnswers.id, answer.id));
    await db
      .update(forumQuestions)
      .set({ helpfulCount: sql`${forumQuestions.helpfulCount} + 1`, updatedAt: new Date() })
      .where(eq(forumQuestions.id, answer.questionId));
  }

  revalidatePath("/forum");
  revalidatePath(`/forum/${answer.questionId}`);
}

export async function acceptForumAnswer(formData: FormData) {
  const user = await requireUser();
  const db = await getDb();
  const questionId = cleanText(formData.get("questionId"), 80);
  const answerId = cleanText(formData.get("answerId"), 80);
  const question = questionId ? await db.query.forumQuestions.findFirst({ where: eq(forumQuestions.id, questionId) }) : null;
  if (!question || question.userId !== user.id) redirect(questionId ? `/forum/${questionId}` : "/forum");

  await db.update(forumAnswers).set({ accepted: false }).where(eq(forumAnswers.questionId, questionId));
  await db
    .update(forumAnswers)
    .set({ accepted: true })
    .where(and(eq(forumAnswers.id, answerId), eq(forumAnswers.questionId, questionId)));
  await db.update(forumQuestions).set({ status: "resolved", updatedAt: new Date() }).where(eq(forumQuestions.id, questionId));

  revalidatePath("/forum");
  revalidatePath(`/forum/${questionId}`);
}
