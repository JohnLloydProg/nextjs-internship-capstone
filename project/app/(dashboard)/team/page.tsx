import { auth } from "@clerk/nextjs/server";
import { Search } from "lucide-react";
import { redirect } from "next/navigation";
import CreateTaskButton from "@/components/create-task-button";
import InviteMemberButton from "@/components/invite-member-button";
import TeamInviteRow from "@/components/team-invite-row";
import { Input } from "@/components/ui/input";
import { getListsByProjectId } from "@/lib/db/queries/lists";
import { getProjects } from "@/lib/db/queries/projects";
import {
	getInvitesByUser,
	getMembersByProject,
	getUserByClerkId,
	userIsOwner,
} from "@/lib/db/queries/users";
import type { Project } from "@/types/index";
import MemberCard from "./member-card";
import TeamSectionToggle from "./team-section-toggle";

export default async function TeamsPage() {
	const { userId } = await auth();
	if (!userId) return redirect("/sign-in");

	const user = await getUserByClerkId(userId);
	if (!user) return redirect("/sign-in");

	// Inferred queries — see notes below.
	const projects = await getProjects({
		userId: user.id,
		newest: true,
		search: "",
	});
	const invites = await getInvitesByUser(user.id);

	return (
		<div className="w-full max-w-6xl">
			<h1 className="text-4xl font-bold text-foreground tracking-tight mb-6">
				Teams
			</h1>

			<div className="flex flex-col lg:flex-row gap-6 items-start">
				<div className="flex-1 w-full flex flex-col gap-6">
					<div className="relative">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input
							name="q"
							placeholder="Search Member"
							className="pl-11 h-11 rounded-full border-primary/60 focus-visible:ring-primary"
						/>
					</div>

					{projects.map((project: Project) => (
						<ProjectTeamSection key={project.id} project={project} />
					))}
				</div>

				<div className="w-full lg:w-80 shrink-0 bg-card border border-border rounded-xl p-6">
					<h2 className="text-xl font-bold text-primary text-center mb-4">
						Team Invites
					</h2>
					<hr className="border-border mb-2" />
					{invites.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-6">
							No pending invites
						</p>
					) : (
						invites.map((invite) => (
							<TeamInviteRow
								key={`${invite.projectId}-${invite.userId}`}
								project={invite.project}
								user={user}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
}

async function ProjectTeamSection({ project }: { project: Project }) {
	const { userId: clerkId } = await auth();
	if (!clerkId) redirect("/sign-in");

	const isOwner = await userIsOwner(project.id, clerkId);

	const [members, lists] = await Promise.all([
		getMembersByProject(project.id),
		getListsByProjectId(project.id),
	]);
	members.push({
		role: "owner",
		...project.owner,
	});
	members.sort((a) => (a.role === "owner" ? -1 : 1));

	return (
		<TeamSectionToggle
			trigger={
				<h2 className="text-xl font-bold text-primary-foreground">
					{project.name}
				</h2>
			}
		>
			<div className="flex flex-col gap-5">
				{isOwner && (
					<div className="flex items-center gap-5">
						<InviteMemberButton
							projectId={project.id}
							className="w-fit"
							variant="secondary"
						/>
						<CreateTaskButton
							projectId={project.id}
							defaultListId=""
							members={members}
							lists={lists}
						/>
					</div>
				)}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
					{members.map((member) => (
						<MemberCard
							key={member.id}
							member={member}
							projectId={project.id}
						/>
					))}
				</div>
			</div>
		</TeamSectionToggle>
	);
}
