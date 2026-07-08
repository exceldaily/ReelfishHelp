# 🎣 ReelFishHelp

A production-ready fishing help platform for US freshwater and saltwater anglers.

**Find fish → identify fish → learn exactly how to catch them → plan the trip → log the catch → share it.**

## What's inside

| Area | What works |
|---|---|
| **Fish Finder** | 41 US species, filterable by water, state, habitat, style, season, difficulty, and "near me" |
| **Catch Guides** | Full editorial guides per species: quick plan, gear by budget tier, techniques by style, timing/conditions, habitat, mistakes, handling & release, per-state regulation links |
| **Photo ID** | Claude vision identification with confidence, alternates, lookalikes, and correct/incorrect feedback |
| **Conditions** | Live Open-Meteo weather + forecast, real NOAA tide predictions, moon phase, sunrise/sunset, pressure trend, and a practical fishing-activity score with future date/time planning |
| **Trips** | Planner with target species, gear/bait checklists, projected weather & tides, complete-trip → catch-log flow |
| **Catches** | Multi-photo catch logging with measurements, conditions, release status, and 3-level visibility |
| **Spots** | Private Leaflet map with 4 privacy tiers — exact coordinates are **never** exposed publicly |
| **Gear** | Categorized gear locker + wishlist, save recommended setups straight from catch guides |
| **Community** | Public feed, follows, likes, comments, saves, reporting |
| **Profiles** | Stats, badges, public gear, shared general areas, follower privacy |
| **Admin** | Species/guide CMS, reports queue with content removal, intentional admin bootstrap |

## Stack

- **Next.js 16** (App Router) + Tailwind CSS 4 + TypeScript
- **Postgres** via Drizzle ORM — Neon in production, **embedded PGlite locally (zero setup)**
- **Auth.js v5** email/password auth with roles
- **Cloudflare R2** (private bucket) for photos — EXIF/GPS stripped, WebP variants, Neon stores metadata only; falls back to Vercel Blob / local disk
- **Claude API** (`claude-opus-4-8`) for photo fish identification
- Free live data: Open-Meteo (weather), NOAA CO-OPS (tides), OpenStreetMap (maps), Wikipedia (species photos), BigDataCloud (reverse geocoding) — **no API keys needed**

## Local development (zero config)

```bash
npm install
npm run db:setup   # migrates + seeds the embedded PGlite database
npm run dev
```

Open http://localhost:3000. Everything works locally — auth, catches, trips, spots, live weather and tides — with no environment variables. The first account you register becomes the admin.

Photo identification is the one feature that needs a key locally:

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...   # console.anthropic.com
```

## Deploying to Vercel (free tier)

1. **Import the repo** into Vercel.
2. **Add Neon Postgres**: Vercel → Storage → Create → Neon. This sets `DATABASE_URL` automatically.
3. **Add Cloudflare R2** for photos (see below). Fallback: Vercel Blob (`BLOB_READ_WRITE_TOKEN`), else local disk in dev.
4. **Set env vars** (Project → Settings → Environment Variables):
   - `AUTH_SECRET` — generate with `npx auth secret` or `openssl rand -base64 32`
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` — photo storage
   - `CRON_SECRET` — protects the nightly media-cleanup cron
   - `ANTHROPIC_API_KEY` — for photo identification (optional)
5. **Migrate + seed the production database** from your machine:
   ```bash
   DATABASE_URL="postgres://...neon connection string..." npm run db:setup
   ```
6. Deploy. Create/admin users intentionally; production signups do not become admin automatically.

## Signup security

The app ships with bcrypt password hashing, generic login errors, trimmed/lowercased email handling, auth throttling, security headers, and optional Cloudflare Turnstile on login/signup.

Recommended Cloudflare setup:

1. Put the production hostname behind Cloudflare proxy mode.
2. Enable the Cloudflare WAF managed ruleset.
3. Add rate limiting rules for `POST /login`, `POST /signup`, `/api/auth/*`, and expensive upload/identify routes.
4. Create a Cloudflare Turnstile widget and set these Vercel environment variables:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`
5. Keep `ALLOW_FIRST_USER_ADMIN` unset or `false` in production. Only use `true` for local bootstrap on an empty dev database.

## Cloudflare R2 photo storage

Photos never touch the Neon database as binaries — Neon stores only metadata
(`media_assets`, `media_variants`, `user_storage_usage`). The bytes live in a
**private** R2 bucket and are served through the authenticated `/api/media/*`
route, which enforces ownership + visibility before returning anything.

**Setup:**

1. Cloudflare dashboard → **R2** → *Create bucket* (e.g. `reelfishhelp-photos`). Keep it **private** (no public access).
2. **R2 → Manage R2 API Tokens → Create API token**, permission *Object Read & Write*, scoped to the bucket. Copy the **Access Key ID**, **Secret Access Key**, and your **Account ID**.
3. Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` (in Vercel and/or `.env.local`).
4. Optional: `STORAGE_FREE_QUOTA_MB` (default 500), `STORAGE_ALERT_RATIO` (default 0.85), `CRON_SECRET`.

If the four R2 vars are unset the app automatically falls back to Vercel Blob,
then local disk — so dev keeps working with zero config.

**What the pipeline does on every upload:** validates type + size (15 MB max) →
strips all EXIF including GPS via `sharp` → generates `thumbnail` (400px),
`feed` (1080px) and `detail` (1600px) WebP variants → uploads them under
`catches/{userId}/{catchId}/{mediaId}/…` → records metadata + bumps the user's
storage usage. Object keys are never guessable public URLs.

**Lifecycle:** `/api/cron/media-cleanup` runs nightly (Vercel Cron in
`vercel.json`) to purge soft-deleted photos past a 24 h recovery window,
abandoned/failed uploads after 7 days, and temporary originals after 7 days.
Admins can also trigger it from **Admin → Storage**. External schedulers can
call it with `Authorization: Bearer $CRON_SECRET`.

**Dashboards:** users manage/delete their own photos and see usage at
**Settings → Photos & storage**; admins see totals by category and user, upload
activity, and failed/pending-purge counts at **Admin → Storage**.

## Data & privacy design

- All stored locations (profiles, catches, non-exact spots) are rounded to ~1 km before touching the database.
- Spot privacy tiers: private exact → private area → shared general area → public broad label. Only `private_exact` keeps precise coordinates, and those are only ever shown to the owner.
- Content visibility: public / followers-only / private on catches, trips, and profiles — enforced on media delivery too.
- **Photo EXIF (including GPS) is stripped from every stored image** before it's saved; originals are only retained temporarily and auto-purged.
- Reports flow into an admin moderation queue with one-click content removal.

## Extending the fish database

Species live in `src/data/species/*.ts` (seeded into the `species` table) with a structured `guide` JSON covering every section of the catch guide. Add a new entry, run `npm run db:seed`, done. Admins can also edit any species and guide live at `/admin/species`. State regulation links live in `src/data/regulations.ts` / the `regulation_links` table, structured to support automated regulation feeds later.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (embedded PGlite, auto-migrates + seeds) |
| `npm run build` | Production build |
| `npm run db:generate` | Generate SQL migrations after schema changes |
| `npm run db:migrate` | Apply migrations (`DATABASE_URL` or local PGlite) |
| `npm run db:seed` | Seed species + regulation links (idempotent) |
| `npm run db:setup` | Migrate + seed in one step |
| `npm test` | Unit tests (location redaction, media keys, EXIF/GPS stripping) |

---

*Fishing activity ratings are practical indicators from live environmental conditions — never guarantees. Always verify current state regulations before keeping fish.*
