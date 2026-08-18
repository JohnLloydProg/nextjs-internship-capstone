"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface WeeklyPoint {
	weekStart: string;
	completed: number;
}

export default function TasksPerWeekWidget({ data }: { data: WeeklyPoint[] }) {
	const chartData = data.map((point) => ({
		week: new Date(point.weekStart).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		}),
		completed: point.completed,
	}));

	return (
		<div className="bg-card border border-border rounded-xl p-6">
			<h3 className="text-sm font-semibold text-foreground mb-4">
				Tasks Completed Per Week
			</h3>
			{chartData.length === 0 ? (
				<p className="text-sm text-muted-foreground py-12 text-center">
					No completed tasks recorded yet.
				</p>
			) : (
				<ResponsiveContainer width="100%" height={240}>
					<BarChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
						<XAxis dataKey="week" fontSize={12} />
						<YAxis fontSize={12} allowDecimals={false} />
						<Tooltip />
						<Bar
							dataKey="completed"
							fill="var(--chart-1)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			)}
		</div>
	);
}
