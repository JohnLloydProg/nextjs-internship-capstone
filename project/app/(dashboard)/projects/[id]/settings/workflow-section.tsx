import DeleteObserverButton from "@/components/delete-observer-button";
import CreateObserverModal from "@/components/modals/create-observer-modal";
import { getListsByProjectId } from "@/lib/db/queries/lists";
import { getMembersByProject } from "@/lib/db/queries/users";
import { getObserversByProjectId } from "@/lib/db/queries/workflow";
import type { Project } from "@/types/index";

const FIELD_LABELS: Record<string, string> = {
	listId: "List",
	priority: "Priority",
	assigneeId: "Assignee",
	dueDate: "Due Date",
	startedAt: "Start Date",
	finishedAt: "Finish Date",
};

export default async function AutomationSection({
	project,
}: {
	project: Project;
}) {
	const [observers, lists, members] = await Promise.all([
		getObserversByProjectId(project.id),
		getListsByProjectId(project.id),
		getMembersByProject(project.id),
	]);

	members.push({
		role: "owner",
		...project.owner,
	});
	members.sort((a) => (a.role === "owner" ? -1 : 1));

	function describeValue(fieldName: string, value: string) {
		if (fieldName === "listId")
			return lists.find((l) => l.id === value)?.name ?? value;
		if (fieldName === "assigneeId") {
			const member = members.find((m) => m.id === value);
			return member ? `${member.firstName} ${member.lastName}` : value;
		}
		if (value === "$now") return "now";
		return value;
	}

	return (
		<div className="bg-card border border-border rounded-xl shadow-sm p-8 w-full max-w-3xl">
			<div className="flex items-center justify-between mb-1">
				<h2 className="text-xl font-bold text-foreground tracking-tight">
					Automations
				</h2>
				<CreateObserverModal
					projectId={project.id}
					lists={lists}
					members={members}
				/>
			</div>
			<p className="text-muted-foreground text-sm mb-6">
				Automatically update tasks or notify people when a field changes.
			</p>

			{observers.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					No automations set up yet.
				</p>
			) : (
				<div className="flex flex-col gap-3">
					{observers.map((observer) => (
						<div
							key={observer.id}
							className="border border-border rounded-lg p-4 flex items-start justify-between gap-4"
						>
							<div className="text-sm text-foreground space-y-1">
								<p>
									<span className="font-semibold">When</span>{" "}
									{FIELD_LABELS[observer.fieldName]}{" "}
									{observer.event === "equals" ? (
										<>
											is set to{" "}
											<span className="font-semibold">
												{describeValue(
													observer.fieldName,
													observer.value ?? "",
												)}
											</span>
										</>
									) : (
										"changes"
									)}
								</p>
								{observer.setters.length > 0 && (
									<p className="text-muted-foreground">
										Set:{" "}
										{observer.setters
											.map(
												(a) =>
													`${FIELD_LABELS[a.fieldName]} → ${describeValue(a.fieldName, a.value)}`,
											)
											.join(", ")}
									</p>
								)}
								{observer.notifiers.length > 0 && (
									<p className="text-muted-foreground">
										Notify:{" "}
										{observer.notifiers
											.filter((n) => n.enabled)
											.map((n) => `${n.user.firstName} ${n.user.lastName}`)
											.join(", ")}
									</p>
								)}
							</div>
							<DeleteObserverButton
								projectId={project.id}
								observerId={observer.id}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
