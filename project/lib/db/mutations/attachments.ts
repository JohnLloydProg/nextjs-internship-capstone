import { and, eq } from "drizzle-orm";
import { db } from "..";
import { attachments, attachmentTasks } from "../schema";

type NewAttachment = typeof attachments.$inferInsert;

export async function createAttachmentRecord(data: NewAttachment) {
	const [newAttachment] = await db.insert(attachments).values(data).returning();
	return newAttachment;
}

export async function deleteAttachmentRecord(attachmentId: string) {
	const [deletedAttachment] = await db
		.delete(attachments)
		.where(eq(attachments.id, attachmentId))
		.returning();
	return deletedAttachment;
}

export async function linkAttachmentToTask(
	attachmentId: string,
	taskId: string,
) {
	const [link] = await db
		.insert(attachmentTasks)
		.values({ attachmentId, taskId })
		.onConflictDoNothing({
			target: [attachmentTasks.attachmentId, attachmentTasks.taskId],
		})
		.returning();
	return link;
}

export async function unlinkAttachmentFromTask(
	attachmentId: string,
	taskId: string,
) {
	const [deleted] = await db
		.delete(attachmentTasks)
		.where(
			and(
				eq(attachmentTasks.attachmentId, attachmentId),
				eq(attachmentTasks.taskId, taskId),
			),
		)
		.returning();
	return deleted;
}
