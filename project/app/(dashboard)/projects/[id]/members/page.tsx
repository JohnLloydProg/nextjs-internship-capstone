import ProjectMembersDisplay from "@/components/project-members";
import { getMembersByProject } from "@/lib/db/queries/users";

export default async function ProjectMembersPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const users = await getMembersByProject(id);

	return <ProjectMembersDisplay projectId={id} users={users} />;
}
