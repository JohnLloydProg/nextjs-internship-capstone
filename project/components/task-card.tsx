"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import Image from "next/image";
import type { Task } from "../types/index";
import { TaskMenuButton } from "./task-menu-button";

const PRIORITY_STYLES: Record<string, string> = {
	urgent: "bg-red-300 text-red-900",
	high: "bg-orange-300 text-orange-900",
	medium: "bg-yellow-300 text-yellow-900",
	low: "bg-green-300 text-green-900",
};

export default function TaskCard({
	index,
	task,
	projectId,
	group,
}: {
	task: Task;
	index: number;
	projectId: string;
	group: string;
}) {
	const { ref, isDragging } = useSortable({
		id: task.id,
		index: index,
		type: "task",
		accept: "task",
		group: group,
	});

	return (
		<div
			ref={ref}
			className={`group/card px-3 py-2 rounded-lg border bg-card shadow-sm flex flex-col gap-4 hover:border-primary border-border cursor-grab relative group transition-all ${isDragging ? "rotate-2 opacity-60" : "rotate-0 opacity-100"}`}
		>
			<div className="flex items-start justify-between">
				<h3 className="font-bold text-foreground text-base tracking-tight leading-snug pt-1">
					{task.title}
				</h3>

				<div className="flex items-center gap-1 shrink-0">
					<span
						className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${PRIORITY_STYLES[task.priority] ?? "bg-zinc-300 text-zing-900"}`}
					>
						{task.priority.toUpperCase()}
					</span>

					<TaskMenuButton
						task={task}
						projectId={projectId}
						defaultListId={task.listId}
					/>
				</div>
			</div>

			<div className="flex justify-between items-center">
				<span className="text-sm font-medium text-foreground">
					{task.dueDate
						? new Date(task.dueDate).toLocaleDateString("en-Us", {
								month: "short",
								day: "numeric",
							})
						: "No Due Date"}
				</span>
				<div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-border overflow-hidden shrink-0">
					<Image
						src={task.assignee?.profilePic || "/placeholder-user.jpg"}
						alt="profile-pic"
						width={28}
						height={28}
						className="w-full h-full object-cover"
					/>
				</div>
			</div>
		</div>
	);
}
