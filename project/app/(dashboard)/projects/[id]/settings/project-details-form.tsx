"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
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
import type { FormState } from "@/lib/actions/projects";
import { updateProjectAction } from "@/lib/actions/projects";
import type { Project } from "@/types/index";

const initialState: FormState = { success: false };

export default function ProjectDetailsForm({
	project,
	isOwner,
}: {
	project: Project;
	isOwner: boolean;
}) {
	const [state, formAction, isPending] = useActionState(
		updateProjectAction.bind(null, project.id),
		initialState,
	);

	return (
		<form action={formAction} className="flex flex-col gap-6">
			<div className="space-y-1.5">
				<Label htmlFor="name">Project Name</Label>
				<Input
					id="name"
					name="name"
					defaultValue={project.name}
					disabled={!isOwner || isPending}
				/>
				{state.errors?.name && (
					<p className="text-sm text-destructive">{state.errors.name[0]}</p>
				)}
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					name="description"
					defaultValue={project.description ?? ""}
					disabled={!isOwner || isPending}
					rows={4}
				/>
				{state.errors?.description && (
					<p className="text-sm text-destructive">
						{state.errors.description[0]}
					</p>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-1.5">
					<Label htmlFor="status">Status</Label>
					<Select
						name="status"
						defaultValue={project.status}
						disabled={!isOwner || isPending}
					>
						<SelectTrigger id="status">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="paused">Paused</SelectItem>
							<SelectItem value="closed">Closed</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="dueDate">Due Date</Label>
					<Input
						id="dueDate"
						name="dueDate"
						type="date"
						defaultValue={
							project.dueDate ? project.dueDate.toISOString().split("T")[0] : ""
						}
						disabled={!isOwner || isPending}
					/>
				</div>
			</div>
			{isOwner && (
				<div className="flex justify-between items-center">
					<p
						className={`text-sm ${
							state.success ? "text-primary" : "text-destructive"
						}`}
					>
						{state.message ||
							(state.success ? "Project updated successfully!" : "")}
					</p>
					<Button type="submit" disabled={isPending}>
						{isPending && <Loader2 className="w-4 h-4 animate-spin" />}
						Save Changes
					</Button>
				</div>
			)}
		</form>
	);
}
