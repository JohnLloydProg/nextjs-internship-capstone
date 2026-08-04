"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
	acceptInviteAction,
	removeAssignmentAction,
} from "@/lib/actions/users";
import type { Project, User } from "../types/index";

export default function TeamInviteRow({
	project,
	user,
}: {
	project: Project;
	user: User;
}) {
	const [isPending, startTransition] = useTransition();
	const [action, setAction] = useState<"accept" | "reject" | null>(null);

	function handleAccept() {
		setAction("accept");
		startTransition(async () => {
			await acceptInviteAction(project.id);
		});
	}

	function handleReject() {
		setAction("reject");
		startTransition(async () => {
			await removeAssignmentAction(project.id, user.id);
		});
	}

	return (
		<div className="py-4 border-b border-border last:border-b-0">
			<h4 className="font-bold text-foreground">{project.name}</h4>
			<p className="text-sm text-muted-foreground mb-3">
				Invited by: {project.owner.firstName} {project.owner.lastName}
			</p>
			<div className="flex items-center gap-2">
				<Button
					variant="secondary"
					size="sm"
					className="flex-1"
					disabled={isPending}
					onClick={handleReject}
				>
					{isPending && action === "reject" ? (
						<Loader2 className="w-3.5 h-3.5 animate-spin" />
					) : (
						"Reject"
					)}
				</Button>
				<Button
					size="sm"
					className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
					disabled={isPending}
					onClick={handleAccept}
				>
					{isPending && action === "accept" ? (
						<Loader2 className="w-3.5 h-3.5 animate-spin" />
					) : (
						"Accept"
					)}
				</Button>
			</div>
		</div>
	);
}
