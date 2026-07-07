"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq, count } from "drizzle-orm";
import { getDb, users, profiles } from "@/db";
import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

const registerSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(24, "Username must be 24 characters or fewer")
    .regex(/^[a-z0-9_]+$/i, "Letters, numbers, and underscores only"),
  displayName: z.string().min(1, "Display name is required").max(40),
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
  const db = await getDb();

  const existingEmail = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
  if (existingEmail) return { error: "An account with that email already exists." };

  const existingUsername = await db.query.profiles.findFirst({
    where: eq(profiles.username, username.toLowerCase()),
  });
  if (existingUsername) return { error: "That username is taken." };

  // First account on a fresh install becomes the admin.
  const [{ value: userCount }] = await db.select({ value: count() }).from(users);
  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      role: userCount === 0 ? "admin" : "user",
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
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
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
