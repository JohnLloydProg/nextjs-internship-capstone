CREATE TYPE "task_fields" AS ENUM('title', 'description', 'listId', 'assigneeId', 'priority', 'dueDate', 'startedAt', 'finishedAt');--> statement-breakpoint
CREATE TYPE "observer_events" AS ENUM('changed', 'equals');--> statement-breakpoint
CREATE TABLE "notify_automations" (
	"observerId" uuid,
	"user_id" uuid,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notify_automations_pkey" PRIMARY KEY("observerId","user_id")
);
--> statement-breakpoint
CREATE TABLE "set_automation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"observer_id" uuid NOT NULL,
	"field_name" "task_fields" NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_observers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"field_name" "task_fields" NOT NULL,
	"event" "observer_events" DEFAULT 'changed'::"observer_events" NOT NULL,
	"value" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "notifyAutomations_observer_idx" ON "notify_automations" ("observerId");--> statement-breakpoint
CREATE INDEX "notifyAutomations_user_idx" ON "notify_automations" ("user_id");--> statement-breakpoint
CREATE INDEX "setAutomations_observer_idx" ON "set_automation" ("observer_id");--> statement-breakpoint
CREATE INDEX "taskObserver_project_idx" ON "task_observers" ("project_id");--> statement-breakpoint
ALTER TABLE "notify_automations" ADD CONSTRAINT "notify_automations_observerId_task_observers_id_fkey" FOREIGN KEY ("observerId") REFERENCES "task_observers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notify_automations" ADD CONSTRAINT "notify_automations_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "set_automation" ADD CONSTRAINT "set_automation_observer_id_task_observers_id_fkey" FOREIGN KEY ("observer_id") REFERENCES "task_observers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "task_observers" ADD CONSTRAINT "task_observers_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
DROP TYPE "type";