"use client";

import { CollisionPriority } from "@dnd-kit/abstract";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Trash2 } from "lucide-react";
import { type KeyboardEvent, useEffect, useState, useTransition } from "react";
import CreateListModal from "@/components/create-list-button";
import CreateTaskButton from "@/components/create-task-button";
import TaskCard from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLists } from "@/hooks/use-lists";
import { useMembers } from "@/hooks/use-members";
import {
	deleteListAction,
	reorderListsAction,
	updateListAction,
} from "@/lib/actions/lists";
import { moveTasksAction } from "@/lib/actions/tasks";
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

function arrayMove<T>(array: T[], from: number, to: number): T[] {
	const copy = array.slice();
	const [moved] = copy.splice(from, 1);
	copy.splice(to, 0, moved);
	return copy;
}

function findTaskLocation(lists: List[], taskId: string) {
	for (let listIndex = 0; listIndex < lists.length; listIndex++) {
		const taskIndex = lists[listIndex].tasks.findIndex((t) => t.id === taskId);
		if (taskIndex !== -1) return { listIndex, taskIndex };
	}
	return null;
}

export function BoardColumn({
	index,
	list,
	projectId,
	createWidget,
}: {
	index: number;
	list: List;
	projectId: string;
	createWidget: React.ReactNode;
}) {
	const { ref: columnRef, handleRef: columnHandleRef } = useSortable({
		id: list.id,
		index,
		type: "column",
		accept: "column",
		group: "board",
	});

	const { ref: dropZoneRef } = useDroppable({
		id: `dropzone-${list.id}`,
		type: "column",
		accept: "task",
		collisionPriority: CollisionPriority.Low,
	});

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
		<div
			ref={columnRef}
			className="group w-80 h-fit bg-card rounded-md border border-border flex flex-col overflow-hidden"
		>
			<div
				ref={columnHandleRef}
				className="px-5 py-3 min-h-14 flex items-center justify-between group-hover:bg-primary/40 text-foreground bg-foreground/20 transition-colors"
			>
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

			<div ref={dropZoneRef} className="p-4 flex flex-col gap-4">
				{list.tasks.map((task, index) => (
					<TaskCard
						key={task.id}
						index={index}
						task={task}
						projectId={projectId}
						group={list.id}
					/>
				))}
				{createWidget}
			</div>
		</div>
	);
}

export default function KanbanBoard({
	projectId,
	lists,
	members,
}: {
	projectId: string;
	lists: List[];
	members: User[];
}) {
	const setLists = useLists((state) => state.setLists);
	const setMembers = useMembers((state) => state.setMembers);
	const dynamicLists = useLists((state) => state.lists);

	const [, startTransition] = useTransition();

	useEffect(() => {
		setLists(lists);
		setMembers(members);
	}, [lists, members, setLists, setMembers]);

	const handleDragOver = (event: any) => {
		const source = event.operation.source;
		const target = event.operation.target;
		if (source?.type !== "task" || !target) return;

		const activeId = source.id as string;
		const overId = target.id as string;

		setLists((current) => {
			const activeLocation = findTaskLocation(current, activeId);
			if (!activeLocation) return current;

			let overListIndex: number;
			let overTaskIndex: number | null = null;

			if (overId.startsWith("dropzone-")) {
				const listId = overId.replace("dropzone-", "");
				overListIndex = current.findIndex((l) => l.id === listId);
			} else {
				const overLocation = findTaskLocation(current, overId);
				if (!overLocation) return current;
				overListIndex = overLocation.listIndex;
				overTaskIndex = overLocation.taskIndex;
			}

			if (overListIndex === -1) return current;
			if (
				activeLocation.listIndex === overListIndex &&
				(overTaskIndex === null || overTaskIndex === activeLocation.taskIndex)
			) {
				return current;
			}

			const next = current.map((list) => ({ ...list, tasks: [...list.tasks] }));
			const [movedTask] = next[activeLocation.listIndex].tasks.splice(
				activeLocation.taskIndex,
				1,
			);
			const destination = next[overListIndex];
			const insertAt = overTaskIndex ?? destination.tasks.length;
			destination.tasks.splice(insertAt, 0, {
				...movedTask,
				listId: destination.id,
			});

			return next;
		});
	};

	const handleDragEnd = (event: any) => {
		if (event.canceled) return;
		console.log("run drag end");

		const source = event.operation.source;
		if (!source) return;
		console.log(source);

		if (source.type === "column") {
			if (source.initialIndex === source.index) return;
			console.log("update column");

			setLists((current) => {
				return arrayMove(current, source.initialIndex, source.index);
			});

			const updates = useLists.getState().lists.map((list, listIndex) => ({
				id: list.id,
				position: listIndex,
			}));
			startTransition(() => {
				reorderListsAction(projectId, updates);
			});
			return;
		}

		if (source.type === "task") {
			console.log("update tasks");
			const updates = useLists.getState().lists.flatMap((list) =>
				list.tasks.map((task, taskIndex) => ({
					id: task.id,
					listId: list.id,
					position: taskIndex,
				})),
			);
			startTransition(() => {
				moveTasksAction(projectId, updates);
			});
		}
	};

	return (
		<DragDropProvider onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
			<div className="flex flex-col w-full max-w-6xl overflow-x-auto scrollbar-thin">
				<div className="flex flex-col lg:flex-row gap-6 p-5 w-fit min-h-[calc(100vh-180px)]">
					{dynamicLists.map((list, index) => (
						<BoardColumn
							key={list.id}
							index={index}
							list={list}
							projectId={projectId}
							createWidget={
								<CreateTaskButton
									projectId={projectId}
									defaultListId={list.id}
									lists={lists}
									members={members}
								/>
							}
						/>
					))}
					<CreateListModal projectId={projectId} position={lists.length} />
				</div>
			</div>
		</DragDropProvider>
	);
}
