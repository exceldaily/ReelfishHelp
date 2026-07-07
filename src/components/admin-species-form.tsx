"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateSpecies, type AdminSpeciesResult } from "@/lib/actions/admin-actions";
import { Button, Card, Input, Label, Select, Textarea, FieldError } from "@/components/ui";

export function AdminSpeciesForm({
  s,
}: {
  s: {
    id: string;
    slug: string;
    commonName: string;
    scientificName: string;
    description: string;
    water: string;
    difficulty: number;
    beginnerFriendly: boolean;
    avgSize: string;
    trophySize: string;
    imageUrl: string | null;
    regions: string[];
    states: string[];
    environments: string[];
    styles: string[];
    seasons: string[];
    baitTypes: string[];
    guideJson: string;
  };
}) {
  const [state, action, pending] = useActionState<AdminSpeciesResult, FormData>(updateSpecies, undefined);

  return (
    <Card className="p-5 sm:p-7">
      <form action={action} className="space-y-4">
        <input type="hidden" name="id" value={s.id} />
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="commonName">Common name</Label>
            <Input id="commonName" name="commonName" defaultValue={s.commonName} />
          </div>
          <div>
            <Label htmlFor="scientificName">Scientific name</Label>
            <Input id="scientificName" name="scientificName" defaultValue={s.scientificName} />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={s.description} className="min-h-20" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="water">Water</Label>
            <Select id="water" name="water" defaultValue={s.water}>
              <option value="freshwater">Freshwater</option>
              <option value="saltwater">Saltwater</option>
              <option value="both">Both</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="difficulty">Difficulty (1–5)</Label>
            <Input id="difficulty" name="difficulty" type="number" min={1} max={5} defaultValue={s.difficulty} />
          </div>
          <div>
            <Label htmlFor="avgSize">Average size</Label>
            <Input id="avgSize" name="avgSize" defaultValue={s.avgSize} />
          </div>
          <div>
            <Label htmlFor="trophySize">Trophy size</Label>
            <Input id="trophySize" name="trophySize" defaultValue={s.trophySize} />
          </div>
        </div>
        <div>
          <Label htmlFor="imageUrl">Image URL (override — leave blank to keep Wikipedia auto-resolve)</Label>
          <Input id="imageUrl" name="imageUrl" defaultValue={s.imageUrl ?? ""} placeholder="https://…" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {(
            [
              ["regions", "Regions", s.regions],
              ["states", "States (2-letter)", s.states],
              ["environments", "Environments", s.environments],
              ["styles", "Fishing styles", s.styles],
              ["seasons", "Seasons", s.seasons],
              ["baitTypes", "Bait types", s.baitTypes],
            ] as const
          ).map(([name, label, value]) => (
            <div key={name}>
              <Label htmlFor={name}>{label} (comma-separated)</Label>
              <Input id={name} name={name} defaultValue={value.join(", ")} />
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
          <input type="checkbox" name="beginnerFriendly" defaultChecked={s.beginnerFriendly} className="size-4 accent-bait-500" />
          Beginner friendly
        </label>
        <div>
          <Label htmlFor="guide">Catch guide (JSON — quickPlan, gear, techniques, timing, habitat, mistakes, handling)</Label>
          <Textarea id="guide" name="guide" defaultValue={s.guideJson} className="min-h-96 font-mono text-xs" />
        </div>
        <FieldError>{state?.error}</FieldError>
        {state?.ok && <p className="text-sm font-bold text-moss-600">Saved ✓</p>}
        <div className="flex gap-3">
          <Button disabled={pending} className="flex-1">{pending ? "Saving…" : "Save species"}</Button>
          <Link href={`/fish/${s.slug}`} className="inline-flex items-center rounded-xl border border-sand-300 px-4 text-sm font-bold text-ink-700 hover:bg-sand-100">
            View live page
          </Link>
        </div>
      </form>
    </Card>
  );
}
