ALTER TABLE "profiles" ADD COLUMN "favorite_brands" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "user_setups" ADD COLUMN "favorite" boolean DEFAULT false NOT NULL;