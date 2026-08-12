import { eq } from "drizzle-orm";
import { db } from "..";
import { comments } from "../schema";

type NewComment = typeof comments.$inferInsert;

export async function createComment(data: NewComment) {
	const [newComment] = await db.insert(comments).values(data).returning();
	return newComment;
}

export async function updateComment(commentId: string, content: string) {
	const [updatedComment] = await db
		.update(comments)
		.set({ content })
		.where(eq(comments.id, commentId))
		.returning();
	return updatedComment;
}

export async function deleteComment(commentId: string) {
	const [deletedComment] = await db
		.delete(comments)
		.where(eq(comments.id, commentId))
		.returning();
	return deletedComment;
}
