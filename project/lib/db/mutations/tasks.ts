import { eq } from "drizzle-orm";
import { db } from "..";
import { tasks } from "../schema";

type NewTask = typeof tasks.$inferInsert;
type UpdateTask = Partial<Omit<NewTask, "id" | "createdAt" | "updatedAt">>;

export async function createTask(data: NewTask) {
	const [newTask] = await db.insert(tasks).values(data).returning();

	return newTask;
}

export async function updateTask(taskId: string, data: UpdateTask) {
	const [updatedTask] = await db
		.update(tasks)
		.set(data)
		.where(eq(tasks.id, taskId))
		.returning();

	return updatedTask;
}

export async function deleteTask(taskId: string) {
	const [deletedTask] = await db
		.delete(tasks)
		.where(eq(tasks.id, taskId))
		.returning();

	return deletedTask;
}
