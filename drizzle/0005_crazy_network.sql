CREATE TABLE "forum_answer_votes" (
	"answer_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "forum_answer_votes_answer_id_user_id_pk" PRIMARY KEY("answer_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "forum_answers" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" text NOT NULL,
	"user_id" text NOT NULL,
	"body" text NOT NULL,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"accepted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_questions" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"board_id" text,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"answer_count" integer DEFAULT 0 NOT NULL,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "forum_answer_votes" ADD CONSTRAINT "forum_answer_votes_answer_id_forum_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."forum_answers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_answer_votes" ADD CONSTRAINT "forum_answer_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_answers" ADD CONSTRAINT "forum_answers_question_id_forum_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."forum_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_answers" ADD CONSTRAINT "forum_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_questions" ADD CONSTRAINT "forum_questions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_questions" ADD CONSTRAINT "forum_questions_board_id_bite_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."bite_boards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "forum_answers_question_idx" ON "forum_answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "forum_answers_user_idx" ON "forum_answers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "forum_questions_user_idx" ON "forum_questions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "forum_questions_board_idx" ON "forum_questions" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "forum_questions_created_idx" ON "forum_questions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "forum_questions_status_idx" ON "forum_questions" USING btree ("status");