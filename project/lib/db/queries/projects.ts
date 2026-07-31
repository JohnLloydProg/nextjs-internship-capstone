import type { Project, User } from "@/types/index";
import { db } from "..";
import type { projects } from "../schema";

type ProjectDetail = typeof projects.$inferSelect;

export async function getProjectById(
	projectId: string,
): Promise<Project | undefined> {
	try {
		return await db.query.projects.findFirst({
			where: {
				id: projectId,
			},
			with: {
				owner: {
					with: {
						role: true,
						notifications: false,
					},
				},
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

export interface ProjectWithMembers extends ProjectDetail {
	members: Omit<User, "role">[];
}

export async function getProjects(
	options?: GetProjectsOptions,
): Promise<ProjectWithMembers[]> {
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
					members: {
						id: userId,
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
			members: true,
		},
	});

	return projectList;
}
