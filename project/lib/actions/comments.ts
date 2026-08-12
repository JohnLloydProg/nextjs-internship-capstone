"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Comment } from "@/types/index";
import { deleteAttachmentRecord } from "../db/mutations/attachments";
import {
	createComment,
	deleteComment,
	updateComment,
} from "../db/mutations/comments";
import {
	count_attachment_links,
	getAttachmentLinksByCommentId,
} from "../db/queries/attachments";
import { getUserByClerkId } from "../db/queries/users";
import { deleteFile } from "../storage";
import { attachFilesToComment } from "./attachments";
import type { FormState } from "./projects";

const EDIT_WINDOW_MS = 300 * 1000;

const createCommentSchema = z.object({
	content: z.string().min(1, "Comment can't be empty").max(2000),
});

export async function createCommentAction(
	projectId: string,
	taskId: string,
	_prevState: FormState | null,
	formData: FormData,
): Promise<FormState> {
	const { userId } = await auth();
	if (!userId) return { success: false, message: "Unauthorized" };

	const user = await getUserByClerkId(userId);
	if (!user) return { success: false, message: "Can't find user" };

	const data = Object.fromEntries(
		Array.from(formData.entries()).filter(([key]) => key !== "files"),
	);
	const validatedFields = createCommentSchema.safeParse(data);

	if (!validatedFields.success) {
		return {
			errors: z.flattenError(validatedFields.error).fieldErrors,
			success: false,
		};
	}

	let createdComment: { id: string } | undefined;

	try {
		createdComment = await createComment({
			taskId,
			authorId: user.id,
			content: validatedFields.data.content,
		});
	} catch (error) {
		console.error("Error while creating comment:", error);
		return { success: false, message: "Error while posting comment." };
	}
	const files = formData
		.getAll("files")
		.filter((entry): entry is File => entry instanceof File && entry.size > 0);

	let skippedFiles: string[] = [];
	if (files.length > 0 && createdComment) {
		const result = await attachFilesToComment(
			createdComment.id,
			files,
			user.id,
		);
		skippedFiles = result.skipped;
	}

	revalidatePath(`/projects/${projectId}/comments`);

	return {
		success: true,
		message:
			skippedFiles.length > 0
				? `Comment posted. Skipped files over 10MB: ${skippedFiles.join(", ")}`
				: undefined,
	};
}

const updateCommentSchema = z.object({
	content: z.string().min(1, "Comment can't be empty").max(2000),
});

export async function updateCommentAction(
	projectId: string,
	comment: Comment,
	_prevState: FormState | null,
	formData: FormData,
): Promise<FormState> {
	const { userId } = await auth();
	if (!userId) return { success: false, message: "Unauthorized" };

	const user = await getUserByClerkId(userId);
	if (!user) return { success: false, message: "Can't find user" };

	if (!comment) return { success: false, message: "Comment not found" };
	if (comment.author.id !== user.id) {
		return { success: false, message: "You can only edit your own comments" };
	}
	if (Date.now() - comment.createdAt.getTime() > EDIT_WINDOW_MS) {
		return { success: false, message: "Editing window has expired" };
	}

	const data = Object.fromEntries(formData.entries());
	const validatedFields = updateCommentSchema.safeParse(data);

	if (!validatedFields.success) {
		return {
			errors: z.flattenError(validatedFields.error).fieldErrors,
			success: false,
		};
	}

	try {
		await updateComment(comment.id, validatedFields.data.content);
	} catch (error) {
		console.error("Error while updating comment:", error);
		return { success: false, message: "Error while updating comment." };
	}

	revalidatePath(`/projects/${projectId}/comments`);

	return { success: true };
}

export async function deleteCommentAction(
	projectId: string,
	comment: Comment,
): Promise<FormState> {
	const { userId } = await auth();
	if (!userId) return { success: false, message: "Unauthorized" };

	const user = await getUserByClerkId(userId);
	if (!user) return { success: false, message: "Can't find user" };

	if (!comment) return { success: false, message: "Comment not found" };
	if (comment.author.id !== user.id) {
		return { success: false, message: "You can only delete your own comments" };
	}
	if (Date.now() - comment.createdAt.getTime() > EDIT_WINDOW_MS) {
		return { success: false, message: "Deleting window has expired" };
	}

	try {
		const attachmentLinks = await getAttachmentLinksByCommentId(comment.id);
		await deleteComment(comment.id);
		for (const link of attachmentLinks) {
			const count = await count_attachment_links(link.attachment.id);
			if (count === 0) {
				await deleteAttachmentRecord(link.attachment.id);
				await deleteFile(link.attachment.storageKey);
			}
		}
	} catch (error) {
		console.error("Error while deleting comment:", error);
		return { success: false, message: "Error while deleting comment." };
	}

	revalidatePath(`/projects/${projectId}/comments`);

	return { success: true };
}
