ALTER TABLE "profiles" ADD COLUMN "region" text DEFAULT 'us' NOT NULL;--> statement-breakpoint
ALTER TABLE "species" ADD COLUMN "region" text DEFAULT 'us' NOT NULL;