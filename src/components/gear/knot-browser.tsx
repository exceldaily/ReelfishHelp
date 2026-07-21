"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";

export type KnotLite = {
  slug: string;
  name: string;
  useCategory: string;
  bestUse: string;
  difficulty: number;
  strengthRating: number;
};

export const USE_LABELS: Record<string, string> = {
  "line-to-hook": "Line to Hook",
  "line-to-lure": "Line to Lure",
  "braid-to-leader": "Braid to Leader",
  "line-to-line": "Line to Line",
  loop: "Loop Knots",
  offshore: "Offshore / Heavy Tackle",
  fly: "Fly Fishing",
  wire: "Wire Leader",
};

const SITUATIONS: { cat: string; label: string }[] = [
  { cat: "line-to-hook", label: "Tying line to a hook" },
  { cat: "braid-to-leader", label: "Tying braid to leader" },
  { cat: "line-to-line", label: "Joining two lines" },
  { cat: "loop", label: "Tying a loop knot" },
  { cat: "wire", label: "Tying wire" },
  { cat: "offshore", label: "Rigging offshore gear" },
  { cat: "fly", label: "Fly fishing" },
];

const ORDER = ["line-to-hook", "line-to-lure", "braid-to-leader", "line-to-line", "loop", "offshore", "fly", "wire"];
const DIFF = ["", "Beginner", "Beginner", "Intermediate", "Advanced", "Expert"];

export function KnotBrowser({ knots }: { knots: KnotLite[] }) {
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const filtered = knots.filter(
    (k) => (!cat || k.useCategory === cat) && (!q || k.name.toLowerCase().includes(q.toLowerCase()))
  );
  const cats = ORDER.filter((c) => filtered.some((k) => k.useCategory === c));

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm font-semibold text-ink-700 mb-2">Choose your situation</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCat(null)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${!cat ? "bg-tide-900 text-white" : "bg-sand-100 text-ink-700 hover:bg-sand-200"}`}
          >
            All knots
          </button>
          {SITUATIONS.map((sit) => (
            <button
              key={sit.cat}
              onClick={() => setCat(cat === sit.cat ? null : sit.cat)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${cat === sit.cat ? "bg-tide-900 text-white" : "bg-sand-100 text-ink-700 hover:bg-sand-200"}`}
            >
              {sit.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-300" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search knots…"
          className="w-full rounded-xl border border-sand-300 bg-white pl-10 pr-4 py-2.5 text-[15px] focus:outline-2 focus:outline-tide-500"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-500">No knots match. Try a different search.</p>
      ) : (
        <div className="space-y-7">
          {cats.map((c) => (
            <section key={c}>
              <h2 className="font-display text-lg font-bold text-ink-900 mb-3">{USE_LABELS[c] ?? c}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered
                  .filter((k) => k.useCategory === c)
                  .map((k) => (
                    <Link
                      key={k.slug}
                      href={`/gear/knots/${k.slug}`}
                      className="group bg-card rounded-2xl border border-edge shadow-card p-4 hover:shadow-lift transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display font-bold text-ink-900 group-hover:text-tide-700 transition-colors">{k.name}</h3>
                        <ArrowRight className="size-4 text-ink-300 group-hover:text-tide-600 shrink-0" />
                      </div>
                      <p className="mt-1 text-sm text-ink-500">{k.bestUse}</p>
                      <div className="mt-2.5 flex items-center gap-3 text-xs text-ink-500">
                        <span className="font-semibold">{DIFF[k.difficulty]}</span>
                        <span className="flex items-center gap-1">
                          Strength
                          <span className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <span key={i} className={`size-1.5 rounded-full ${i <= k.strengthRating ? "bg-moss-500" : "bg-sand-200"}`} />
                            ))}
                          </span>
                        </span>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
