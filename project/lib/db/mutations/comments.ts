import { db } from "..";
import { comments } from "../schema";

type NewComment = typeof comments.$inferInsert;

export async function createComment(data: NewComment) {
	const [newComment] = await db.insert(comments).values(data).returning();
	return newComment;
}
