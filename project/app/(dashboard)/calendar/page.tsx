import { auth } from "@clerk/nextjs/server";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
	addDays,
	type CalendarDay,
	DAY_LABELS,
	formatMonthYear,
	formatWeekRange,
	getMonthMatrix,
	getWeekDays,
	toDateKey,
} from "@/lib/calendar";
import type { UpcomingDeadline } from "@/lib/db/queries/tasks";
import {
	getTasksDueBetween,
	getUpcomingDueTasks,
} from "@/lib/db/queries/tasks";

const STATUS_STYLES: Record<string, string> = {
	urgent: "bg-red-300 text-red-900",
	high: "bg-orange-300 text-orange-900",
	medium: "bg-yellow-300 text-yellow-900",
	low: "bg-green-300 text-green-900",
};

export default async function CalendarPage({
	searchParams,
}: {
	searchParams: Promise<{
		view?: string;
		year?: string;
		month?: string;
		date?: string;
	}>;
}) {
	const { userId: clerkId } = await auth();
	if (!clerkId) redirect("/sign-in");

	const params = await searchParams;
	const now = new Date();

	const view = params.view === "week" ? "week" : "month";
	const year = params.year ? Number(params.year) : now.getFullYear();
	const month = params.month ? Number(params.month) : now.getMonth();
	const referenceDate = params.date ? new Date(params.date) : now;

	const weeksToRender: CalendarDay[][] =
		view === "week"
			? [getWeekDays(referenceDate)]
			: getMonthMatrix(year, month);

	const rangeStart = weeksToRender[0][0].date;
	const rangeEnd = weeksToRender[weeksToRender.length - 1][6].date;

	const [dayTasks, deadlines] = await Promise.all([
		getTasksDueBetween(clerkId, rangeStart, rangeEnd),
		getUpcomingDueTasks(clerkId, 6),
	]);

	const tasksByDay = new Map<string, typeof dayTasks>();
	for (const task of dayTasks) {
		if (!task.dueDate) continue;

		const key = toDateKey(new Date(task.dueDate));
		const existing = tasksByDay.get(key) ?? [];
		existing.push(task);
		tasksByDay.set(key, existing);
	}

	const prevMonthDate = new Date(year, month - 1, 1);
	const nextMonthDate = new Date(year, month + 1, 1);

	const prevHref =
		view === "week"
			? `/calendar?view=week&date=${toDateKey(addDays(referenceDate, -7))}`
			: `/calendar?view=month&year=${prevMonthDate.getFullYear()}&month=${prevMonthDate.getMonth()}`;

	const nextHref =
		view === "week"
			? `/calendar?view=week&date=${toDateKey(addDays(referenceDate, 7))}`
			: `/calendar?view=month&year=${nextMonthDate.getFullYear()}&month=${nextMonthDate.getMonth()}`;

	const monthToggleHref = `/calendar?view=month&year=${
		view === "week" ? referenceDate.getFullYear() : year
	}&month=${view === "week" ? referenceDate.getMonth() : month}`;

	const weekToggleHref = `/calendar?view=week&date=${toDateKey(
		view === "month" ? now : referenceDate,
	)}`;

	const titleText =
		view === "week"
			? formatWeekRange(weeksToRender[0][0].date, weeksToRender[0][6].date)
			: formatMonthYear(new Date(year, month, 1));

	const todayKey = toDateKey(now);

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-2xl font-bold text-foreground tracking-tight border-b border-border pb-3 mb-5">
					Upcoming Deadlines
				</h2>

				{deadlines.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						No upcoming deadlines. Enjoy the breathing room.
					</p>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
						{deadlines.map((deadline) => (
							<DeadlineCard key={deadline.id} deadline={deadline} />
						))}
					</div>
				)}
			</div>
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold text-foreground tracking-tight">
					Project Calendar
				</h1>
				<div className="flex items-center rounded-lg border border-border p-1 bg-card">
					<Link
						href={monthToggleHref}
						className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
							view === "month"
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Month
					</Link>
					<Link
						href={weekToggleHref}
						className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
							view === "week"
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Week
					</Link>
				</div>
			</div>

			<div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
				<div className="flex items-center justify-between px-6 py-5">
					<h2 className="text-2xl font-bold text-foreground">{titleText}</h2>
					<div className="flex items-center gap-2">
						<Link
							href={prevHref}
							className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/70 transition-colors text-foreground"
						>
							<ChevronLeft size={16} />
						</Link>
						<Link
							href={nextHref}
							className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/70 transition-colors text-foreground"
						>
							<ChevronRight size={16} />
						</Link>
					</div>
				</div>

				<div className="grid grid-cols-7 bg-primary">
					{DAY_LABELS.map((day) => (
						<div
							key={day}
							className="py-2.5 text-center text-sm font-semibold text-primary-foreground"
						>
							{day}
						</div>
					))}
				</div>

				<div className="divide-y divide-border">
					{weeksToRender.map((week) => (
						<div
							key={toDateKey(week[0].date)}
							className="grid grid-cols-7 divide-x divide-border"
						>
							{week.map(({ date, isCurrentMonth }) => {
								const key = toDateKey(date);
								const dueToday = tasksByDay.get(key) ?? [];
								const isToday = key === todayKey;
								const limit = view === "month" ? 2 : 6;

								return (
									<div
										key={key}
										className={`p-2 ${view === "week" ? "min-h-40" : "min-h-24"}`}
									>
										<span
											className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${
												isToday
													? "bg-primary text-primary-foreground font-bold"
													: isCurrentMonth
														? "text-foreground"
														: "text-muted-foreground/50"
											}`}
										>
											{date.getDate()}
										</span>

										{dueToday.length > 0 && (
											<div className="mt-1.5 space-y-1">
												{dueToday.slice(0, limit).map((task) => (
													<Link
														key={task.id}
														title={task.title}
														href={`projects/${task.project.id}`}
														className={`truncate text-[11px] px-1.5 py-0.5 rounded ${STATUS_STYLES[task.priority] ?? "bg-muted text-muted-foreground"} font-medium block`}
													>
														{task.title}
														{view === "week" && <div>{task.description}</div>}
													</Link>
												))}
												{dueToday.length > limit && (
													<div className="text-[11px] text-muted-foreground px-1.5">
														+{dueToday.length - 2} more
													</div>
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function DeadlineCard({ deadline }: { deadline: UpcomingDeadline }) {
	if (!deadline.dueDate) return null;

	return (
		<div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm">
			<div className="flex items-start justify-between gap-2">
				<h3 className="font-bold text-foreground leading-snug">
					{deadline.title}
				</h3>
				<span
					className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
						STATUS_STYLES[deadline.priority] ?? "bg-muted text-muted-foreground"
					}`}
				>
					{deadline.priority.toUpperCase()}
				</span>
			</div>

			<p className="text-sm text-muted-foreground">
				Project: {deadline.project.name}
			</p>

			<div className="flex items-center justify-between mt-auto pt-2">
				<span className="text-sm font-medium text-foreground">
					{new Date(deadline.dueDate).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					})}
				</span>
				<div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xs font-semibold text-muted-foreground">
					{deadline.assignee?.profilePic ? (
						<Image
							src={deadline.assignee.profilePic}
							alt={`${deadline.assignee.firstName} ${deadline.assignee.lastName}`}
							width={32}
							height={32}
							className="w-full h-full object-cover"
						/>
					) : deadline.assignee ? (
						`${deadline.assignee.firstName[0]}${deadline.assignee.lastName[0]}`
					) : null}
				</div>
			</div>
		</div>
	);
}
