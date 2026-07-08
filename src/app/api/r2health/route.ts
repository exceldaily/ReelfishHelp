import { NextResponse } from "next/server";
import { r2Enabled, putObject, getObject, deleteObject } from "@/lib/r2";

// TEMPORARY diagnostic — verifies R2 config/connectivity on the live deployment
// without exposing any secret VALUES (only lengths + error causes). Remove after
// confirming R2 is healthy.
export const dynamic = "force-dynamic";

export async function GET() {
  const acct = process.env.R2_ACCOUNT_ID ?? "";
  const bucket = process.env.R2_BUCKET ?? "";
  const key = process.env.R2_ACCESS_KEY_ID ?? "";
  const secret = process.env.R2_SECRET_ACCESS_KEY ?? "";

  // lengths reveal stray whitespace/truncation without leaking the value.
  // expected: acct 32, bucket 12, key 32, secret 64
  const lengths = { acct: acct.length, bucket: bucket.length, key: key.length, secret: secret.length };
  const trimmedDiff = {
    acct: acct !== acct.trim(),
    bucket: bucket !== bucket.trim(),
    key: key !== key.trim(),
    secret: secret !== secret.trim(),
  };
  const host = `${acct}.r2.cloudflarestorage.com`;

  let write = "skipped (r2 not enabled)";
  let cause: unknown = null;
  if (r2Enabled()) {
    try {
      const k = `healthcheck/${Date.now()}.txt`;
      await putObject(k, Buffer.from("ok"), "text/plain");
      const got = await getObject(k);
      await deleteObject(k);
      write = got ? "R2 write+read+delete OK" : "R2 read returned null";
    } catch (e) {
      write = "R2 error: " + (e instanceof Error ? e.message : String(e));
      const c = e && (e as { cause?: unknown }).cause;
      if (c) cause = { code: (c as { code?: string }).code, message: (c as { message?: string }).message };
    }
  }

  return NextResponse.json({ r2Enabled: r2Enabled(), lengths, trimmedDiff, hostLen: host.length, write, cause });
}
