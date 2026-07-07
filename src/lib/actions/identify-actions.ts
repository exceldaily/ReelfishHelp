"use server";

import { eq } from "drizzle-orm";
import { getDb, identifications } from "@/db";

/** Stores user feedback on an identification — used to improve the system over time. */
export async function submitIdentifyFeedback(id: string, feedback: "correct" | "incorrect") {
  if (feedback !== "correct" && feedback !== "incorrect") return { error: "Invalid feedback" };
  const db = await getDb();
  await db.update(identifications).set({ feedback }).where(eq(identifications.id, id));
  return { ok: true };
}
