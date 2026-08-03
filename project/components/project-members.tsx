"use client";

import { ChevronRight, Loader2, Trash2, XCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { removeAssignmentAction } from "@/lib/actions/users";
import type { Project } from "../types/index";
import { InviteMemberModal } from "./invite-member-modal";

export type AssignmentWithUser = {
	projectId: string;
	userId: string;
	role: "editor" | "commenter" | "viewer" | "owner";
	accepted: boolean;
	createdAt: Date;
	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		profilePic: string | null;
		bio: string | null;
	};
};

function AlertModal({
	project,
	isOwner,
	selected,
}: {
	project: Project;
	isOwner: boolean;
	selected: AssignmentWithUser;
}) {
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
	const [_isLoading, startTransition] = useTransition();
	const isPending = selected ? !selected.accepted : false;

	async function handleRemoveMember(userId: string) {
		if (!isOwner) return;

		setActionLoadingId(userId);
		startTransition(async () => {
			if (!project.id || !userId) return;
			await removeAssignmentAction(project.id, userId);
			setActionLoadingId(null);
		});
	}

	async function handleCancelInvite(userId: string) {
		if (!isOwner) return;

		setActionLoadingId(userId);
		startTransition(async () => {
			if (!project.id || !userId) return;
			await removeAssignmentAction(project.id, userId);
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

export default function ProjectMembersDisplay({
	project,
	assignments,
	isOwner,
}: {
	project: Project;
	assignments: AssignmentWithUser[];
	isOwner: boolean;
}) {
	const [items, setItems] = useState<AssignmentWithUser[]>(assignments);
	const [selectedUserId, setSelectedUserId] = useState<string | null>();

	useEffect(() => {
		setItems(assignments);
	}, [assignments]);

	const selected = items.find((a) => a.userId === selectedUserId) || null;
	const isPending = selected ? !selected.accepted : false;

	return (
		<div className="flex flex-col md:flex-row gap-8 items-start w-full max-w-6xl">
			<nav className="w-full md:w-64 shrink-0 flex flex-col gap-5 h-full">
				{isOwner && <InviteMemberModal projectId={project.id} />}
				<div className="w-full h-full overflow-y-auto">
					<div className="h-fit w-full shrink-0 flex flex-col gap-2">
						{items.map((assignment) => {
							const { user } = assignment;
							const isActive = user.id === selectedUserId;
							const pending = !assignment.accepted;
							return (
								<button
									type="button"
									key={user.id}
									onClick={() => setSelectedUserId(user.id)}
									className={`flex items-center justify-between gap-2 px-5 py-3 rounded-md text-base transition-colors border ${
										isActive
											? "border-primary text-primary font-medium"
											: "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
									}`}
								>
									<span className="flex items-center gap-2 min-w-0">
										<span className="truncate">
											{user.firstName} {user.lastName}
										</span>
										{pending && (
											<Badge
												variant="outline"
												className="shrink-0 text-[10px] px-1.5 py-0"
											>
												Pending
											</Badge>
										)}
									</span>
									{isActive && <ChevronRight className="w-4 h-4 shrink-0" />}
								</button>
							);
						})}
					</div>
				</div>
			</nav>

			<div className="flex-1 w-full bg-card border border-border rounded-xl shadow-sm p-8">
				{!selected ? (
					<div className="flex flex-col items-center justify-center h-full min-h-100 text-center">
						<div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
							<Image
								src="/placeholder-user.jpg"
								alt="profile-pic"
								width={80}
								height={80}
								className="w-full h-full object-cover"
							/>
						</div>
						<h3 className="text-xl font-bold text-foreground tracking-tight mb-2">
							No Member Selected
						</h3>
						<p className="text-muted-foreground max-w-sm">
							Choose a team member from the list on the left to view their
							profile details and role information.
						</p>
					</div>
				) : (
					<div className="animate-in fade-in duration-300">
						<div className="flex items-start justify-between gap-6 mb-8">
							<div className="flex items-center gap-6">
								<div className="w-24 h-24 rounded-full border-2 border-primary bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0">
									{selected.user.profilePic ? (
										<Image
											src={selected.user.profilePic}
											alt={`${selected.user.firstName}'s avatar`}
											width={96}
											height={96}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold text-2xl">
											{selected.user.firstName[0]}
											{selected.user.lastName[0]}
										</div>
									)}
								</div>
								<div>
									<h2 className="text-2xl font-bold text-foreground tracking-tight">
										{selected.user.firstName} {selected.user.lastName}
									</h2>
									<div className="flex items-center gap-2 mt-1">
										<p className="text-primary font-medium">
											{selected.role.toUpperCase()}
										</p>
										{isPending && (
											<Badge variant="outline" className="text-xs">
												Pending invite
											</Badge>
										)}
									</div>
								</div>
							</div>
							{isOwner && selected.userId !== project.owner.id && (
								<AlertModal
									project={project}
									isOwner={isOwner}
									selected={selected}
								/>
							)}
						</div>

						<hr className="border-border mb-8" />

						<div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
							<div className="space-y-1.5">
								<Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									First Name
								</Label>
								<p className="text-foreground text-base font-medium">
									{selected.user.firstName}
								</p>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Last Name
								</Label>
								<p className="text-foreground text-base font-medium">
									{selected.user.lastName}
								</p>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Email Address
								</Label>
								<p className="text-foreground text-base font-medium">
									{selected.user.email}
								</p>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Role
								</Label>
								<p className="text-foreground text-base font-medium">
									{selected.role.toUpperCase()}
								</p>
							</div>

							<div className="space-y-2 md:col-span-2 mt-2">
								<Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Bio
								</Label>
								<div className="bg-muted/30 border border-border/50 rounded-lg p-4 min-h-30">
									{selected.user.bio ? (
										<p className="text-foreground leading-relaxed">
											{selected.user.bio}
										</p>
									) : (
										<p className="text-muted-foreground italic">
											No bio provided.
										</p>
									)}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
