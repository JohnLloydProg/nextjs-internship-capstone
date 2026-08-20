import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "..";
import {
	assignments,
	comments,
	lists,
	projects,
	tasks,
	users,
} from "../schema";

async function getUserProjectIds(userId: string): Promise<string[]> {
	const owned = await db
		.select({ id: projects.id })
		.from(projects)
		.where(eq(projects.ownerId, userId));

	const assigned = await db
		.select({ id: assignments.projectId })
		.from(assignments)
		.where(and(eq(assignments.userId, userId), eq(assignments.accepted, true)));

	return Array.from(
		new Set([...owned.map((p) => p.id), ...assigned.map((a) => a.id)]),
	);
}

export interface DashboardStats {
	totalProjects: number;
	totalAssignedTasks: number;
	completedAssignedTasks: number;
	pendingTasks: number;
}

export async function getDashboardStats(
	userId: string,
): Promise<DashboardStats> {
	const projectIds = await getUserProjectIds(userId);

	const assignedTasks = await db
		.select({
			id: tasks.id,
			startedAt: tasks.startedAt,
			finishedAt: tasks.finishedAt,
		})
		.from(tasks)
		.where(eq(tasks.assigneeId, userId));

	return {
		totalProjects: projectIds.length,
		totalAssignedTasks: assignedTasks.length,
		completedAssignedTasks: assignedTasks.filter((t) => t.finishedAt !== null)
			.length,
		pendingTasks: assignedTasks.filter(
			(t) => t.startedAt === null && t.finishedAt === null,
		).length,
	};
}

export interface ActiveProjectSummary {
	id: string;
	name: string;
	updatedAt: Date;
	dueDate: Date | null;
	totalTasks: number;
	finishedTasks: number;
}

export async function getActiveProjectsForUser(
	userId: string,
	limit = 3,
): Promise<ActiveProjectSummary[]> {
	const projectIds = await getUserProjectIds(userId);
	if (projectIds.length === 0) return [];

	const projectRows = await db.query.projects.findMany({
		where: { id: { in: projectIds }, status: "active" },
		with: {
			latest: true,
		},
		orderBy: { updatedAt: "desc" },
		limit,
	});

	if (projectRows.length === 0) return [];

	return projectRows.map((project) => {
		return {
			id: project.id,
			name: project.name,
			updatedAt: project.updatedAt,
			dueDate: project.dueDate,
			totalTasks: project.latest?.numTasks ?? 0,
			finishedTasks: project.latest?.numFinished ?? 0,
		};
	});
}

export interface TaskDistributionSlice {
	priority: "low" | "medium" | "high" | "urgent";
	taskCount: number;
}

const PRIORITY_ORDER = ["urgent", "high", "medium", "low"] as const;

export async function getTaskDistributionForUser(
	userId: string,
): Promise<TaskDistributionSlice[]> {
	const projectIds = await getUserProjectIds(userId);
	if (projectIds.length === 0) return [];

	const rows = await db
		.select({ priority: tasks.priority, taskId: tasks.id })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(
			and(inArray(lists.projectId, projectIds), eq(tasks.assigneeId, userId)),
		);

	const counts = new Map<string, number>();
	for (const row of rows) {
		counts.set(row.priority, (counts.get(row.priority) ?? 0) + 1);
	}

	return PRIORITY_ORDER.filter(
		(priority) => (counts.get(priority) ?? 0) > 0,
	).map((priority) => ({
		priority,
		taskCount: counts.get(priority) ?? 0,
	}));
}

export interface RecentCommentSummary {
	id: string;
	content: string;
	createdAt: Date;
	taskId: string;
	projectId: string;
	author: { firstName: string; lastName: string; profilePic: string | null };
}

export async function getRecentCommentsForUser(
	userId: string,
	limit = 2,
): Promise<RecentCommentSummary[]> {
	const rows = await db
		.select({
			id: comments.id,
			content: comments.content,
			createdAt: comments.createdAt,
			taskId: tasks.id,
			taskTitle: tasks.title,
			projectId: lists.projectId,
			authorFirstName: users.firstName,
			authorLastName: users.lastName,
			authorProfilePic: users.profilePic,
		})
		.from(comments)
		.innerJoin(tasks, eq(comments.taskId, tasks.id))
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.innerJoin(users, eq(comments.authorId, users.id))
		.where(eq(tasks.assigneeId, userId))
		.orderBy(desc(comments.createdAt))
		.limit(limit);

	return rows.map((row) => ({
		id: row.id,
		content: row.content,
		createdAt: row.createdAt,
		taskId: row.taskId,
		taskTitle: row.taskTitle,
		projectId: row.projectId,
		author: {
			firstName: row.authorFirstName,
			lastName: row.authorLastName,
			profilePic: row.authorProfilePic,
		},
	}));
}
