import { inArray } from "drizzle-orm";
import type { Project, Task, TaskHistory } from "@/types/index";
import { db } from "..";
import { tasks } from "../schema";

export interface CalendarTask extends Omit<Task, "attachments"> {
	project: Omit<Project, "owner">;
}

export async function getTaskRawById(taskId: string) {
	return db.query.tasks.findFirst({ where: { id: taskId } });
}

export async function getTaskListIdsByIds(
	taskIds: string[],
): Promise<Map<string, string>> {
	if (taskIds.length === 0) return new Map();

	const rows = await db
		.select({ id: tasks.id, listId: tasks.listId })
		.from(tasks)
		.where(inArray(tasks.id, taskIds));

	return new Map(rows.map((row) => [row.id, row.listId]));
}

export async function getHistoryByTaskId(
	taskId: string,
): Promise<Record<string, TaskHistory[]>> {
	const history = await db.query.taskHistory.findMany({
		with: {
			changedBy: true,
		},
		where: {
			taskId: taskId,
		},
		orderBy: {
			changedAt: "desc",
		},
	});

	const record: Record<string, TaskHistory[]> = {};
	for (const his of history) {
		if (his.editId in record) {
			record[his.editId].push(his);
		} else {
			record[his.editId] = [his];
		}
	}

	return record;
}

export async function getTasksDueBetween(
	clerkId: string,
	startDate: Date,
	endDate: Date,
): Promise<CalendarTask[]> {
	const tasks = await db.query.tasks.findMany({
		where: {
			assignee: {
				clerkId: clerkId,
			},
			dueDate: {
				gte: startDate,
				lte: endDate,
			},
		},
		with: {
			assignee: true,
			list: {
				columns: {},
				with: {
					project: true,
				},
			},
		},
		orderBy: {
			dueDate: "asc",
		},
	});
	return tasks.map((task) => ({ project: task.list.project, ...task }));
}

export interface UpcomingDeadline extends Omit<Task, "attachments"> {
	project: Omit<Project, "owner">;
}

export async function getUpcomingDueTasks(
	clerkId: string,
	limit = 6,
): Promise<UpcomingDeadline[]> {
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);

	const tasks = await db.query.tasks.findMany({
		where: {
			assignee: {
				clerkId: clerkId,
			},
			dueDate: {
				gte: startOfToday,
			},
		},
		with: {
			list: {
				columns: {},
				with: {
					project: true,
				},
			},
			assignee: true,
		},
		orderBy: {
			dueDate: "asc",
		},
		limit: limit,
	});

	return tasks.map((task) => ({ project: task.list.project, ...task }));
}
