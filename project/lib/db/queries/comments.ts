import type { Comment } from "@/types/index";
import { db } from "..";

export async function getCommentsByTaskId(taskId: string): Promise<Comment[]> {
	return await db.query.comments.findMany({
		where: { taskId },
		orderBy: { createdAt: "asc" },
		with: {
			author: true,
			attachments: {
				columns: { fileHash: false },
				with: { uploadedBy: true },
				orderBy: { createdAt: "desc" },
			},
		},
	});
}

export interface TaskThreadSummary {
	taskId: string;
	taskTitle: string;
	latestComment: {
		content: string;
		authorFirstName: string;
	} | null;
}

export async function getTaskCommentThreads(
	projectId: string,
): Promise<TaskThreadSummary[]> {
	const projectTasks = await db.query.tasks.findMany({
		where: { list: { projectId } },
		with: {
			comments: {
				orderBy: { createdAt: "desc" },
				limit: 1,
				with: { author: true },
			},
		},
	});

	return projectTasks
		.map((task) => ({
			taskId: task.id,
			taskTitle: task.title,
			latestComment: task.comments[0]
				? {
						content: task.comments[0].content,
						authorFirstName: task.comments[0].author.firstName,
					}
				: null,
			sortDate: task.comments[0]?.createdAt ?? task.createdAt,
		}))
		.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
		.map(({ taskId, taskTitle, latestComment }) => ({
			taskId,
			taskTitle,
			latestComment,
		}));
}
