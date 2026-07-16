import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  real,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

/* ---------------------------------- users ---------------------------------- */

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["user", "admin"] })
    .notNull()
    .default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WaterPref = "freshwater" | "saltwater" | "both";
export type Visibility = "public" | "followers" | "private";
export type LocationMode = "precise" | "approximate" | "off";
export type LocationPrecision = "exact_private" | "approx_private" | "shared_broad_area" | "hidden";

export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  homeState: text("home_state"),
  waterPref: text("water_pref").$type<WaterPref>().notNull().default("both"),
  experience: text("experience", {
    enum: ["new", "casual", "regular", "serious"],
  })
    .notNull()
    .default("casual"),
  fishingStyles: jsonb("fishing_styles").$type<string[]>().notNull().default([]),
  favoriteSpecies: jsonb("favorite_species").$type<string[]>().notNull().default([]),
  visibility: text("visibility").$type<Visibility>().notNull().default("public"),
  locationMode: text("location_mode").$type<LocationMode>().notNull().default("approximate"),
  // manual location fallback + last approximate fix (rounded, never exact)
  manualState: text("manual_state"),
  manualRegion: text("manual_region"),
  lastLat: real("last_lat"),
  lastLng: real("last_lng"),
  lastLocationLabel: text("last_location_label"),
  onboarded: boolean("onboarded").notNull().default(false),
  acceptedTermsAt: timestamp("accepted_terms_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* --------------------------------- species --------------------------------- */

export type SpeciesGuide = {
  summary: string;
  identification?: {
    characteristics: string[];
  };
  quickPlan: {
    bestBaitNow: string;
    lureType: string;
    setup: string;
    locationType: string;
    bestTime: string;
    seasonalNote: string;
  };
  gear: {
    rod: string;
    reel: string;
    mainLine: string;
    leader: string;
    hooks: string;
    jigheads?: string;
    terminal: string;
    lureSizes: string;
    lureColors: string;
    baits: string[];
    setups: { beginner: string; budget: string; serious: string };
  };
  techniques: {
    presentation: string;
    retrieve: string;
    positioning: string;
    depth: string;
    structure: string;
    current?: string;
    byStyle: Partial<Record<"shore" | "boat" | "kayak" | "pier" | "surf", string>>;
  };
  timing: {
    seasons: string;
    timeOfDay: string;
    weather: string;
    wind: string;
    waterTemp: string;
    tide?: string;
    moon?: string;
    pressure?: string;
    movement: string;
  };
  habitat: {
    overview: string;
    depthRange: string;
    structures: string[];
    lookFor: string;
    migration?: string;
  };
  mistakes: string[];
  handling: {
    landing: string;
    handling: string;
    release: string;
    regulations: string;
  };
};

export const species = pgTable(
  "species",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    slug: text("slug").notNull().unique(),
    commonName: text("common_name").notNull(),
    scientificName: text("scientific_name").notNull(),
    water: text("water", { enum: ["freshwater", "saltwater", "both"] }).notNull(),
    category: text("category").notNull(), // bass, trout, catfish, drum, pelagic...
    difficulty: integer("difficulty").notNull(), // 1-5
    beginnerFriendly: boolean("beginner_friendly").notNull().default(false),
    // Wikipedia page title used to resolve a high-quality photo at runtime
    wikiTitle: text("wiki_title").notNull(),
    imageUrl: text("image_url"),
    imageCredit: text("image_credit"),
    description: text("description").notNull(),
    avgSize: text("avg_size").notNull(),
    trophySize: text("trophy_size").notNull(),
    regions: jsonb("regions").$type<string[]>().notNull().default([]), // US regions
    states: jsonb("states").$type<string[]>().notNull().default([]), // 2-letter, empty = widespread
    environments: jsonb("environments").$type<string[]>().notNull().default([]), // lake,river,pond,beach,pier,surf,marsh,flats,reef,bridge,dock,canal,open water,inshore,offshore
    styles: jsonb("styles").$type<string[]>().notNull().default([]), // shore,kayak,boat,pier,surf
    seasons: jsonb("seasons").$type<string[]>().notNull().default([]), // spring,summer,fall,winter
    baitTypes: jsonb("bait_types").$type<string[]>().notNull().default([]),
    lookalikes: jsonb("lookalikes")
      .$type<{ name: string; howToTell: string }[]>()
      .notNull()
      .default([]),
    guide: jsonb("guide").$type<SpeciesGuide>().notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("species_water_idx").on(t.water)]
);

/* ---------------------------------- catches --------------------------------- */

