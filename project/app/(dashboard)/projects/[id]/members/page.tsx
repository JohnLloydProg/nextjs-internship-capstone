import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/dist/client/components/navigation";
import type { AssignmentWithUser } from "@/components/project-members";
import ProjectMembersDisplay from "@/components/project-members";
import { getProjectById } from "@/lib/db/queries/projects";
import { getAssignmentByProject, userIsOwner } from "@/lib/db/queries/users";

export default async function ProjectMembersPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const project = await getProjectById(id);
	if (!project) return redirect("/projects");

	const { userId } = await auth();
	if (!userId) return redirect("/sign-in");

	const isOwner = await userIsOwner(id, userId);
	const assignments: AssignmentWithUser[] = await getAssignmentByProject(id);

	assignments.push({
		projectId: project.id,
		userId: project.owner.id,
		accepted: true,
		createdAt: project.createdAt,
		user: { ...project.owner },
		role: "owner",
	});
	assignments.sort((a, b) => {
		if (a.role === "owner") return -1;
		if (b.role === "owner") return 1;
		return a.createdAt.getTime() - b.createdAt.getTime();
	});

	return (
		<ProjectMembersDisplay
			project={project}
			assignments={assignments}
			isOwner={isOwner}
		/>
	);
}
