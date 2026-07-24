import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getConditions } from "@/lib/conditions";
import { getProfile } from "@/lib/auth-helpers";
import { toRegion } from "@/lib/regions";

export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get("lat") ?? "");
  const lng = parseFloat(req.nextUrl.searchParams.get("lng") ?? "");
  const atParam = req.nextUrl.searchParams.get("at");
  if (Number.isNaN(lat) || Number.isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Valid lat and lng are required" }, { status: 400 });
  }
  const at = atParam ? new Date(atParam) : undefined;
  if (at && Number.isNaN(at.getTime())) {
    return NextResponse.json({ error: "Invalid 'at' timestamp" }, { status: 400 });
  }
  try {
    const viewer = await auth();
    const viewerProfile = viewer?.user ? await getProfile(viewer.user.id) : null;
    const bundle = await getConditions(lat, lng, at, toRegion(viewerProfile?.region));
    return NextResponse.json(bundle);
  } catch (err) {
    console.error("[conditions]", err);
    return NextResponse.json(
      { error: "Live conditions are temporarily unavailable. Try again shortly." },
      { status: 502 }
    );
  }
}
