"use client";

import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface TimelinePoint {
	recordedAt: Date;
	numTasks: number;
	numFinished: number;
	numDue: number;
}

export default function ProgressTimelineWidget({
	data,
}: {
	data: TimelinePoint[];
}) {
	const chartData = data.map((point) => ({
		date: new Date(point.recordedAt).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		}),
		"All Tasks": point.numTasks,
		Finished: point.numFinished,
		Overdue: point.numDue,
	}));

	return (
		<div className="bg-card border border-border rounded-xl p-6">
			<h3 className="text-sm font-semibold text-foreground mb-4">
				Project Tasks Progress
			</h3>
			{chartData.length === 0 ? (
				<p className="text-sm text-muted-foreground py-12 text-center">
					No history yet — check back after the next analytics run.
				</p>
			) : (
				<ResponsiveContainer width="100%" height={280}>
					<LineChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
						<XAxis dataKey="date" fontSize={12} />
						<YAxis fontSize={12} allowDecimals={false} />
						<Tooltip />
						<Legend />
						<Line
							type="monotone"
							dataKey="All Tasks"
							stroke="var(--chart-2)"
							strokeWidth={2}
							dot={false}
						/>
						<Line
							type="monotone"
							dataKey="Finished"
							stroke="var(--chart-1)"
							strokeWidth={2}
							dot={false}
						/>
						<Line
							type="monotone"
							dataKey="Overdue"
							stroke="var(--destructive)"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			)}
		</div>
	);
}
