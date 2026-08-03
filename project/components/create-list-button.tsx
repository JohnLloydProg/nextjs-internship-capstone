"use client";

import { Plus } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateListAction } from "@/lib/actions/lists";
import { FormMessage } from "./formMessage";

export type NewList = {
	name: string;
	suggestedLimit?: number | null | undefined;
};

export function CreateListModal({
	projectId,
	position,
}: {
	projectId: string;
	position: number;
}) {
	const [state, formAction, _isLoading] = useActionState(
		CreateListAction.bind("", projectId).bind(0, position),
		null,
	);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<button
					type="button"
					className="group bg-zinc-300 hover:bg-muted-foreground text-white relative w-1 hover:w-2 rounded-full h-full cursor-pointer transition-all"
				>
					<Plus className="absolute w-5 h-5 p-0.5 bg-zinc-300 group-hover:bg-muted-foreground rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
				</button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-106 bg-card border-border shadow-lg">
				<DialogHeader>
					<DialogTitle className="text-foreground text-xl tracking-tight">
						Create List
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Add a new list to organize your tasks.
					</DialogDescription>
				</DialogHeader>

				<FormMessage state={state} />

				<form action={formAction} className="grid gap-5 mt-4">
					<div className="space-y-2">
						<Label htmlFor="name" className="text-foreground font-semibold">
							List Name <span className="text-destructive">*</span>
						</Label>
						<Input
							id="name"
							name="name"
							placeholder="e.g., High Priority"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="suggestedLimit"
							className="flex items-center justify-between text-foreground font-semibold"
						>
							Suggested Limit
							<span className="text-xs text-muted-foreground font-normal">
								Optional
							</span>
						</Label>
						<Input
							id="suggestedLimit"
							name="suggestedLimit"
							type="number"
							min="1"
							placeholder="e.g., 5"
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
						<Button type="submit">Create</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
