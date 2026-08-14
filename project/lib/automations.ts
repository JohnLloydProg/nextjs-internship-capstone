import { updateTask } from "./db/mutations/tasks";
import type { FieldChange } from "./db/mutations/tasks";
import type { TaskField } from "@/types/index";
import { getObserversByProjectId } from "./db/queries/workflow";
import { createNotification } from "./db/mutations/notifications";

const DATE_FIELDS: TaskField[] = ["dueDate", "startedAt", "finishedAt"];

function resolveSetValue(
	fieldName: TaskField,
	rawValue: string,
): string | Date {
	if (DATE_FIELDS.includes(fieldName)) {
		if (rawValue === "$now") return new Date();
		const parsed = new Date(rawValue);
		return Number.isNaN(parsed.getTime()) ? rawValue : parsed;
	}
	return rawValue;
}

export async function runTaskObserverAutomations(
	projectId: string,
	taskId: string,
	changes: FieldChange[],
	link: string,
) {
	if (changes.length === 0) return;

	const observers = await getObserversByProjectId(projectId);
	if (observers.length === 0) return;

	const changesByField = new Map(changes.map((c) => [c.fieldName, c]));

	const triggered = observers.filter((observer) => {
		const change = changesByField.get(observer.fieldName);
		if (!change) return false;
		if (observer.event === "changed")
			return change.oldValue !== change.newValue;
		if (observer.event === "equals") return change.newValue === observer.value;
		return false;
	});

	if (triggered.length === 0) return;

	const setUpdates: Record<string, unknown> = {};
	for (const observer of triggered) {
		for (const action of observer.setters) {
			setUpdates[action.fieldName] = resolveSetValue(
				action.fieldName,
				action.value,
			);
		}
	}

	if (Object.keys(setUpdates).length > 0) {
		try {
			await updateTask(taskId, setUpdates as never);
		} catch (error) {
			console.error("Failed to apply automation set-actions:", error);
		}
	}

	const notifyUserIds = new Set<string>();
	for (const observer of triggered) {
		for (const notify of observer.notifiers) {
			notifyUserIds.add(notify.userId);
		}
	}

	const assigneeChange = changesByField.get("assigneeId");
	if (
		assigneeChange?.oldValue !== assigneeChange?.newValue &&
		assigneeChange?.newValue
	) {
		notifyUserIds.add(assigneeChange.newValue);
	}

	for (const userId of notifyUserIds) {
		try {
			await createNotification({
				receiverId: userId,
				title: "Automation triggered",
				description:
					"A task was updated automatically based on a rule you're subscribed to.",
				link,
			});
		} catch (error) {
			console.error("Failed to create automation notification:", error);
		}
	}
}
