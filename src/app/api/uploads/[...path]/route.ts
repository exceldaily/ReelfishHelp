import path from "path";
import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
};

/** Serves locally stored uploads in dev mode (production uses Vercel Blob URLs). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: parts } = await params;
  const rel = parts.join("/");
  // prevent path traversal
  if (rel.includes("..") || rel.includes("\\")) {
    return new NextResponse("Not found", { status: 404 });
  }
  const file = path.join(process.cwd(), ".data", "uploads", rel);
  try {
    const buf = await fs.readFile(file);
    const ext = path.extname(file).toLowerCase();
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
