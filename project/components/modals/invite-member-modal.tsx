"use client";

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
import { inviteMemberAction } from "@/lib/actions/users";
import { FormMessage } from "../formMessage";

export function InviteMemberModal({
	projectId,
	open,
	onOpenChange,
}: {
	projectId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [state, formAction, _isLoading] = useActionState(
		inviteMemberAction.bind(null, projectId),
		null,
	);

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
			}}
		>
			<DialogContent className="sm:max-w-107 bg-card border-border shadow-lg">
				<DialogHeader>
					<DialogTitle className="text-foreground text-xl tracking-tight">
						Invite Member
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Invite a new team member to collaborate on this project.
					</DialogDescription>
				</DialogHeader>

				<FormMessage state={state} />

				<form action={formAction} className="grid gap-5 mt-4">
					<div className="space-y-2">
						<Label htmlFor="email" className="text-foreground font-semibold">
							Email Address <span className="text-destructive">*</span>
						</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="name@example.com"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="role" className="text-foreground font-semibold">
							Role <span className="text-destructive">*</span>
						</Label>
						<Select name="role" defaultValue="viewer" required>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="editor">Editor</SelectItem>
								<SelectItem value="commenter">Commenter</SelectItem>
								<SelectItem value="viewer">Viewer</SelectItem>
							</SelectContent>
						</Select>
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
						<Button type="submit">Send Invite</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
