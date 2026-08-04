import { and, eq } from "drizzle-orm";
import { db } from "..";
import { assignments, users } from "../schema";

export type NewUser = typeof users.$inferInsert;
export type UpdateUser = Partial<
	Omit<NewUser, "id" | "clerkId" | "createdAt" | "updatedAt">
>;

export async function createUser(userData: NewUser) {
	const [newUser] = await db.insert(users).values(userData).returning();
	return newUser;
}

export async function updateUserByClerkId(
	clerkId: string,
	updateData: UpdateUser,
) {
	const [updatedUser] = await db
		.update(users)
		.set(updateData)
		.where(eq(users.clerkId, clerkId))
		.returning();

	return updatedUser ?? null;
}

export async function deleteUserByClerkId(clerkId: string) {
	const [deletedUser] = await db
		.delete(users)
		.where(eq(users.clerkId, clerkId))
		.returning();

	return deletedUser ?? null;
}

export async function deleteAssignmentByCompositeID(
	projectId: string,
	userId: string,
) {
	const [deletedAssignment] = await db
		.delete(assignments)
		.where(
			and(eq(assignments.projectId, projectId), eq(assignments.userId, userId)),
		)
		.returning();
	return deletedAssignment ?? null;
}

export async function updateAssignmentByCompositeID(
	projectId: string,
	userId: string,
	updateData: Partial<typeof assignments.$inferInsert>,
) {
	const [updatedAssignment] = await db
		.update(assignments)
		.set(updateData)
		.where(
			and(eq(assignments.projectId, projectId), eq(assignments.userId, userId)),
		)
		.returning();
	return updatedAssignment ?? null;
}