export const catches = pgTable(
  "catches",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    speciesId: text("species_id").references(() => species.id, { onDelete: "set null" }),
    customSpeciesName: text("custom_species_name"),
    caughtAt: timestamp("caught_at", { withTimezone: true }).notNull(),
    waterType: text("water_type"), // lake, river, inshore, surf...
    method: text("method"), // shore, boat, kayak, pier, surf
    lengthIn: real("length_in"),
    weightLb: real("weight_lb"),
    bait: text("bait"),
    gearNotes: text("gear_notes"),
    weatherNotes: text("weather_notes"),
    tideNotes: text("tide_notes"),
    story: text("story"),
    released: boolean("released").notNull().default(true),
    visibility: text("visibility").$type<Visibility>().notNull().default("private"),
    publishAt: timestamp("publish_at", { withTimezone: true }),
    shareDelay: text("share_delay", { enum: ["now", "12h", "24h", "never"] }).notNull().default("never"),
    locationPrecision: text("location_precision").$type<LocationPrecision>().notNull().default("approx_private"),
    // location is always stored approximately (2 decimal places ≈ 1km)
    lat: real("lat"),
    lng: real("lng"),
    locationLabel: text("location_label"),
    broadAreaLabel: text("broad_area_label"),
    showLocation: boolean("show_location").notNull().default(false),
    tripId: text("trip_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("catches_user_idx").on(t.userId), index("catches_vis_idx").on(t.visibility)]
);

export const catchPhotos = pgTable("catch_photos", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  catchId: text("catch_id")
    .notNull()
    .references(() => catches.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  position: integer("position").notNull().default(0),
});

/* ----------------------------------- gear ----------------------------------- */

export const gearItems = pgTable(
  "gear_items",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: text("category").notNull(), // rod, reel, combo, line, leader, hooks, lures, tackle box, electronics, kayak, boat, motor, net, other
    name: text("name").notNull(),
    brand: text("brand"),
    model: text("model"),
    notes: text("notes"),
    photoUrl: text("photo_url"),
    purchaseDate: text("purchase_date"),
    condition: text("condition", {
      enum: ["new", "good", "worn", "needs repair"],
    }).default("good"),
    favorite: boolean("favorite").notNull().default(false),
    wishlist: boolean("wishlist").notNull().default(false),
    isPublic: boolean("is_public").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("gear_user_idx").on(t.userId)]
);

/* ----------------------------------- spots ----------------------------------- */

export type SpotPrivacy = "private_exact" | "private_area" | "shared_area" | "public_broad";

export const spots = pgTable(
  "spots",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    privacy: text("privacy").$type<SpotPrivacy>().notNull().default("private_exact"),
    lat: real("lat"),
    lng: real("lng"),
    areaLabel: text("area_label"), // e.g. "Lake Lanier — south end", shown for shared/public
    waterType: text("water_type"),
    speciesNotes: text("species_notes"),
    accessNotes: text("access_notes"),
    structureNotes: text("structure_notes"),
    tideSeasonNotes: text("tide_season_notes"),
    safetyParkingNotes: text("safety_parking_notes"),
    baitTechniqueNotes: text("bait_technique_notes"),
    photoUrl: text("photo_url"),
    favorite: boolean("favorite").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("spots_user_idx").on(t.userId)]
);

/* ----------------------------------- trips ----------------------------------- */

export type ChecklistItem = { text: string; done: boolean };

export const trips = pgTable(
  "trips",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    date: text("date").notNull(), // YYYY-MM-DD
    time: text("time"), // HH:MM
    spotId: text("spot_id").references(() => spots.id, { onDelete: "set null" }),
    locationLabel: text("location_label"),
    lat: real("lat"),
    lng: real("lng"),
    targetSpeciesIds: jsonb("target_species_ids").$type<string[]>().notNull().default([]),
    gearChecklist: jsonb("gear_checklist").$type<ChecklistItem[]>().notNull().default([]),
    baitChecklist: jsonb("bait_checklist").$type<ChecklistItem[]>().notNull().default([]),
    notes: text("notes"),
    status: text("status", { enum: ["planned", "completed"] })
      .notNull()
      .default("planned"),
    visibility: text("visibility").$type<Visibility>().notNull().default("private"),
    weatherSummary: jsonb("weather_summary").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("trips_user_idx").on(t.userId)]
);

/* ---------------------------------- social ---------------------------------- */

export const follows = pgTable(
  "follows",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.followingId] })]
);

export const likes = pgTable(
  "likes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    catchId: text("catch_id")
      .notNull()
      .references(() => catches.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.catchId] })]
);

export const comments = pgTable(
  "comments",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    catchId: text("catch_id")
      .notNull()
      .references(() => catches.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("comments_catch_idx").on(t.catchId)]
);

