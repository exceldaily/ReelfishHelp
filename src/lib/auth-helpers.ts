import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, profiles, type Profile } from "@/db";

export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Redirects to /login if not signed in. */
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/home");
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const db = await getDb();
  return (await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) })) ?? null;
}
