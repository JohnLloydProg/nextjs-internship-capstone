import { notFound } from "next/navigation";
import KanbanBoard from "@/components/kanban-board";
import { getListsByProjectId } from "@/lib/db/queries/lists";
import { getProjectById } from "@/lib/db/queries/projects";
import { getMembersByProject } from "@/lib/db/queries/users";

export default async function KanbanPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const project = await getProjectById(id);
	if (!project) notFound();

	const [lists, members] = await Promise.all([
		getListsByProjectId(id),
		getMembersByProject(id),
	]);

	members.push({
		role: "owner",
		...project.owner,
	});
	members.sort((a) => (a.role === "owner" ? -1 : 1));
	return <KanbanBoard projectId={id} lists={lists} members={members} />;
}