export const forumQuestions = pgTable(
  "forum_questions",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    boardId: text("board_id").references(() => biteBoards.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    topic: text("topic").notNull().default("general"),
    status: text("status", { enum: ["open", "resolved"] }).notNull().default("open"),
    answerCount: integer("answer_count").notNull().default(0),
    helpfulCount: integer("helpful_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("forum_questions_user_idx").on(t.userId),
    index("forum_questions_board_idx").on(t.boardId),
    index("forum_questions_created_idx").on(t.createdAt),
    index("forum_questions_status_idx").on(t.status),
    index("forum_questions_topic_idx").on(t.topic),
  ]
);

export const forumAnswers = pgTable(
  "forum_answers",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    questionId: text("question_id")
      .notNull()
      .references(() => forumQuestions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    helpfulCount: integer("helpful_count").notNull().default(0),
    accepted: boolean("accepted").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("forum_answers_question_idx").on(t.questionId),
    index("forum_answers_user_idx").on(t.userId),
  ]
);

export const forumAnswerVotes = pgTable(
  "forum_answer_votes",
  {
    answerId: text("answer_id")
      .notNull()
      .references(() => forumAnswers.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.answerId, t.userId] })]
);

export const savedPosts = pgTable(
  "saved_posts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    catchId: text("catch_id")
      .notNull()
      .references(() => catches.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.catchId] })]
);

export const savedGuides = pgTable(
  "saved_guides",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    speciesId: text("species_id")
      .notNull()
      .references(() => species.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.speciesId] })]
);

