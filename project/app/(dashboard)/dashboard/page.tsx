import { auth } from "@clerk/nextjs/server";
import { Clock, FolderOpen, ListChecks, Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateProjectButton } from "@/components/create-project-button";
import ActiveProjectRow from "@/components/dashboard/active-project-row";
import RecentCommentsWidget from "@/components/dashboard/recent-comments-widget";
import DashboardStatCard from "@/components/dashboard/stat-card";
import TaskDistributionWidget from "@/components/dashboard/task-distribution-widget";
import { Button } from "@/components/ui/button";
import {
	getActiveProjectsForUser,
	getDashboardStats,
	getRecentCommentsForUser,
	getTaskDistributionForUser,
} from "@/lib/db/queries/dashboard";
import { getUserByClerkId } from "@/lib/db/queries/users";

export default async function DashboardPage() {
	const { userId: clerkId } = await auth();
	if (!clerkId) redirect("/sign-in");

	const user = await getUserByClerkId(clerkId);
	if (!user) redirect("/sign-in");

	const [stats, activeProjects, distribution, recentComments] =
		await Promise.all([
			getDashboardStats(user.id),
			getActiveProjectsForUser(user.id, 3),
			getTaskDistributionForUser(user.id),
			getRecentCommentsForUser(user.id, 2),
		]);

	const completionPercent =
		stats.totalAssignedTasks > 0
			? Math.round(
					(stats.completedAssignedTasks / stats.totalAssignedTasks) * 100,
				)
			: 0;

	return (
		<div className="w-full max-w-6xl flex flex-col gap-6">
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-stretch mt-12">
				<DashboardStatCard
					label="Total Projects"
					value={stats.totalProjects.toString()}
					icon={FolderOpen}
				/>
				<DashboardStatCard
					label="Active Tasks"
					value={`${stats.completedAssignedTasks} / ${stats.totalAssignedTasks}`}
					icon={ListChecks}
					progress={{
						percent: completionPercent,
						label: `${completionPercent}% Completion`,
					}}
				/>
				<DashboardStatCard
					label="Pending Tasks"
					value={stats.pendingTasks.toString()}
					icon={Clock}
				/>

				<div className="flex flex-col justify-between lg:w-48">
					<Link href="/team">
						<Button className="w-full">
							<UserPlus className="w-4 h-4 mr-2" />
							Add Member
						</Button>
					</Link>
					<CreateProjectButton />
					<Link href="/projects">
						<Button className="w-full">
							<Plus className="w-4 h-4 mr-2" />
							Create Task
						</Button>
					</Link>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
				<div className="bg-card border border-border rounded-xl p-6 h-full">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
							Active Project Status
						</h3>
						<Link
							href="/projects"
							className="text-sm font-medium text-primary hover:underline"
						>
							View All
						</Link>
					</div>

					{activeProjects.length === 0 ? (
						<p className="text-sm text-muted-foreground py-8 text-center">
							No active projects yet.
						</p>
					) : (
						<div className="flex flex-col gap-3">
							{activeProjects.map((project) => (
								<ActiveProjectRow key={project.id} project={project} />
							))}
						</div>
					)}
				</div>

				<div className="flex flex-col gap-4">
					<TaskDistributionWidget data={distribution} />
					<RecentCommentsWidget comments={recentComments} />
				</div>
			</div>
		</div>
	);
}
