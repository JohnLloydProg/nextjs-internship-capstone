import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function toHistoryValue(value: unknown): string | null {
	if (value === null || value === undefined) return null;
	if (value instanceof Date) return value.toISOString();
	return String(value);
}

export function formatRelativeTime(date: Date): string {
	const diffMs = Date.now() - new Date(date).getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));

	if (diffMinutes < 1) return "Just now";
	if (diffMinutes < 60)
		return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;

	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24)
		return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

	const diffDays = Math.floor(diffHours / 24);
	if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

	const diffMonths = Math.floor(diffDays / 30);
	return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
}

export function formatDueCountdown(dueDate: Date | null): string {
	if (!dueDate) return "No due date";

	const diffMs = new Date(dueDate).getTime() - Date.now();
	const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays < 0)
		return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} overdue`;
	if (diffDays === 0) return "Due today";
	if (diffDays < 30)
		return `Due in ${diffDays} day${diffDays === 1 ? "" : "s"}`;

	const diffMonths = Math.round(diffDays / 30);
	return `Due in ${diffMonths} month${diffMonths === 1 ? "" : "s"}`;
}
