import crypto from "node:crypto";
import { headers } from "next/headers";

type Bucket = {
  count: number;
  resetAt: number;
};

type Limit = {
  key: string;
  limit: number;
  windowMs: number;
};

declare global {
  // Best-effort in-process throttling. Cloudflare/Vercel should remain the
  // front-line defense for distributed abuse.
  var __reelFishRateLimit: Map<string, Bucket> | undefined;
}

const buckets = globalThis.__reelFishRateLimit ?? new Map<string, Bucket>();
globalThis.__reelFishRateLimit = buckets;

export class RateLimitError extends Error {
  constructor(message = "Too many attempts. Please wait a few minutes and try again.") {
    super(message);
    this.name = "RateLimitError";
  }
}

function hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function consume({ key, limit, windowMs }: Limit): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count += 1;
  if (bucket.count > limit) return false;
  return true;
}

function pruneExpired() {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function clientIpFromHeaders(h: Headers) {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return h.get("cf-connecting-ip") ?? forwarded ?? h.get("x-real-ip") ?? "unknown";
}

export async function enforceAuthRateLimit(action: "login" | "register", email?: string) {
  if (buckets.size > 1000) pruneExpired();

  const h = await headers();
  const ip = clientIpFromHeaders(h);
  const userAgent = h.get("user-agent")?.slice(0, 120) ?? "unknown";
  const normalizedEmail = email?.trim().toLowerCase();
  const windowMs = action === "register" ? 60 * 60 * 1000 : 10 * 60 * 1000;
  const ipLimit = action === "register" ? 8 : 20;
  const emailLimit = action === "register" ? 3 : 10;

  const limits: Limit[] = [
    {
      key: `auth:${action}:ip:${hash(`${ip}:${userAgent}`)}`,
      limit: ipLimit,
      windowMs,
    },
  ];

  if (normalizedEmail) {
    limits.push({
      key: `auth:${action}:email:${hash(normalizedEmail)}`,
      limit: emailLimit,
      windowMs,
    });
  }

  if (!limits.every(consume)) {
    throw new RateLimitError();
  }
}
