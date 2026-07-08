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

export type BiteBoardKind = "region" | "lake" | "river" | "bay" | "beach" | "marsh" | "offshore" | "pier";
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

/* --------------------------------- relations --------------------------------- */

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  catches: many(catches),
  biteReports: many(biteReports),
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

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Species = typeof species.$inferSelect;
export type NewSpecies = typeof species.$inferInsert;
export type Catch = typeof catches.$inferSelect;
export type CatchPhoto = typeof catchPhotos.$inferSelect;
export type GearItem = typeof gearItems.$inferSelect;
export type Spot = typeof spots.$inferSelect;
export type Trip = typeof trips.$inferSelect;
