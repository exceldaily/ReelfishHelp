"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register, type AuthResult } from "@/lib/actions/auth-actions";
import { Button, Input, Label, FieldError } from "@/components/ui";
import { TurnstileField } from "@/components/turnstile-field";

export default function SignupPage() {
  const [state, action, pending] = useActionState<AuthResult, FormData>(register, undefined);

  return (
    <div className="bg-white rounded-3xl shadow-lift p-7 sm:p-9 animate-fade-up">
      <h1 className="font-display text-2xl font-bold text-ink-900">Join ReelFishHelp</h1>
      <p className="mt-1 text-sm text-ink-500">
        Free account — live conditions, catch guides, trip plans, and your own catch log.
      </p>
      <form action={action} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" name="displayName" required maxLength={40} placeholder="John Doe" />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              required
              minLength={3}
              maxLength={24}
              pattern="[A-Za-z0-9_]+"
              placeholder="reelbrad"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            placeholder="8 to 72 characters"
          />
        </div>
        <label className="flex items-start gap-2.5 text-sm text-ink-700">
          <input type="checkbox" name="acceptTerms" className="mt-0.5 size-4 accent-bait-500" />
          <span>
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="font-bold text-tide-700 hover:underline">
              Community Rules &amp; Terms
            </Link>{" "}
            — including no hate, harassment, or illegal fishing.
          </span>
        </label>
        <TurnstileField />
        <FieldError>{state?.error}</FieldError>
        <Button size="lg" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-ink-500 text-center">
        Already fishing with us?{" "}
        <Link href="/login" className="font-bold text-tide-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
