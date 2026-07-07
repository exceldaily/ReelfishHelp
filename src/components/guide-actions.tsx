"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Plus, Check } from "lucide-react";
import { toggleSavedGuide, saveSetupToGear } from "@/lib/actions/species-actions";

export function SaveGuideButton({
  speciesId,
  initialSaved,
  signedIn,
}: {
  speciesId: string;
  initialSaved: boolean;
  signedIn: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (!signedIn) return router.push("/login");
        start(async () => {
          const res = await toggleSavedGuide(speciesId);
          setSaved(res.saved);
        });
      }}
      disabled={pending}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 min-h-11 text-sm font-bold transition-colors ${
        saved
          ? "bg-tide-100 text-tide-800"
          : "border border-sand-300 bg-white text-ink-700 hover:bg-sand-100"
      }`}
    >
      {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
      {saved ? "Guide saved" : "Save this guide"}
    </button>
  );
}

export function SaveSetupButton({
  speciesId,
  tier,
  signedIn,
}: {
  speciesId: string;
  tier: "beginner" | "budget" | "serious";
  signedIn: boolean;
}) {
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (!signedIn) return router.push("/login");
        start(async () => {
          const res = await saveSetupToGear(speciesId, tier);
          if (!("error" in res)) setDone(true);
        });
      }}
      disabled={pending || done}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-tide-700 hover:text-tide-900 disabled:opacity-70"
    >
      {done ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
      {done ? "Added to gear wishlist" : "Save to gear wishlist"}
    </button>
  );
}
