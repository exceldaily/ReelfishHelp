"use client";

import { useOptimistic, useTransition } from "react";
import { toggleChecklistItem, setTripStatus, deleteTrip } from "@/lib/actions/trip-actions";
import type { ChecklistItem } from "@/db/schema";
import { CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";

export function TripChecklist({
  tripId,
  list,
  items,
  title,
}: {
  tripId: string;
  list: "gearChecklist" | "baitChecklist";
  items: ChecklistItem[];
  title: string;
}) {
  const [optimistic, applyOptimistic] = useOptimistic(
    items,
    (state, index: number) =>
      state.map((it, i) => (i === index ? { ...it, done: !it.done } : it))
  );
  const [, start] = useTransition();

  if (items.length === 0) return null;
  const done = optimistic.filter((i) => i.done).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-bold text-ink-900">{title}</h3>
        <span className="text-xs font-bold text-ink-500">{done}/{optimistic.length}</span>
      </div>
      <div className="space-y-1.5">
        {optimistic.map((item, i) => (
          <label
            key={`${item.text}-${i}`}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 cursor-pointer transition-colors ${
              item.done ? "bg-moss-100/60" : "bg-sand-100/60 hover:bg-sand-100"
            }`}
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={() =>
                start(async () => {
                  applyOptimistic(i);
                  await toggleChecklistItem(tripId, list, i);
                })
              }
              className="size-4.5 accent-moss-500"
            />
            <span className={`text-sm font-medium ${item.done ? "line-through text-ink-300" : "text-ink-900"}`}>
              {item.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function TripActions({ tripId, status }: { tripId: string; status: "planned" | "completed" }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap gap-2.5">
      {status === "planned" ? (
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              await setTripStatus(tripId, "completed");
              router.refresh();
            })
          }
        >
          <CheckCircle2 className="size-4" /> Mark trip complete
        </Button>
      ) : (
        <>
          <Button
            variant="dark"
            onClick={() => router.push(`/catches/new?trip=${tripId}`)}
          >
            Log a catch from this trip
          </Button>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await setTripStatus(tripId, "planned");
                router.refresh();
              })
            }
          >
            <RotateCcw className="size-4" /> Reopen
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        className="text-red-700 ml-auto"
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this trip?")) start(() => deleteTrip(tripId));
        }}
      >
        <Trash2 className="size-4" /> Delete
      </Button>
    </div>
  );
}
