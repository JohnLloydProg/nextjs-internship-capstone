import { ArrowDown, ArrowUp, Minus } from "lucide-react";

function Delta({
	current,
	previous,
}: {
	current: number;
	previous: number | null;
}) {
	if (previous === null) {
		return <span className="text-xs text-muted-foreground">No prior data</span>;
	}

	const diff = current - previous;
	if (Math.abs(diff) < 0.01) {
		return (
			<span className="flex items-center gap-1 text-xs text-muted-foreground">
				<Minus className="w-3 h-3" />
				No change
			</span>
		);
	}

	// Lower cycle/lead time is an improvement, so a decrease is shown "good" (green).
	const improved = diff < 0;
	return (
		<span
			className={`flex items-center gap-1 text-xs font-medium ${
				improved ? "text-primary" : "text-destructive"
			}`}
		>
			{improved ? (
				<ArrowDown className="w-3 h-3" />
			) : (
				<ArrowUp className="w-3 h-3" />
			)}
			{Math.abs(diff).toFixed(1)}d vs last week
		</span>
	);
}

export default function CycleLeadComparisonWidget({
	title,
	current,
	previous,
}: {
	title: string;
	current: { cycleTime: string; leadTime: string } | null;
	previous: { cycleTime: string; leadTime: string } | null;
}) {
	const currentCycle = current ? Number(current.cycleTime) : 0;
	const currentLead = current ? Number(current.leadTime) : 0;
	const previousCycle = previous ? Number(previous.cycleTime) : null;
	const previousLead = previous ? Number(previous.leadTime) : null;

	return (
		<div className="bg-card border border-border rounded-xl p-6">
			<h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>

			{!current ? (
				<p className="text-sm text-muted-foreground py-6 text-center">
					No data recorded yet.
				</p>
			) : (
				<div className="grid grid-cols-2 gap-6">
					<div className="space-y-1">
						<p className="text-xs font-medium text-muted-foreground">
							Cycle Time
						</p>
						<p className="text-2xl font-bold text-foreground">
							{currentCycle.toFixed(1)}
							<span className="text-sm font-normal text-muted-foreground ml-1">
								days
							</span>
						</p>
						<Delta current={currentCycle} previous={previousCycle} />
					</div>
					<div className="space-y-1">
						<p className="text-xs font-medium text-muted-foreground">
							Lead Time
						</p>
						<p className="text-2xl font-bold text-foreground">
							{currentLead.toFixed(1)}
							<span className="text-sm font-normal text-muted-foreground ml-1">
								days
							</span>
						</p>
						<Delta current={currentLead} previous={previousLead} />
					</div>
				</div>
			)}
		</div>
	);
}
