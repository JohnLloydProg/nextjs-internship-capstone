import type { List } from "@/types/index";
import { db } from "..";
import { tasks } from "../schema";
import { eq } from "drizzle-orm";

export async function getListsByProjectId(projectId: string): Promise<List[]> {
	return await db.query.lists.findMany({
		where: {
			projectId: projectId,
		},
		orderBy: {
			position: "asc",
		},
		with: {
			tasks: {
				orderBy: { position: "asc" },
				with: {
					assignee: true,
				},
			},
		},
	});
}

export async function getTaskCountByListId(listId: string) {
	return db.$count(tasks, eq(tasks.listId, listId));
}
