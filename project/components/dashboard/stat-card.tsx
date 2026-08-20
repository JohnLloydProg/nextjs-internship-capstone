import type { LucideIcon } from "lucide-react";

export default function DashboardStatCard({
	label,
	value,
	icon: Icon,
	progress,
}: {
	label: string;
	value: string;
	icon: LucideIcon;
	progress?: { percent: number; label: string };
}) {
	return (
		<div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">
					{label}
				</span>
				<Icon className="w-4 h-4 text-primary" />
			</div>
			<p className="text-3xl font-bold text-foreground">{value}</p>
			{progress && (
				<div className="space-y-1">
					<div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
						<div
							className="h-full bg-linear-to-r from-[#9E7F1F] to-[#D1B252] rounded-full"
							style={{ width: `${progress.percent}%` }}
						/>
					</div>
					<p className="text-xs font-medium text-primary text-right">
						{progress.label}
					</p>
				</div>
			)}
		</div>
	);
}
