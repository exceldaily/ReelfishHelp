CREATE TABLE "content_items" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" text NOT NULL,
	"kind" text DEFAULT 'idea' NOT NULL,
	"platform" text,
	"stage" text DEFAULT 'idea' NOT NULL,
	"title" text NOT NULL,
	"hook" text,
	"script_15" text,
	"script_30" text,
	"overlays" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"visuals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cta" text,
	"hashtags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"caption" text,
	"captions" jsonb,
	"comments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"shot_list" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"broll_terms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"screen_steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"template_slug" text,
	"source_refs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "allow_feature" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_items_author_idx" ON "content_items" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "content_items_stage_idx" ON "content_items" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "content_items_kind_idx" ON "content_items" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "content_items_created_idx" ON "content_items" USING btree ("created_at");