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
  const [justSaved, setJustSaved] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (!signedIn) return router.push("/login");
        start(async () => {
          const res = await toggleSavedGuide(speciesId);
          setSaved(res.saved);
          if (res.saved) {
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 700);
          }
        });
      }}
      disabled={pending}
      aria-pressed={saved}
      title={saved ? "Remove from your saved guides" : "Save to your guides"}
      className={`group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 min-h-11 text-sm font-bold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide-500 ${
        saved
          ? "bg-tide-700 text-white shadow-card hover:bg-tide-600"
          : "border border-tide-200 bg-tide-50 text-tide-800 hover:border-tide-300 hover:bg-tide-100 hover:shadow-card"
      } ${pending ? "opacity-70" : ""}`}
    >
      {saved ? (
        <BookmarkCheck className={`size-4 ${justSaved ? "guide-save-pop" : ""}`} />
      ) : (
        <Bookmark className="size-4 transition-transform group-hover:-translate-y-0.5" />
      )}
      {saved ? "Saved to your guides" : "Save this guide"}
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
