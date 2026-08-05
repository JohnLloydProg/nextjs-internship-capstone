import KanbanBoard from "@/components/kanban-board";
import { getListsByProjectId } from "@/lib/db/queries/lists";
import { getMembersByProject } from "@/lib/db/queries/users";

export default async function KanbanPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const [lists, members] = await Promise.all([
		getListsByProjectId(id),
		getMembersByProject(id),
	]);
	return <KanbanBoard projectId={id} lists={lists} members={members} />;
}
