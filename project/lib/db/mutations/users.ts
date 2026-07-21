import { eq } from "drizzle-orm";
import type { User } from "@/types/index";
import { db } from "..";
import { users } from "../schema";

export type NewUser = typeof users.$inferInsert;
export type UpdateUser = Partial<
	Omit<NewUser, "id" | "clerkId" | "createdAt" | "updatedAt">
>;

export async function createUser(userData: NewUser): Promise<User> {
	const [newUser] = await db.insert(users).values(userData).returning();
	return newUser;
}

export async function updateUserByClerkId(
	clerkId: string,
	updateData: UpdateUser,
): Promise<User | null> {
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
