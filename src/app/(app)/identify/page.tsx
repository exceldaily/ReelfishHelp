"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Upload,
  Fish,
  ThumbsUp,
  ThumbsDown,
  Trophy,
  BookOpenText,
  RefreshCw,
  KeyRound,
  Check,
} from "lucide-react";
import { Button, ButtonLink, Card, PageHeader, Spinner, WaterBadge, FieldError } from "@/components/ui";
import { submitIdentifyFeedback } from "@/lib/actions/identify-actions";
import type { IdentificationResult } from "@/lib/identify";

type Status = "idle" | "loading" | "done" | "error";

function ConfidenceBar({ pct }: { pct: number }) {
  const color = pct >= 75 ? "bg-moss-500" : pct >= 45 ? "bg-bait-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-2 flex-1 rounded-full bg-sand-200 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(3, pct))}%` }} />
      </div>
      <span className="text-sm font-bold text-ink-900 w-11 text-right">{Math.round(pct)}%</span>
    </div>
  );
}

export default function IdentifyPage() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/identify")
      .then((r) => r.json())
      .then((d) => setConfigured(d.configured))
      .catch(() => setConfigured(null));
  }, []);

  function onPick(f: File | null) {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    setFeedback(null);
    setStatus("idle");
    const url = URL.createObjectURL(f);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return url;
    });
  }

  async function identify() {
    if (!file) return;
    setStatus("loading");
    setError(null);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/identify", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setNeedsKey(!!data.needsKey);
        throw new Error(data.setup ? `${data.error} ${data.setup}` : data.error ?? "Identification failed");
      }
      setResult(data);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Identification failed");
      setStatus("error");
    }
  }

  function sendFeedback(f: "correct" | "incorrect") {
    if (!result) return;
    setFeedback(f);
    submitIdentifyFeedback(result.id, f).catch(() => {});
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Identify a Fish"
        subtitle="Upload a photo or take one with your camera — get the most likely species, confidence, lookalikes, and a link straight to the catch guide."
      />

      {configured === false && (
        <Card className="p-5 mb-6 border-bait-400 bg-bait-100/40">
          <div className="flex gap-3">
            <KeyRound className="size-5 text-bait-600 shrink-0 mt-0.5" />
            <div className="text-sm text-ink-700 leading-relaxed">
              <strong>Setup needed:</strong> photo identification uses the Claude vision API. Add{" "}
              <code className="bg-white px-1.5 py-0.5 rounded font-mono text-xs">ANTHROPIC_API_KEY</code> to your
              environment (get one at console.anthropic.com) and restart the server. Everything else in the app
              works without it.
            </div>
          </div>
        </Card>
      )}

      {/* upload area */}
      <Card className="p-5 sm:p-6">
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />

        {!preview ? (
          <button
            onClick={() => fileInput.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-sand-300 hover:border-tide-400 bg-sand-50 py-14 flex flex-col items-center gap-3 transition-colors"
          >
            <div className="size-14 rounded-2xl bg-tide-100 flex items-center justify-center">
              <Fish className="size-7 text-tide-700" />
            </div>
            <div className="font-display font-bold text-ink-900">Drop in a fish photo</div>
            <div className="text-sm text-ink-500">JPG, PNG, or WEBP · up to 5 MB · clear side view works best</div>
          </button>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-tide-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Fish to identify" className="w-full max-h-96 object-contain" />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button variant="outline" onClick={() => fileInput.current?.click()}>
            <Upload className="size-4" /> {preview ? "Choose another photo" : "Upload photo"}
          </Button>
          <Button variant="outline" onClick={() => cameraInput.current?.click()}>
            <Camera className="size-4" /> Take photo
          </Button>
          {file && (
            <Button onClick={identify} disabled={status === "loading"} className="ml-auto">
              {status === "loading" ? (
                <>
                  <Spinner className="border-white/40 border-t-white" /> Identifying…
                </>
              ) : (
                <>
                  <Fish className="size-4" /> Identify this fish
                </>
              )}
            </Button>
          )}
        </div>
        {error && !needsKey && <FieldError>{error}</FieldError>}
        {error && needsKey && (
          <p className="mt-3 text-sm font-medium text-bait-700 bg-bait-100 border border-bait-400/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </Card>

      {/* results */}
      {result && (
        <div className="mt-6 space-y-4 animate-fade-up">
          {!result.isFish ? (
            <Card className="p-6">
              <h2 className="font-display text-lg font-bold">Hmm — that doesn&apos;t look like a fish</h2>
              <p className="mt-1.5 text-sm text-ink-500">
                {result.notFishDescription ?? "Try a clearer photo with the whole fish visible."}
              </p>
            </Card>
          ) : (
            <>
              <Card className="p-5 sm:p-6 border-2 border-tide-300">
                <div className="text-[11px] font-bold uppercase tracking-wider text-tide-700 mb-1.5">
                  Best match
                </div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-ink-900">
                      {result.primary.commonName}
                    </h2>
                    <p className="text-sm italic text-ink-300">{result.primary.scientificName}</p>
                  </div>
                  {result.primarySpecies && <WaterBadge water={result.primarySpecies.water} />}
                </div>
                <div className="mt-3">
                  <ConfidenceBar pct={result.primary.confidencePct} />
                </div>
                <p className="mt-3 text-sm text-ink-700 leading-relaxed">{result.primary.reasoning}</p>
                {result.handlingNote && (
                  <p className="mt-3 text-sm text-ink-700 bg-sand-100 rounded-xl px-4 py-3">
                    <strong>Handle with care:</strong> {result.handlingNote}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {result.primarySpecies && (
                    <>
                      <ButtonLink href={`/fish/${result.primarySpecies.slug}`}>
                        <BookOpenText className="size-4" /> Open Catch Guide
                      </ButtonLink>
                      <ButtonLink
                        href={`/catches/new?species=${result.primarySpecies.slug}${result.imageUrl ? `&photo=${encodeURIComponent(result.imageUrl)}` : ""}`}
                        variant="dark"
                      >
                        <Trophy className="size-4" /> Log as a catch
                      </ButtonLink>
                    </>
                  )}
                  {!result.primarySpecies && (
                    <ButtonLink
                      href={`/catches/new?custom=${encodeURIComponent(result.primary.commonName)}${result.imageUrl ? `&photo=${encodeURIComponent(result.imageUrl)}` : ""}`}
                      variant="dark"
                    >
                      <Trophy className="size-4" /> Log as a catch
                    </ButtonLink>
                  )}
                </div>

                {/* feedback */}
                <div className="mt-5 pt-4 border-t border-sand-100 flex items-center gap-3">
                  <span className="text-sm text-ink-500">Did we get it right?</span>
                  {feedback ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-moss-600">
                      <Check className="size-4" /> Thanks — feedback recorded
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => sendFeedback("correct")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-sand-300 px-3 py-1.5 text-sm font-semibold hover:bg-moss-100 hover:border-moss-300"
                      >
                        <ThumbsUp className="size-4" /> Correct
                      </button>
                      <button
                        onClick={() => sendFeedback("incorrect")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-sand-300 px-3 py-1.5 text-sm font-semibold hover:bg-red-50 hover:border-red-300"
                      >
                        <ThumbsDown className="size-4" /> Not right
                      </button>
                    </>
                  )}
                </div>
              </Card>

              {/* alternates */}
              {result.alternates.length > 0 && (
                <Card className="p-5 sm:p-6">
                  <h3 className="font-display font-bold text-ink-900 mb-3">Could also be…</h3>
                  <div className="space-y-3">
                    {result.alternates.map((a, i) => {
                      const known = result.alternateSpecies[i];
                      return (
                        <div key={a.commonName} className="rounded-xl bg-sand-100/60 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-bold text-sm text-ink-900">
                              {known ? (
                                <Link href={`/fish/${known.slug}`} className="hover:text-tide-700">
                                  {a.commonName} →
                                </Link>
                              ) : (
                                a.commonName
                              )}
                            </div>
                            <span className="text-xs font-bold text-ink-500">{Math.round(a.confidencePct)}%</span>
                          </div>
                          <p className="mt-1 text-sm text-ink-700">{a.howToTell}</p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* known lookalikes from the guide */}
              {result.primarySpecies && result.primarySpecies.lookalikes.length > 0 && (
                <Card className="p-5 sm:p-6">
                  <h3 className="font-display font-bold text-ink-900 mb-3">
                    Known lookalikes for {result.primarySpecies.commonName}
                  </h3>
                  <div className="space-y-2.5">
                    {result.primarySpecies.lookalikes.map((l) => (
                      <div key={l.name} className="text-sm text-ink-700 leading-relaxed">
                        <strong>{l.name}:</strong> {l.howToTell}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
          <div className="text-center">
            <Button variant="ghost" onClick={() => fileInput.current?.click()}>
              <RefreshCw className="size-4" /> Identify another fish
            </Button>
          </div>
        </div>
      )}

      <p className="mt-8 text-xs text-ink-300 text-center max-w-lg mx-auto">
        Identification is AI-assisted and can be wrong — verify against the guide photos and lookalike notes
        before keeping fish, and always follow your state&apos;s regulations.
      </p>
    </div>
  );
}
