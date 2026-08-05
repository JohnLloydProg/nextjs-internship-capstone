"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { List, User } from "../types/index";
import { CreateTaskModal } from "./modals/create-task-modal";

export function CreateTaskButton({
	projectId,
	members,
	lists,
	defaultListId,
}: {
	projectId: string;
	members: User[];
	lists: List[];
	defaultListId: string;
}) {
	const [isOpen, setOpen] = useState<boolean>(false);

	return (
		<>
			<Button variant="secondary" onClick={() => setOpen(true)}>
				<Plus className="w-4 h-4 mr-2" />
				Create Task
			</Button>
			<CreateTaskModal
				projectId={projectId}
				members={members}
				lists={lists}
				defaultListId={defaultListId}
				open={isOpen}
				onOpenChange={setOpen}
			/>
		</>
	);
}
