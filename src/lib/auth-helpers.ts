import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, profiles, type Profile } from "@/db";
import { unitSystemForRegion } from "@/lib/regions";
import type { UnitSystem } from "@/lib/units";
import { toLanguage, type LanguageCode } from "@/lib/languages";

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

/** The unit system the current viewer sees (metric for SEA, imperial for USA / signed-out). */
export async function getViewerUnits(): Promise<UnitSystem> {
  const session = await auth();
  if (!session?.user) return "imperial";
  const profile = await getProfile(session.user.id);
  return unitSystemForRegion(profile?.region);
}

/** The display language of the current viewer (English for signed-out). */
export async function getViewerLang(): Promise<LanguageCode> {
  const session = await auth();
  if (!session?.user) return "en";
  const profile = await getProfile(session.user.id);
  return toLanguage(profile?.language);
}
