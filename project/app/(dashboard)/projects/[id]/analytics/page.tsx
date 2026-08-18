import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CycleLeadComparisonWidget from "@/components/analytics/cycle-lead-comparison-widget";
import ProgressTimelineWidget from "@/components/analytics/progress-timeline-widget";
import TasksPerAssigneeWidget from "@/components/analytics/tasks-per-assignee-widget";
import TasksPerWeekWidget from "@/components/analytics/tasks-per-week-widget";
import {
	FinishedRatioWidget,
	OverdueWidget,
	TotalTasksWidget,
} from "@/components/analytics/widgets";
import {
	getLatestProgressRecord,
	getProgressTimeline,
	getProjectCycleLeadComparison,
	getTasksCompletedPerWeek,
	getTasksPerAssignee,
	getUserCycleLeadComparison,
} from "@/lib/db/queries/analytics";
import { getUserByClerkId } from "@/lib/db/queries/users";

export default async function ProjectAnalyticsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id: projectId } = await params;

	const { userId: clerkId } = await auth();
	if (!clerkId) redirect("/sign-in");

	const currentUser = await getUserByClerkId(clerkId);
	if (!currentUser) redirect("/sign-in");

	const [
		latestRecord,
		timeline,
		weeklyCompleted,
		projectCycleLead,
		userCycleLead,
		perAssignee,
	] = await Promise.all([
		getLatestProgressRecord(projectId),
		getProgressTimeline(projectId),
		getTasksCompletedPerWeek(projectId),
		getProjectCycleLeadComparison(projectId),
		getUserCycleLeadComparison(projectId, currentUser.id),
		getTasksPerAssignee(projectId),
	]);

	return (
		<div className="w-full max-w-6xl space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<TotalTasksWidget record={latestRecord} />
				<FinishedRatioWidget record={latestRecord} />
				<OverdueWidget record={latestRecord} />
			</div>

			<ProgressTimelineWidget data={timeline} />

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<TasksPerWeekWidget data={weeklyCompleted} />
				<TasksPerAssigneeWidget data={perAssignee} />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<CycleLeadComparisonWidget
					title="Project-Wide Cycle & Lead Time"
					current={projectCycleLead?.current ?? null}
					previous={projectCycleLead?.previous ?? null}
				/>
				<CycleLeadComparisonWidget
					title="My Cycle & Lead Time"
					current={userCycleLead?.current ?? null}
					previous={userCycleLead?.previous ?? null}
				/>
			</div>
		</div>
	);
}
