import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
	perUserRecords,
	projectProgressRecords,
	projects,
	users,
} from "@/lib/db/schema";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function average(values: number[]): number {
	if (values.length === 0) return 0;
	return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const allProjects = await db.select().from(projects);

	let projectsProcessed = 0;

	for (const project of allProjects) {
		const projectTasks = await db.query.tasks.findMany({
			columns: {
				id: true,
				assigneeId: true,
				dueDate: true,
				startedAt: true,
				finishedAt: true,
				createdAt: true,
			},
			where: {
				list: {
					projectId: project.id,
				},
			},
		});

		const now = new Date();

		const numTasks = projectTasks.length;
		const finishedTasks = projectTasks.filter((t) => t.finishedAt !== null);
		const numFinished = finishedTasks.length;

		const numDue = projectTasks.filter(
			(t) => t.dueDate !== null && t.dueDate < now && t.finishedAt === null,
		).length;

		const cycleTimes = finishedTasks
			.filter((t) => t.startedAt !== null)
			.map((t) => {
				if (!t.finishedAt || !t.startedAt) return 0;
				return (t.finishedAt.getTime() - t.startedAt.getTime()) / MS_PER_DAY;
			});

		const leadTimes = finishedTasks.map((t) => {
			if (!t.finishedAt) return 0;
			return (t.finishedAt.getTime() - t.createdAt.getTime()) / MS_PER_DAY;
		});

		const cycleTime = average(cycleTimes);
		const leadTime = average(leadTimes);

		const [record] = await db
			.insert(projectProgressRecords)
			.values({
				projectId: project.id,
				projectName: project.name,
				numFinished,
				numTasks,
				numDue,
				cycleTime: cycleTime.toFixed(2),
				leadTime: leadTime.toFixed(2),
			})
			.returning();

		await db
			.update(projects)
			.set({ latestRecord: record.id })
			.where(eq(projects.id, project.id));

		if (!record) continue;

		const tasksByUser = new Map<string, typeof projectTasks>();
		for (const task of projectTasks) {
			if (!task.assigneeId) continue;
			const existing = tasksByUser.get(task.assigneeId) ?? [];
			existing.push(task);
			tasksByUser.set(task.assigneeId, existing);
		}

		if (tasksByUser.size > 0) {
			const userIds = Array.from(tasksByUser.keys());
			const assignedUsers = await db
				.select({
					id: users.id,
					firstName: users.firstName,
					lastName: users.lastName,
				})
				.from(users)
				.where(inArray(users.id, userIds));

			const userNameById = new Map(
				assignedUsers.map((u) => [u.id, `${u.firstName} ${u.lastName}`]),
			);

			await db.insert(perUserRecords).values(
				Array.from(tasksByUser.entries()).map(([userId, userTasks]) => {
					const finished = userTasks.filter((t) => t.finishedAt !== null);

					const userCycleTimes = finished
						.filter((t) => t.startedAt !== null)
						.map((t) => {
							if (!t.finishedAt || !t.startedAt) return 0;
							return (
								(t.finishedAt.getTime() - t.startedAt.getTime()) / MS_PER_DAY
							);
						});

					const userLeadTimes = finished.map((t) => {
						if (!t.finishedAt) return 0;
						return (
							(t.finishedAt.getTime() - t.createdAt.getTime()) / MS_PER_DAY
						);
					});

					return {
						projectRecordId: record.id,
						userId,
						userName: userNameById.get(userId) ?? "Unknown User",
						noTasks: userTasks.length,
						cycleTime: average(userCycleTimes).toFixed(2),
						leadTime: average(userLeadTimes).toFixed(2),
					};
				}),
			);
		}

		projectsProcessed++;
	}

	return NextResponse.json({
		success: true,
		projectsProcessed,
		recordedAt: new Date().toISOString(),
	});
}