export const reports = pgTable("reports", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetType: text("target_type", {
    enum: ["catch", "comment", "profile", "spot", "message", "bite_report"],
  }).notNull(),
  targetId: text("target_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status", { enum: ["open", "resolved", "dismissed"] })
    .notNull()
    .default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------ identifications ------------------------------ */

export const identifications = pgTable("identifications", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  imageUrl: text("image_url"),
  result: jsonb("result").$type<Record<string, unknown>>().notNull(),
  feedback: text("feedback", { enum: ["correct", "incorrect"] }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------- media / R2 --------------------------------- */

export type MediaKind = "catch" | "profile" | "gear" | "spot" | "identification" | "report" | "other";
export type MediaStatus = "pending" | "ready" | "failed" | "deleted";
export type StorageBackend = "r2" | "blob" | "local";
export type VariantLabel = "thumbnail" | "feed" | "detail" | "original";

/**
 * One row per uploaded image. Neon stores ONLY metadata — never binaries.
 * The actual bytes live in Cloudflare R2 (or Vercel Blob / local disk as a
 * fallback when R2 is not configured). `visibility` drives the protected
 * delivery route; exact coordinates are never stored here.
 */
export const mediaAssets = pgTable(
  "media_assets",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").$type<MediaKind>().notNull().default("other"),
    relatedId: text("related_id"), // catchId / gearId / spotId / profile userId ...
    backend: text("backend").$type<StorageBackend>().notNull().default("local"),
    // base object key prefix in the bucket, e.g. catches/{userId}/{catchId}/{mediaId}
    baseKey: text("base_key"),
    contentType: text("content_type").notNull(),
    originalName: text("original_name"),
    // total bytes across all stored variants (kept in sync with variants)
    byteSize: bigint("byte_size", { mode: "number" }).notNull().default(0),
    width: integer("width"),
    height: integer("height"),
    visibility: text("visibility").$type<Visibility>().notNull().default("private"),
    status: text("status").$type<MediaStatus>().notNull().default("pending"),
    // whether the temporary original is still retained (for fish ID / retries)
    hasOriginal: boolean("has_original").notNull().default(false),
    originalKey: text("original_key"),
    // denormalized copy of variants for fast reads (also normalized below)
    variants: jsonb("variants")
      .$type<{ label: VariantLabel; key: string; url: string; width: number; height: number; bytes: number; format: string }[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("media_owner_idx").on(t.ownerId),
    index("media_related_idx").on(t.kind, t.relatedId),
    index("media_status_idx").on(t.status),
  ]
);

export const mediaVariants = pgTable(
  "media_variants",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    assetId: text("asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    label: text("label").$type<VariantLabel>().notNull(),
    key: text("key").notNull(), // R2 object key OR blob/local URL
    url: text("url").notNull(), // protected delivery URL
    format: text("format").notNull().default("webp"),
    width: integer("width").notNull().default(0),
    height: integer("height").notNull().default(0),
    byteSize: bigint("byte_size", { mode: "number" }).notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("media_variants_asset_idx").on(t.assetId)]
);

export const userStorageUsage = pgTable("user_storage_usage", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  totalBytes: bigint("total_bytes", { mode: "number" }).notNull().default(0),
  assetCount: integer("asset_count").notNull().default(0),
  photoCount: integer("photo_count").notNull().default(0),
  // per-user quota; null = use the global default (STORAGE_FREE_QUOTA_MB)
  quotaBytes: bigint("quota_bytes", { mode: "number" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type MediaVariant = typeof mediaVariants.$inferSelect;
export type UserStorageUsage = typeof userStorageUsage.$inferSelect;

/* ----------------------------- community core ------------------------------ */

export type BiteBoardKind = "state" | "region" | "lake" | "river" | "bay" | "beach" | "marsh" | "offshore" | "pier";
export type BiteReportOutcome = "caught" | "missed" | "hooked" | "observed";
export type BiteReportVisibility = "private" | "followers" | "public_area" | "public_no_area";

export const biteBoards = pgTable(
  "bite_boards",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    kind: text("kind").$type<BiteBoardKind>().notNull(),
    regionLabel: text("region_label").notNull(),
    state: text("state"),
    water: text("water").$type<WaterPref>().notNull().default("both"),
    description: text("description").notNull(),
    active: boolean("active").notNull().default(true),
    coverMediaId: text("cover_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("bite_boards_water_idx").on(t.water), index("bite_boards_state_idx").on(t.state)]
);

export const biteBoardMembers = pgTable(
  "bite_board_members",
  {
    boardId: text("board_id")
      .notNull()
      .references(() => biteBoards.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["member", "mod"] }).notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.boardId, t.userId] })]
);

export const biteReports = pgTable(
  "bite_reports",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    boardId: text("board_id").references(() => biteBoards.id, { onDelete: "set null" }),
    speciesId: text("species_id").references(() => species.id, { onDelete: "set null" }),
    customSpecies: text("custom_species"),
    outcome: text("outcome").$type<BiteReportOutcome>().notNull().default("caught"),
    bait: text("bait"),
    method: text("method"),
    timeOfDay: text("time_of_day"),
    weatherSummary: jsonb("weather_summary").$type<Record<string, unknown> | null>(),
    tideSummary: text("tide_summary"),
    moonSummary: text("moon_summary"),
    notes: text("notes"),
    photoMediaId: text("photo_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    photoUrl: text("photo_url"),
    visibility: text("visibility").$type<BiteReportVisibility>().notNull().default("private"),
    locationPrecision: text("location_precision").$type<LocationPrecision>().notNull().default("hidden"),
    lat: real("lat"),
    lng: real("lng"),
    broadAreaLabel: text("broad_area_label"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("bite_reports_board_idx").on(t.boardId),
    index("bite_reports_user_idx").on(t.userId),
    index("bite_reports_created_idx").on(t.createdAt),
    index("bite_reports_visibility_idx").on(t.visibility),
  ]
);

export const userBlocks = pgTable(
  "user_blocks",
  {
    blockerId: text("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: text("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.blockerId, t.blockedId] })]
);

export type BiteBoard = typeof biteBoards.$inferSelect;
export type NewBiteBoard = typeof biteBoards.$inferInsert;
export type BiteReport = typeof biteReports.$inferSelect;
export type NewBiteReport = typeof biteReports.$inferInsert;

/* ------------------------------- messaging ---------------------------------- */

/**
 * One row per pair of users. `userAId` < `userBId` (lexicographic) so a pair
 * maps to exactly one conversation regardless of who opened it.
 */
export const conversations = pgTable(
  "conversations",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userAId: text("user_a_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userBId: text("user_b_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
    lastMessagePreview: text("last_message_preview"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("conversations_pair_idx").on(t.userAId, t.userBId)]
);

export const messages = pgTable(
  "messages",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId)]
);

export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;

/* ------------------------------ regulation links ----------------------------- */

export const regulationLinks = pgTable(
  "regulation_links",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    state: text("state").notNull(), // 2-letter
    agency: text("agency").notNull(),
    url: text("url").notNull(),
    notes: text("notes"),
  },
  (t) => [uniqueIndex("regs_state_idx").on(t.state)]
);

/* ---------------------------------- crews ---------------------------------- */

export type CrewPrivacy = "open" | "private";
export type CrewRole = "owner" | "admin" | "member";

export const crews = pgTable(
  "crews",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    avatarUrl: text("avatar_url"),
    homeState: text("home_state"), // optional 2-letter state, for discovery
    privacy: text("privacy").$type<CrewPrivacy>().notNull().default("open"),
    inviteCode: text("invite_code").notNull(), // join token for private crews
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    memberCount: integer("member_count").notNull().default(1), // denormalized
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("crews_privacy_idx").on(t.privacy), index("crews_state_idx").on(t.homeState)]
);

