import { AwsClient } from "aws4fetch";

/**
 * Cloudflare R2 client (S3-compatible) using aws4fetch for SigV4 signing.
 *
 * The bucket is PRIVATE. Nothing here is ever exposed to the browser — all
 * reads/writes happen server-side, and images are delivered through the
 * protected `/api/media/*` route which enforces ownership + visibility.
 *
 * Required env (see .env.example):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 */

export function r2Enabled(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET
  );
}

function endpoint(): string {
  return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
}

function bucketUrl(key: string): string {
  const bucket = process.env.R2_BUCKET!;
  // keys are already path-safe (slashes preserved, each segment url-encoded)
  return `${endpoint()}/${bucket}/${key}`;
}

let _client: AwsClient | null = null;
function client(): AwsClient {
  if (!_client) {
    _client = new AwsClient({
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      service: "s3",
      region: "auto",
    });
  }
  return _client;
}

export async function putObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<void> {
  // Sign first, then send the raw bytes in a fresh fetch. Passing a
  // pre-built Request to fetch turns the body into a stream, which Node
  // sends with chunked encoding and no Content-Length — R2 rejects that
  // with 411 (Length Required). A typed-array body on a direct fetch call
  // gets an automatic Content-Length.
  const bytes = new Uint8Array(body);
  const signed = await client().sign(
    new Request(bucketUrl(key), {
      method: "PUT",
      body: bytes,
      headers: { "Content-Type": contentType },
    })
  );
  const res = await fetch(signed.url, {
    method: "PUT",
    headers: signed.headers,
    body: bytes,
  });
  if (!res.ok) {
    throw new Error(`R2 put failed (${res.status}) for ${key}: ${await safeText(res)}`);
  }
}

/** Fetch an object's bytes (used by the protected delivery route). */
export async function getObject(
  key: string
): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  const res = await client().fetch(bucketUrl(key), { method: "GET" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`R2 get failed (${res.status}) for ${key}`);
  return {
    body: await res.arrayBuffer(),
    contentType: res.headers.get("content-type") ?? "application/octet-stream",
  };
}

/** Short-lived signed GET URL — lets us offload public-image bandwidth to R2's edge. */
export async function signedGetUrl(key: string, expiresSeconds = 3600): Promise<string> {
  const url = new URL(bucketUrl(key));
  url.searchParams.set("X-Amz-Expires", String(expiresSeconds));
  const signed = await client().sign(
    new Request(url, { method: "GET" }),
    { aws: { signQuery: true } }
  );
  return signed.url;
}

export async function deleteObject(key: string): Promise<void> {
  const res = await client().fetch(bucketUrl(key), { method: "DELETE" });
  // 204 = deleted, 404 = already gone — both are fine
  if (!res.ok && res.status !== 404) {
    throw new Error(`R2 delete failed (${res.status}) for ${key}`);
  }
}

export async function deleteObjects(keys: string[]): Promise<void> {
  // R2 supports S3 batch delete, but sequential single deletes keep this
  // dependency-light and the volumes here are small.
  await Promise.all(keys.map((k) => deleteObject(k).catch(() => {})));
}

/** List object keys under a prefix (paginated). Used by the cleanup job. */
export async function listObjects(prefix: string, max = 1000): Promise<string[]> {
  const url = new URL(bucketUrl(""));
  url.searchParams.set("list-type", "2");
  url.searchParams.set("prefix", prefix);
  url.searchParams.set("max-keys", String(max));
  const res = await client().fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error(`R2 list failed (${res.status}) for ${prefix}`);
  const xml = await res.text();
  return [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map((m) => decodeXml(m[1]));
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return "";
  }
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
