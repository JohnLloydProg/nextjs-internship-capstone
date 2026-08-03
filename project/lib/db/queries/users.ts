import type { Member, User } from "@/types/index";
import { db } from "..";

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
	const user = await db.query.users.findFirst({
		where: {
			clerkId: clerkId,
		},
	});
	return user ?? null;
}

export async function getMembersByProject(
	projectId: string,
): Promise<Member[]> {
	const assignments = await db.query.assignments.findMany({
		where: {
			projectId: projectId,
			accepted: true,
		},
		with: {
			user: true,
		},
	});

	return assignments.map((assignment) => ({
		role: assignment.role,
		...assignment.user,
	}));
}

export async function getAssignmentByProject(projectId: string) {
	const assignments = await db.query.assignments.findMany({
		where: {
			projectId: projectId,
		},
		with: {
			user: true,
		},
	});
	return assignments;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
	try {
		return await db.query.users.findFirst({
			where: {
				email: email,
			},
		});
	} catch (_error) {
		return undefined;
	}
}

export async function userIsOwner(projectId: string, userId: string) {
	try {
		const project = await db.query.projects.findFirst({
			where: {
				id: projectId,
				owner: {
					clerkId: userId,
				},
			},
		});
		return !!project;
	} catch (_error) {
		return false;
	}
}
