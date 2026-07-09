import { and, eq } from "drizzle-orm";
import { getDb, crewMembers, type CrewRole } from "@/db";

/** The caller's role in a crew, or null if they aren't a member. */
export async function crewRole(
  crewId: string,
  userId: string | null | undefined
): Promise<CrewRole | null> {
  if (!userId) return null;
  const db = await getDb();
  const m = await db.query.crewMembers.findFirst({
    where: and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, userId)),
  });
  return m?.role ?? null;
}

/** Owners and admins can moderate (remove members, delete posts). */
export function canModerate(role: CrewRole | null): boolean {
  return role === "owner" || role === "admin";
}