export const crewMembers = pgTable(
  "crew_members",
  {
    crewId: text("crew_id")
      .notNull()
      .references(() => crews.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<CrewRole>().notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.crewId, t.userId] }), index("crew_members_user_idx").on(t.userId)]
);

export const crewPosts = pgTable(
  "crew_posts",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    crewId: text("crew_id")
      .notNull()
      .references(() => crews.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body"),
    catchId: text("catch_id").references(() => catches.id, { onDelete: "set null" }),
    photoMediaId: text("photo_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    photoUrl: text("photo_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("crew_posts_crew_idx").on(t.crewId), index("crew_posts_created_idx").on(t.createdAt)]
);

export type Crew = typeof crews.$inferSelect;
export type NewCrew = typeof crews.$inferInsert;
export type CrewMember = typeof crewMembers.$inferSelect;
export type CrewPost = typeof crewPosts.$inferSelect;

/* ------------------------------ gear education ------------------------------ */

export type ContentStatus = "draft" | "review" | "published";
export type GearArticleCategory = "rod" | "reel" | "line" | "leader" | "terminal" | "concept";
export type KnotUseCategory =
  | "line-to-hook"
  | "line-to-lure"
  | "braid-to-leader"
  | "line-to-line"
  | "loop"
  | "offshore"
  | "fly"
  | "wire";
export type GearSetupCategory =
  | "all-around"
  | "shore"
  | "pier"
  | "kayak"
  | "inshore-boat"
  | "offshore"
  | "technique"
  | "trophy";

export type GearArticleBody = {
  useCases: string[];
  pros: string[];
  cons: string[];
  mistakes?: string[];
  // rod fields
  lengthNote?: string;
  power?: string;
  action?: string;
  lineRange?: string;
  lureRange?: string;
  bestReel?: string;
  bestEnvironment?: string;
  bestSpeciesNote?: string;
  // line fields
  underwaterVisibility?: string;
  stretch?: string;
  abrasion?: string;
  casting?: string;
  knotStrength?: string;
  // reel / generic
  sizeNote?: string;
  gearRatioNote?: string;
  dragNote?: string;
  facts?: { label: string; value: string }[];
};

export const gearArticles = pgTable(
  "gear_articles",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: text("slug").notNull().unique(),
    category: text("category").$type<GearArticleCategory>().notNull(),
    subtype: text("subtype"),
    name: text("name").notNull(),
    summary: text("summary").notNull(),
    body: jsonb("body").$type<GearArticleBody>().notNull(),
    relatedSpecies: jsonb("related_species").$type<string[]>().notNull().default([]),
    waterTypes: jsonb("water_types").$type<string[]>().notNull().default([]),
    difficulty: integer("difficulty"),
    status: text("status").$type<ContentStatus>().notNull().default("published"),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("gear_articles_cat_idx").on(t.category), index("gear_articles_status_idx").on(t.status)]
);

export const knots = pgTable(
  "knots",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    useCategory: text("use_category").$type<KnotUseCategory>().notNull(),
    bestUse: text("best_use").notNull(),
    lineTypes: jsonb("line_types").$type<string[]>().notNull().default([]),
    difficulty: integer("difficulty").notNull().default(2),
    strengthRating: integer("strength_rating").notNull().default(3),
    species: jsonb("species").$type<string[]>().notNull().default([]),
    steps: jsonb("steps").$type<{ n: number; text: string }[]>().notNull().default([]),
    mistakes: jsonb("mistakes").$type<string[]>().notNull().default([]),
    whenNotToUse: text("when_not_to_use"),
    alternatives: jsonb("alternatives").$type<string[]>().notNull().default([]),
    imageUrl: text("image_url"),
    videoUrl: text("video_url"),
    status: text("status").$type<ContentStatus>().notNull().default("published"),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("knots_use_idx").on(t.useCategory), index("knots_status_idx").on(t.status)]
);

export type GearSetupFlags = {
  beginnerFriendly?: boolean;
  heavyTackle?: boolean;
  artificial?: boolean;
  liveBait?: boolean;
  bottom?: boolean;
  trolling?: boolean;
  jigging?: boolean;
};

export const gearSetups = pgTable(
  "gear_setups",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    category: text("category").$type<GearSetupCategory>().notNull(),
    water: text("water").$type<WaterPref>().notNull().default("both"),
    environments: jsonb("environments").$type<string[]>().notNull().default([]),
    methods: jsonb("methods").$type<string[]>().notNull().default([]),
    summary: text("summary").notNull(),
    rod: text("rod").notNull(),
    reel: text("reel").notNull(),
    mainLine: text("main_line").notNull(),
    leader: text("leader").notNull(),
    hook: text("hook").notNull(),
    rig: text("rig").notNull(),
    lureBait: text("lure_bait").notNull(),
    knot: text("knot").notNull(),
    whyItWorks: text("why_it_works").notNull(),
    relatedSpecies: jsonb("related_species").$type<string[]>().notNull().default([]),
    flags: jsonb("flags").$type<GearSetupFlags>().notNull().default({}),
    status: text("status").$type<ContentStatus>().notNull().default("published"),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("gear_setups_cat_idx").on(t.category), index("gear_setups_water_idx").on(t.water)]
);

