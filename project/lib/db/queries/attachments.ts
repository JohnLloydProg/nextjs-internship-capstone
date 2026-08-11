import { eq } from "drizzle-orm";
import { db } from "..";
import { attachmentComments, attachmentTasks } from "../schema";

export async function findAttachmentByHash(fileHash: string) {
	return db.query.attachments.findFirst({ where: { fileHash } });
}

export async function count_attachment_links(
	attachmentId: string,
): Promise<number> {
	const task_links = await db.$count(
		attachmentTasks,
		eq(attachmentTasks.attachmentId, attachmentId),
	);
	const comment_links = await db.$count(
		attachmentComments,
		eq(attachmentComments.attachmentId, attachmentId),
	);
	return task_links + comment_links;
}
