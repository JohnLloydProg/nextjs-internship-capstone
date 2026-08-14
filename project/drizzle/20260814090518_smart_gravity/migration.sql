CREATE TABLE "per_user_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_record_id" uuid NOT NULL,
	"user_id" uuid,
	"user_name" text NOT NULL,
	"number_of_tasks" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_progress_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid,
	"project_name" text NOT NULL,
	"number_of_finished" integer NOT NULL,
	"number_of_tasks" integer NOT NULL,
	"number_of_overdue" integer NOT NULL,
	"cycle_time" numeric(5,2) NOT NULL,
	"lead_time" numeric(5,2) NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "latest_record_id" uuid;--> statement-breakpoint
CREATE INDEX "per_user_records_idx" ON "per_user_records" ("project_record_id","user_id");--> statement-breakpoint
CREATE INDEX "record_project_id_date_idx" ON "project_progress_records" ("project_id","recorded_at");--> statement-breakpoint
ALTER TABLE "per_user_records" ADD CONSTRAINT "per_user_records_352Y5kCFDiBJ_fkey" FOREIGN KEY ("project_record_id") REFERENCES "project_progress_records"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "per_user_records" ADD CONSTRAINT "per_user_records_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_progress_records" ADD CONSTRAINT "project_progress_records_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_latest_record_id_project_progress_records_id_fkey" FOREIGN KEY ("latest_record_id") REFERENCES "project_progress_records"("id");