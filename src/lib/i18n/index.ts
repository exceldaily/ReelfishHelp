/**
 * UI translation system. The English dictionary defines the key set; every
 * other language provides the same keys (typechecked). Server pages get the
 * viewer's language via getViewerLang() (auth-helpers); client components
 * receive it as a prop and call t() directly.
 *
 * Scope note: this translates the interface. Long-form CONTENT (species
 * guides, gear articles, knots, tips, user posts) stays in its authored
 * language until a dedicated content translation pass.
 */
import type { LanguageCode } from "@/lib/languages";
import { en } from "./en";
import { th } from "./th";
import { ms } from "./ms";
import { zh } from "./zh";
import { lo } from "./lo";
import { fil } from "./fil";

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;

const DICTS: Record<LanguageCode, Messages> = { en, th, ms, zh, lo, fil };

export function t(lang: LanguageCode, key: MessageKey, vars?: Record<string, string>): string {
  let s = DICTS[lang]?.[key] ?? en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}
