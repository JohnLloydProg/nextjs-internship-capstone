import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
import { getProjects } from "@/lib/db/queries/projects";
import { getUserByClerkId } from "@/lib/db/queries/users";

export function ProjectGridSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{[1, 2, 3, 4, 5, 6].map((item) => (
				<div
					key={item}
					className="bg-foreground/20 animate-pulse w-85 h-56 rounded-xl"
				/>
			))}
		</div>
	);
}

export default async function ProjectGrid({
	status,
	search,
	newest,
}: {
	status?: "active" | "paused" | "closed";
	search?: string;
	newest?: boolean;
}) {
	const { userId } = await auth();
	if (!userId) return redirect("/sign-in");

	const user = await getUserByClerkId(userId);
	if (!user) notFound();

	const projects = await getProjects({
		status: status,
		userId: user.id,
		newest: newest,
		search: search,
	});

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{projects.map((proj) => (
				<ProjectCard key={proj.id} project={proj} />
			))}
		</div>
	);
}
