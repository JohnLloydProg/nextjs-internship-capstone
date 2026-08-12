"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
	createAttachmentRecord,
	deleteAttachmentRecord,
	linkAttachmentToComment,
	linkAttachmentToTask,
	unlinkAttachmentFromTask,
} from "../db/mutations/attachments";
import {
	count_attachment_links,
	findAttachmentByHash,
} from "../db/queries/attachments";
import { getUserByClerkId } from "../db/queries/users";
import { deleteFile, hashBuffer, uploadFile } from "../storage";
import type { FormState } from "./projects";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function processAttachmentUpload(file: File, uploaderId: string) {
	const buffer = Buffer.from(await file.arrayBuffer());
	const fileHash = hashBuffer(buffer);

	let attachment = await findAttachmentByHash(fileHash);

	if (!attachment) {
		const storageKey = await uploadFile(
			buffer,
			file.name,
			fileHash,
			file.type || "application/octet-stream",
		);
		attachment = await createAttachmentRecord({
			fileName: file.name,
			mimeType: file.type || "application/octet-stream",
			sizeBytes: file.size,
			storageKey,
			fileHash,
			uploaderId,
		});
	}

	return attachment;
}

export async function attachFilesToComment(
	commentId: string,
	files: File[],
	uploaderId: string,
): Promise<{ skipped: string[] }> {
	const skipped: string[] = [];

	for (const file of files) {
		if (!(file instanceof File) || file.size === 0) continue;

		if (file.size > MAX_FILE_SIZE) {
			skipped.push(file.name);
			continue;
		}

		const attachment = await processAttachmentUpload(file, uploaderId);
		if (attachment) await linkAttachmentToComment(attachment.id, commentId);
	}

	return { skipped };
}

export async function attachFilesToTask(
	taskId: string,
	files: File[],
	uploaderId: string,
): Promise<{ skipped: string[] }> {
	const skipped: string[] = [];

	for (const file of files) {
		if (!(file instanceof File) || file.size === 0) continue;

		if (file.size > MAX_FILE_SIZE) {
			skipped.push(file.name);
			continue;
		}

		const attachment = await processAttachmentUpload(file, uploaderId);
		if (attachment) await linkAttachmentToTask(attachment.id, taskId);
	}

	return { skipped };
}

export async function createAttachmentAction(
	projectId: string,
	taskId: string,
	_prevState: FormState | null,
	formData: FormData,
): Promise<FormState> {
	const { userId } = await auth();
	if (!userId) return { success: false, message: "Unauthorized" };

	const user = await getUserByClerkId(userId);
	if (!user) return { success: false, message: "Can't find user" };

	const file = formData.get("file");
	if (!(file instanceof File) || file.size === 0) {
		return { success: false, message: "Choose a file to upload" };
	}
	if (file.size > MAX_FILE_SIZE) {
		return { success: false, message: "File must be 10MB or smaller" };
	}

	try {
		const attachment = await processAttachmentUpload(file, user.id);

		if (!attachment) {
			return { success: false, message: "Failed to store attachment." };
		}

		await linkAttachmentToTask(attachment.id, taskId);
	} catch (error) {
		console.error("Error while creating attachment:", error);
		return { success: false, message: "Error while adding attachment." };
	}

	revalidatePath(`/projects/${projectId}`);

	return { success: true };
}

export async function deleteAttachmentAction(
	projectId: string,
	taskId: string,
	attachmentId: string,
): Promise<FormState> {
	const { userId } = await auth();
	if (!userId) return { success: false, message: "Unauthorized" };

	try {
		await unlinkAttachmentFromTask(attachmentId, taskId);
		const attachment_links_count = await count_attachment_links(attachmentId);
		if (attachment_links_count === 0) {
			const deletedAttachment = await deleteAttachmentRecord(attachmentId);
			await deleteFile(deletedAttachment.storageKey);
		}
	} catch (error) {
		console.error("Error while removing attachment:", error);
		return { success: false, message: "Error while removing attachment." };
	}

	revalidatePath(`/projects/${projectId}`);

	return { success: true };
}
