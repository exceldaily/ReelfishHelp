"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ShieldCheck, EyeOff, Navigation, Check } from "lucide-react";
import { saveLocation, saveManualLocation, completeOnboarding } from "@/lib/actions/profile-actions";
import { Button, Card, Input, Label, Select, FieldError, Spinner } from "@/components/ui";
import { US_STATES } from "@/data/regulations";
import { REGION_LIST, type Region } from "@/lib/regions";
import { RegionFlag } from "@/components/region-flag";
import { LANGUAGES, type LanguageCode } from "@/lib/languages";
import type { LocationMode, WaterPref } from "@/db/schema";

const STYLES = ["Shore", "Kayak", "Boat", "Pier", "Surf", "Wading", "Fly", "Ice"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [region, setRegion] = useState<Region>("us");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [locLabel, setLocLabel] = useState<string | null>(null);
  const [locBusy, setLocBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [manualState, setManualState] = useState("");
  const [manualQuery, setManualQuery] = useState("");

  const [waterPref, setWaterPref] = useState<WaterPref>("both");
  const [experience, setExperience] = useState<"new" | "casual" | "regular" | "serious">("casual");
  const [styles, setStyles] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  function requestLocation(mode: LocationMode) {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Your browser doesn't support location. Choose your area manually below.");
      setManual(true);
      return;
    }
    setLocBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        startTransition(async () => {
          const res = await saveLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            mode,
          });
          setLocBusy(false);
          if ("error" in res) setError(res.error);
          else {
            setLocLabel(res.label);
            setStep(2);
          }
        });
      },
      () => {
        setLocBusy(false);
        setError("Location permission was denied — no problem, pick your area manually below.");
        setManual(true);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    );
  }

  async function submitManual() {
    setError(null);
    if (region === "us" && !manualState) {
      setError("Pick your state first.");
      return;
    }
    startTransition(async () => {
      let lat: number | undefined, lng: number | undefined, label: string | undefined;
      if (manualQuery.trim().length > 2) {
        try {
          const r = await fetch(`/api/geocode?q=${encodeURIComponent(manualQuery)}`);
          const d = await r.json();
          const first = d.results?.[0];
          if (first) {
            lat = first.lat;
            lng = first.lng;
            label = first.label;
          }
        } catch {
          /* manual state alone still works */
        }
      }
      await saveManualLocation({ state: manualState, lat, lng, label });
      setLocLabel(label ?? manualState);
      setStep(2);
    });
  }

  function finish() {
    startTransition(async () => {
      await completeOnboarding({
        region,
        language,
        waterPref,
        experience,
        fishingStyles: styles,
        homeState: region === "us" ? manualState || null : null,
      });
      router.push("/home");
      router.refresh();
    });
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-500 mb-4">
        <span className={step === 1 ? "text-tide-700" : ""}>1 · Location</span>
        <span className="h-px flex-1 bg-sand-200" />
        <span className={step === 2 ? "text-tide-700" : ""}>2 · Your fishing</span>
      </div>

      {step === 1 && (
        <Card className="p-6 sm:p-8">
          <div className="mb-6">
            <Label>Which region do you fish?</Label>
            <p className="mb-2.5 -mt-0.5 text-xs text-ink-300">
              Sets your fish, units, and local info. You can switch anytime.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {REGION_LIST.map((r) => {
                const on = region === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRegion(r.id)}
                    className={`flex flex-col items-start gap-0.5 rounded-2xl border-2 p-3.5 text-left transition-colors ${
                      on ? "border-tide-600 bg-tide-50" : "border-sand-200 bg-white hover:border-sand-300"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold text-ink-900">
                      <RegionFlag region={r.id} className="h-3.5 w-[26px]" /> {r.name}
                    </span>
                    <span className="text-xs text-ink-500">{r.blurb}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3">
              <Label htmlFor="language">Language</Label>
              <Select id="language" value={language} onChange={(e) => setLanguage(e.target.value as LanguageCode)}>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native}{l.code !== "en" ? ` (${l.label})` : ""}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <MapPin className="size-8 text-tide-600" />
          <h1 className="mt-3 font-display text-2xl font-bold">Where do you fish?</h1>
          <p className="mt-1.5 text-ink-500 text-sm leading-relaxed">
            Your location powers local conditions{region === "us" ? ", tides," : ""} and species suggestions. We only ever
            store an <strong>approximate</strong> area (about a 1-mile grid) — never your exact
            position, and it's never shown publicly.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => requestLocation("precise")}
              disabled={locBusy || pending}
              className="w-full flex items-start gap-3 rounded-2xl border-2 border-tide-300 bg-tide-50 hover:border-tide-500 p-4 text-left transition-colors disabled:opacity-60"
            >
              <Navigation className="size-5 text-tide-700 mt-0.5 shrink-0" />
              <span>
                <span className="font-bold text-ink-900 block">Use my location privately</span>
                <span className="text-sm text-ink-500">Best accuracy for conditions and tides. Stored approximately, visible only to you.</span>
              </span>
              {(locBusy || pending) && <Spinner className="ml-auto mt-1" />}
            </button>
            <button
              onClick={() => requestLocation("approximate")}
              disabled={locBusy || pending}
              className="w-full flex items-start gap-3 rounded-2xl border-2 border-sand-200 bg-white hover:border-tide-400 p-4 text-left transition-colors disabled:opacity-60"
            >
              <ShieldCheck className="size-5 text-moss-600 mt-0.5 shrink-0" />
              <span>
                <span className="font-bold text-ink-900 block">Use approximate location only</span>
                <span className="text-sm text-ink-500">Same as above — we round aggressively either way. This is the default.</span>
              </span>
            </button>
            <button
              onClick={() => setManual(true)}
              className="w-full flex items-start gap-3 rounded-2xl border-2 border-sand-200 bg-white hover:border-sand-400 p-4 text-left transition-colors"
            >
              <EyeOff className="size-5 text-ink-500 mt-0.5 shrink-0" />
              <span>
                <span className="font-bold text-ink-900 block">Don't use my location</span>
                <span className="text-sm text-ink-500">Pick a state and area manually instead.</span>
              </span>
            </button>
          </div>

          {manual && (
            <div className="mt-5 rounded-2xl bg-sand-100 p-4 space-y-3">
              {region === "us" && (
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select id="state" value={manualState} onChange={(e) => setManualState(e.target.value)}>
                    <option value="">Choose your state…</option>
                    {US_STATES.map((s) => (
                      <option key={s.code} value={s.code}>{s.name}</option>
                    ))}
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="city">City or area (optional — improves conditions accuracy)</Label>
                <Input
                  id="city"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  placeholder="e.g. Tampa, Lake Lanier, Outer Banks"
                />
              </div>
              <Button onClick={submitManual} disabled={pending} className="w-full">
                {pending ? "Saving…" : "Continue with this area"}
              </Button>
            </div>
          )}

          <FieldError>{error}</FieldError>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6 sm:p-8">
          {locLabel && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-moss-100 text-moss-700 px-3 py-1 text-xs font-bold mb-3">
              <Check className="size-3.5" /> Fishing near {locLabel}
            </div>
          )}
          <h1 className="font-display text-2xl font-bold">How do you fish?</h1>
          <p className="mt-1.5 text-ink-500 text-sm">
            This tunes species suggestions and guide advice. Change it anytime in settings.
          </p>

          <div className="mt-6">
            <Label>Water</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["freshwater", "saltwater", "both"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setWaterPref(w)}
                  className={`rounded-xl border-2 px-3 py-2.5 text-sm font-bold capitalize transition-colors ${
                    waterPref === w
                      ? "border-tide-600 bg-tide-50 text-tide-800"
                      : "border-sand-200 bg-white text-ink-500 hover:border-sand-300"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <Label>Experience</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  ["new", "Brand new"],
                  ["casual", "Casual"],
                  ["regular", "Regular"],
                  ["serious", "Serious"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setExperience(v)}
                  className={`rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition-colors ${
                    experience === v
                      ? "border-tide-600 bg-tide-50 text-tide-800"
                      : "border-sand-200 bg-white text-ink-500 hover:border-sand-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <Label>Fishing styles (pick any)</Label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => {
                const on = styles.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() =>
                      setStyles((prev) => (on ? prev.filter((x) => x !== s) : [...prev, s]))
                    }
                    className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors ${
                      on
                        ? "border-bait-500 bg-bait-100 text-bait-700"
                        : "border-sand-200 bg-white text-ink-500 hover:border-sand-300"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <Button size="lg" className="w-full mt-7" onClick={finish} disabled={pending}>
            {pending ? "Setting up your dashboard…" : "Start fishing"}
          </Button>
        </Card>
      )}
    </div>
  );
}
