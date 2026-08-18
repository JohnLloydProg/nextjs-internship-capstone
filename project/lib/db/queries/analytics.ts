import { sql } from "drizzle-orm";
import { db } from "..";

export async function getProgressTimeline(projectId: string, days = 30) {
	const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

	return await db.query.projectProgressRecords.findMany({
		columns: {
			recordedAt: true,
			numTasks: true,
			numFinished: true,
			numDue: true,
		},
		where: {
			projectId: projectId,
			recordedAt: {
				gte: since,
			},
		},
		orderBy: {
			recordedAt: "asc",
		},
	});
}

export async function getLatestProgressRecord(projectId: string) {
	const record = await db.query.projects.findFirst({
		columns: {},
		where: {
			id: projectId,
		},
		with: {
			latest: true,
		},
	});

	return record?.latest ?? null;
}

export async function getTasksCompletedPerWeek(projectId: string, weeks = 8) {
	const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);

	const rows = await db.execute<{
		week_start: string;
		num_finished: number;
	}>(sql`
		SELECT DISTINCT ON (date_trunc('week', recorded_at))
			date_trunc('week', recorded_at) AS week_start,
			number_of_finished AS num_finished
		FROM project_progress_records
		WHERE project_id = ${projectId}
			AND recorded_at >= ${since}
		ORDER BY date_trunc('week', recorded_at), recorded_at DESC
	`);

	const weeklySnapshots = rows.rows as {
		week_start: string;
		num_finished: number;
	}[];

	return weeklySnapshots.map((row, i) => {
		const previous = weeklySnapshots[i - 1];
		return {
			weekStart: row.week_start,
			completed: previous
				? Math.max(0, row.num_finished - previous.num_finished)
				: 0,
		};
	});
}

export async function getProjectCycleLeadComparison(projectId: string) {
	const current = await getLatestProgressRecord(projectId);
	if (!current) return null;

	const weekAgo = new Date(
		current.recordedAt.getTime() - 7 * 24 * 60 * 60 * 1000,
	);

	const previous = await db.query.projectProgressRecords.findFirst({
		where: {
			projectId: projectId,
			recordedAt: {
				lte: weekAgo,
			},
		},
		orderBy: {
			recordedAt: "desc",
		},
	});

	return { current, previous: previous ?? null };
}

export async function getUserCycleLeadComparison(
	projectId: string,
	userId: string,
) {
	const currentProjectRecord = await getLatestProgressRecord(projectId);
	if (!currentProjectRecord) return null;

	const currentUserRecord = await db.query.perUserRecords.findFirst({
		where: {
			projectRecordId: currentProjectRecord.id,
			userId: userId,
		},
	});
	if (!currentUserRecord) return null;

	const weekAgo = new Date(
		currentProjectRecord.recordedAt.getTime() - 7 * 24 * 60 * 60 * 1000,
	);

	const previousProjectRecord = await db.query.projectProgressRecords.findFirst(
		{
			where: {
				projectId: projectId,
				recordedAt: {
					lte: weekAgo,
				},
			},
			orderBy: {
				recordedAt: "desc",
			},
		},
	);

	let previousUserRecord = null;
	if (previousProjectRecord) {
		const row = await db.query.perUserRecords.findFirst({
			where: {
				projectRecordId: previousProjectRecord.id,
				userId: userId,
			},
		});
		previousUserRecord = row ?? null;
	}

	return { current: currentUserRecord, previous: previousUserRecord };
}

export async function getTasksPerAssignee(projectId: string) {
	const latest = await getLatestProgressRecord(projectId);
	if (!latest) return [];

	return await db.query.perUserRecords.findMany({
		columns: {
			userId: true,
			userName: true,
			noTasks: true,
		},
		where: {
			projectRecordId: latest.id,
		},
	});
}
