"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createComment } from "../db/mutations/comments";
import { getUserByClerkId } from "../db/queries/users";
import { attachFilesToComment } from "./attachments";
import type { FormState } from "./projects";

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
