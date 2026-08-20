"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TaskDistributionSlice } from "@/lib/db/queries/dashboard";

const PRIORITY_COLORS: Record<TaskDistributionSlice["priority"], string> = {
	urgent: "#f87171",
	high: "#fb923c",
	medium: "#facc15",
	low: "#4ade80",
};

const PRIORITY_LABELS: Record<TaskDistributionSlice["priority"], string> = {
	urgent: "Urgent",
	high: "High",
	medium: "Medium",
	low: "Low",
};
export default function TaskDistributionWidget({
	data,
}: {
	data: TaskDistributionSlice[];
}) {
	if (data.length === 0) {
		return (
			<div className="bg-card border border-border rounded-xl p-6">
				<h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4">
					Tasks Distribution
				</h3>
				<p className="text-sm text-muted-foreground py-8 text-center">
					No tasks yet.
				</p>
			</div>
		);
	}

	const chartData = data.map((slice) => ({
		name: PRIORITY_LABELS[slice.priority],
		value: slice.taskCount,
		priority: slice.priority,
	}));

	return (
		<div className="bg-card border border-border rounded-xl p-6">
			<h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4">
				Tasks Distribution
			</h3>
			<div className="flex items-center gap-4">
				<div className="flex-1 flex flex-col gap-2 min-w-0">
					{data.map((slice) => (
						<div
							key={slice.priority}
							className="flex items-center gap-2 text-sm"
						>
							<span
								className="w-2.5 h-2.5 rounded-full shrink-0"
								style={{ backgroundColor: PRIORITY_COLORS[slice.priority] }}
							/>
							<span className="text-foreground">
								{PRIORITY_LABELS[slice.priority]}
							</span>
							<span className="text-muted-foreground ml-auto">
								{slice.taskCount}
							</span>
						</div>
					))}
				</div>
				<div className="w-32 h-32 shrink-0">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={chartData}
								dataKey="value"
								nameKey="name"
								innerRadius={35}
								outerRadius={60}
							>
								{chartData.map((entry) => (
									<Cell
										key={entry.priority}
										fill={PRIORITY_COLORS[entry.priority]}
									/>
								))}
							</Pie>
							<Tooltip />
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}
