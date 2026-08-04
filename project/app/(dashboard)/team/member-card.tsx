import { auth } from "@clerk/nextjs/server";
import { Mail } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import MemberActionsMenu from "@/components/member-actions-menu";
import { Badge } from "@/components/ui/badge";
import { getProjectCountByUser } from "@/lib/db/queries/projects";
import { getUserByClerkId, userIsOwner } from "@/lib/db/queries/users";
import type { Member } from "@/types/index";

export default async function MemberCard({
	member,
	projectId,
}: {
	member: Member;
	projectId: string;
}) {
	const { userId: clerkId } = await auth();
	if (!clerkId) redirect("/sign-in");

	const user = await getUserByClerkId(clerkId);
	if (!user) redirect("/sign-in");

	const isOwner = await userIsOwner(projectId, clerkId);
	const count = await getProjectCountByUser(member.id);

	return (
		<div className="relative w-full bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center shadow-2xs">
			<div className="w-full flex items-center justify-between mb-2">
				<Badge
					className={
						member.role === "owner"
							? "bg-primary"
							: "bg-transparent border border-primary text-primary"
					}
				>
					{member.role.toUpperCase()}
				</Badge>
				<MemberActionsMenu
					projectId={projectId}
					member={member}
					isOwner={isOwner}
					isCurrentUser={member.id === user.id}
				/>
			</div>

			<div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mb-3">
				{member.profilePic ? (
					// eslint-disable-next-line @next/next/no-img-element
					<Image
						src={member.profilePic}
						alt={`${member.firstName} ${member.lastName}`}
						width={80}
						height={80}
						className="w-full h-full object-cover"
					/>
				) : null}
			</div>

			<h3 className="font-bold text-foreground">
				{member.firstName} {member.lastName}
			</h3>
			<p className="text-sm text-muted-foreground mb-3">{member.role}</p>
			<div className="bg-muted h-px w-full my-2" />
			<div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
				<Mail className="w-3.5 h-3.5" />
				<span>
					{member.email.slice(0, 20)}
					{member.email.length > 20 ? "..." : ""}
				</span>
			</div>

			<Badge className="bg-primary text-primary-foreground hover:bg-primary">
				{count} Project{count === 1 ? "" : "s"}
			</Badge>
		</div>
	);
}
