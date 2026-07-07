"use client";

import { useActionState, useState } from "react";
import { createTrip, type TripFormResult } from "@/lib/actions/trip-actions";
import { Button, Card, Input, Label, Select, Textarea, FieldError } from "@/components/ui";
import { Search } from "lucide-react";

export function NewTripForm({
  speciesOptions,
  spotOptions,
  preselectedSpeciesId,
}: {
  speciesOptions: { id: string; name: string }[];
  spotOptions: { id: string; name: string; lat: number | null; lng: number | null }[];
  preselectedSpeciesId: string | null;
}) {
  const [state, action, pending] = useActionState<TripFormResult, FormData>(createTrip, undefined);
  const [place, setPlace] = useState<{ label: string; lat: number; lng: number } | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ label: string; lat: number; lng: number }[]>([]);

  async function searchPlace() {
    if (query.trim().length < 2) return;
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    const d = await res.json();
    setResults(d.results ?? []);
  }

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  return (
    <Card className="p-5 sm:p-7">
      <form action={action} className="space-y-5">
        <div>
          <Label htmlFor="t-title">Trip name *</Label>
          <Input id="t-title" name="title" required placeholder="Saturday dawn patrol — redfish" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="t-date">Date *</Label>
            <Input id="t-date" name="date" type="date" defaultValue={tomorrow} required />
          </div>
          <div>
            <Label htmlFor="t-time">Start time</Label>
            <Input id="t-time" name="time" type="time" defaultValue="06:30" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="t-spot">Use a saved spot</Label>
            <Select
              id="t-spot"
              name="spotId"
              defaultValue=""
              onChange={(e) => {
                const s = spotOptions.find((x) => x.id === e.target.value);
                if (s?.lat != null && s?.lng != null) setPlace({ label: s.name, lat: s.lat, lng: s.lng });
              }}
            >
              <option value="">— none —</option>
              {spotOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>
          <div className="relative">
            <Label htmlFor="t-place">…or search a location</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-300" />
              <Input
                id="t-place"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    searchPlace();
                  }
                }}
                placeholder="City, lake, or coast…"
                className="pl-9"
              />
            </div>
            {results.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-lift border border-sand-200 py-1 z-20">
                {results.map((r) => (
                  <button
                    key={`${r.lat}${r.lng}`}
                    type="button"
                    onClick={() => {
                      setPlace(r);
                      setResults([]);
                      setQuery(r.label);
                    }}
                    className="w-full text-left px-3.5 py-2 text-sm font-semibold hover:bg-sand-100"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
            {place && (
              <>
                <input type="hidden" name="lat" value={place.lat} />
                <input type="hidden" name="lng" value={place.lng} />
                <input type="hidden" name="locationLabel" value={place.label} />
                <p className="mt-1 text-xs text-moss-600 font-semibold">Weather & tides will project for {place.label}.</p>
              </>
            )}
          </div>
        </div>

        <div>
          <Label>Target species (pick up to 8)</Label>
          <div className="max-h-44 overflow-y-auto rounded-xl border border-sand-200 p-3 grid grid-cols-2 gap-1.5">
            {speciesOptions.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  name="targetSpecies"
                  value={s.id}
                  defaultChecked={s.id === preselectedSpeciesId}
                  className="size-4 accent-tide-600"
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="t-gear">Gear checklist (one item per line)</Label>
            <Textarea id="t-gear" name="gearChecklist" placeholder={"7' medium spinning combo\nPliers + lip grip\nRain jacket"} />
          </div>
          <div>
            <Label htmlFor="t-bait">Bait & tackle list (one per line)</Label>
            <Textarea id="t-bait" name="baitChecklist" placeholder={"2 dozen live shrimp\nPopping corks\n1/4 oz jigheads + paddletails"} />
          </div>
        </div>

        <div>
          <Label htmlFor="t-notes">Notes</Label>
          <Textarea id="t-notes" name="notes" className="min-h-16" placeholder="Launch plan, tide timing, backup spot…" />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="t-vis" className="mb-0">Privacy</Label>
          <Select id="t-vis" name="visibility" defaultValue="private" className="w-44">
            <option value="private">Private</option>
            <option value="followers">Followers only</option>
            <option value="public">Public</option>
          </Select>
        </div>

        <FieldError>{state?.error}</FieldError>
        <Button size="lg" className="w-full" disabled={pending}>
          {pending ? "Creating trip…" : "Create trip"}
        </Button>
      </form>
    </Card>
  );
}
