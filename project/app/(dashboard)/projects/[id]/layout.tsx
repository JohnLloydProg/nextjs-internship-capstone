import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getProjectById } from "@/lib/db/queries/projects";
import { notFound } from "next/navigation";
import type React from "react";
import { Button } from "@/components/ui/button";
import ProjectNavBar from "@/components/project-nav";

export default async function ProjectPage({
	params,
	children,
}: {
	params: Promise<{ id: string }>;
	children: React.ReactNode;
}) {
	/*
			<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
					🎯 Kanban Board Implementation Tasks
				</h3>
				<ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
					<li>• Task 5.1: Design responsive Kanban board layout</li>
					<li>
						• Task 5.2: Implement drag-and-drop functionality with dnd-kit
					</li>
					<li>
						• Task 5.4: Implement optimistic UI updates for smooth interactions
					</li>
					<li>• Task 5.6: Create task detail modals and editing interfaces</li>
				</ul>
			</div>

			<div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
				<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
					🛠️ Components & Features to Implement
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
					<div>
						<strong className="block mb-2">Core Components:</strong>
						<ul className="space-y-1 list-disc list-inside">
							<li>components/kanban-board.tsx</li>
							<li>components/task-card.tsx</li>
							<li>components/modals/create-task-modal.tsx</li>
							<li>stores/board-store.ts (Zustand)</li>
						</ul>
					</div>
					<div>
						<strong className="block mb-2">Advanced Features:</strong>
						<ul className="space-y-1 list-disc list-inside">
							<li>Drag & drop with @dnd-kit/core</li>
							<li>Real-time updates</li>
							<li>Task assignments & due dates</li>
							<li>Comments & activity history</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
	*/

	const { id } = await params;
	const project = await getProjectById(id);
	if (!project) notFound();

	return (
		<div className="w-full flex flex-col gap-8 h-full">
			<div className="flex flex-col gap-5">
				<div className="flex items-center gap-3 text-4xl font-bold tracking-tight">
					<Link
						href="/projects"
						className="text-foreground hover:opacity-80 transition-opacity"
					>
						Projects
					</Link>
					<ChevronRight
						className="w-6 h-6 text-muted-foreground"
						strokeWidth={2.5}
					/>
					<span className="text-primary font-medium">{project.name}</span>
				</div>

				<p className="text-muted-foreground">{project.description}</p>

				<ProjectNavBar projectId={project.id} />
			</div>

			{children}
		</div>
	);
}