export const gearBrands = pgTable(
  "gear_brands",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    categories: jsonb("categories").$type<string[]>().notNull().default([]),
    water: text("water").$type<WaterPref>().notNull().default("both"),
    reputation: text("reputation").notNull(),
    bestKnownFor: jsonb("best_known_for").$type<string[]>().notNull().default([]),
    beginnerNotes: text("beginner_notes"),
    useCases: jsonb("use_cases").$type<string[]>().notNull().default([]),
    status: text("status").$type<ContentStatus>().notNull().default("published"),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("gear_brands_status_idx").on(t.status)]
);

/** Per-species gear ranges the Setup Builder scores against. */
export const fishGearRequirements = pgTable("fish_gear_requirements", {
  speciesSlug: text("species_slug").primaryKey(),
  lineLbMin: integer("line_lb_min").notNull(),
  lineLbIdeal: integer("line_lb_ideal").notNull(),
  lineLbMax: integer("line_lb_max").notNull(),
  leaderLbMin: integer("leader_lb_min"),
  leaderLbMax: integer("leader_lb_max"),
  rodPower: jsonb("rod_power").$type<string[]>().notNull().default([]),
  reelSizeMin: integer("reel_size_min"),
  reelSizeMax: integer("reel_size_max"),
  hookSize: text("hook_size"),
  typicalSizeLb: real("typical_size_lb"),
  fightStrength: integer("fight_strength").notNull().default(3),
  structureRisk: integer("structure_risk").notNull().default(2),
  methods: jsonb("methods").$type<string[]>().notNull().default([]),
  notes: text("notes"),
  status: text("status").$type<ContentStatus>().notNull().default("published"),
});

export const userSetups = pgTable(
  "user_setups",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    fishingType: text("fishing_type"),
    water: text("water"),
    rod: jsonb("rod").$type<Record<string, unknown>>(),
    reel: jsonb("reel").$type<Record<string, unknown>>(),
    line: jsonb("line").$type<Record<string, unknown>>(),
    leader: jsonb("leader").$type<Record<string, unknown>>(),
    terminal: jsonb("terminal").$type<Record<string, unknown>>(),
    baitLure: jsonb("bait_lure").$type<Record<string, unknown>>(),
    method: text("method"),
    notes: text("notes"),
    visibility: text("visibility").$type<Visibility>().notNull().default("private"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("user_setups_owner_idx").on(t.ownerId), index("user_setups_vis_idx").on(t.visibility)]
);

export type GearArticle = typeof gearArticles.$inferSelect;
export type NewGearArticle = typeof gearArticles.$inferInsert;
export type Knot = typeof knots.$inferSelect;
export type NewKnot = typeof knots.$inferInsert;
export type GearSetup = typeof gearSetups.$inferSelect;
export type NewGearSetup = typeof gearSetups.$inferInsert;
export type GearBrand = typeof gearBrands.$inferSelect;
export type NewGearBrand = typeof gearBrands.$inferInsert;
export type FishGearRequirement = typeof fishGearRequirements.$inferSelect;
export type NewFishGearRequirement = typeof fishGearRequirements.$inferInsert;
export type UserSetup = typeof userSetups.$inferSelect;
export type NewUserSetup = typeof userSetups.$inferInsert;

/* ---------------------------------- badges ---------------------------------- */

/**
 * Stored badge grants (special badges like founding-member/og/partner that an
 * admin awards). Activity badges (first-catch, catch-master, ...) are derived
 * from live stats at render time and never stored — see src/lib/badges.ts.
 * badgeSlug references the catalog in src/data/badges.ts.
 */
export const userBadges = pgTable(
  "user_badges",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    badgeSlug: text("badge_slug").notNull(),
    awardedAt: timestamp("awarded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.badgeSlug] })]
);

export type UserBadge = typeof userBadges.$inferSelect;

/* ------------------------------- notifications ------------------------------- */

export type NotificationType =
  | "badge"
  | "follow"
  | "like"
  | "comment"
  | "answer"
  | "accepted"
  | "welcome"
  | "system";

/**
 * In-app notifications shown in the bell dropdown. `dedupeKey` prevents
 * repeats of one-time events (e.g. badge:<slug> per user); null for events
 * that can legitimately repeat. `image` is an optional icon path (badge art).
 */
export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<NotificationType>().notNull(),
    title: text("title").notNull(),
    body: text("body"),
    href: text("href"),
    image: text("image"),
    dedupeKey: text("dedupe_key"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("notifications_user_idx").on(t.userId),
    index("notifications_created_idx").on(t.createdAt),
    uniqueIndex("notifications_dedupe_idx").on(t.userId, t.dedupeKey),
  ]
);

