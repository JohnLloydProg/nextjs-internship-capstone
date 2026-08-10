"use client";

import { Loader2, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeAssignmentAction } from "@/lib/actions/users";
import type { Member } from "../types/index";
import EditPermissionsModal from "./modals/update-permission-modal";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./ui/alert-dialog";

export default function MemberActionsMenu({
	member,
	projectId,
	isOwner,
	isCurrentUser,
}: {
	member: Member;
	projectId: string;
	isOwner: boolean;
	isCurrentUser: boolean;
}) {
	const [isRemoveOpen, setIsRemoveOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isLoading, startTransition] = useTransition();
	const router = useRouter();

	function handleConfirmRemove() {
		startTransition(async () => {
			await removeAssignmentAction(projectId, member.id);
			setIsRemoveOpen(false);
		});
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="w-6 h-6 -mr-1">
						<MoreHorizontal className="w-4 h-4 text-muted-foreground" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-40">
					<DropdownMenuItem
						onSelect={() => {
							router.push(`/projects/${projectId}/members`);
						}}
					>
						View Profile
					</DropdownMenuItem>
					{isOwner && !isCurrentUser && (
						<DropdownMenuItem
							onSelect={(e) => {
								e.preventDefault();
								setIsEditOpen(true);
							}}
						>
							Edit Permissions
						</DropdownMenuItem>
					)}
					{isOwner && !isCurrentUser && (
						<DropdownMenuItem
							className="text-destructive focus:text-destructive"
							onSelect={(e) => {
								e.preventDefault();
								setIsRemoveOpen(true);
							}}
						>
							Remove Member
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove this member?</AlertDialogTitle>
						<AlertDialogDescription>
							{`${member.firstName} ${member.lastName} will lose access to this project. This action cannot be undone.`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isLoading}>Back</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={isLoading}
							onClick={(e) => {
								e.preventDefault();
								handleConfirmRemove();
							}}
						>
							{isLoading ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								"Confirm"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<EditPermissionsModal
				member={member}
				projectId={projectId}
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
			/>
		</>
	);
}
