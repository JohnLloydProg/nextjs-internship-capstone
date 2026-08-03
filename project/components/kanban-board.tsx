"use client";

import { Trash2 } from "lucide-react";
import { type KeyboardEvent, useState, useTransition } from "react";
import { CreateListModal } from "@/components/create-list-button";
import { CreateTaskModal } from "@/components/create-task-button";
import TaskCard from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteListAction, updateListAction } from "@/lib/actions/lists";
import type { List, User } from "@/types/index";

// TODO: Task 5.1 - Design responsive Kanban board layout
// TODO: Task 5.2 - Implement drag-and-drop functionality with dnd-kit

/*
TODO: Implementation Notes for Interns:

This is the main Kanban board component that should:
- Display columns (lists) horizontally
- Allow drag and drop of tasks between columns
- Support adding new tasks and columns
- Handle real-time updates
- Be responsive on mobile

Key dependencies to install:
- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities

Features to implement:
- Drag and drop tasks between columns
- Drag and drop to reorder tasks within columns
- Add new task button in each column
- Add new column functionality
- Optimistic updates (Task 5.4)
- Real-time persistence (Task 5.5)
- Mobile responsive design
- Loading states
- Error handling

State management:
- Use Zustand store for board state (Task 5.3)
- Implement optimistic updates
- Handle conflicts with server state
*/

export function BoardColumn({
	list,
	projectId,
	members,
}: {
	list: List;
	projectId: string;
	members: User[];
}) {
	const [_isLoading, startTransition] = useTransition();
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [titleValue, setTitleValue] = useState(list.name);

	const [isEditingLimit, setIsEditingLimit] = useState(false);
	const [limitValue, setLimitValue] = useState(
		list.suggestedLimit ? list.suggestedLimit.toString() : "",
	);

	const handleTitleDoubleClick = () => setIsEditingTitle(true);
	const handleTitleBlur = () => {
		startTransition(async () => {
			await updateListAction(
				projectId,
				list.id,
				titleValue,
				Number(limitValue),
			);
		});
		setIsEditingTitle(false);
	};
	const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") handleTitleBlur();
		if (e.key === "Escape") {
			setTitleValue(list.name);
			setIsEditingTitle(false);
		}
	};

	const handleLimitDoubleClick = () => setIsEditingLimit(true);
	const handleLimitBlur = () => {
		startTransition(async () => {
			await updateListAction(
				projectId,
				list.id,
				titleValue,
				Number(limitValue),
			);
		});
		setIsEditingLimit(false);
	};
	const handleLimitKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") handleLimitBlur();
		if (e.key === "Escape") {
			setLimitValue(list.suggestedLimit ? list.suggestedLimit.toString() : "");
			setIsEditingLimit(false);
		}
	};

	const handleDeleteList = () => {
		startTransition(async () => {
			await deleteListAction(projectId, list.id);
		});
	};

	const currentLimit = Number(limitValue) || Infinity;
	const isOverLimit =
		currentLimit !== Infinity && list.tasks.length > currentLimit;

	return (
		<div className="group w-80 h-fit bg-card rounded-md border border-border flex flex-col overflow-hidden">
			<div className="px-5 py-3 min-h-14 flex items-center justify-between group-hover:bg-primary/40 text-foreground bg-foreground/20 transition-colors">
				<div className="flex-1 mr-3 min-w-0">
					{isEditingTitle ? (
						<Input
							autoFocus
							value={titleValue}
							onChange={(e) => setTitleValue(e.target.value)}
							onBlur={handleTitleBlur}
							onKeyDown={handleTitleKeyDown}
							className="h-8 font-bold text-base bg-background px-2"
						/>
					) : (
						<button
							type="button"
							onDoubleClick={handleTitleDoubleClick}
							title="Double-click to edit"
							className="font-bold text-base cursor-text block truncate select-none"
						>
							{titleValue}
						</button>
					)}
				</div>

				<div className="flex items-center gap-2 shrink-0">
					{isEditingLimit ? (
						<Input
							autoFocus
							type="number"
							min="1"
							value={limitValue}
							onChange={(e) => setLimitValue(e.target.value)}
							onBlur={handleLimitBlur}
							onKeyDown={handleLimitKeyDown}
							className="h-7 w-16 text-center text-xs font-bold bg-background px-1"
							placeholder="∞"
						/>
					) : (
						<button
							type="button"
							onDoubleClick={handleLimitDoubleClick}
							title="Double-click to set limit"
							className={`text-black text-xs font-bold px-2 h-6 flex items-center justify-center rounded-sm cursor-text select-none transition-colors ${
								isOverLimit ? "bg-red-300" : "bg-white"
							}`}
						>
							{list.tasks.length}/{limitValue || "∞"}
						</button>
					)}

					<Button
						variant="ghost"
						size="icon"
						onClick={handleDeleteList}
						className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
					>
						<Trash2 className="w-4 h-4" />
						<span className="sr-only">Delete List</span>
					</Button>
				</div>
			</div>

			<div className="p-4 flex flex-col gap-4">
				{list.tasks.map((task) => (
					<TaskCard
						key={task.id}
						task={task}
						projectId={projectId}
						members={members}
					/>
				))}
				<CreateTaskModal
					projectId={projectId}
					members={members}
					listId={list.id}
					position={list.tasks.length}
				/>
			</div>
		</div>
	);
}

export function KanbanBoard({
	projectId,
	lists,
	members,
}: {
	projectId: string;
	lists: List[];
	members: User[];
}) {
	return (
		<div className="flex flex-col w-full max-w-6xl overflow-x-auto scrollbar-thin">
			<div className="flex flex-col lg:flex-row gap-6 p-5 w-fit min-h-[calc(100vh-180px)]">
				{lists.map((list) => (
					<BoardColumn
						key={list.id}
						list={list}
						projectId={projectId}
						members={members}
					/>
				))}
				<CreateListModal projectId={projectId} position={lists.length} />
			</div>
		</div>
	);
}
