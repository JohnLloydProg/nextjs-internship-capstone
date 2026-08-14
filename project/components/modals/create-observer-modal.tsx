"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { List, TaskField, User } from "@/types/index";
import { createObserverAction } from "@/lib/actions/automation";

const FIELD_OPTIONS: { value: TaskField; label: string }[] = [
	{ value: "listId", label: "List" },
	{ value: "priority", label: "Priority" },
	{ value: "assigneeId", label: "Assignee" },
	{ value: "dueDate", label: "Due Date" },
	{ value: "startedAt", label: "Start Date" },
	{ value: "finishedAt", label: "Finish Date" },
];

const DATE_FIELDS: TaskField[] = ["dueDate", "startedAt", "finishedAt"];

function ValueInput({
	fieldName,
	value,
	onChange,
	lists,
	members,
}: {
	fieldName: TaskField;
	value: string;
	onChange: (value: string) => void;
	lists: List[];
	members: User[];
}) {
	if (fieldName === "listId") {
		return (
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select a list" />
				</SelectTrigger>
				<SelectContent>
					{lists.map((list) => (
						<SelectItem key={list.id} value={list.id}>
							{list.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	}

	if (fieldName === "assigneeId") {
		return (
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select a member" />
				</SelectTrigger>
				<SelectContent>
					{members.map((member) => (
						<SelectItem key={member.id} value={member.id}>
							{member.firstName} {member.lastName}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	}

	if (fieldName === "priority") {
		return (
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select priority" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="urgent">Urgent</SelectItem>
					<SelectItem value="high">High</SelectItem>
					<SelectItem value="medium">Medium</SelectItem>
					<SelectItem value="low">Low</SelectItem>
				</SelectContent>
			</Select>
		);
	}

	if (DATE_FIELDS.includes(fieldName)) {
		return (
			<div className="flex items-center gap-2">
				<Input
					type="date"
					value={value === "$now" ? "" : value}
					onChange={(e) => onChange(e.target.value)}
					disabled={value === "$now"}
					className="flex-1"
				/>
				<label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
					<input
						type="checkbox"
						checked={value === "$now"}
						onChange={(e) => onChange(e.target.checked ? "$now" : "")}
					/>
					Now
				</label>
			</div>
		);
	}

	return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
}

export default function CreateObserverModal({
	projectId,
	lists,
	members,
}: {
	projectId: string;
	lists: List[];
	members: User[];
}) {
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const [triggerField, setTriggerField] = useState<TaskField>("listId");
	const [event, setEvent] = useState<"changed" | "equals">("equals");
	const [triggerValue, setTriggerValue] = useState("");

	const [setActions, setSetActionsState] = useState<
		{ fieldName: TaskField; value: string }[]
	>([]);
	const [notifyUserIds, setNotifyUserIds] = useState<string[]>([]);

	const resetForm = () => {
		setTriggerField("listId");
		setEvent("equals");
		setTriggerValue("");
		setSetActionsState([]);
		setNotifyUserIds([]);
		setError(null);
	};

	const handleAddSetAction = () =>
		setSetActionsState((prev) => [
			...prev,
			{ fieldName: "startedAt", value: "$now" },
		]);

	const handleRemoveSetAction = (index: number) =>
		setSetActionsState((prev) => prev.filter((_, i) => i !== index));

	const toggleNotifyUser = (userId: string) =>
		setNotifyUserIds((prev) =>
			prev.includes(userId)
				? prev.filter((id) => id !== userId)
				: [...prev, userId],
		);

	const handleSubmit = () => {
		setError(null);
		startTransition(async () => {
			const result = await createObserverAction(projectId, {
				fieldName: triggerField,
				event,
				value: event === "equals" ? triggerValue : undefined,
				setActions,
				notifyUserIds,
			});
			if (result.success) {
				resetForm();
				setOpen(false);
			} else {
				setError(result.message ?? "Failed to create automation");
			}
		});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) resetForm();
				setOpen(next);
			}}
		>
			<DialogTrigger asChild>
				<Button variant="secondary">
					<Plus className="w-4 h-4 mr-2" />
					New Automation
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-lg bg-card border-border shadow-lg max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>New Automation</DialogTitle>
					<DialogDescription>
						When a task's field changes, automatically update other fields or
						notify people.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-5 mt-2">
					<div className="space-y-2">
						<Label className="font-semibold">When</Label>
						<div className="grid grid-cols-2 gap-3">
							<Select
								value={triggerField}
								onValueChange={(v) => setTriggerField(v as TaskField)}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{FIELD_OPTIONS.map((f) => (
										<SelectItem key={f.value} value={f.value}>
											{f.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={event}
								onValueChange={(v) => setEvent(v as "changed" | "equals")}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="equals">equals</SelectItem>
									<SelectItem value="changed">changes (any value)</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{event === "equals" && (
							<ValueInput
								fieldName={triggerField}
								value={triggerValue}
								onChange={setTriggerValue}
								lists={lists}
								members={members}
							/>
						)}
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label className="font-semibold">Then set</Label>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleAddSetAction}
							>
								<Plus className="w-3.5 h-3.5 mr-1" />
								Add
							</Button>
						</div>
						{setActions.length === 0 ? (
							<p className="text-xs text-muted-foreground">
								No field updates configured.
							</p>
						) : (
							setActions.map((action, index) => (
								<div key={action.fieldName} className="flex items-start gap-2">
									<Select
										value={action.fieldName}
										onValueChange={(v) =>
											setSetActionsState((prev) =>
												prev.map((a, i) =>
													i === index
														? { fieldName: v as TaskField, value: "" }
														: a,
												),
											)
										}
									>
										<SelectTrigger className="w-32 shrink-0">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{FIELD_OPTIONS.map((f) => (
												<SelectItem key={f.value} value={f.value}>
													{f.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<div className="flex-1">
										<ValueInput
											fieldName={action.fieldName}
											value={action.value}
											onChange={(v) =>
												setSetActionsState((prev) =>
													prev.map((a, i) =>
														i === index ? { ...a, value: v } : a,
													),
												)
											}
											lists={lists}
											members={members}
										/>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => handleRemoveSetAction(index)}
										className="shrink-0 text-muted-foreground hover:text-destructive"
									>
										<X className="w-4 h-4" />
									</Button>
								</div>
							))
						)}
					</div>

					<div className="space-y-2">
						<Label className="font-semibold">Notify</Label>
						<div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto scrollbar-thin border border-border rounded-lg p-2">
							{members.length === 0 ? (
								<p className="text-xs text-muted-foreground px-1">
									No members to notify.
								</p>
							) : (
								members.map((member) => (
									<label
										key={member.id}
										className="flex items-center gap-2 text-sm px-1 py-0.5"
									>
										<input
											type="checkbox"
											checked={notifyUserIds.includes(member.id)}
											onChange={() => toggleNotifyUser(member.id)}
										/>
										{member.firstName} {member.lastName}
									</label>
								))
							)}
						</div>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}
				</div>

				<DialogFooter className="mt-4 sm:justify-end gap-2">
					<DialogClose asChild>
						<Button type="button" variant="ghost">
							Cancel
						</Button>
					</DialogClose>
					<Button type="button" onClick={handleSubmit} disabled={isPending}>
						{isPending && <Loader2 className="w-4 h-4 animate-spin" />}
						Create Automation
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
