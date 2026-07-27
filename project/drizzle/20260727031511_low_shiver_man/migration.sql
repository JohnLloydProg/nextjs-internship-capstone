CREATE TYPE "project_status" AS ENUM('active', 'paused', 'closed');--> statement-breakpoint
CREATE TABLE "assignments" (
	"project_id" uuid,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assignments_pkey" PRIMARY KEY("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"received_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"link" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"access_level" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "name" TO "first_name";--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "suggested_limit" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "status" "project_status" DEFAULT 'active'::"project_status";--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "stated_at" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "finished_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role_id" uuid;--> statement-breakpoint
CREATE INDEX "post_categories_project_id_idx" ON "assignments" ("project_id");--> statement-breakpoint
CREATE INDEX "post_categories_user_id_idx" ON "assignments" ("user_id");--> statement-breakpoint
CREATE INDEX "post_categories_composite_idx" ON "assignments" ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "notifications_receiver_id_idx" ON "notifications" ("received_id");--> statement-breakpoint
CREATE INDEX "users_role_id_idx" ON "users" ("role_id");--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_received_id_users_id_fkey" FOREIGN KEY ("received_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL;