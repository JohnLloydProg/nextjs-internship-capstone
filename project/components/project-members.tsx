"use client";

import { ChevronRight, EditIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { Project, User } from "../types/index";
import InviteMemberButton from "./invite-member-button";
import EditPermissionsModal from "./modals/update-permission-modal";
import { RemoveMemberAlert } from "./remove-member-modal";
import { Button } from "./ui/button";

export type AssignmentWithUser = {
	projectId: string;
	userId: string;
	role: "editor" | "commenter" | "viewer" | "owner";
	accepted: boolean;
	createdAt: Date;
	user: User;
};

export default function ProjectMembersDisplay({
	project,
	assignments,
	isOwner,
}: {
	project: Project;
	assignments: AssignmentWithUser[];
	isOwner: boolean;
}) {
	const [isOpen, setOpen] = useState<boolean>(false);
	const [items, setItems] = useState<AssignmentWithUser[]>(assignments);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(
		project.owner.id,
	);

	useEffect(() => {
		setItems(assignments);
	}, [assignments]);

	const selected =
		items.find((a) => a.userId === selectedUserId) || assignments[0];
	const isPending = selected ? !selected.accepted : false;

	return (
		<div className="flex flex-col md:flex-row gap-8 items-start w-full max-w-6xl">
			<nav className="w-full md:w-64 shrink-0 flex flex-col gap-5 h-full">
				{isOwner && <InviteMemberButton projectId={project.id} />}
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
										{selected.user.jobPosition?.toUpperCase() ||
											"NO JOB POSITION"}
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
							<RemoveMemberAlert selected={selected} />
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
								Project Permission
							</Label>
							<div className="flex items-center">
								{isOwner && selected.userId !== project.owner.id && (
									<>
										<Button
											variant="ghost"
											onClick={() => {
												setOpen(true);
											}}
										>
											<EditIcon size={16} />
										</Button>
										<EditPermissionsModal
											projectId={project.id}
											open={isOpen}
											onOpenChange={setOpen}
											member={{ role: selected.role, ...selected.user }}
										/>
									</>
								)}
								<p className="text-foreground text-base font-medium">
									{selected.role.toUpperCase()}
								</p>
							</div>
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
			</div>
		</div>
	);
}