export type Notification = typeof notifications.$inferSelect;

/* ------------------------------ push subscriptions --------------------------- */

/**
 * Web Push subscriptions, one row per device/browser that granted notification
 * permission (installed PWAs on Android and iOS 16.4+). Dead endpoints are
 * pruned when a send returns 404/410.
 */
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull().unique(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("push_subscriptions_user_idx").on(t.userId)]
);

export type PushSubscription = typeof pushSubscriptions.$inferSelect;

/* -------------------------------- angler tips -------------------------------- */

/**
 * Daily Angler Tips shown on the home screen and browsable at /tips.
 * One shared tip per calendar day (UTC): a tip scheduled for today via
 * `publishDate` wins; otherwise the active unscheduled pool rotates
 * deterministically (see src/lib/tips.ts). Counts are denormalized the same
 * way the forum does helpfulCount; per-user state lives in the join tables.
 */
export const anglerTips = pgTable(
  "angler_tips",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    tipText: text("tip_text").notNull(),
    category: text("category").notNull(),
    icon: text("icon"), // key into the card's icon map; falls back to a lightbulb
    imageUrl: text("image_url"),
    isActive: boolean("is_active").notNull().default(true),
    publishDate: text("publish_date"), // YYYY-MM-DD — show exactly on this day
    expirationDate: text("expiration_date"), // YYYY-MM-DD — hidden after this day
    displayOrder: integer("display_order").notNull().default(0),
    helpfulCount: integer("helpful_count").notNull().default(0),
    saveCount: integer("save_count").notNull().default(0),
    shareCount: integer("share_count").notNull().default(0),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("angler_tips_active_idx").on(t.isActive),
    index("angler_tips_publish_idx").on(t.publishDate),
  ]
);

export const tipHelpful = pgTable(
  "tip_helpful",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tipId: text("tip_id")
      .notNull()
      .references(() => anglerTips.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.tipId] })]
);

export const savedTips = pgTable(
  "saved_tips",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tipId: text("tip_id")
      .notNull()
      .references(() => anglerTips.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.tipId] })]
);

export type AnglerTip = typeof anglerTips.$inferSelect;
export type NewAnglerTip = typeof anglerTips.$inferInsert;

/* --------------------------------- relations --------------------------------- */

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  catches: many(catches),
  biteReports: many(biteReports),
  forumQuestions: many(forumQuestions),
  forumAnswers: many(forumAnswers),
  gear: many(gearItems),
  spots: many(spots),
  trips: many(trips),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const catchesRelations = relations(catches, ({ one, many }) => ({
  user: one(users, { fields: [catches.userId], references: [users.id] }),
  species: one(species, { fields: [catches.speciesId], references: [species.id] }),
  photos: many(catchPhotos),
  likes: many(likes),
  comments: many(comments),
}));

