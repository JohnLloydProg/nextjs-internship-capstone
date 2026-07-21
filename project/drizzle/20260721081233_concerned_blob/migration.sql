ALTER TABLE "users" ADD COLUMN "profile_pic" text;--> statement-breakpoint
CREATE INDEX "users_clerk_id_idx" ON "users" ("clerk_id");