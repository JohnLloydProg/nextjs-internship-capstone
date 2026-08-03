"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteProjectAction } from "@/lib/actions/projects";
import type { Project } from "@/types/index";

export default function DeleteProjectSection({
	project,
}: {
	project: Project;
}) {
	const [isDeleting, startDeleteTransition] = useTransition();
	const [confirmName, setConfirmName] = useState("");

	function handleDelete() {
		startDeleteTransition(async () => {
			const result = await deleteProjectAction(project.id);
			if (result && !result.success) {
				console.error(result.message);
			}
		});
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" disabled={isDeleting}>
					{isDeleting ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						<Trash2 className="w-4 h-4" />
					)}
					Delete Project
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete "{project.name}"?</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently delete the project and all of its lists,
						tasks, comments, and member assignments. Type the project name to
						confirm.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="py-2">
					<Input
						value={confirmName}
						onChange={(e) => setConfirmName(e.target.value)}
						placeholder={project.name}
					/>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => setConfirmName("")}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						disabled={confirmName !== project.name}
						onClick={handleDelete}
					>
						Delete Project
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
