import { eq } from "drizzle-orm";
import { db } from "..";
import { lists } from "../schema";

// Extract the types automatically from the schema
type NewList = typeof lists.$inferInsert;
type UpdateList = Partial<
	Omit<NewList, "id" | "createdAt" | "updatedAt" | "projectId">
>;

export async function createList(data: NewList) {
	const [newList] = await db.insert(lists).values(data).returning();

	return newList;
}

export async function updateList(listId: string, data: UpdateList) {
	const [updatedList] = await db
		.update(lists)
		.set(data)
		.where(eq(lists.id, listId))
		.returning();

	return updatedList;
}

export async function deleteList(listId: string) {
	const [deletedList] = await db
		.delete(lists)
		.where(eq(lists.id, listId))
		.returning();

	return deletedList;
}
