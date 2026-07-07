"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserCircle2, MapPin, Check } from "lucide-react";
import { updateProfile, saveLocation } from "@/lib/actions/profile-actions";
import { Button, Card, Input, Label, Select, Textarea, FieldError } from "@/components/ui";
import { ImageInput } from "@/components/image-input";
import { US_STATES } from "@/data/regulations";

const STYLES = ["Shore", "Kayak", "Boat", "Pier", "Surf", "Wading", "Fly", "Ice"];

export function SettingsForm({
  profile,
  speciesOptions,
}: {
  profile: {
    displayName: string;
    username: string;
    bio: string | null;
    homeState: string | null;
    waterPref: string;
    experience: string;
    visibility: string;
    locationMode: string;
    fishingStyles: string[];
    favoriteSpecies: string[];
    avatarUrl: string | null;
    lastLocationLabel: string | null;
  };
  speciesOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [locMsg, setLocMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(formData: FormData) {
    setSaved(false);
    setError(null);
    start(async () => {
      const res = await updateProfile(formData);
      if (res.error) setError(res.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  function refreshLocation() {
    if (!("geolocation" in navigator)) return;
    setLocMsg("Locating…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        start(async () => {
          const res = await saveLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            mode: "approximate",
          });
          setLocMsg("label" in res ? `Location updated: ${res.label}` : res.error);
          router.refresh();
        });
      },
      () => setLocMsg("Location permission denied — you can still search a location on the Conditions page.")
    );
  }

  return (
    <Card className="p-5 sm:p-7">
      <form action={submit} className="space-y-5">
        {/* avatar */}
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            <div className="relative size-16 rounded-full overflow-hidden bg-tide-100">
              <Image src={profile.avatarUrl} alt="" fill sizes="64px" className="object-cover" unoptimized={profile.avatarUrl.startsWith("/api/")} />
            </div>
          ) : (
            <div className="size-16 rounded-full bg-tide-100 grid place-items-center">
              <UserCircle2 className="size-9 text-tide-500" />
            </div>
          )}
          <div>
            <Label htmlFor="avatar">Profile photo</Label>
            <ImageInput id="avatar" name="avatar" className="text-sm" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" name="displayName" defaultValue={profile.displayName} required maxLength={40} />
          </div>
          <div>
            <Label>Username</Label>
            <Input value={`@${profile.username}`} disabled className="opacity-60" />
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} maxLength={500} className="min-h-20" placeholder="Weekend wade fisherman chasing gator trout…" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="homeState">Home state</Label>
            <Select id="homeState" name="homeState" defaultValue={profile.homeState ?? ""}>
              <option value="">—</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.code}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="waterPref">Water</Label>
            <Select id="waterPref" name="waterPref" defaultValue={profile.waterPref}>
              <option value="freshwater">Freshwater</option>
              <option value="saltwater">Saltwater</option>
              <option value="both">Both</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="experience">Experience</Label>
            <Select id="experience" name="experience" defaultValue={profile.experience}>
              <option value="new">Brand new</option>
              <option value="casual">Casual</option>
              <option value="regular">Regular</option>
              <option value="serious">Serious</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="visibility">Profile privacy</Label>
            <Select id="visibility" name="visibility" defaultValue={profile.visibility}>
              <option value="public">Public</option>
              <option value="followers">Followers only</option>
              <option value="private">Private</option>
            </Select>
          </div>
        </div>

        <div>
          <Label>Fishing styles</Label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <label key={s} className="inline-flex items-center gap-1.5 rounded-full border border-sand-300 px-3.5 py-1.5 text-sm font-semibold cursor-pointer has-checked:border-bait-500 has-checked:bg-bait-100 has-checked:text-bait-700">
                <input type="checkbox" name="fishingStyles" value={s} defaultChecked={profile.fishingStyles.includes(s)} className="sr-only" />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label>Favorite target species (up to 12)</Label>
          <div className="max-h-40 overflow-y-auto rounded-xl border border-sand-200 p-3 grid grid-cols-2 gap-1.5">
            {speciesOptions.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  name="favoriteSpecies"
                  value={s.id}
                  defaultChecked={profile.favoriteSpecies.includes(s.id)}
                  className="size-4 accent-tide-600"
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="locationMode">Location use</Label>
          <Select id="locationMode" name="locationMode" defaultValue={profile.locationMode}>
            <option value="precise">Use my location privately</option>
            <option value="approximate">Use approximate location only</option>
            <option value="off">Don&apos;t use my location</option>
          </Select>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-ink-500">
              Current area: <strong>{profile.lastLocationLabel ?? "not set"}</strong>
            </span>
            <button type="button" onClick={refreshLocation} className="inline-flex items-center gap-1 font-bold text-tide-700 hover:underline">
              <MapPin className="size-3.5" /> Update from device
            </button>
          </div>
          {locMsg && <p className="mt-1 text-xs text-ink-500">{locMsg}</p>}
          <p className="mt-1.5 text-xs text-ink-300">
            Locations are always stored rounded to about a mile. Your area is never shown publicly.
          </p>
        </div>

        <FieldError>{error}</FieldError>
        {saved && (
          <p className="text-sm font-bold text-moss-600 inline-flex items-center gap-1.5">
            <Check className="size-4" /> Saved
          </p>
        )}
        <Button size="lg" className="w-full" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </form>
    </Card>
  );
}
