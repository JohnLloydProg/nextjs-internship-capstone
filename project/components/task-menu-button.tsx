"use client";

import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLists } from "@/hooks/use-lists";
import { useMembers } from "@/hooks/use-members";
import { deleteTaskAction, updateTaskAction } from "@/lib/actions/tasks";
import type { Task } from "@/types/index";
import ActivityPanel from "./activity-panel";
import AttachmentsPanel from "./attachment-panel";

type EditableField =
	| "title"
	| "description"
	| "listId"
	| "priority"
	| "assigneeId"
	| "dueDate";

function toDateInputValue(date: Date | string | null): string {
	if (!date) return "";
	return new Date(date).toISOString().split("T")[0];
}

function EditIconButton({ onClick }: { onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="text-muted-foreground hover:text-primary transition-colors"
		>
			<Pencil className="w-3.5 h-3.5" />
			<span className="sr-only">Edit</span>
		</button>
	);
}

export function TaskMenuButton({
	task,
	projectId,
	defaultListId,
}: {
	task: Task;
	projectId: string;
	defaultListId: string;
}) {
	const [open, setOpen] = useState(false);
	const [state, formAction, isPending] = useActionState(
		updateTaskAction.bind(null, projectId).bind(null, task.id),
		null,
	);
	const [isDeleting, startDeleteTransition] = useTransition();
	const lists = useLists((state) => state.lists);
	const members = useMembers((state) => state.members);

	const [editing, setEditing] = useState<Record<EditableField, boolean>>({
		title: false,
		description: false,
		listId: false,
		priority: false,
		assigneeId: false,
		dueDate: false,
	});

	const [titleValue, setTitleValue] = useState(task.title);
	const [descriptionValue, setDescriptionValue] = useState(
		task.description ?? "",
	);
	const [listId, setListId] = useState(defaultListId);
	const [priority, setPriority] = useState(task.priority);
	const [assigneeId, setAssigneeId] = useState(task.assignee?.id ?? "");
	const [dueDate, setDueDate] = useState(toDateInputValue(task.dueDate));

	const startEditing = (field: EditableField) =>
		setEditing((prev) => ({ ...prev, [field]: true }));
	const stopEditing = (field: EditableField) =>
		setEditing((prev) => ({ ...prev, [field]: false }));

	const resetFormState = () => {
		setEditing({
			title: false,
			description: false,
			listId: false,
			priority: false,
			assigneeId: false,
			dueDate: false,
		});
		setTitleValue(task.title);
		setDescriptionValue(task.description ?? "");
		setListId(defaultListId);
		setPriority(task.priority);
		setAssigneeId(task.assignee?.id ?? "");
		setDueDate(toDateInputValue(task.dueDate));
	};

	const handleMenuClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	const listName = lists.find((l) => l.id === listId)?.name ?? "Select a list";
	const assigneeName = assigneeId
		? (() => {
				const member = members.find((m) => m.id === assigneeId);
				return member ? `${member.firstName} ${member.lastName}` : "Unassigned";
			})()
		: "Unassigned";
	const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) resetFormState();
				setOpen(next);
			}}
		>
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

			<DialogContent className="sm:max-w-3xl lg:max-w-4xl bg-card border-border shadow-lg">
				<DialogHeader>
					<DialogTitle className="text-foreground text-xl tracking-tight font-heading">
						Task Details
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Click the pencil next to a field to update it, or permanently delete
						this task.
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 mt-4">
					<form action={formAction} className="flex flex-col gap-5">
						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<Label className="text-foreground font-semibold">
									Title <span className="text-destructive">*</span>
								</Label>
								{!editing.title && (
									<EditIconButton onClick={() => startEditing("title")} />
								)}
							</div>
							{editing.title ? (
								<Input
									name="title"
									autoFocus
									required
									value={titleValue}
									onChange={(e) => setTitleValue(e.target.value)}
									onBlur={() => stopEditing("title")}
								/>
							) : (
								<>
									<p className="px-2.5 py-1.5 text-sm text-foreground">
										{titleValue}
									</p>
									<input type="hidden" name="title" value={titleValue} />
								</>
							)}
							{state?.errors?.title && (
								<p className="text-sm text-destructive">
									{state.errors.title[0]}
								</p>
							)}
						</div>

						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<Label className="text-foreground font-semibold">
									Description
								</Label>
								<div className="flex items-center gap-2">
									<span className="text-xs text-muted-foreground font-normal">
										Optional
									</span>
									{!editing.description && (
										<EditIconButton
											onClick={() => startEditing("description")}
										/>
									)}
								</div>
							</div>
							{editing.description ? (
								<Textarea
									name="description"
									autoFocus
									value={descriptionValue}
									onChange={(e) => setDescriptionValue(e.target.value)}
									onBlur={() => stopEditing("description")}
									className="h-20 resize-none"
								/>
							) : (
								<>
									<p className="px-2.5 py-1.5 text-sm text-muted-foreground min-h-16 rounded-lg border border-dashed border-border">
										{descriptionValue || "No description"}
									</p>
									<input
										type="hidden"
										name="description"
										value={descriptionValue}
									/>
								</>
							)}
						</div>

						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<Label className="text-foreground font-semibold">
									List <span className="text-destructive">*</span>
								</Label>
								{!editing.listId && (
									<EditIconButton onClick={() => startEditing("listId")} />
								)}
							</div>
							{editing.listId ? (
								<Select
									name="listId"
									value={listId}
									onValueChange={(value) => {
										setListId(value);
										stopEditing("listId");
									}}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a list" />
									</SelectTrigger>
									<SelectContent>
										{lists.map((list) => (
											<SelectItem key={list.id} value={list.id}>
												{list.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							) : (
								<>
									<p className="px-2.5 py-1.5 text-sm text-foreground">
										{listName}
									</p>
									<input type="hidden" name="listId" value={listId} />
								</>
							)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<Label className="text-foreground font-semibold">
										Priority
									</Label>
									{!editing.priority && (
										<EditIconButton onClick={() => startEditing("priority")} />
									)}
								</div>
								{editing.priority ? (
									<Select
										name="priority"
										value={priority}
										onValueChange={(value) => {
											setPriority(value as Task["priority"]);
											stopEditing("priority");
										}}
									>
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
								) : (
									<>
										<p className="px-2.5 py-1.5 text-sm text-foreground">
											{priorityLabel}
										</p>
										<input type="hidden" name="priority" value={priority} />
									</>
								)}
							</div>

							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<Label className="text-foreground font-semibold">
										Assignee
									</Label>
									{!editing.assigneeId && (
										<EditIconButton
											onClick={() => startEditing("assigneeId")}
										/>
									)}
								</div>
								{editing.assigneeId ? (
									<Select
										name="assigneeId"
										value={assigneeId}
										onValueChange={(value) => {
											setAssigneeId(value);
											stopEditing("assigneeId");
										}}
									>
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
								) : (
									<>
										<p className="px-2.5 py-1.5 text-sm text-foreground">
											{assigneeName}
										</p>
										<input type="hidden" name="assigneeId" value={assigneeId} />
									</>
								)}
							</div>
						</div>

						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<Label className="text-foreground font-semibold">
									Due Date
								</Label>
								<div className="flex items-center gap-2">
									<span className="text-xs text-muted-foreground font-normal">
										Optional
									</span>
									{!editing.dueDate && (
										<EditIconButton onClick={() => startEditing("dueDate")} />
									)}
								</div>
							</div>
							{editing.dueDate ? (
								<Input
									name="dueDate"
									type="date"
									autoFocus
									value={dueDate}
									onChange={(e) => setDueDate(e.target.value)}
									onBlur={() => stopEditing("dueDate")}
								/>
							) : (
								<>
									<p className="px-2.5 py-1.5 text-sm text-foreground">
										{dueDate
											? new Date(dueDate).toLocaleDateString()
											: "No due date"}
									</p>
									<input type="hidden" name="dueDate" value={dueDate} />
								</>
							)}
						</div>
						<div className="md:col-span-2 mt-2 flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 gap-2">
							<Button
								type="button"
								variant="destructive"
								className="sm:w-auto w-full font-medium"
								disabled={isDeleting}
								onClick={() => {
									startDeleteTransition(async () => {
										await deleteTaskAction(projectId, task.id);
									});
								}}
							>
								{isDeleting ? (
									<Loader2 className="w-4 h-4 animate-spin mr-2" />
								) : (
									<Trash2 className="w-4 h-4 mr-2" />
								)}
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
								<Button type="submit" disabled={isPending}>
									{isPending && <Loader2 className="w-4 h-4 animate-spin" />}
									Save Changes
								</Button>
							</div>
						</div>
					</form>

					<div className="flex flex-col gap-5 pb-6">
						<AttachmentsPanel task={task} projectId={projectId} />

						<div className="space-y-2 flex-1 min-h-0">
							<Label className="text-foreground font-semibold">
								Activity History
							</Label>
							<ActivityPanel task={task} />
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
