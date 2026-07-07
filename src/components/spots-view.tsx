"use client";

import { useActionState, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { MapPin, Plus, Star, Trash2, X, Lock, Users, Globe, Navigation } from "lucide-react";
import { createSpot, deleteSpot, toggleSpotFavorite, type SpotFormResult } from "@/lib/actions/spot-actions";
import { Button, Card, Input, Label, Select, Textarea, FieldError, Badge, EmptyState } from "@/components/ui";
import type { Spot } from "@/db/schema";

const SpotMap = dynamic(() => import("./spot-map").then((m) => m.SpotMap), {
  ssr: false,
  loading: () => <div className="h-80 rounded-2xl bg-sand-100 animate-pulse" />,
});

const PRIVACY_OPTIONS = [
  { value: "private_exact", label: "Private — exact spot", icon: Lock, desc: "Precise pin, visible only to you." },
  { value: "private_area", label: "Private — approximate area", icon: Lock, desc: "Rounded to ~1 mile, only you see it." },
  { value: "shared_area", label: "Shared general area", icon: Users, desc: "Followers can see the general area label." },
  { value: "public_broad", label: "Public broad area only", icon: Globe, desc: "Public sees only the broad label — never coordinates." },
] as const;

export function SpotsView({ spots }: { spots: Spot[] }) {
  const [showForm, setShowForm] = useState(false);
  const [state, action, pending] = useActionState<SpotFormResult, FormData>(createSpot, undefined);
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);
  const [privacy, setPrivacy] = useState<string>("private_exact");
  const [, start] = useTransition();

  const markers = spots
    .filter((s) => s.lat != null && s.lng != null)
    .map((s) => ({
      lat: s.lat!,
      lng: s.lng!,
      label: s.name,
      approx: s.privacy !== "private_exact",
    }));

  return (
    <div>
      <div className="flex justify-end mb-5 -mt-2">
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? "Close" : "Save a spot"}
        </Button>
      </div>

      {markers.length > 0 && !showForm && (
        <div className="mb-6">
          <SpotMap markers={markers} />
          <p className="mt-2 text-xs text-ink-500">
            Orange pins = exact private spots · blue circles = approximate areas. This map is only visible to you.
          </p>
        </div>
      )}

      {showForm && (
        <Card className="p-5 sm:p-6 mb-6 animate-fade-up">
          <form action={action} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="s-name">Spot name *</Label>
                <Input id="s-name" name="name" required placeholder="North point rock pile" />
              </div>
              <div>
                <Label htmlFor="s-area">Area label (what others may see)</Label>
                <Input id="s-area" name="areaLabel" placeholder="Lake Lanier — south end" />
              </div>
            </div>

            <div>
              <Label>Privacy</Label>
              <div className="grid sm:grid-cols-2 gap-2">
                {PRIVACY_OPTIONS.map((o) => (
                  <label
                    key={o.value}
                    className={`flex items-start gap-2.5 rounded-xl border-2 p-3 cursor-pointer transition-colors ${
                      privacy === o.value ? "border-tide-500 bg-tide-50" : "border-sand-200 hover:border-sand-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value={o.value}
                      checked={privacy === o.value}
                      onChange={() => setPrivacy(o.value)}
                      className="mt-1 accent-tide-600"
                    />
                    <span>
                      <span className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
                        <o.icon className="size-3.5" /> {o.label}
                      </span>
                      <span className="text-xs text-ink-500">{o.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="mb-0">Pin it on the map (tap to place)</Label>
                <button
                  type="button"
                  onClick={() =>
                    navigator.geolocation?.getCurrentPosition((pos) =>
                      setPicked({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                    )
                  }
                  className="inline-flex items-center gap-1 text-xs font-bold text-tide-700"
                >
                  <Navigation className="size-3.5" /> Use my location
                </button>
              </div>
              <SpotMap onPick={(lat, lng) => setPicked({ lat, lng })} picked={picked} center={picked ?? undefined} height="16rem" />
              {picked && (
                <>
                  <input type="hidden" name="lat" value={picked.lat} />
                  <input type="hidden" name="lng" value={picked.lng} />
                  <p className="mt-1.5 text-xs text-moss-600 font-semibold">
                    Pin set{privacy !== "private_exact" ? " — will be stored rounded to ~1 mile" : " (exact, private to you)"}.
                  </p>
                </>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="s-water">Water type</Label>
                <Input id="s-water" name="waterType" placeholder="Grass flat, river bend, reef…" />
              </div>
              <div>
                <Label htmlFor="s-species">Species here</Label>
                <Input id="s-species" name="speciesNotes" placeholder="Redfish, trout on the edge" />
              </div>
              <div>
                <Label htmlFor="s-structure">Structure</Label>
                <Input id="s-structure" name="structureNotes" placeholder="Oyster bar on the point" />
              </div>
              <div>
                <Label htmlFor="s-tide">Tide / season</Label>
                <Input id="s-tide" name="tideSeasonNotes" placeholder="Best on last of outgoing, Oct–Dec" />
              </div>
              <div>
                <Label htmlFor="s-access">Access</Label>
                <Input id="s-access" name="accessNotes" placeholder="Kayak launch off CR-12" />
              </div>
              <div>
                <Label htmlFor="s-safety">Parking / safety</Label>
                <Input id="s-safety" name="safetyParkingNotes" placeholder="Lot closes at sunset; watch the rays" />
              </div>
            </div>
            <div>
              <Label htmlFor="s-bait">Bait & techniques that work here</Label>
              <Textarea id="s-bait" name="baitTechniqueNotes" className="min-h-16" placeholder="Gold spoon on high water; cut mullet in the hole at low." />
            </div>
            <div>
              <Label htmlFor="s-photo">Photo</Label>
              <input id="s-photo" name="photo" type="file" accept="image/*" className="text-sm" />
            </div>
            <FieldError>{state?.error}</FieldError>
            {state?.ok && <p className="text-sm font-semibold text-moss-600">Spot saved ✓</p>}
            <Button disabled={pending} className="w-full">{pending ? "Saving…" : "Save spot"}</Button>
          </form>
        </Card>
      )}

      {spots.length === 0 && !showForm ? (
        <EmptyState
          icon={<MapPin />}
          title="No saved spots yet"
          body="Build your private map — pins, access notes, what bites where and when. Exact coordinates are never shown publicly."
          action={<Button onClick={() => setShowForm(true)}><Plus className="size-4" /> Save your first spot</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {spots.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex gap-3">
                {s.photoUrl && (
                  <div className="relative size-20 rounded-xl overflow-hidden bg-sand-100 shrink-0">
                    <Image src={s.photoUrl} alt={s.name} fill sizes="80px" className="object-cover" unoptimized={s.photoUrl.startsWith("/api/")} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold text-ink-900">{s.name}</h3>
                    <button onClick={() => start(() => { toggleSpotFavorite(s.id); })} aria-label="Toggle favorite">
                      <Star className={`size-4 ${s.favorite ? "fill-bait-400 text-bait-400" : "text-sand-300 hover:text-bait-400"}`} />
                    </button>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant={s.privacy.startsWith("private") ? "dark" : s.privacy === "shared_area" ? "salt" : "orange"}>
                      {PRIVACY_OPTIONS.find((o) => o.value === s.privacy)?.label ?? s.privacy}
                    </Badge>
                    {s.waterType && <Badge variant="outline">{s.waterType}</Badge>}
                  </div>
                  {s.areaLabel && <div className="mt-1 text-xs text-ink-500">📍 {s.areaLabel}</div>}
                </div>
              </div>
              <dl className="mt-3 space-y-1 text-sm text-ink-700">
                {s.speciesNotes && <div><strong className="text-xs uppercase text-ink-300">Fish:</strong> {s.speciesNotes}</div>}
                {s.structureNotes && <div><strong className="text-xs uppercase text-ink-300">Structure:</strong> {s.structureNotes}</div>}
                {s.tideSeasonNotes && <div><strong className="text-xs uppercase text-ink-300">Tide/season:</strong> {s.tideSeasonNotes}</div>}
                {s.baitTechniqueNotes && <div><strong className="text-xs uppercase text-ink-300">Bait:</strong> {s.baitTechniqueNotes}</div>}
                {s.accessNotes && <div><strong className="text-xs uppercase text-ink-300">Access:</strong> {s.accessNotes}</div>}
                {s.safetyParkingNotes && <div><strong className="text-xs uppercase text-ink-300">Parking/safety:</strong> {s.safetyParkingNotes}</div>}
              </dl>
              <div className="mt-3 pt-2.5 border-t border-sand-100 flex items-center justify-between text-xs text-ink-300">
                <span>Saved {new Date(s.createdAt).toLocaleDateString()}</span>
                <button onClick={() => start(() => { deleteSpot(s.id); })} className="inline-flex items-center gap-1 hover:text-red-600">
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
