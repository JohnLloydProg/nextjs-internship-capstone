"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createList, deleteList, updateList } from "../db/mutations/lists";
import type { FormState } from "./projects";

const createListSchema = z.object({
	name: z.string().min(3).max(30, "Limit characters to 30 only"),
	suggestedLimit: z.preprocess(
		(value) => (value === "" ? undefined : Number(value)),
		z.number().max(10).optional(),
	),
});

const updateListSchema = z.object({
	name: z.string().min(3).max(30, "Limit characters to 30 only"),
	suggestedLimit: z.number().max(10).optional().nullable(),
});

export async function CreateListAction(
	projectId: string,
	position: number,
	_: FormState | null,
	formData: FormData,
): Promise<FormState> {
	const data = Object.fromEntries(formData.entries());
	const parsedResults = createListSchema.safeParse(data);

	if (!parsedResults.success)
		return {
			success: false,
			errors: z.flattenError(parsedResults.error).fieldErrors,
		};

	try {
		await createList({
			projectId: projectId,
			position: position,
			...parsedResults.data,
		});
	} catch (error) {
		console.error("Error while creating list:", error);
		return { success: false, message: "Error while creating list." };
	}

	revalidatePath(`/projects/${projectId}`);

	return { success: true };
}

export async function updateListAction(
	projectId: string,
	listId: string,
	name: string,
	suggestedLimit?: number | null,
): Promise<FormState> {
	const parsedResults = updateListSchema.safeParse({
		name,
		suggestedLimit,
	});

	if (!parsedResults.success) {
		return {
			success: false,
			errors: z.flattenError(parsedResults.error).fieldErrors,
		};
	}

	try {
		await updateList(listId, parsedResults.data);
	} catch (error) {
		console.error("Error while updating list:", error);
		return { success: false, message: "Error while updating list." };
	}

	revalidatePath(`/projects/${projectId}`);

	return { success: true };
}

export async function deleteListAction(
	projectId: string,
	listId: string,
): Promise<FormState> {
	try {
		await deleteList(listId);
	} catch (error) {
		console.error("Error while deleting list:", error);
		return {
			success: false,
			message: "Error while deleting list.",
		};
	}

	revalidatePath(`/projects/${projectId}`);

	return {
		success: true,
		message: "List deleted successfully",
	};
}

export async function reorderListsAction(
	projectId: string,
	updates: { id: string; position: number }[],
) {
	try {
		for (const update of updates) {
			await updateList(update.id, { position: update.position });
		}
		revalidatePath(`/projects/${projectId}`);
	} catch (_error) {
		return {
			success: false,
			message: "Error while updating lists",
		};
	}

	return {
		success: true,
		message: "Lists order updated successfully",
	};
}
