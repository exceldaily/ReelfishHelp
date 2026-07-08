ALTER TABLE "forum_questions" ADD COLUMN "topic" text DEFAULT 'general' NOT NULL;--> statement-breakpoint
CREATE INDEX "forum_questions_topic_idx" ON "forum_questions" USING btree ("topic");