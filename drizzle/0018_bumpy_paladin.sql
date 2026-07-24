ALTER TABLE "forum_questions" ADD COLUMN "region" text DEFAULT 'us' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "language" text DEFAULT 'en' NOT NULL;