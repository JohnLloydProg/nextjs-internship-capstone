import type { User } from "@/types/index";
import { db } from "..";

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
	const user = await db.query.users.findFirst({
		where: {
			clerkId: clerkId,
		},
		with: {
			role: true,
		},
	});
	return user ?? null;
}

export async function getMembersByProject(projectId: string): Promise<User[]> {
	return await db.query.users.findMany({
		where: {
			assignedProjects: {
				id: projectId,
			},
		},
		with: {
			role: true,
		},
	});
}
