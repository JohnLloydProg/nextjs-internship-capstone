import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/dist/client/components/navigation";
import { getProjectById } from "@/lib/db/queries/projects";
import { userIsOwner } from "@/lib/db/queries/users";
import DeleteProjectSection from "./delete-project-section";
import ProjectDetailsForm from "./project-details-form";

export default async function ProjectSettingsDisplay({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const { userId } = await auth();
	if (!userId) return redirect("/sign-in");

	const isOwner = await userIsOwner(id, userId);

	const project = await getProjectById(id);
	if (!project) notFound();

	return (
		<div className="flex flex-col gap-8 w-full items-center">
			<div className="bg-card border border-border rounded-xl shadow-sm p-8 w-full max-w-3xl">
				<h2 className="text-xl font-bold text-foreground tracking-tight mb-1">
					Project Details
				</h2>
				<p className="text-muted-foreground text-sm mb-6">
					Update your project's name, description, status, and due date.
				</p>
				<ProjectDetailsForm project={project} isOwner={isOwner} />
			</div>

			{isOwner && (
				<div className="bg-card border border-destructive/40 rounded-xl shadow-sm p-8 w-full max-w-3xl">
					<h2 className="text-xl font-bold text-destructive tracking-tight mb-1">
						Danger Zone
					</h2>
					<p className="text-muted-foreground text-sm mb-6">
						Deleting a project permanently removes it, along with all its lists,
						tasks, comments, and member assignments. This cannot be undone.
					</p>
					<DeleteProjectSection project={project} />
				</div>
			)}
		</div>
	);
}
