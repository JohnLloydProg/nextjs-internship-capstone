import type { List } from "@/types/index";
import { db } from "..";

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
					assignee: {
						with: {
							role: false,
						},
					},
				},
			},
		},
	});
}
