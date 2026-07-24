"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { register, type AuthResult } from "@/lib/actions/auth-actions";
import { Button, Input, Label, FieldError, Select } from "@/components/ui";
import { TurnstileField } from "@/components/turnstile-field";
import { LANGUAGES, type LanguageCode } from "@/lib/languages";
import { t } from "@/lib/i18n";

export default function SignupPage() {
  const [state, action, pending] = useActionState<AuthResult, FormData>(register, undefined);
  // language comes first — the moment it changes, the whole form follows it
  const [lang, setLang] = useState<LanguageCode>("en");

  return (
    <div className="bg-white rounded-3xl shadow-lift p-7 sm:p-9 animate-fade-up">
      <h1 className="font-display text-2xl font-bold text-ink-900">{t(lang, "signup.title")}</h1>
      <p className="mt-1 text-sm text-ink-500">{t(lang, "signup.subtitle")}</p>
      <form action={action} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="language">{t(lang, "common.language")}</Label>
          <Select id="language" name="language" value={lang} onChange={(e) => setLang(e.target.value as LanguageCode)}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native}{l.code !== "en" ? ` (${l.label})` : ""}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="displayName">{t(lang, "signup.displayName")}</Label>
            <Input id="displayName" name="displayName" required maxLength={40} placeholder="John Doe" />
          </div>
          <div>
            <Label htmlFor="username">{t(lang, "signup.username")}</Label>
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
          <Label htmlFor="email">{t(lang, "signup.email")}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="password">{t(lang, "signup.password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            placeholder={t(lang, "signup.passwordHint")}
          />
        </div>
        <label className="flex items-start gap-2.5 text-sm text-ink-700 cursor-pointer">
          {/* native checkboxes ignore padding, so a transparent 40px input overlays
              a 20px visual box to give a full-size tap target */}
          <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
            <input
              type="checkbox"
              name="acceptTerms"
              className="peer absolute -inset-2.5 size-10 cursor-pointer opacity-0"
            />
            <span
              aria-hidden
              className="pointer-events-none grid size-5 place-items-center rounded border border-sand-300 bg-white text-xs font-bold text-transparent peer-checked:border-bait-500 peer-checked:bg-bait-500 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tide-500"
            >
              ✓
            </span>
          </span>
          <span>
            {t(lang, "signup.terms")}{" "}
            <Link href="/terms" target="_blank" className="inline-block py-3 -my-3 font-bold text-tide-700 hover:underline">
              {t(lang, "signup.termsLink")}
            </Link>{" "}
            {t(lang, "signup.termsTail")}
          </span>
        </label>
        <TurnstileField />
        <FieldError>{state?.error}</FieldError>
        <Button size="lg" className="w-full" disabled={pending}>
          {pending ? t(lang, "signup.creating") : t(lang, "signup.create")}
        </Button>
      </form>
      <p className="mt-5 text-sm text-ink-500 text-center">
        {t(lang, "signup.already")}{" "}
        <Link href="/login" className="inline-block py-3 -my-3 font-bold text-tide-700 hover:underline">
          {t(lang, "signup.logIn")}
        </Link>
      </p>
    </div>
  );
}
