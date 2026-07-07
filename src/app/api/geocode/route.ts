import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/geo";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });
  try {
    const results = await searchPlaces(q);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Location search unavailable" }, { status: 502 });
  }
}
