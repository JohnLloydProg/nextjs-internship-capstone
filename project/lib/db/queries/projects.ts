import { and, eq } from "drizzle-orm";
import type { Project } from "@/types/index";
import { db } from "..";
import { assignments, projects } from "../schema";

export async function getProjectById(
	projectId: string,
): Promise<Project | undefined> {
	try {
		return await db.query.projects.findFirst({
			where: {
				id: projectId,
			},
			with: {
				owner: true,
			},
		});
	} catch (_error) {
		return undefined;
	}
}

interface GetProjectsOptions {
	userId?: string;
	search?: string;
	status?: "active" | "paused" | "closed";
	newest?: boolean;
}

export async function getProjects(
	options?: GetProjectsOptions,
): Promise<(Project & { progress: number })[]> {
	const { userId, search, status, newest } = options || {};

	const conditions = [];

	if (status) {
		conditions.push({ status: status });
	}

	if (userId) {
		conditions.push({
			OR: [
				{
					ownerId: userId,
				},
				{
					assignments: {
						userId: userId,
						accepted: true,
					},
				},
			],
		});
	}

	const projectList = await db.query.projects.findMany({
		where: {
			AND: conditions,
			name: {
				ilike: `%${search}%`,
			},
		},
		orderBy: { updatedAt: newest ? "desc" : "asc" },
		with: {
			owner: true,
			assignments: {
				with: {
					user: true,
				},
			},
			latest: true,
		},
	});

	return projectList.map((project) => ({
		members: project.assignments.map((assignment) => assignment.user),
		progress: project.latest?.numTasks
			? ((project.latest?.numFinished ?? 0) / project.latest?.numTasks) * 100
			: 0,
		...project,
	}));
}

export async function getProjectCountByUser(userId: string): Promise<number> {
	const ownedCount = await db.$count(projects, eq(projects.ownerId, userId));
	const assignedCount = await db.$count(
		assignments,
		and(eq(assignments.userId, userId), eq(assignments.accepted, true)),
	);

	return ownedCount + assignedCount;
}
