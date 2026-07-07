import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { identifyFish, identifyConfigured } from "@/lib/identify";
import { storeImage } from "@/lib/storage";

export const maxDuration = 60;

const MAX_ID_BYTES = 5 * 1024 * 1024; // Anthropic vision limit

export async function GET() {
  return NextResponse.json({ configured: identifyConfigured() });
}

export async function POST(req: NextRequest) {
  if (!identifyConfigured()) {
    return NextResponse.json(
      {
        error: "Fish identification is not configured yet.",
        needsKey: true,
        setup:
          "Add ANTHROPIC_API_KEY to your environment (console.anthropic.com → API keys) and restart. The rest of the app works without it.",
      },
      { status: 503 }
    );
  }

  const form = await req.formData();
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Attach a fish photo to identify." }, { status: 400 });
  }
  if (file.size > MAX_ID_BYTES) {
    return NextResponse.json(
      { error: "Image is too large for identification (5 MB max). Most phones can share a smaller size." },
      { status: 400 }
    );
  }

  const session = await auth();
  const buf = Buffer.from(await file.arrayBuffer());

  // store the image so the identification can be saved as a catch later
  let imageUrl: string | null = null;
  try {
    imageUrl = await storeImage(file, "identify");
  } catch {
    imageUrl = null; // identification still works without stored copy
  }

  try {
    const result = await identifyFish({
      imageBase64: buf.toString("base64"),
      mediaType: file.type,
      imageUrl,
      userId: session?.user?.id ?? null,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[identify]", err);
    const message =
      err instanceof Error && /Unsupported|clearer photo/.test(err.message)
        ? err.message
        : "Identification failed — the service may be busy. Try again in a moment.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
