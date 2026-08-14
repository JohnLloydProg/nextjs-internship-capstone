import type { TaskObserver } from "@/types/index";
import { db } from "..";

export async function getObserversByProjectId(
	projectId: string,
): Promise<TaskObserver[]> {
	const observers = await db.query.taskObservers.findMany({
		where: {
			projectId: projectId,
		},
		with: {
			setters: true,
			notifiers: {
				where: {
					enabled: true,
				},
				with: {
					user: true,
				},
			},
		},
	});

	return observers as unknown as TaskObserver[];
}
