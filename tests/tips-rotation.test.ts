import { test } from "node:test";
import assert from "node:assert/strict";
import { pickDailyTip, utcToday } from "../src/lib/tips";

const t = (id: string, over: Partial<Parameters<typeof pickDailyTip>[0][number]> = {}) => ({
  id,
  isActive: true,
  publishDate: null as string | null,
  expirationDate: null as string | null,
  displayOrder: 0,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  ...over,
});

test("same tip is returned for every call on the same day", () => {
  const tips = [t("a"), t("b"), t("c")];
  const first = pickDailyTip(tips, "2026-07-17");
  for (let i = 0; i < 5; i++) assert.equal(pickDailyTip(tips, "2026-07-17"), first);
});

test("the pick advances to the next tip on the next day", () => {
  const tips = [t("a"), t("b"), t("c")];
  const today = pickDailyTip(tips, "2026-07-17");
  const tomorrow = pickDailyTip(tips, "2026-07-18");
  assert.notEqual(today, tomorrow);
});

test("rotation wraps and covers the whole pool", () => {
  const tips = [t("a"), t("b"), t("c")];
  const seen = new Set<string>();
  for (let d = 1; d <= 3; d++) seen.add(pickDailyTip(tips, `2026-07-0${d}`)!);
  assert.equal(seen.size, 3);
});

test("a tip scheduled for today beats the rotation", () => {
  const tips = [t("a"), t("b"), t("sched", { publishDate: "2026-07-17" })];
  assert.equal(pickDailyTip(tips, "2026-07-17"), "sched");
  assert.notEqual(pickDailyTip(tips, "2026-07-18"), "sched");
});

test("inactive and expired tips never show", () => {
  const tips = [
    t("inactive", { isActive: false }),
    t("expired", { expirationDate: "2026-07-01" }),
    t("live"),
  ];
  for (let d = 10; d < 20; d++) {
    assert.equal(pickDailyTip(tips, `2026-07-${d}`), "live");
  }
});

test("empty pool returns null instead of exploding", () => {
  assert.equal(pickDailyTip([], "2026-07-17"), null);
  assert.equal(pickDailyTip([t("x", { isActive: false })], "2026-07-17"), null);
});

test("displayOrder controls rotation order", () => {
  const tips = [t("second", { displayOrder: 2 }), t("first", { displayOrder: 1 })];
  // day index parity decides which shows, but ordering must be stable by displayOrder
  const day1 = pickDailyTip(tips, "2026-07-17");
  const day2 = pickDailyTip(tips, "2026-07-18");
  assert.deepEqual(new Set([day1, day2]), new Set(["first", "second"]));
});

test("utcToday formats as YYYY-MM-DD", () => {
  assert.match(utcToday(new Date("2026-07-17T15:30:00Z")), /^2026-07-17$/);
});
