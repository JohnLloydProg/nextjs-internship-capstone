CREATE TYPE "type" AS ENUM('comments', 'tasks');--> statement-breakpoint
CREATE TABLE "attachment_comments" (
	"attachment_id" uuid,
	"comment_id" uuid,
	"attached_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attachment_comments_pkey" PRIMARY KEY("attachment_id","comment_id")
);
--> statement-breakpoint
CREATE TABLE "attachment_tasks" (
	"attachment_id" uuid,
	"task_id" uuid,
	"attached_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attachment_tasks_pkey" PRIMARY KEY("attachment_id","task_id")
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(127) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"storage_key" text NOT NULL,
	"file_hash" varchar(64) NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"task_id" uuid NOT NULL,
	"user_id" uuid,
	"edit_id" uuid NOT NULL,
	"field_name" varchar(64) NOT NULL,
	"old_value" text,
	"new_value" text,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "attachment_comments_comment_idx" ON "attachment_comments" ("comment_id");--> statement-breakpoint
CREATE INDEX "attachment_comments_attachment_idx" ON "attachment_comments" ("attachment_id");--> statement-breakpoint
CREATE INDEX "attachment_tasks_task_idx" ON "attachment_tasks" ("task_id");--> statement-breakpoint
CREATE INDEX "attachment_tasks_attachment_idx" ON "attachment_tasks" ("attachment_id");--> statement-breakpoint
CREATE INDEX "attachments_file_hash_idx" ON "attachments" ("file_hash");--> statement-breakpoint
CREATE INDEX "task_history_task_idx" ON "task_history" ("task_id","changed_at");--> statement-breakpoint
ALTER TABLE "attachment_comments" ADD CONSTRAINT "attachment_comments_attachment_id_attachments_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attachment_comments" ADD CONSTRAINT "attachment_comments_comment_id_comments_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attachment_tasks" ADD CONSTRAINT "attachment_tasks_attachment_id_attachments_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attachment_tasks" ADD CONSTRAINT "attachment_tasks_task_id_tasks_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_task_id_tasks_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;