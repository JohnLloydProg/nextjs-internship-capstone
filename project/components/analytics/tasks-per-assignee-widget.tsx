"use client";

import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface AssigneeSlice {
	userId: string | null;
	userName: string;
	noTasks: number;
}

const _COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
];

export default function TasksPerAssigneeWidget({
	data,
}: {
	data: AssigneeSlice[];
}) {
	const chartData = data.map((d) => ({ name: d.userName, value: d.noTasks }));

	return (
		<div className="bg-card border border-border rounded-xl p-6">
			<h3 className="text-sm font-semibold text-foreground mb-4">
				Tasks Per Assignee
			</h3>
			{chartData.length === 0 ? (
				<p className="text-sm text-muted-foreground py-12 text-center">
					No assigned tasks yet.
				</p>
			) : (
				<ResponsiveContainer width="100%" height={280}>
					<PieChart>
						<Pie
							data={chartData}
							dataKey="value"
							nameKey="name"
							cx="50%"
							cy="50%"
							outerRadius={90}
							fill="var(--chart-1)"
							label={(entry) => entry.value}
						></Pie>
						<Tooltip />
						<Legend />
					</PieChart>
				</ResponsiveContainer>
			)}
		</div>
	);
}