export const catchPhotosRelations = relations(catchPhotos, ({ one }) => ({
  catch: one(catches, { fields: [catchPhotos.catchId], references: [catches.id] }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  catch: one(catches, { fields: [likes.catchId], references: [catches.id] }),
  user: one(users, { fields: [likes.userId], references: [users.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  catch: one(catches, { fields: [comments.catchId], references: [catches.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const forumQuestionsRelations = relations(forumQuestions, ({ one, many }) => ({
  user: one(users, { fields: [forumQuestions.userId], references: [users.id] }),
  board: one(biteBoards, { fields: [forumQuestions.boardId], references: [biteBoards.id] }),
  answers: many(forumAnswers),
}));

export const forumAnswersRelations = relations(forumAnswers, ({ one, many }) => ({
  question: one(forumQuestions, { fields: [forumAnswers.questionId], references: [forumQuestions.id] }),
  user: one(users, { fields: [forumAnswers.userId], references: [users.id] }),
  votes: many(forumAnswerVotes),
}));

export const forumAnswerVotesRelations = relations(forumAnswerVotes, ({ one }) => ({
  answer: one(forumAnswers, { fields: [forumAnswerVotes.answerId], references: [forumAnswers.id] }),
  user: one(users, { fields: [forumAnswerVotes.userId], references: [users.id] }),
}));

export const tripsRelations = relations(trips, ({ one }) => ({
  user: one(users, { fields: [trips.userId], references: [users.id] }),
  spot: one(spots, { fields: [trips.spotId], references: [spots.id] }),
}));

export const spotsRelations = relations(spots, ({ one }) => ({
  user: one(users, { fields: [spots.userId], references: [users.id] }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  userA: one(users, { fields: [conversations.userAId], references: [users.id], relationName: "convoA" }),
  userB: one(users, { fields: [conversations.userBId], references: [users.id], relationName: "convoB" }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export const gearItemsRelations = relations(gearItems, ({ one }) => ({
  user: one(users, { fields: [gearItems.userId], references: [users.id] }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  owner: one(users, { fields: [mediaAssets.ownerId], references: [users.id] }),
  variantRows: many(mediaVariants),
}));

export const mediaVariantsRelations = relations(mediaVariants, ({ one }) => ({
  asset: one(mediaAssets, { fields: [mediaVariants.assetId], references: [mediaAssets.id] }),
}));

export const userStorageUsageRelations = relations(userStorageUsage, ({ one }) => ({
  user: one(users, { fields: [userStorageUsage.userId], references: [users.id] }),
}));

export const biteBoardsRelations = relations(biteBoards, ({ one, many }) => ({
  coverMedia: one(mediaAssets, { fields: [biteBoards.coverMediaId], references: [mediaAssets.id] }),
  members: many(biteBoardMembers),
  reports: many(biteReports),
  questions: many(forumQuestions),
}));

export const biteBoardMembersRelations = relations(biteBoardMembers, ({ one }) => ({
  board: one(biteBoards, { fields: [biteBoardMembers.boardId], references: [biteBoards.id] }),
  user: one(users, { fields: [biteBoardMembers.userId], references: [users.id] }),
}));

export const biteReportsRelations = relations(biteReports, ({ one }) => ({
  user: one(users, { fields: [biteReports.userId], references: [users.id] }),
  board: one(biteBoards, { fields: [biteReports.boardId], references: [biteBoards.id] }),
  species: one(species, { fields: [biteReports.speciesId], references: [species.id] }),
  photoMedia: one(mediaAssets, { fields: [biteReports.photoMediaId], references: [mediaAssets.id] }),
}));

export const userBlocksRelations = relations(userBlocks, ({ one }) => ({
  blocker: one(users, { fields: [userBlocks.blockerId], references: [users.id], relationName: "blocker" }),
  blocked: one(users, { fields: [userBlocks.blockedId], references: [users.id], relationName: "blocked" }),
}));

export const crewsRelations = relations(crews, ({ one, many }) => ({
  owner: one(users, { fields: [crews.ownerId], references: [users.id] }),
  members: many(crewMembers),
  posts: many(crewPosts),
}));

export const crewMembersRelations = relations(crewMembers, ({ one }) => ({
  crew: one(crews, { fields: [crewMembers.crewId], references: [crews.id] }),
  user: one(users, { fields: [crewMembers.userId], references: [users.id] }),
}));

export const crewPostsRelations = relations(crewPosts, ({ one }) => ({
  crew: one(crews, { fields: [crewPosts.crewId], references: [crews.id] }),
  user: one(users, { fields: [crewPosts.userId], references: [users.id] }),
  catch: one(catches, { fields: [crewPosts.catchId], references: [catches.id] }),
}));

export const userSetupsRelations = relations(userSetups, ({ one }) => ({
  owner: one(users, { fields: [userSetups.ownerId], references: [users.id] }),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, { fields: [userBadges.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const anglerTipsRelations = relations(anglerTips, ({ one }) => ({
  author: one(users, { fields: [anglerTips.createdBy], references: [users.id] }),
}));

export const tipHelpfulRelations = relations(tipHelpful, ({ one }) => ({
  tip: one(anglerTips, { fields: [tipHelpful.tipId], references: [anglerTips.id] }),
  user: one(users, { fields: [tipHelpful.userId], references: [users.id] }),
}));

export const savedTipsRelations = relations(savedTips, ({ one }) => ({
  tip: one(anglerTips, { fields: [savedTips.tipId], references: [anglerTips.id] }),
  user: one(users, { fields: [savedTips.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Species = typeof species.$inferSelect;
export type NewSpecies = typeof species.$inferInsert;
export type Catch = typeof catches.$inferSelect;
export type CatchPhoto = typeof catchPhotos.$inferSelect;
export type ForumQuestion = typeof forumQuestions.$inferSelect;
export type ForumAnswer = typeof forumAnswers.$inferSelect;
export type GearItem = typeof gearItems.$inferSelect;
export type Spot = typeof spots.$inferSelect;
export type Trip = typeof trips.$inferSelect;
