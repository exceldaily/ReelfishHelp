"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthResult } from "@/lib/actions/auth-actions";
import { TurnstileField } from "@/components/turnstile-field";
import { Button, Input, Label, FieldError } from "@/components/ui";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthResult, FormData>(login, undefined);

  return (
    <div className="bg-white rounded-3xl shadow-lift p-7 sm:p-9 animate-fade-up">
      <h1 className="font-display text-2xl font-bold text-ink-900">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-500">Log in to your fishing dashboard.</p>
      <form action={action} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" placeholder="8+ characters" />
        </div>
        <TurnstileField />
        <FieldError>{state?.error}</FieldError>
        <Button size="lg" className="w-full" disabled={pending}>
          {pending ? "Logging in..." : "Log in"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-ink-500 text-center">
        New here?{" "}
        <Link href="/signup" className="inline-block py-3 -my-3 font-bold text-tide-700 hover:underline">
          Create a free account
        </Link>
      </p>
    </div>
  );
}
