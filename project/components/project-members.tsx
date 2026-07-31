"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { Member } from "@/types/index";
import { InviteMemberModal } from "./invite-member-modal";

export default function ProjectMembersDisplay({
	projectId,
	users,
}: {
	projectId: string;
	users: Member[];
}) {
	const [selectedUserId, setSelectedUserId] = React.useState<string | null>();

	const selectedUser = users.find((user) => user.id === selectedUserId) || null;

	return (
		<div className="flex flex-col md:flex-row gap-8 items-start w-full max-w-6xl">
			<nav className="w-full md:w-64 shrink-0 flex flex-col gap-5 h-full">
				<InviteMemberModal projectId={projectId} />
				<div className="w-full h-full overflow-y-auto">
					<div className="h-fit w-full shrink-0 flex flex-col gap-2">
						{users.map((user) => {
							const isActive = user.id === selectedUserId;
							return (
								<button
									type="button"
									key={user.id}
									onClick={() => setSelectedUserId(user.id)}
									className={`flex items-center justify-between px-5 py-3 rounded-md text-base transition-colors border ${
										isActive
											? "border-primary text-primary font-medium"
											: "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
									}`}
								>
									<span>
										{user.firstName} {user.lastName}
									</span>
									{isActive && <ChevronRight className="w-4 h-4" />}
								</button>
							);
						})}
					</div>
				</div>
			</nav>

			<div className="flex-1 w-full bg-card border border-border rounded-xl shadow-sm p-8">
				{!selectedUser ? (
					// Empty State Placeholder
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
					// Selected User Details
					<div className="animate-in fade-in duration-300">
						<div className="flex items-center gap-6 mb-8">
							<div className="w-24 h-24 rounded-full border-2 border-primary bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0">
								{selectedUser.profilePic ? (
									<Image
										src={selectedUser.profilePic}
										alt={`${selectedUser.firstName}'s avatar`}
										width={96}
										height={96}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold text-2xl">
										{selectedUser.firstName[0]}
										{selectedUser.lastName[0]}
									</div>
								)}
							</div>
							<div>
								<h2 className="text-2xl font-bold text-foreground tracking-tight">
									{selectedUser.firstName} {selectedUser.lastName}
								</h2>
								<p className="text-primary font-medium mt-1">
									{selectedUser.role.toUpperCase() || "NO ASSIGNED ROLE"}
								</p>
							</div>
						</div>

						<hr className="border-border mb-8" />

						<div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
							<div className="space-y-1.5">
								<Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									First Name
								</Label>
								<p className="text-foreground text-base font-medium">
									{selectedUser.firstName}
								</p>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Last Name
								</Label>
								<p className="text-foreground text-base font-medium">
									{selectedUser.lastName}
								</p>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Email Address
								</Label>
								<p className="text-foreground text-base font-medium">
									{selectedUser.email}
								</p>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Role
								</Label>
								<p className="text-foreground text-base font-medium">
									{selectedUser.role.toUpperCase() || "NO ASSIGNED ROLE"}
								</p>
							</div>

							<div className="space-y-2 md:col-span-2 mt-2">
								<Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Bio
								</Label>
								<div className="bg-muted/30 border border-border/50 rounded-lg p-4 min-h-30">
									{selectedUser.bio ? (
										<p className="text-foreground leading-relaxed">
											{selectedUser.bio}
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
