CREATE TABLE "fish_gear_requirements" (
	"species_slug" text PRIMARY KEY NOT NULL,
	"line_lb_min" integer NOT NULL,
	"line_lb_ideal" integer NOT NULL,
	"line_lb_max" integer NOT NULL,
	"leader_lb_min" integer,
	"leader_lb_max" integer,
	"rod_power" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reel_size_min" integer,
	"reel_size_max" integer,
	"hook_size" text,
	"typical_size_lb" real,
	"fight_strength" integer DEFAULT 3 NOT NULL,
	"structure_risk" integer DEFAULT 2 NOT NULL,
	"methods" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	"status" text DEFAULT 'published' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gear_articles" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"subtype" text,
	"name" text NOT NULL,
	"summary" text NOT NULL,
	"body" jsonb NOT NULL,
	"related_species" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"water_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"difficulty" integer,
	"status" text DEFAULT 'published' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gear_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "gear_brands" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"water" text DEFAULT 'both' NOT NULL,
	"reputation" text NOT NULL,
	"best_known_for" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"beginner_notes" text,
	"use_cases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gear_brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "gear_setups" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"water" text DEFAULT 'both' NOT NULL,
	"environments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"methods" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"summary" text NOT NULL,
	"rod" text NOT NULL,
	"reel" text NOT NULL,
	"main_line" text NOT NULL,
	"leader" text NOT NULL,
	"hook" text NOT NULL,
	"rig" text NOT NULL,
	"lure_bait" text NOT NULL,
	"knot" text NOT NULL,
	"why_it_works" text NOT NULL,
	"related_species" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"flags" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gear_setups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "knots" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"use_category" text NOT NULL,
	"best_use" text NOT NULL,
	"line_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"difficulty" integer DEFAULT 2 NOT NULL,
	"strength_rating" integer DEFAULT 3 NOT NULL,
	"species" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mistakes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"when_not_to_use" text,
	"alternatives" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image_url" text,
	"video_url" text,
	"status" text DEFAULT 'published' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "knots_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_setups" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"fishing_type" text,
	"water" text,
	"rod" jsonb,
	"reel" jsonb,
	"line" jsonb,
	"leader" jsonb,
	"terminal" jsonb,
	"bait_lure" jsonb,
	"method" text,
	"notes" text,
	"visibility" text DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_setups" ADD CONSTRAINT "user_setups_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gear_articles_cat_idx" ON "gear_articles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "gear_articles_status_idx" ON "gear_articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gear_brands_status_idx" ON "gear_brands" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gear_setups_cat_idx" ON "gear_setups" USING btree ("category");--> statement-breakpoint
CREATE INDEX "gear_setups_water_idx" ON "gear_setups" USING btree ("water");--> statement-breakpoint
CREATE INDEX "knots_use_idx" ON "knots" USING btree ("use_category");--> statement-breakpoint
CREATE INDEX "knots_status_idx" ON "knots" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_setups_owner_idx" ON "user_setups" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "user_setups_vis_idx" ON "user_setups" USING btree ("visibility");