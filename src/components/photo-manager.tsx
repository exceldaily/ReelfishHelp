"use client";

import { useState, useTransition } from "react";
import { Trash2, ImageOff } from "lucide-react";
import { deletePhoto } from "@/lib/actions/media-actions";
import { Card, EmptyState } from "@/components/ui";

type Asset = {
  id: string;
  kind: string;
  url: string;
  bytes: number;
  visibility: string;
  createdAt: string;
};

const KIND_LABEL: Record<string, string> = {
  catch: "Catch",
  profile: "Avatar",
  gear: "Gear",
  spot: "Spot",
  identification: "Fish ID",
  other: "Photo",
};

export function PhotoManager({ assets }: { assets: Asset[] }) {
  const [items, setItems] = useState(assets);
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  function remove(id: string) {
    if (!confirm("Delete this photo permanently? This can't be undone.")) return;
    setBusyId(id);
    start(async () => {
      const res = await deletePhoto(id);
      if (res.ok) setItems((prev) => prev.filter((a) => a.id !== id));
      else alert(res.error ?? "Delete failed");
      setBusyId(null);
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ImageOff className="size-8 text-ink-300" />}
        title="No photos yet"
        body="Photos you add to catches, gear, spots, or your profile show up here."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {items.map((a) => (
        <Card key={a.id} className="overflow-hidden group relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.url} alt={KIND_LABEL[a.kind] ?? "Photo"} className="aspect-square w-full object-cover" loading="lazy" />
          <div className="p-2 flex items-center justify-between text-[11px] text-ink-500">
            <span className="font-bold uppercase tracking-wide">{KIND_LABEL[a.kind] ?? a.kind}</span>
            <span>{(a.bytes / 1024).toFixed(0)} KB</span>
          </div>
          <button
            onClick={() => remove(a.id)}
            disabled={pending && busyId === a.id}
            className="absolute top-2 right-2 size-8 rounded-full bg-white/90 text-red-600 grid place-items-center shadow-card opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:opacity-50"
            aria-label="Delete photo"
            title="Delete photo"
          >
            <Trash2 className="size-4" />
          </button>
        </Card>
      ))}
    </div>
  );
}
