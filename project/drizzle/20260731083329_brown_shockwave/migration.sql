CREATE TYPE "assignment_role" AS ENUM('editor', 'commenter', 'viewer');--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_roles_id_fkey";--> statement-breakpoint
ALTER INDEX "post_categories_project_id_idx" RENAME TO "assignments_project_id_idx";--> statement-breakpoint
ALTER INDEX "post_categories_user_id_idx" RENAME TO "assignments_user_id_idx";--> statement-breakpoint
ALTER INDEX "post_categories_composite_idx" RENAME TO "assignments_composite_idx";--> statement-breakpoint
DROP INDEX "users_role_id_idx";--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "role_id" "assignment_role" DEFAULT 'viewer'::"assignment_role" NOT NULL;--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "accepted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role_id";