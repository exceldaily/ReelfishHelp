"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, ListChecks } from "lucide-react";
import { Button } from "@/components/ui";

const WATER_TYPES = ["freshwater", "saltwater", "inshore", "offshore", "surf", "pier", "kayak", "boat", "river", "lake", "pond", "shore"];
const ROD_TYPES = ["spinning", "casting", "surf", "jigging", "trolling", "fly", "inshore", "offshore", "freshwater", "travel"];
const POWERS = ["ultralight", "light", "medium-light", "medium", "medium-heavy", "heavy", "extra-heavy"];
const REEL_TYPES = ["spinning", "baitcasting", "conventional", "lever-drag", "star-drag", "fly", "trolling"];
const REEL_SIZES = [1000, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 8000, 10000, 14000, 20000];
const LINE_TYPES = ["braid", "monofilament", "fluorocarbon", "copolymer", "wire"];
const LEADER_TYPES = ["none", "fluorocarbon", "monofilament", "wire"];
const HOOKS = ["circle hook", "j-hook", "treble hook", "weedless hook", "offset worm hook", "jig head"];
const BAITS = ["live bait", "cut bait", "soft plastic", "hard bait", "jig", "spoon", "topwater", "fly", "trolling lure"];
const METHODS = ["casting", "trolling", "bottom fishing", "jigging", "drifting", "still fishing", "surf fishing", "sight fishing", "fly fishing"];

