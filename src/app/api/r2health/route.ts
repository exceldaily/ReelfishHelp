import { NextResponse } from "next/server";
import { r2Enabled, putObject, getObject, deleteObject } from "@/lib/r2";

// TEMPORARY diagnostic — verifies R2 config/connectivity on the live deployment
// without exposing any secret values. Remove after confirming R2 is healthy.
export const dynamic = "force-dynamic";

export async function GET() {
  const flags = {
    hasAccount: !!process.env.R2_ACCOUNT_ID,
    hasKey: !!process.env.R2_ACCESS_KEY_ID,
    hasSecret: !!process.env.R2_SECRET_ACCESS_KEY,
    hasBucket: !!process.env.R2_BUCKET,
    r2Enabled: r2Enabled(),
  };
  let write = "skipped (r2 not enabled)";
  if (flags.r2Enabled) {
    try {
      const key = `healthcheck/${Date.now()}.txt`;
      await putObject(key, Buffer.from("ok"), "text/plain");
      const got = await getObject(key);
      await deleteObject(key);
      write = got ? "R2 write+read+delete OK" : "R2 read returned null";
    } catch (e) {
      write = "R2 error: " + (e instanceof Error ? e.message : String(e));
    }
  }
  return NextResponse.json({ ...flags, write });
}
