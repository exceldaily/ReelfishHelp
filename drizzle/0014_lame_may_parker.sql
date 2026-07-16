CREATE TABLE "angler_tips" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"tip_text" text NOT NULL,
	"category" text NOT NULL,
	"icon" text,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"publish_date" text,
	"expiration_date" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"save_count" integer DEFAULT 0 NOT NULL,
	"share_count" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "angler_tips_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "saved_tips" (
	"user_id" text NOT NULL,
	"tip_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_tips_user_id_tip_id_pk" PRIMARY KEY("user_id","tip_id")
);
--> statement-breakpoint
CREATE TABLE "tip_helpful" (
	"user_id" text NOT NULL,
	"tip_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tip_helpful_user_id_tip_id_pk" PRIMARY KEY("user_id","tip_id")
);
--> statement-breakpoint
ALTER TABLE "angler_tips" ADD CONSTRAINT "angler_tips_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_tips" ADD CONSTRAINT "saved_tips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_tips" ADD CONSTRAINT "saved_tips_tip_id_angler_tips_id_fk" FOREIGN KEY ("tip_id") REFERENCES "public"."angler_tips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip_helpful" ADD CONSTRAINT "tip_helpful_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip_helpful" ADD CONSTRAINT "tip_helpful_tip_id_angler_tips_id_fk" FOREIGN KEY ("tip_id") REFERENCES "public"."angler_tips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "angler_tips_active_idx" ON "angler_tips" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "angler_tips_publish_idx" ON "angler_tips" USING btree ("publish_date");