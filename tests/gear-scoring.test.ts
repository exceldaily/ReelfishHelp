import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreSpecies, scoreSetup, type SpeciesReq, type SetupInput } from "../src/lib/gear/scoring";

const bluegill: SpeciesReq = {
  speciesSlug: "bluegill", name: "Bluegill", water: "freshwater",
  lineLbMin: 2, lineLbIdeal: 4, lineLbMax: 6, leaderLbMin: null, leaderLbMax: null,
  rodPower: ["ultralight", "light"], reelSizeMin: 500, reelSizeMax: 2000,
  fightStrength: 1, structureRisk: 1, methods: ["still fishing", "casting"],
};
const redfish: SpeciesReq = {
  speciesSlug: "redfish", name: "Redfish", water: "saltwater",
  lineLbMin: 10, lineLbIdeal: 20, lineLbMax: 30, leaderLbMin: 20, leaderLbMax: 40,
  rodPower: ["medium", "medium-heavy"], reelSizeMin: 3000, reelSizeMax: 4000,
  fightStrength: 4, structureRisk: 4, methods: ["casting", "sight fishing", "still fishing"],
};
const tarpon: SpeciesReq = {
  speciesSlug: "tarpon", name: "Tarpon", water: "saltwater",
  lineLbMin: 30, lineLbIdeal: 65, lineLbMax: 80, leaderLbMin: 60, leaderLbMax: 100,
  rodPower: ["heavy", "extra-heavy"], reelSizeMin: 5000, reelSizeMax: 10000,
  fightStrength: 5, structureRisk: 3, methods: ["still fishing", "drifting", "sight fishing"],
};
const gagGrouper: SpeciesReq = {
  speciesSlug: "gag-grouper", name: "Gag Grouper", water: "saltwater",
  lineLbMin: 50, lineLbIdeal: 65, lineLbMax: 100, leaderLbMin: 80, leaderLbMax: 130,
  rodPower: ["heavy", "extra-heavy"], reelSizeMin: 6000, reelSizeMax: 14000,
  fightStrength: 5, structureRisk: 5, methods: ["bottom fishing", "jigging"],
};
const trout: SpeciesReq = {
  speciesSlug: "speckled-trout", name: "Speckled Trout", water: "saltwater",
  lineLbMin: 8, lineLbIdeal: 12, lineLbMax: 20, leaderLbMin: 15, leaderLbMax: 25,
  rodPower: ["medium-light", "medium"], reelSizeMin: 2500, reelSizeMax: 3500,
  fightStrength: 2, structureRisk: 2, methods: ["casting", "drifting"],
};

test("ultralight panfish setup is a strong match for bluegill", () => {
  const setup: SetupInput = { water: "freshwater", lineLb: 4, lineType: "monofilament", rodPower: "ultralight", reelSize: 1500, method: "casting" };
  const v = scoreSpecies(setup, bluegill).verdict;
  assert.ok(v === "Excellent Match" || v === "Good Match", `got ${v}`);
});

test("a 6 lb light setup is Too Light for tarpon", () => {
  const setup: SetupInput = { water: "saltwater", lineLb: 6, lineType: "braid", rodPower: "light", reelSize: 2000, method: "still fishing" };
  assert.equal(scoreSpecies(setup, tarpon).verdict, "Too Light");
});

test("a heavy bottom setup matches gag grouper but is wrong/too heavy for trout", () => {
  const setup: SetupInput = { water: "saltwater", lineLb: 65, lineType: "braid", leaderLb: 100, rodPower: "heavy", reelSize: 8000, method: "bottom fishing" };
  const gag = scoreSpecies(setup, gagGrouper).verdict;
  assert.ok(gag === "Excellent Match" || gag === "Good Match", `gag got ${gag}`);
  const tr = scoreSpecies(setup, trout).verdict;
  assert.ok(tr === "Too Heavy" || tr === "Wrong Setup Type", `trout got ${tr}`);
});

test("water filter excludes freshwater fish from a saltwater setup", () => {
  const setup: SetupInput = { water: "saltwater", lineLb: 20, lineType: "braid", leaderLb: 30, rodPower: "medium-heavy", reelSize: 3500, method: "casting" };
  const res = scoreSetup(setup, [bluegill, redfish]);
  const all = [...res.best, ...res.okay, ...res.tooLight, ...res.tooHeavy, ...res.wrongType];
  assert.ok(!all.some((s) => s.slug === "bluegill"), "bluegill should be filtered out in saltwater");
  assert.ok(res.best.some((s) => s.slug === "redfish"), "redfish should be a match");
});

test("braid with no leader triggers a leader suggestion", () => {
  const setup: SetupInput = { water: "saltwater", lineLb: 20, lineType: "braid", rodPower: "medium-heavy", reelSize: 3500, method: "casting" };
  const res = scoreSetup(setup, [redfish]);
  assert.ok(res.suggestions.some((s) => /leader/i.test(s)), "expected a leader suggestion");
});

test("aggregation buckets a mixed set correctly", () => {
  const setup: SetupInput = { water: "saltwater", lineLb: 65, lineType: "braid", leaderLb: 100, rodPower: "heavy", reelSize: 8000, method: "bottom fishing" };
  const res = scoreSetup(setup, [gagGrouper, trout]);
  assert.ok(res.best.some((s) => s.slug === "gag-grouper"));
  assert.ok([...res.tooHeavy, ...res.wrongType].some((s) => s.slug === "speckled-trout"));
});
