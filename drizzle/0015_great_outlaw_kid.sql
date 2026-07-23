CREATE TABLE "badge_audit_logs" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_user_id" text NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professional_profiles" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title_slug" text NOT NULL,
	"business_name" text,
	"service_area" text,
	"address" text,
	"phone" text,
	"website" text,
	"booking_link" text,
	"hours" text,
	"public_bio" text,
	"social_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_verified_titles" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title_slug" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"granted_by_id" text,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text
);
--> statement-breakpoint
CREATE TABLE "verification_documents" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" text NOT NULL,
	"user_id" text NOT NULL,
	"media_id" text NOT NULL,
	"label" text DEFAULT 'Proof' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verified_title_requests" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title_slug" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"full_name" text DEFAULT '' NOT NULL,
	"display_name" text DEFAULT '' NOT NULL,
	"business_name" text,
	"website" text,
	"booking_link" text,
	"social_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"service_area" text,
	"state" text,
	"bio" text,
	"reason" text,
	"contact_email" text DEFAULT '' NOT NULL,
	"contact_phone" text,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"admin_notes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"more_info_message" text,
	"decided_by_id" text,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verified_titles" (
	"slug" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verified_user_reports" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title_slug" text NOT NULL,
	"board_id" text,
	"species_id" text,
	"general_area" text DEFAULT '' NOT NULL,
	"species_text" text DEFAULT '' NOT NULL,
	"body" text NOT NULL,
	"fields" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"report_date" timestamp with time zone DEFAULT now() NOT NULL,
	"visibility" text DEFAULT 'public' NOT NULL,
	"moderation_status" text DEFAULT 'visible' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "badge_audit_logs" ADD CONSTRAINT "badge_audit_logs_subject_user_id_users_id_fk" FOREIGN KEY ("subject_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_audit_logs" ADD CONSTRAINT "badge_audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_title_slug_verified_titles_slug_fk" FOREIGN KEY ("title_slug") REFERENCES "public"."verified_titles"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_verified_titles" ADD CONSTRAINT "user_verified_titles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_verified_titles" ADD CONSTRAINT "user_verified_titles_title_slug_verified_titles_slug_fk" FOREIGN KEY ("title_slug") REFERENCES "public"."verified_titles"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_verified_titles" ADD CONSTRAINT "user_verified_titles_granted_by_id_users_id_fk" FOREIGN KEY ("granted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_request_id_verified_title_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."verified_title_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verified_title_requests" ADD CONSTRAINT "verified_title_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verified_title_requests" ADD CONSTRAINT "verified_title_requests_title_slug_verified_titles_slug_fk" FOREIGN KEY ("title_slug") REFERENCES "public"."verified_titles"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verified_title_requests" ADD CONSTRAINT "verified_title_requests_decided_by_id_users_id_fk" FOREIGN KEY ("decided_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verified_user_reports" ADD CONSTRAINT "verified_user_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verified_user_reports" ADD CONSTRAINT "verified_user_reports_title_slug_verified_titles_slug_fk" FOREIGN KEY ("title_slug") REFERENCES "public"."verified_titles"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verified_user_reports" ADD CONSTRAINT "verified_user_reports_board_id_bite_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."bite_boards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verified_user_reports" ADD CONSTRAINT "verified_user_reports_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "badge_audit_subject_idx" ON "badge_audit_logs" USING btree ("subject_user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "pro_profiles_user_uq" ON "professional_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_titles_user_title_uq" ON "user_verified_titles" USING btree ("user_id","title_slug");--> statement-breakpoint
CREATE INDEX "user_titles_user_idx" ON "user_verified_titles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_titles_status_idx" ON "user_verified_titles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "verification_docs_request_idx" ON "verification_documents" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "title_requests_user_idx" ON "verified_title_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "title_requests_status_idx" ON "verified_title_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "verified_reports_board_idx" ON "verified_user_reports" USING btree ("board_id","created_at");--> statement-breakpoint
CREATE INDEX "verified_reports_species_idx" ON "verified_user_reports" USING btree ("species_id","created_at");--> statement-breakpoint
CREATE INDEX "verified_reports_user_idx" ON "verified_user_reports" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "verified_reports_visible_idx" ON "verified_user_reports" USING btree ("moderation_status","created_at");