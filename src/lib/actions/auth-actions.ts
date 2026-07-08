"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq, count } from "drizzle-orm";
import { getDb, users, profiles } from "@/db";
import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { enforceAuthRateLimit, RateLimitError } from "@/lib/auth-rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((value) => new TextEncoder().encode(value).length <= 72, "Password must be 72 bytes or fewer."),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(24, "Username must be 24 characters or fewer")
    .regex(/^[a-z0-9_]+$/i, "Letters, numbers, and underscores only"),
  displayName: z.string().trim().min(1, "Display name is required").max(40),
});

export type AuthResult = { error?: string } | undefined;

export async function register(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
    displayName: formData.get("displayName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  if (formData.get("acceptTerms") !== "on") {
    return { error: "Please agree to the Community Rules & Terms to create an account." };
  }
  const { email, password, username, displayName } = parsed.data;
  const turnstile = await verifyTurnstile(formData);
  if (!turnstile.ok) return { error: turnstile.error };
  try {
    await enforceAuthRateLimit("register", email);
  } catch (err) {
    if (err instanceof RateLimitError) return { error: err.message };
    throw err;
  }

  const db = await getDb();

  const existingEmail = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existingEmail) return { error: "That email or username is already taken." };

  const existingUsername = await db.query.profiles.findFirst({
    where: eq(profiles.username, username.toLowerCase()),
  });
  if (existingUsername) return { error: "That email or username is already taken." };

  // Production should not grant admin just because a database starts empty.
  const [{ value: userCount }] = await db.select({ value: count() }).from(users);
  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      role: userCount === 0 && process.env.ALLOW_FIRST_USER_ADMIN === "true" ? "admin" : "user",
    })
    .returning();

  await db.insert(profiles).values({
    userId: user.id,
    username: username.toLowerCase(),
    displayName,
    acceptedTermsAt: new Date(),
  });

  await signIn("credentials", { email, password, redirect: false });
  redirect("/onboarding");
}

export async function login(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const turnstile = await verifyTurnstile(formData);
  if (!turnstile.ok) return { error: turnstile.error };
  try {
    await enforceAuthRateLimit("login", email);
  } catch (err) {
    if (err instanceof RateLimitError) return { error: err.message };
    throw err;
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }
  redirect("/home");
}
