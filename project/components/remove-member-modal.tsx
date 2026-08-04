"use client";
import { Loader2, Trash2, XCircle } from "lucide-react";
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
import { removeAssignmentAction } from "@/lib/actions/users";
import type { AssignmentWithUser } from "./project-members";
import { Button } from "./ui/button";

export function RemoveMemberAlert({
	selected,
}: {
	selected: AssignmentWithUser;
}) {
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
	const [_isLoading, startTransition] = useTransition();
	const isPending = selected ? !selected.accepted : false;

	async function handleRemoveMember(userId: string) {
		setActionLoadingId(userId);
		startTransition(async () => {
			if (!selected.projectId || !userId) return;
			await removeAssignmentAction(selected.projectId, userId);
			setActionLoadingId(null);
		});
	}

	async function handleCancelInvite(userId: string) {
		setActionLoadingId(userId);
		startTransition(async () => {
			if (!selected.projectId || !userId) return;
			await removeAssignmentAction(selected.projectId, userId);
			setActionLoadingId(null);
		});
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="destructive"
					disabled={actionLoadingId === selected.userId}
				>
					{actionLoadingId === selected.userId ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : isPending ? (
						<XCircle className="w-4 h-4" />
					) : (
						<Trash2 className="w-4 h-4" />
					)}
					{isPending ? "Cancel Invitation" : "Remove Member"}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{isPending ? "Cancel this invitation?" : "Remove this member?"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{isPending
							? `This will revoke the pending invite for ${selected.user.firstName} ${selected.user.lastName}. They will no longer be able to accept it.`
							: `${selected.user.firstName} ${selected.user.lastName} will lose access to this project. This action cannot be undone.`}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Back</AlertDialogCancel>
					<AlertDialogAction
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						onClick={() =>
							isPending
								? handleCancelInvite(selected.userId)
								: handleRemoveMember(selected.userId)
						}
					>
						Confirm
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
