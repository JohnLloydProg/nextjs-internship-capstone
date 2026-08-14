import { db } from "..";
import { notifications } from "../schema";

type NewNotification = typeof notifications.$inferInsert;

export async function createNotification(data: NewNotification) {
	const [notification] = await db
		.insert(notifications)
		.values(data)
		.returning();
	return notification;
}
