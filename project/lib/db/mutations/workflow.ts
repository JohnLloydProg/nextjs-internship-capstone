import { eq } from "drizzle-orm";
import type { ObserverEvent, TaskField } from "@/types/index";
import { db } from "..";
import { notifyAutomations, setAutomations, taskObservers } from "../schema";

export interface CreateObserverInput {
	projectId: string;
	fieldName: TaskField;
	event: ObserverEvent;
	value: string | null;
	setActions: { fieldName: TaskField; value: string }[];
	notifyUserIds: string[];
}

export async function createObserverWithActions(input: CreateObserverInput) {
	const [observer] = await db
		.insert(taskObservers)
		.values({
			projectId: input.projectId,
			fieldName: input.fieldName,
			event: input.event,
			value: input.value,
		})
		.returning();

	if (input.setActions.length > 0) {
		await db.insert(setAutomations).values(
			input.setActions.map((action) => ({
				observerId: observer.id,
				fieldName: action.fieldName,
				value: action.value,
			})),
		);
	}

	if (input.notifyUserIds.length > 0) {
		await db.insert(notifyAutomations).values(
			input.notifyUserIds.map((userId) => ({
				observerId: observer.id,
				userId,
				enabled: true,
			})),
		);
	}

	return observer;
}

export async function deleteObserver(observerId: string) {
	const [deleted] = await db
		.delete(taskObservers)
		.where(eq(taskObservers.id, observerId))
		.returning();
	return deleted;
}
