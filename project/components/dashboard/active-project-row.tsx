import Link from "next/link";
import type { ActiveProjectSummary } from "@/lib/db/queries/dashboard";
import { formatDueCountdown, formatRelativeTime } from "@/lib/utils";

export default function ActiveProjectRow({
	project,
}: {
	project: ActiveProjectSummary;
}) {
	const progress =
		project.totalTasks > 0
			? Math.round((project.finishedTasks / project.totalTasks) * 100)
			: 0;

	return (
		<Link
			href={`/projects/${project.id}`}
			className="flex items-center gap-4 bg-muted/40 hover:bg-muted/70 rounded-lg p-4 transition-colors"
		>
			<div className="min-w-0 w-40 shrink-0">
				<p className="font-bold text-foreground truncate">{project.name}</p>
				<p className="text-xs text-muted-foreground">
					Updated {formatRelativeTime(project.updatedAt)}
				</p>
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between text-xs mb-1">
					<span className="text-muted-foreground">Progress</span>
					<span className="font-semibold text-foreground">{progress}%</span>
				</div>
				<div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
					<div
						className="h-full bg-linear-to-r from-[#9E7F1F] to-[#D1B252] rounded-full"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>

			<span className="text-xs font-medium text-primary shrink-0 w-28 text-right">
				{formatDueCountdown(project.dueDate)}
			</span>
		</Link>
	);
}
