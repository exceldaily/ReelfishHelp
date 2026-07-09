CREATE TABLE "crew_members" (
	"crew_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crew_members_crew_id_user_id_pk" PRIMARY KEY("crew_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "crew_posts" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crew_id" text NOT NULL,
	"user_id" text NOT NULL,
	"body" text,
	"catch_id" text,
	"photo_media_id" text,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crews" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"avatar_url" text,
	"home_state" text,
	"privacy" text DEFAULT 'open' NOT NULL,
	"invite_code" text NOT NULL,
	"owner_id" text NOT NULL,
	"member_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crews_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "crew_members" ADD CONSTRAINT "crew_members_crew_id_crews_id_fk" FOREIGN KEY ("crew_id") REFERENCES "public"."crews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crew_members" ADD CONSTRAINT "crew_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crew_posts" ADD CONSTRAINT "crew_posts_crew_id_crews_id_fk" FOREIGN KEY ("crew_id") REFERENCES "public"."crews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crew_posts" ADD CONSTRAINT "crew_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crew_posts" ADD CONSTRAINT "crew_posts_catch_id_catches_id_fk" FOREIGN KEY ("catch_id") REFERENCES "public"."catches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crew_posts" ADD CONSTRAINT "crew_posts_photo_media_id_media_assets_id_fk" FOREIGN KEY ("photo_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crews" ADD CONSTRAINT "crews_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "crew_members_user_idx" ON "crew_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "crew_posts_crew_idx" ON "crew_posts" USING btree ("crew_id");--> statement-breakpoint
CREATE INDEX "crew_posts_created_idx" ON "crew_posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "crews_privacy_idx" ON "crews" USING btree ("privacy");--> statement-breakpoint
CREATE INDEX "crews_state_idx" ON "crews" USING btree ("home_state");