import Image from "next/image";
import Link from "next/link";
import type { ProjectWithMembers } from "@/lib/db/queries/projects";

/*
TODO: Implementation Notes for Interns:

This component should display:
- Project name and description
- Progress indicator
- Team member count
- Due date
- Status badge
- Actions menu (edit, delete, etc.)

Props interface:
interface ProjectCardProps {
  project: {
    id: string
    name: string
    description?: string
    progress: number
    memberCount: number
    dueDate?: Date
    status: 'active' | 'completed' | 'on-hold'
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

Features to implement:
- Hover effects
- Click to navigate to project board
- Responsive design
- Loading states
- Error states
*/

export function ProjectCard({ project }: { project: ProjectWithMembers }) {
	const getStatusStyles = (status: string) => {
		switch (status) {
			case "active":
				return "bg-[#bbf7d0] text-[#166534]";
			case "paused":
				return "bg-[#fef08a] text-[#854d0e]";
			case "closed":
				return "bg-[#fecaca] text-[#991b1b]";
			default:
				return "bg-zinc-100 text-zinc-600";
		}
	};

	return (
		<Link
			href={`/projects/${project.id}`}
			className="w-85 h-56 bg-card rounded-xl p-5 border-2 border-foreground/20 hover:border-primary shadow-md flex flex-col relative cursor-pointer"
		>
			<div className="flex items-center justify-between">
				<h3 className="text-xl font-bold text-foreground tracking-tight">
					{project.name}
				</h3>
				<div
					className={`px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide ${getStatusStyles(project.status)}`}
				>
					{project.status.toUpperCase()}
				</div>
			</div>

			{project.description && (
				<p className="text-xs text-muted-foreground mt-1 mb-4 text-justify">
					{project.description.slice(0, 100)}
					{project.description.length >= 100 && "..."}
				</p>
			)}

			<div className="mt-auto flex items-center gap-3">
				<div className="h-3 w-full bg-zinc-200 rounded-full overflow-hidden">
					<div
						className="h-full bg-linear-to-r from-[#9E7F1F] to-[#D1B252] rounded-full"
						style={{ width: `10%` }}
					/>
				</div>
				<span className="text-sm font-medium text-foreground">{10}%</span>
			</div>

			<div className="mt-6 flex items-center justify-between">
				<span className="text-base font-medium text-foreground">
					{project.dueDate?.toLocaleDateString() || "No Due Date"}
				</span>

				<div className="flex -space-x-3">
					{project.members.slice(0, 2).map((member, index) => (
						<div
							key={member.id}
							className="w-8 h-8 rounded-full bg-zinc-300 border-2 border-primary relative z-0 overflow-clip"
							style={{ zIndex: 3 - index - 1 }}
						>
							<Image
								src={member.profilePic || "/placeholder-user.jpg"}
								alt="profile pic"
								width={32}
								height={32}
								className="w-full h-full object-cover"
							/>
						</div>
					))}
					{project.members.length > 2 && (
						<div className="w-8 h-8 rounded-full bg-primary border-2 border-primary relative z-3 overflow-clip flex items-center justify-center">
							+{project.members.length - 2}
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}
