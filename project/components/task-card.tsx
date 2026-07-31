"use client";

import Image from "next/image";
import type { Project, Task, User } from "../types/index";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useActionState, useTransition } from "react";
import { deleteTaskAction, updateTaskAction } from "@/lib/actions/tasks";

/*
TODO: Implementation Notes for Interns:

This component should display:
- Task title and description
- Priority indicator
- Assignee avatar
- Due date
- Labels/tags
- Comments count
- Drag handle for reordering

Props interface:
interface TaskCardProps {
  task: {
    id: string
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    assignee?: User
    dueDate?: Date
    labels: string[]
    commentsCount: number
  }
  isDragging?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

Features to implement:
- Drag and drop support
- Click to open task modal
- Priority color coding
- Overdue indicators
- Responsive design
*/

export function TaskMenuButton({
	task,
	projectId,
	members,
}: {
	task: Task;
	projectId: string;
	members: User[];
}) {
	const [state, formAction, _isLoading] = useActionState(
		updateTaskAction.bind("", projectId).bind("", task.id),
		null,
	);
	const [isLoading, startTranstion] = useTransition();

	const handleMenuClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					onClick={handleMenuClick}
					variant="ghost"
					size="icon"
					className="w-8 h-8 text-muted-foreground hover:text-foreground opacity-0 group-hover/card:opacity-100 transition-opacity"
				>
					<MoreHorizontal className="w-4 h-4" />
					<span className="sr-only">Edit Task</span>
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-125 bg-card border-border shadow-lg">
				<DialogHeader>
					<DialogTitle className="text-foreground text-xl tracking-tight">
						Edit Task
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Update the task details below or permanently delete it.
					</DialogDescription>
				</DialogHeader>

				<form action={formAction} className="grid gap-5 mt-4">
					<div className="space-y-2">
						<Label htmlFor="title" className="text-foreground font-semibold">
							Title <span className="text-destructive">*</span>
						</Label>
						<Input id="title" name="title" defaultValue={task.title} required />
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="description"
							className="flex items-center justify-between text-foreground font-semibold"
						>
							Description
							<span className="text-xs text-muted-foreground font-normal">
								Optional
							</span>
						</Label>
						<Textarea
							id="description"
							name="description"
							defaultValue={task.description || ""}
							className="h-20 resize-none"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div className="space-y-2">
							<Label
								htmlFor="priority"
								className="text-foreground font-semibold"
							>
								Priority
							</Label>
							<Select name="priority" defaultValue={task.priority}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="urgent">Urgent</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="low">Low</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label className="text-foreground font-semibold">Assignee</Label>
							<Select name="assigneeId" defaultValue={task.assignee?.id || ""}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select team member" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">Unassigned</SelectItem>
									{members.map((member) => (
										<SelectItem key={member.id} value={member.id}>
											{member.firstName} {member.lastName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="dueDate"
							className="flex items-center justify-between text-foreground font-semibold"
						>
							Due Date
							<span className="text-xs text-muted-foreground font-normal">
								Optional
							</span>
						</Label>
						<Input
							id="dueDate"
							name="dueDate"
							type="date"
							defaultValue={
								task.dueDate
									? new Date(task.dueDate).toISOString().split("T")[0]
									: ""
							}
						/>
					</div>

					<DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 gap-2">
						<Button
							type="button"
							variant="destructive"
							className="sm:w-auto w-full font-medium"
							onClick={() => {
								startTranstion(async () => {
									await deleteTaskAction(projectId, task.id);
								});
							}}
						>
							<Trash2 className="w-4 h-4 mr-2" />
							Delete
						</Button>
						<div className="flex gap-2 w-full sm:w-auto">
							<DialogClose asChild>
								<Button
									type="button"
									variant="ghost"
									className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
								>
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit">Save Changes</Button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function getPriorityColor(priority: string) {
	switch (priority) {
		case "urgent":
			return "bg-red-300 text-red-900";
		case "high":
			return "bg-orange-300 text-orange-900";
		case "medium":
			return "bg-yellow-300 text-yellow-900";
		case "low":
			return "bg-green-300 text-green-900";
		default:
			return "bg-zinc-300 text-zing-900";
	}
}

export default function TaskCard({
	task,
	projectId,
	members,
}: {
	task: Task;
	projectId: string;
	members: User[];
}) {
	return (
		<div className="group/card p-5 rounded-lg border bg-card shadow-sm flex flex-col gap-4 hover:border-primary border-border cursor-pointer transition-colors relative group">
			{/* Header Row: Title, Priority, Menu */}
			<div className="flex items-start justify-between gap-3">
				<span className="font-bold text-foreground text-base tracking-tight leading-snug pt-1">
					{task.title}
				</span>

				<div className="flex items-center gap-1 shrink-0">
					<span
						className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${getPriorityColor(task.priority)}`}
					>
						{task.priority.toUpperCase()}
					</span>

					<TaskMenuButton task={task} projectId={projectId} members={members} />
				</div>
			</div>

			{/* Description Row */}
			{task.description && (
				<p className="text-sm text-muted-foreground leading-snug line-clamp-2">
					{task.description}
				</p>
			)}

			{/* Footer Row: Date & Assignee */}
			<div className="flex justify-between mt-auto items-center pt-2">
				<span className="text-sm font-medium text-foreground">
					{task.dueDate
						? new Date(task.dueDate).toLocaleDateString()
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
