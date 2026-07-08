import { headers } from "next/headers";

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

function clientIpFromHeaders(h: Headers) {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return h.get("cf-connecting-ip") ?? forwarded ?? h.get("x-real-ip") ?? "";
}

export async function verifyTurnstile(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };

  const token = String(formData.get("cf-turnstile-response") ?? "");
  if (!token) {
    return { ok: false, error: "Please complete the security check and try again." };
  }

  const h = await headers();
  const body = new URLSearchParams({
    secret,
    response: token,
  });
  const remoteIp = clientIpFromHeaders(h);
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      cache: "no-store",
    });
    const json = (await res.json()) as TurnstileResponse;
    if (res.ok && json.success) return { ok: true };
  } catch {
    return { ok: false, error: "Security check failed. Please try again." };
  }

  return { ok: false, error: "Security check failed. Please try again." };
}

