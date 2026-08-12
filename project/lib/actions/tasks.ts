"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { TaskHistory } from "@/types/index";
import { getLoggedInUser } from "../authentication";
import { deleteAttachmentRecord } from "../db/mutations/attachments";
import type { FieldChange } from "../db/mutations/tasks";
import {
	createTask,
	createTaskHistoryEntries,
	deleteTask,
	updateTask,
} from "../db/mutations/tasks";
import {
	count_attachment_links,
	getAttachmentLinksByTaskId,
} from "../db/queries/attachments";
import { getTaskCountByListId } from "../db/queries/lists";
import {
	getHistoryByTaskId,
	getTaskListIdsByIds,
	getTaskRawById,
} from "../db/queries/tasks";
import { deleteFile } from "../storage";
import { toHistoryValue } from "../utils";
import { attachFilesToTask } from "./attachments";
import type { FormState } from "./projects";

const createTaskSchema = z.object({
	title: z.string().min(1, "Task title is required"),
	listId: z.string(),

	description: z.string().nullable().optional(),
	assigneeId: z.preprocess(
		(val) => (val === "" ? undefined : val),
		z.string().optional(),
	),
	priority: z.enum(["low", "medium", "high", "urgent"]).optional(),

	dueDate: z.preprocess(
		(val) => (val === "" ? undefined : new Date(val as string)),
		z.date().optional(),
	),
	startedAt: z.date().optional(),
	finishedAt: z.date().optional(),
});

const updateTaskSchema = z.object({
	title: z.string().min(1, "Task title is required").optional(),
	listId: z.string(),

	description: z.preprocess(
		(val) => (val === "" ? null : val),
		z.string().nullable().optional(),
	),
	assigneeId: z.preprocess(
		(val) => (val === "" ? null : val),
		z.string().nullable().optional(),
	),
	priority: z.enum(["low", "medium", "high", "urgent"]).optional(),

	dueDate: z.preprocess(
		(val) => (val === "" || val == null ? undefined : new Date(val as string)),
		z.date().nullable().optional(),
	),
});

export async function createTaskAction(
	projectId: string,
	_prevState: FormState | null,
	formData: FormData,
): Promise<FormState> {
	const user = await getLoggedInUser();
	if (!user) return { success: false, message: "Unauthorized" };

	const data = Object.fromEntries(
		Array.from(formData.entries()).filter(([key]) => key !== "files"),
	);
	const validatedFields = createTaskSchema.safeParse(data);

	if (!validatedFields.success) {
		return {
			errors: z.flattenError(validatedFields.error).fieldErrors,
			message: "Failed to create task. Please check your inputs.",
			success: false,
		};
	}

	let createdTask: { id: string } | undefined;

	try {
		const position = await getTaskCountByListId(validatedFields.data.listId);
		createdTask = await createTask({
			position: position,
			...validatedFields.data,
		});
	} catch (error) {
		console.error("Failed to create task in database:", error);
		return {
			message: "Database error: Failed to create task.",
			success: false,
		};
	}

	const files = formData
		.getAll("files")
		.filter((entry): entry is File => entry instanceof File && entry.size > 0);

	let skippedFiles: string[] = [];
	if (files.length > 0 && createdTask) {
		const result = await attachFilesToTask(createdTask.id, files, user.id);
		skippedFiles = result.skipped;
	}

	revalidatePath(`/projects/${projectId}`);

	return {
		message:
			skippedFiles.length > 0
				? `Task created. Skipped files over 10MB: ${skippedFiles.join(", ")}`
				: "Task created successfully",
		success: true,
	};
}

export async function updateTaskAction(
	projectId: string,
	taskId: string,
	_prevState: FormState | null,
	formData: FormData,
): Promise<FormState> {
	const user = await getLoggedInUser();
	if (!user) return { success: false, message: "Unauthorized" };

	const existingTask = await getTaskRawById(taskId);
	if (!existingTask) return { success: false, message: "Task not found!" };

	const data = Object.fromEntries(formData.entries());

	const validatedFields = updateTaskSchema.safeParse(data);

	if (!validatedFields.success) {
		return {
			errors: z.flattenError(validatedFields.error).fieldErrors,
			success: false,
		};
	}

	const updateData = Object.fromEntries<string | Date | number | null>(
		Object.entries(validatedFields.data).filter(([_, v]) => v !== undefined),
	);

	try {
		if (existingTask.listId !== validatedFields.data.listId) {
			updateData.position = await getTaskCountByListId(
				validatedFields.data.listId,
			);
		}

		await updateTask(taskId, updateData);
	} catch (error) {
		console.error("Failed to update task in database:", error);
		return {
			message: "Database error: Failed to update task.",
			success: false,
		};
	}

	const taskFields = existingTask as Record<string, unknown>;
	const changes: FieldChange[] = [];
	for (const [fieldName, newValue] of Object.entries(updateData)) {
		const oldValue = toHistoryValue(taskFields[fieldName]);
		const normalizedNew = toHistoryValue(newValue);
		if (oldValue !== normalizedNew) {
			changes.push({ fieldName, oldValue, newValue: normalizedNew });
		}
	}

	if (changes.length > 0) {
		try {
			await createTaskHistoryEntries(taskId, user.id, changes);
		} catch (error) {
			console.error("Failed to record task history:", error);
		}
	}

	revalidatePath(`/projects/${projectId}`);

	return {
		message: "Task updated successfully",
		success: true,
	};
}

export async function deleteTaskAction(
	projectId: string,
	taskId: string,
): Promise<FormState> {
	const user = await getLoggedInUser();
	if (!user) return { success: false, message: "Unauthorized" };

	try {
		const attachmentLinks = await getAttachmentLinksByTaskId(taskId);
		await deleteTask(taskId);
		for (const link of attachmentLinks) {
			const count = await count_attachment_links(link.attachment.id);
			if (count === 0) {
				await deleteAttachmentRecord(link.attachment.id);
				await deleteFile(link.attachment.storageKey);
			}
		}
	} catch (error) {
		console.error("Failed to delete task in database:", error);
		return {
			message: "Database error: Failed to delete task.",
			success: false,
		};
	}

	revalidatePath(`/projects/${projectId}`);

	return {
		message: "Task deleted successfully",
		success: true,
	};
}

export async function moveTasksAction(
	projectId: string,
	updates: {
		id: string;
		listId: string;
		position: number;
	}[],
) {
	const user = await getLoggedInUser();
	if (!user) return { success: false, message: "Unauthorized" };

	if (updates.length === 0) return { success: true };

	const previousListIds = await getTaskListIdsByIds(updates.map((u) => u.id));
	try {
		for (const update of updates) {
			await updateTask(update.id, {
				listId: update.listId,
				position: update.position,
			});
		}
	} catch (_error) {
		return {
			success: false,
			message: "Error while updating tasks",
		};
	}

	for (const update of updates) {
		const previousListId = previousListIds.get(update.id);
		if (!previousListId || previousListId === update.listId) continue;

		try {
			await createTaskHistoryEntries(update.id, user.id, [
				{
					fieldName: "listId",
					oldValue: previousListId,
					newValue: update.listId,
				},
			]);
		} catch (error) {
			console.error("Failed to record task move history:", error);
		}
	}

	revalidatePath(`/projects/${projectId}`);

	return {
		success: true,
		message: "Tasks updated successfully",
	};
}

export async function getHistoryAction(
	taskId: string,
): Promise<Record<string, TaskHistory[]>> {
	try {
		const history = await getHistoryByTaskId(taskId);
		return history;
	} catch (_error) {
		console.error("Error while getting history:", _error);
		return {};
	}
}
