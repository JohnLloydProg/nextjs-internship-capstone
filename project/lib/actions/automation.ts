"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
	createObserverWithActions,
	deleteObserver,
} from "../db/mutations/workflow";
import { userIsOwner } from "../db/queries/users";
import type { FormState } from "./projects";

const TASK_FIELD_VALUES = [
	"title",
	"description",
	"listId",
	"priority",
	"assigneeId",
	"dueDate",
	"startedAt",
	"finishedAt",
] as const;

const setActionSchema = z.object({
	fieldName: z.enum(TASK_FIELD_VALUES),
	value: z.string().min(1),
});

const createObserverSchema = z.object({
	fieldName: z.enum(TASK_FIELD_VALUES),
	event: z.enum(["changed", "equals"]),
	value: z.string().optional(),
	setActions: z.array(setActionSchema).default([]),
	notifyUserIds: z.array(z.string()).default([]),
});

export async function createObserverAction(
	projectId: string,
	input: z.infer<typeof createObserverSchema>,
): Promise<FormState> {
	const { userId } = await auth();
	if (!userId) return { success: false, message: "Unauthorized" };

	const isOwner = await userIsOwner(projectId, userId);
	if (!isOwner) {
		return {
			success: false,
			message: "Only the project owner can manage automations",
		};
	}

	const parsed = createObserverSchema.safeParse(input);
	if (!parsed.success) {
		return { success: false, errors: z.flattenError(parsed.error).fieldErrors };
	}
	if (parsed.data.event === "equals" && !parsed.data.value) {
		return { success: false, message: "Choose a value to match against" };
	}

	try {
		await createObserverWithActions({
			projectId,
			fieldName: parsed.data.fieldName,
			event: parsed.data.event,
			value:
				parsed.data.event === "equals" ? (parsed.data.value ?? null) : null,
			setActions: parsed.data.setActions,
			notifyUserIds: parsed.data.notifyUserIds,
		});
	} catch (error) {
		console.error("Error creating automation:", error);
		return { success: false, message: "Failed to create automation." };
	}

	revalidatePath(`/projects/${projectId}/settings`);
	return { success: true, message: "Automation created" };
}

export async function deleteObserverAction(
	projectId: string,
	observerId: string,
): Promise<FormState> {
	const { userId } = await auth();
	if (!userId) return { success: false, message: "Unauthorized" };

	const isOwner = await userIsOwner(projectId, userId);
	if (!isOwner) {
		return {
			success: false,
			message: "Only the project owner can manage automations",
		};
	}

	try {
		await deleteObserver(observerId);
	} catch (error) {
		console.error("Error deleting automation:", error);
		return { success: false, message: "Failed to delete automation." };
	}

	revalidatePath(`/projects/${projectId}/settings`);
	return { success: true };
}
