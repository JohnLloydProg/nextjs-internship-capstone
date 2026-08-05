"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { User } from "@/types/index";
import { createTask, deleteTask, updateTask } from "../db/mutations/tasks";
import { getUserByClerkId } from "../db/queries/users";
import type { FormState } from "./projects";
import { getTaskCountByListId } from "../db/queries/lists";

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
	const { userId } = await auth();
	if (!userId) return { success: false, message: "Unauthorized" };

	let user: User | null;
	try {
		user = await getUserByClerkId(userId);
	} catch (error) {
		console.error("Error while getting user:", error);
		return { success: false, message: "Error while getting user." };
	}
	if (!user) return { success: false, message: "Can't find user" };

	const data = Object.fromEntries(formData.entries());
	const validatedFields = createTaskSchema.safeParse(data);

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Failed to create task. Please check your inputs.",
			success: false,
		};
	}

	try {
		const position = await getTaskCountByListId(validatedFields.data.listId);
		await createTask({ position: position, ...validatedFields.data });
	} catch (error) {
		console.error("Failed to create task in database:", error);
		return {
			message: "Database error: Failed to create task.",
			success: false,
		};
	}

	revalidatePath(`/projects/${projectId}`);

	return {
		message: "Task created successfully",
		success: true,
	};
}

export async function updateTaskAction(
	projectId: string,
	taskId: string,
	_prevState: FormState | null, // Replace 'any' with your FormState type
	formData: FormData,
): Promise<FormState> {
	// Replace 'any' with your FormState type
	const { userId } = await auth();
	if (!userId) return { success: false, message: "Unauthorized" };

	let user: User | null;
	try {
		user = await getUserByClerkId(userId);
	} catch (error) {
		console.error("Error while getting user:", error);
		return { success: false, message: "Error while getting user." };
	}
	if (!user) return { success: false, message: "Can't find user" };

	const data = Object.fromEntries(formData.entries());

	const validatedFields = updateTaskSchema.safeParse(data);

	if (!validatedFields.success) {
		return {
			errors: z.flattenError(validatedFields.error).fieldErrors,
			success: false,
		};
	}

	try {
		// Clean the object to remove undefined fields so Drizzle doesn't try to update them
		const updateData = Object.fromEntries(
			Object.entries(validatedFields.data).filter(([_, v]) => v !== undefined),
		);

		await updateTask(taskId, updateData);
	} catch (error) {
		console.error("Failed to update task in database:", error);
		return {
			message: "Database error: Failed to update task.",
			success: false,
		};
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
	const { userId } = await auth();
	if (!userId) return { success: false, message: "Unauthorized" };

	let user: User | null;
	try {
		user = await getUserByClerkId(userId);
	} catch (error) {
		console.error("Error while getting user:", error);
		return { success: false, message: "Error while getting user." };
	}
	if (!user) return { success: false, message: "Can't find user" };

	try {
		await deleteTask(taskId);
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
