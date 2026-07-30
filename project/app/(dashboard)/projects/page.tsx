import { Suspense } from "react";
import { CreateProjectButton } from "@/components/create-project-button";
import { FilterModal } from "@/components/filter-modal";
import SearchBar from "@/components/searchBar";
import ProjectGrid, { ProjectGridSkeleton } from "./projectGrid";

type statusType = "active" | "paused" | "closed" | undefined;

export default async function ProjectsPage({
	searchParams,
}: {
	searchParams: Promise<{
		status: string;
		nameSearch: string;
		newest: string;
	}>;
}) {
	const { status, nameSearch, newest } = await searchParams;
	let safeStatus: statusType;
	switch (status) {
		case "active":
			safeStatus = "active";
			break;
		case "paused":
			safeStatus = "paused";
			break;
		case "closed":
			safeStatus = "closed";
			break;
		default:
			safeStatus = undefined;
			break;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center mt-10">
				<div>
					<h1 className="text-4xl font-bold text-outer_space-500 dark:text-platinum-500">
						Projects
					</h1>
					<p className="text-payne's_gray-500 dark:text-french_gray-500 mt-2">
						Manage and organize your team projects
					</p>
				</div>
				<CreateProjectButton />
			</div>

			{/*<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
				<h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
					📋 Projects Page Implementation Tasks
				</h3>
				<ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
					<li>• Task 4.1: Implement project CRUD operations</li>
					<li>• Task 4.2: Create project listing and dashboard interface</li>
					<li>• Task 4.5: Design and implement project cards and layouts</li>
					<li>
						• Task 4.6: Add project and task search/filtering capabilities
					</li>
				</ul>
			</div>*/}

			<div className="flex flex-col sm:flex-row gap-5 items-center">
				<FilterModal />
				<SearchBar />
			</div>

			<Suspense fallback={<ProjectGridSkeleton />}>
				<ProjectGrid
					status={safeStatus}
					search={nameSearch || ""}
					newest={newest === "true"}
				/>
			</Suspense>
		</div>
	);
}