const selCls = "w-full rounded-xl border border-sand-300 bg-white px-3 py-2.5 min-h-11 text-[15px] capitalize";
const numCls = "w-full rounded-xl border border-sand-300 bg-white px-3 py-2.5 min-h-11 text-[15px]";
const labelCls = "block text-sm font-semibold text-ink-700 mb-1";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-sand-100 pt-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="grid place-items-center size-6 rounded-full bg-tide-100 text-tide-700 text-xs font-bold">{n}</span>
        <h3 className="font-display font-bold text-ink-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function SetupBuilder({ initialSpecies }: { initialSpecies?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"scratch" | "help">(initialSpecies ? "help" : "scratch");

  function goToResults(params: Record<string, string>) {
    const q = new URLSearchParams({ built: "1", ...params });
    router.push(`/gear/builder?${q.toString()}`);
  }

  function onScratch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params: Record<string, string> = {};
    for (const [k, v] of fd.entries()) if (v) params[k] = String(v);
    goToResults(params);
  }

  function onHelp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const water = String(fd.get("water") || "saltwater");
    const platform = String(fd.get("platform") || "");
    const baitKind = String(fd.get("baitKind") || "artificial");
    const tackle = String(fd.get("tackle") || "medium");
    const speciesTarget = String(fd.get("species") || "");

    const T: Record<string, { power: string; line: string; leader: string; reel: string }> = {
      light: { power: "medium-light", line: "10", leader: "20", reel: "2500" },
      medium: { power: "medium-heavy", line: "20", leader: "30", reel: "4000" },
      heavy: { power: "heavy", line: "50", leader: "80", reel: "8000" },
    };
    const t = T[tackle] ?? T.medium;
    const method =
      platform === "surf" ? "surf fishing" : platform === "offshore" ? "bottom fishing" : baitKind === "live" ? "still fishing" : "casting";
    goToResults({
      water,
      fishingType: platform || water,
      rodPower: t.power,
      lineType: "braid",
      lineLb: t.line,
      leaderType: "fluorocarbon",
      leaderLb: t.leader,
      reelSize: t.reel,
      method,
      ...(speciesTarget ? { species: speciesTarget } : {}),
    });
  }

  return (
    <div>
      <div className="flex gap-1.5 rounded-xl bg-sand-100 p-1 w-fit mb-6">
        <button onClick={() => setMode("scratch")} className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold ${mode === "scratch" ? "bg-white shadow-card text-ink-900" : "text-ink-500"}`}>
          <ListChecks className="size-4" /> Build from scratch
        </button>
        <button onClick={() => setMode("help")} className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold ${mode === "help" ? "bg-white shadow-card text-ink-900" : "text-ink-500"}`}>
          <Wand2 className="size-4" /> Help me build one
        </button>
      </div>

      {mode === "scratch" ? (
        <form onSubmit={onScratch} className="bg-white rounded-2xl border border-sand-200 shadow-card p-5 sm:p-6 space-y-5">
          <Step n={1} title="What kind of fishing are you doing?">
            <select name="water" className={selCls} defaultValue="saltwater">
              {WATER_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Step>
          <Step n={2} title="What rod are you using?">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className={labelCls}>Rod type</label><select name="rodType" className={selCls} defaultValue="spinning">{ROD_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
              <div><label className={labelCls}>Power</label><select name="rodPower" className={selCls} defaultValue="medium">{POWERS.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
            </div>
          </Step>
          <Step n={3} title="What reel?">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className={labelCls}>Reel type</label><select name="reelType" className={selCls} defaultValue="spinning">{REEL_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
              <div><label className={labelCls}>Reel size</label><select name="reelSize" className={selCls} defaultValue="3000">{REEL_SIZES.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
            </div>
          </Step>
          <Step n={4} title="What line is on your reel?">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className={labelCls}>Line type</label><select name="lineType" className={selCls} defaultValue="braid">{LINE_TYPES.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
              <div><label className={labelCls}>Pound test</label><input name="lineLb" type="number" min={2} max={200} defaultValue={20} className={numCls} /></div>
            </div>
          </Step>
          <Step n={5} title="Leader">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className={labelCls}>Leader type</label><select name="leaderType" className={selCls} defaultValue="fluorocarbon">{LEADER_TYPES.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
              <div><label className={labelCls}>Leader pound test</label><input name="leaderLb" type="number" min={0} max={250} defaultValue={30} className={numCls} /></div>
            </div>
          </Step>
          <Step n={6} title="Hook & bait">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className={labelCls}>Hook</label><select name="hook" className={selCls} defaultValue="circle hook">{HOOKS.map((h) => <option key={h} value={h}>{h}</option>)}</select></div>
              <div><label className={labelCls}>Bait or lure</label><select name="baitLure" className={selCls} defaultValue="soft plastic">{BAITS.map((b) => <option key={b} value={b}>{b}</option>)}</select></div>
            </div>
          </Step>
          <Step n={7} title="How are you fishing it?">
            <select name="method" className={selCls} defaultValue="casting">{METHODS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
          </Step>
          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full">See what this setup can catch</Button>
          </div>
        </form>
      ) : (
        <form onSubmit={onHelp} className="bg-white rounded-2xl border border-sand-200 shadow-card p-5 sm:p-6 space-y-5">
          <div>
            <label className={labelCls}>What fish are you targeting? (optional)</label>
            <input name="species" defaultValue={initialSpecies ?? ""} placeholder="e.g. redfish, bass, grouper" className={numCls} />
          </div>
          <div>
            <label className={labelCls}>Where are you fishing?</label>
            <select name="water" className={selCls} defaultValue="saltwater">{WATER_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}</select>
          </div>
          <div>
            <label className={labelCls}>Shore, pier, kayak, boat, surf, or offshore?</label>
            <select name="platform" className={selCls} defaultValue="boat">{["shore", "pier", "kayak", "boat", "surf", "offshore"].map((p) => <option key={p} value={p}>{p}</option>)}</select>
          </div>
          <div>
            <label className={labelCls}>Live bait or artificial?</label>
            <select name="baitKind" className={selCls} defaultValue="artificial">{["artificial", "live"].map((p) => <option key={p} value={p}>{p}</option>)}</select>
          </div>
          <div>
            <label className={labelCls}>Light tackle or heavy tackle?</label>
            <select name="tackle" className={selCls} defaultValue="medium">{["light", "medium", "heavy"].map((p) => <option key={p} value={p}>{p}</option>)}</select>
          </div>
          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full">Build my setup</Button>
          </div>
        </form>
      )}
    </div>
  );
}
