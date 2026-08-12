"use client";

import { FilePlus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useLists } from "@/hooks/use-lists";
import { useMembers } from "@/hooks/use-members";
import { getHistoryAction } from "@/lib/actions/tasks";
import type { Task, TaskHistory } from "../types/index";

const FIELD_LABELS: Record<string, string> = {
	title: "Title",
	description: "Description",
	listId: "List",
	priority: "Priority",
	assigneeId: "Assignee",
	dueDate: "Due Date",
};

function formatFieldValue(
	fieldName: string,
	value: string | null,
	lists: { id: string; name: string }[],
	members: { id: string; firstName: string; lastName: string }[],
): string {
	if (value === null || value === "") {
		return fieldName === "assigneeId" ? "Unassigned" : "—";
	}

	switch (fieldName) {
		case "listId": {
			const list = lists.find((l) => l.id === value);
			return list ? list.name : "Unknown list";
		}
		case "assigneeId": {
			const member = members.find((m) => m.id === value);
			return member
				? `${member.firstName} ${member.lastName}`
				: "Unknown member";
		}
		case "priority":
			return value.charAt(0).toUpperCase() + value.slice(1);
		case "dueDate": {
			const date = new Date(value);
			return Number.isNaN(date.getTime())
				? value
				: date.toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric",
					});
		}
		case "description":
			return value.length > 60 ? `${value.slice(0, 60)}…` : value;
		default:
			return value;
	}
}

function formatTimestamp(date: Date | string): string {
	const d = new Date(date);
	return d.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

function Avatar({
	member,
}: {
	member: {
		firstName: string;
		lastName: string;
		profilePic: string | null;
	} | null;
}) {
	return (
		<div className="w-7 h-7 rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
			{member?.profilePic ? (
				<Image
					src={member.profilePic}
					alt={`${member.firstName} ${member.lastName}`}
					width={28}
					height={28}
					className="w-full h-full object-cover"
				/>
			) : member ? (
				`${member.firstName[0]}${member.lastName[0]}`
			) : (
				"?"
			)}
		</div>
	);
}

export default function ActivityPanel({ task }: { task: Task }) {
	const lists = useLists((state) => state.lists);
	const members = useMembers((state) => state.members);
	const [history, setHistory] = useState<Record<string, TaskHistory[]>>({});
	const [_loading, startTransition] = useTransition();

	useEffect(() => {
		startTransition(async () => {
			setHistory(await getHistoryAction(task.id));
		});
	}, [task]);

	const groupedEdits = Object.entries(history);

	return (
		<div className="flex flex-col gap-3 h-50 overflow-y-auto scrollbar-thin pr-1">
			{groupedEdits.map(([editId, changes]) => {
				const editor = changes[0].changedBy ?? null;

				return (
					<div key={editId} className="flex items-start gap-2.5">
						<Avatar member={editor} />
						<div className="flex-1 min-w-0 pt-0.5">
							<p className="text-xs text-foreground font-semibold">
								{editor
									? `${editor.firstName} ${editor.lastName}`
									: "Unknown user"}
							</p>
							<div className="flex flex-col gap-0.5 mt-0.5">
								{changes.map((change) => (
									<p key={change.id} className="text-xs text-muted-foreground">
										<span className="font-medium text-foreground">
											{FIELD_LABELS[change.fieldName] ?? change.fieldName}
										</span>{" "}
										changed from{" "}
										<span className="italic">
											{formatFieldValue(
												change.fieldName,
												change.oldValue,
												lists,
												members,
											)}
										</span>{" "}
										to{" "}
										<span className="italic text-foreground">
											{formatFieldValue(
												change.fieldName,
												change.newValue,
												lists,
												members,
											)}
										</span>
									</p>
								))}
							</div>
							<p className="text-[10px] text-muted-foreground mt-1">
								{formatTimestamp(changes[0].changedAt)}
							</p>
						</div>
					</div>
				);
			})}
			<div className="flex items-start gap-2.5">
				<div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
					<FilePlus className="w-3.5 h-3.5 text-primary" />
				</div>
				<div className="flex-1 min-w-0 pt-0.5">
					<p className="text-xs text-foreground font-semibold">Task created</p>
					<p className="text-[10px] text-muted-foreground">
						{formatTimestamp(task.createdAt)}
					</p>
				</div>
			</div>
		</div>
	);
}
