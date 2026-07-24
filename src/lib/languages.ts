/**
 * Display-language preference. English is the default and what every account
 * created before this feature uses. The SEA set covers the region's most
 * common languages; the stored code is the hook for translated content later.
 */

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "th", label: "Thai", native: "ไทย" },
  { code: "ms", label: "Malay", native: "Bahasa Melayu" },
  { code: "zh", label: "Mandarin", native: "中文" },
  { code: "lo", label: "Lao", native: "ພາສາລາວ" },
  { code: "fil", label: "Filipino", native: "Filipino" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export function isLanguage(value: unknown): value is LanguageCode {
  return LANGUAGES.some((l) => l.code === value);
}

export function toLanguage(value: unknown): LanguageCode {
  return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}

export function languageLabel(code: unknown): string {
  const l = LANGUAGES.find((x) => x.code === code);
  return l ? l.native : "English";
}
