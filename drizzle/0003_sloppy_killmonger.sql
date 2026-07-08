CREATE TABLE "bite_board_members" (
	"board_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bite_board_members_board_id_user_id_pk" PRIMARY KEY("board_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "bite_boards" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"region_label" text NOT NULL,
	"state" text,
	"water" text DEFAULT 'both' NOT NULL,
	"description" text NOT NULL,
	"cover_media_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bite_boards_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bite_reports" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"board_id" text,
	"species_id" text,
	"custom_species" text,
	"outcome" text DEFAULT 'caught' NOT NULL,
	"bait" text,
	"method" text,
	"time_of_day" text,
	"weather_summary" jsonb,
	"tide_summary" text,
	"moon_summary" text,
	"notes" text,
	"photo_media_id" text,
	"photo_url" text,
	"visibility" text DEFAULT 'private' NOT NULL,
	"location_precision" text DEFAULT 'hidden' NOT NULL,
	"lat" real,
	"lng" real,
	"broad_area_label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_blocks" (
	"blocker_id" text NOT NULL,
	"blocked_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_blocks_blocker_id_blocked_id_pk" PRIMARY KEY("blocker_id","blocked_id")
);
--> statement-breakpoint
ALTER TABLE "catches" ADD COLUMN "publish_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "catches" ADD COLUMN "share_delay" text DEFAULT 'never' NOT NULL;--> statement-breakpoint
ALTER TABLE "catches" ADD COLUMN "location_precision" text DEFAULT 'approx_private' NOT NULL;--> statement-breakpoint
ALTER TABLE "catches" ADD COLUMN "broad_area_label" text;--> statement-breakpoint
ALTER TABLE "bite_board_members" ADD CONSTRAINT "bite_board_members_board_id_bite_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."bite_boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bite_board_members" ADD CONSTRAINT "bite_board_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bite_boards" ADD CONSTRAINT "bite_boards_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bite_reports" ADD CONSTRAINT "bite_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bite_reports" ADD CONSTRAINT "bite_reports_board_id_bite_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."bite_boards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bite_reports" ADD CONSTRAINT "bite_reports_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bite_reports" ADD CONSTRAINT "bite_reports_photo_media_id_media_assets_id_fk" FOREIGN KEY ("photo_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocker_id_users_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocked_id_users_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bite_boards_water_idx" ON "bite_boards" USING btree ("water");--> statement-breakpoint
CREATE INDEX "bite_boards_state_idx" ON "bite_boards" USING btree ("state");--> statement-breakpoint
CREATE INDEX "bite_reports_board_idx" ON "bite_reports" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "bite_reports_user_idx" ON "bite_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bite_reports_created_idx" ON "bite_reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bite_reports_visibility_idx" ON "bite_reports" USING btree ("visibility");