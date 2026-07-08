import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { processImage } from "../src/lib/image-pipeline";

// A JPEG carrying EXIF metadata (stand-in for the GPS block a phone camera adds).
async function exifJpeg(width = 1400, height = 1000): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: { r: 12, g: 110, b: 80 } } })
    .withExif({ IFD0: { Copyright: "PRIVATEGPS-27.9876,-82.1234", Software: "SecretCam" } })
    .jpeg()
    .toBuffer();
}

test("strips ALL EXIF (incl. GPS) from every stored variant", async () => {
  const input = await exifJpeg();
  const { variants } = await processImage(input, "image/jpeg");

  assert.equal(variants.length, 3);
  for (const v of variants) {
    // the secret EXIF string must not survive into the stored bytes
    assert.ok(!v.buffer.includes(Buffer.from("PRIVATEGPS")), `${v.label} leaked EXIF text`);
    const meta = await sharp(v.buffer).metadata();
    assert.equal(meta.exif, undefined, `${v.label} still has an EXIF block`);
    assert.equal(v.format, "webp");
  }
});

test("generates thumbnail/feed/detail variants converted to WebP", async () => {
  const { variants } = await processImage(await exifJpeg(3000, 2000), "image/jpeg");
  const byLabel = Object.fromEntries(variants.map((v) => [v.label, v]));

  assert.ok(byLabel.thumbnail.width <= 400 && byLabel.thumbnail.height <= 400);
  assert.ok(byLabel.feed.width <= 1080 && byLabel.feed.height <= 1080);
  assert.ok(byLabel.detail.width <= 1600 && byLabel.detail.height <= 1600);
  // smaller variants should be fewer bytes
  assert.ok(byLabel.thumbnail.bytes < byLabel.detail.bytes);
});

test("never upscales images smaller than a variant target", async () => {
  const { variants } = await processImage(await exifJpeg(320, 240), "image/jpeg");
  const detail = variants.find((v) => v.label === "detail")!;
  assert.equal(detail.width, 320);
  assert.equal(detail.height, 240);
});

test("rejects non-image input", async () => {
  await assert.rejects(() => processImage(Buffer.from("not an image"), "text/plain"));
});
