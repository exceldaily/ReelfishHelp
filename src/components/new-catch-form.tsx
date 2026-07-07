"use client";

import { useActionState, useState } from "react";
import { MapPin, Camera } from "lucide-react";
import { createCatch, type CatchFormResult } from "@/lib/actions/catch-actions";
import { Button, Card, Input, Label, Select, Textarea, FieldError } from "@/components/ui";
import { ImageInput } from "@/components/image-input";
import { WATER_TYPES, CATCH_METHODS } from "@/lib/constants";

export function NewCatchForm({
  speciesOptions,
  preselectedId,
  customName,
  existingPhotoUrl,
  tripId,
}: {
  speciesOptions: { id: string; slug: string; name: string }[];
  preselectedId: string | null;
  customName: string | null;
  existingPhotoUrl: string | null;
  tripId: string | null;
}) {
  const [state, action, pending] = useActionState<CatchFormResult, FormData>(createCatch, undefined);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locBusy, setLocBusy] = useState(false);

  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  function grabLocation() {
    if (!("geolocation" in navigator)) return;
    setLocBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocBusy(false);
      },
      () => setLocBusy(false)
    );
  }

  return (
    <Card className="p-5 sm:p-7">
      <form action={action} className="space-y-5">
        {tripId && <input type="hidden" name="tripId" value={tripId} />}
        {existingPhotoUrl && <input type="hidden" name="existingPhotoUrl" value={existingPhotoUrl} />}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="speciesId">Species</Label>
            <Select id="speciesId" name="speciesId" defaultValue={preselectedId ?? ""}>
              <option value="">Choose species…</option>
              {speciesOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="customSpeciesName">Or a species not in the list</Label>
            <Input id="customSpeciesName" name="customSpeciesName" defaultValue={customName ?? ""} placeholder="e.g. Bowfin" />
          </div>
        </div>

        {existingPhotoUrl && (
          <div className="rounded-xl overflow-hidden border border-sand-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={existingPhotoUrl} alt="From identification" className="w-full max-h-56 object-cover" />
            <p className="text-xs text-ink-500 px-3 py-2 bg-sand-50">Photo carried over from identification.</p>
          </div>
        )}

        <div>
          <Label htmlFor="photos">Photos (up to 6)</Label>
          <label className="flex items-center gap-3 rounded-xl border-2 border-dashed border-sand-300 hover:border-tide-400 px-4 py-4 cursor-pointer transition-colors">
            <Camera className="size-5 text-tide-600" />
            <span className="text-sm font-semibold text-ink-700">Add photos</span>
            <ImageInput id="photos" name="photos" multiple className="text-sm" />
          </label>
          <p className="mt-1 text-xs text-ink-300">Photos are resized on your phone before upload — big camera shots are fine.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="caughtAt">Date & time</Label>
            <Input id="caughtAt" name="caughtAt" type="datetime-local" defaultValue={nowLocal} required />
          </div>
          <div>
            <Label>Location (approximate)</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={grabLocation}
                className="inline-flex items-center gap-1.5 rounded-xl border border-sand-300 px-3.5 min-h-11 text-sm font-semibold hover:bg-sand-100 whitespace-nowrap"
              >
                <MapPin className="size-4 text-tide-600" />
                {locBusy ? "Locating…" : coords ? "Location set ✓" : "Use my location"}
              </button>
              <Input name="locationLabel" placeholder="Label, e.g. Tampa Bay flats" />
            </div>
            {coords && (
              <>
                <input type="hidden" name="lat" value={coords.lat} />
                <input type="hidden" name="lng" value={coords.lng} />
                <p className="mt-1.5 text-xs text-ink-500">Stored rounded to ~1 mile — exact spot never saved.</p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="waterType">Water</Label>
            <Select id="waterType" name="waterType" defaultValue="">
              <option value="">—</option>
              {WATER_TYPES.map((w) => (
                <option key={w} value={w} className="capitalize">{w}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="method">Method</Label>
            <Select id="method" name="method" defaultValue="">
              <option value="">—</option>
              {CATCH_METHODS.map((m) => (
                <option key={m} value={m} className="capitalize">{m}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="lengthIn">Length (in)</Label>
            <Input id="lengthIn" name="lengthIn" type="number" step="0.25" min="0" placeholder="18.5" />
          </div>
          <div>
            <Label htmlFor="weightLb">Weight (lb)</Label>
            <Input id="weightLb" name="weightLb" type="number" step="0.1" min="0" placeholder="3.2" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bait">Bait or lure</Label>
            <Input id="bait" name="bait" placeholder="Live shrimp under popping cork" />
          </div>
          <div>
            <Label htmlFor="gearNotes">Gear used</Label>
            <Input id="gearNotes" name="gearNotes" placeholder='7&apos; medium spinning, 15 lb braid' />
          </div>
          <div>
            <Label htmlFor="weatherNotes">Weather notes</Label>
            <Input id="weatherNotes" name="weatherNotes" placeholder="Overcast, light SE wind" />
          </div>
          <div>
            <Label htmlFor="tideNotes">Tide notes</Label>
            <Input id="tideNotes" name="tideNotes" placeholder="Last of outgoing" />
          </div>
        </div>

        <div>
          <Label htmlFor="story">Story / notes</Label>
          <Textarea id="story" name="story" placeholder="How it went down…" />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <input type="checkbox" name="released" defaultChecked className="size-4 accent-moss-500" />
            Released
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <input type="checkbox" name="showLocation" className="size-4 accent-tide-500" />
            Show approximate area on the public post
          </label>
          <div className="flex items-center gap-2 ml-auto">
            <Label htmlFor="visibility" className="mb-0">Visibility</Label>
            <Select id="visibility" name="visibility" defaultValue="private" className="w-40">
              <option value="private">Private</option>
              <option value="followers">Followers only</option>
              <option value="public">Public</option>
            </Select>
          </div>
        </div>

        <FieldError>{state?.error}</FieldError>
        <Button size="lg" className="w-full" disabled={pending}>
          {pending ? "Saving catch…" : "Save catch"}
        </Button>
      </form>
    </Card>
  );
}
