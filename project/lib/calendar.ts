export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface CalendarDay {
	date: Date;
	isCurrentMonth: boolean;
}

export function addDays(date: Date, amount: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + amount);
	return result;
}

export function toDateKey(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/** Builds a stable 6-week (42-day) grid for the given month, starting on Monday. */
export function getMonthMatrix(year: number, month: number): CalendarDay[][] {
	const firstOfMonth = new Date(year, month, 1);
	const mondayIndex = (firstOfMonth.getDay() + 6) % 7;
	const gridStart = new Date(year, month, 1 - mondayIndex);

	const weeks: CalendarDay[][] = [];
	const cursor = new Date(gridStart);

	for (let week = 0; week < 6; week++) {
		const days: CalendarDay[] = [];
		for (let day = 0; day < 7; day++) {
			days.push({
				date: new Date(cursor),
				isCurrentMonth: cursor.getMonth() === month,
			});
			cursor.setDate(cursor.getDate() + 1);
		}
		weeks.push(days);
	}

	return weeks;
}

export function getWeekDays(reference: Date): CalendarDay[] {
	const mondayIndex = (reference.getDay() + 6) % 7;
	const start = addDays(reference, -mondayIndex);

	return Array.from({ length: 7 }, (_, i) => {
		const date = addDays(start, i);
		return { date, isCurrentMonth: date.getMonth() === reference.getMonth() };
	});
}

export function formatMonthYear(date: Date): string {
	return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatWeekRange(start: Date, end: Date): string {
	const sameMonth = start.getMonth() === end.getMonth();
	const startLabel = start.toLocaleDateString("en-US", {
		month: "short",
		day: "2-digit",
	});
	return `${startLabel} – ${end.toLocaleDateString("en-Us", { month: sameMonth ? undefined : "short", day: "2-digit" })} ${end.getFullYear()}`;
}
