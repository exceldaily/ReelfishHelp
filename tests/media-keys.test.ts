import { test } from "node:test";
import assert from "node:assert/strict";
import { mediaBaseKey, variantKey, temporaryOriginalKey } from "../src/lib/media-keys";

test("catch keys are scoped under the owner + catch", () => {
  const key = mediaBaseKey("catch", "user1", "catch9", "media5");
  assert.equal(key, "catches/user1/catch9/media5");
  assert.equal(variantKey(key, "feed"), "catches/user1/catch9/media5/feed.webp");
});

test("profile keys live under users/{id}/profile", () => {
  assert.equal(mediaBaseKey("profile", "user1", null, "m1"), "users/user1/profile/m1");
});

test("gear and spot keys include the parent id when present", () => {
  assert.equal(mediaBaseKey("gear", "u", "g", "m"), "gear/u/g/m");
  assert.equal(mediaBaseKey("spot", "u", "s", "m"), "spots/u/s/m");
});

test("keys never contain path-traversal segments", () => {
  for (const kind of ["catch", "profile", "gear", "spot", "other"] as const) {
    const key = mediaBaseKey(kind, "u", "r", "m");
    assert.ok(!key.includes(".."));
    assert.ok(!key.startsWith("/"));
  }
});

test("temporary originals are namespaced for lifecycle cleanup", () => {
  const key = temporaryOriginalKey("user1", "media5");
  assert.equal(key, "temporary/user1/media5/original");
  assert.ok(key.startsWith("temporary/"));
});
