import { test } from "node:test";
import assert from "node:assert/strict";
import { approximate } from "../src/lib/geo";

test("approximate() rounds coordinates to ~1km (2 decimals)", () => {
  const { lat, lng } = approximate(27.987654, -82.123456);
  assert.equal(lat, 27.99);
  assert.equal(lng, -82.12);
});

test("approximate() never leaks sub-100m precision", () => {
  const exact = { lat: 27.9876543, lng: -82.1234567 };
  const approx = approximate(exact.lat, exact.lng);
  // rounded value must differ from the exact fix (precision genuinely dropped)
  assert.notEqual(approx.lat, exact.lat);
  assert.notEqual(approx.lng, exact.lng);
  // at most 2 decimal places survive
  assert.ok(/^-?\d+(\.\d{1,2})?$/.test(String(approx.lat)));
  assert.ok(/^-?\d+(\.\d{1,2})?$/.test(String(approx.lng)));
});
