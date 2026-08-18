CREATE TYPE "widget_type" AS ENUM('progress_timeline', 'stat_total_tasks', 'stat_finished_ratio', 'stat_overdue', 'tasks_per_week', 'project_cycle_lead', 'user_cycle_lead', 'tasks_per_assignee');--> statement-breakpoint
CREATE TABLE "analytics_widgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"user_id" uuid,
	"widget_type" "widget_type" NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "analytics_widgets_project_idx" ON "analytics_widgets" ("project_id","user_id");--> statement-breakpoint
ALTER TABLE "analytics_widgets" ADD CONSTRAINT "analytics_widgets_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "analytics_widgets" ADD CONSTRAINT "analytics_widgets_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_latest_record_id_project_progress_records_id_fkey", ADD CONSTRAINT "projects_latest_record_id_project_progress_records_id_fkey" FOREIGN KEY ("latest_record_id") REFERENCES "project_progress_records"("id") ON DELETE SET NULL;