import type { Project, Task } from "@/types/index";
import { db } from "..";

export interface CalendarTask extends Omit<Task, "attachments"> {
	project: Omit<Project, "owner">;
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
