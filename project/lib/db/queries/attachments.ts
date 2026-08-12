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

export async function getAttachmentLinksByTaskId(taskId: string) {
	const attachmentLinks = await db.query.attachmentTasks.findMany({
		where: {
			taskId: taskId,
		},
		with: {
			attachment: true,
		},
	});
	return attachmentLinks;
}

export async function getAttachmentLinksByCommentId(commentId: string) {
	const attachmentLinks = await db.query.attachmentComments.findMany({
		where: {
			commentId: commentId,
		},
		with: {
			attachment: true,
		},
	});
	return attachmentLinks;
}
