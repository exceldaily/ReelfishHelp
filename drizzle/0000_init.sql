CREATE TABLE "catch_photos" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"catch_id" text NOT NULL,
	"url" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catches" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"species_id" text,
	"custom_species_name" text,
	"caught_at" timestamp with time zone NOT NULL,
	"water_type" text,
	"method" text,
	"length_in" real,
	"weight_lb" real,
	"bait" text,
	"gear_notes" text,
	"weather_notes" text,
	"tide_notes" text,
	"story" text,
	"released" boolean DEFAULT true NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"lat" real,
	"lng" real,
	"location_label" text,
	"show_location" boolean DEFAULT false NOT NULL,
	"trip_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"catch_id" text NOT NULL,
	"user_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "follows_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE "gear_items" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"model" text,
	"notes" text,
	"photo_url" text,
	"purchase_date" text,
	"condition" text DEFAULT 'good',
	"favorite" boolean DEFAULT false NOT NULL,
	"wishlist" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identifications" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"image_url" text,
	"result" jsonb NOT NULL,
	"feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"user_id" text NOT NULL,
	"catch_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "likes_user_id_catch_id_pk" PRIMARY KEY("user_id","catch_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"bio" text,
	"home_state" text,
	"water_pref" text DEFAULT 'both' NOT NULL,
	"experience" text DEFAULT 'casual' NOT NULL,
	"fishing_styles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"favorite_species" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"visibility" text DEFAULT 'public' NOT NULL,
	"location_mode" text DEFAULT 'approximate' NOT NULL,
	"manual_state" text,
	"manual_region" text,
	"last_lat" real,
	"last_lng" real,
	"last_location_label" text,
	"onboarded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "regulation_links" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state" text NOT NULL,
	"agency" text NOT NULL,
	"url" text NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"reason" text NOT NULL,
	"details" text,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_guides" (
	"user_id" text NOT NULL,
	"species_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_guides_user_id_species_id_pk" PRIMARY KEY("user_id","species_id")
);
--> statement-breakpoint
CREATE TABLE "saved_posts" (
	"user_id" text NOT NULL,
	"catch_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_posts_user_id_catch_id_pk" PRIMARY KEY("user_id","catch_id")
);
--> statement-breakpoint
CREATE TABLE "species" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"common_name" text NOT NULL,
	"scientific_name" text NOT NULL,
	"water" text NOT NULL,
	"category" text NOT NULL,
	"difficulty" integer NOT NULL,
	"beginner_friendly" boolean DEFAULT false NOT NULL,
	"wiki_title" text NOT NULL,
	"image_url" text,
	"image_credit" text,
	"description" text NOT NULL,
	"avg_size" text NOT NULL,
	"trophy_size" text NOT NULL,
	"regions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"states" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"environments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"styles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"seasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"bait_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"lookalikes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"guide" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "species_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "spots" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"privacy" text DEFAULT 'private_exact' NOT NULL,
	"lat" real,
	"lng" real,
	"area_label" text,
	"water_type" text,
	"species_notes" text,
	"access_notes" text,
	"structure_notes" text,
	"tide_season_notes" text,
	"safety_parking_notes" text,
	"bait_technique_notes" text,
	"photo_url" text,
	"favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"time" text,
	"spot_id" text,
	"location_label" text,
	"lat" real,
	"lng" real,
	"target_species_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gear_checklist" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"bait_checklist" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	"status" text DEFAULT 'planned' NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"weather_summary" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "catch_photos" ADD CONSTRAINT "catch_photos_catch_id_catches_id_fk" FOREIGN KEY ("catch_id") REFERENCES "public"."catches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catches" ADD CONSTRAINT "catches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catches" ADD CONSTRAINT "catches_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_catch_id_catches_id_fk" FOREIGN KEY ("catch_id") REFERENCES "public"."catches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gear_items" ADD CONSTRAINT "gear_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identifications" ADD CONSTRAINT "identifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_catch_id_catches_id_fk" FOREIGN KEY ("catch_id") REFERENCES "public"."catches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_guides" ADD CONSTRAINT "saved_guides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_guides" ADD CONSTRAINT "saved_guides_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_catch_id_catches_id_fk" FOREIGN KEY ("catch_id") REFERENCES "public"."catches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spots" ADD CONSTRAINT "spots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_spot_id_spots_id_fk" FOREIGN KEY ("spot_id") REFERENCES "public"."spots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "catches_user_idx" ON "catches" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "catches_vis_idx" ON "catches" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "comments_catch_idx" ON "comments" USING btree ("catch_id");--> statement-breakpoint
CREATE INDEX "gear_user_idx" ON "gear_items" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "regs_state_idx" ON "regulation_links" USING btree ("state");--> statement-breakpoint
CREATE INDEX "species_water_idx" ON "species" USING btree ("water");--> statement-breakpoint
CREATE INDEX "spots_user_idx" ON "spots" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trips_user_idx" ON "trips" USING btree ("user_id");