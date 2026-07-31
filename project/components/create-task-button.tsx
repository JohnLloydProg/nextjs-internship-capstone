"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useActionState } from "react";
import { createTaskAction } from "@/lib/actions/tasks";
import { FormMessage } from "./formMessage";
import type { Project, User } from "../types/index";

export function CreateTaskModal({
	projectId,
	members,
	listId,
	position,
}: {
	projectId: string;
	members: User[];
	listId: string;
	position: number;
}) {
	const [state, formAction, _isLoading] = useActionState(
		createTaskAction.bind("", projectId).bind("", listId).bind(0, position),
		null,
	);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="secondary">
					<Plus className="w-4 h-4 mr-2" />
					Create Task
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-125 bg-card border-border shadow-lg">
				<DialogHeader>
					<DialogTitle className="text-foreground text-xl tracking-tight">
						New Task
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Fill in the details below to add a new task to your board.
					</DialogDescription>
				</DialogHeader>

				<FormMessage state={state} />

				<form action={formAction} className="grid gap-5 mt-4">
					<div className="space-y-2">
						<Label htmlFor="title" className="text-foreground font-semibold">
							Task Title <span className="text-destructive">*</span>
						</Label>
						<Input
							id="title"
							name="title"
							placeholder="e.g., Update landing page hero"
							required
						/>
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
							placeholder="Add more details about this task..."
							className="resize-none h-20"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div className="space-y-2">
							<Label className="text-foreground font-semibold">Priority</Label>
							<Select defaultValue="medium" name="priority">
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
							<Select name="assigneeId">
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
							className="text-foreground"
						/>
					</div>

					<DialogFooter className="mt-4 sm:justify-end gap-2">
						<DialogClose asChild>
							<Button
								type="button"
								variant="ghost"
								className="text-muted-foreground hover:text-foreground"
							>
								Cancel
							</Button>
						</DialogClose>
						<Button type="submit">Create Task</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
