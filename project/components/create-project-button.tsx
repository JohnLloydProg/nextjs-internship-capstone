"use client";

import { Plus } from "lucide-react";
import { useActionState, useState } from "react";
import { CreateProjectAction } from "@/lib/actions/projects";
import { FormMessage } from "./formMessage";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export function CreateProjectButton() {
	const [isOpen, setIsOpen] = useState(false);
	const [state, formAction, _isLoading] = useActionState(
		CreateProjectAction,
		null,
	);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="default" onClick={() => setIsOpen(true)}>
					<Plus size={20} className="mr-2" />
					New Project
				</Button>
			</DialogTrigger>

			<DialogContent className="w-full sm:max-w-lg bg-card p-6 md:p-8 rounded-xl border border-border shadow-lg">
				<form action={formAction} className="flex flex-col gap-5">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold text-foreground tracking-tight">
							Create New Project
						</DialogTitle>
						<DialogDescription className="text-sm text-muted-foreground mt-1">
							Fill out the details below to initialize a new project workspace.
						</DialogDescription>
					</DialogHeader>

					<FormMessage state={state} />

					<div className="space-y-2 mt-2">
						<Label htmlFor="name">
							Project Name <span className="text-destructive">*</span>
						</Label>
						<Input
							id="name"
							name="name"
							placeholder="e.g., Q4 Marketing Campaign"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Project Description</Label>
						<Textarea
							id="description"
							name="description"
							placeholder="Briefly describe the scope and goals..."
							className="resize-none h-24"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div className="space-y-2">
							<Label
								htmlFor="dueDate"
								className="flex items-center justify-between"
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

						<div className="space-y-2">
							<Label
								htmlFor="members"
								className="flex items-center justify-between"
							>
								Member Emails
								<span className="text-xs text-muted-foreground font-normal">
									Optional
								</span>
							</Label>
							<Input
								id="members"
								type="text"
								placeholder="comma, separated, emails"
							/>
						</div>
					</div>

					<Button variant="default" type="submit" className="py-5">
						Create Project
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
