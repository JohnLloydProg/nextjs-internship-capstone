import type { projectProgressRecords } from "@/lib/db/schema";
import StatCard from "./stat-card";

type ProgressRecord = typeof projectProgressRecords.$inferSelect;

export function TotalTasksWidget({
	record,
}: {
	record: ProgressRecord | null;
}) {
	return <StatCard label="Number of Tasks" value={record?.numTasks ?? 0} />;
}

export function FinishedRatioWidget({
	record,
}: {
	record: ProgressRecord | null;
}) {
	const total = record?.numTasks ?? 0;
	const finished = record?.numFinished ?? 0;
	const percent = total > 0 ? Math.round((finished / total) * 100) : 0;

	return (
		<StatCard
			label="Finished / Total"
			value={`${finished} / ${total}`}
			sublabel={`${percent}% complete`}
		/>
	);
}

export function OverdueWidget({ record }: { record: ProgressRecord | null }) {
	return (
		<StatCard
			label="Overdue Tasks"
			value={record?.numDue ?? 0}
			sublabel={
				record && record.numDue > 0 ? "Needs attention" : "All caught up"
			}
		/>
	);
}
