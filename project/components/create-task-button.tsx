"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLists } from "@/hooks/use-lists";
import { useMembers } from "@/hooks/use-members";
import type { List, User } from "../types/index";
import { CreateTaskModal } from "./modals/create-task-modal";

export default function CreateTaskButton({
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
	const setMembers = useMembers((state) => state.setMembers);
	const setLists = useLists((state) => state.setLists);

	return (
		<>
			<Button
				variant="secondary"
				onClick={() => {
					setMembers(members);
					setLists(lists);
					setOpen(true);
				}}
			>
				<Plus className="w-4 h-4 mr-2" />
				Create Task
			</Button>
			<CreateTaskModal
				projectId={projectId}
				defaultListId={defaultListId}
				open={isOpen}
				onOpenChange={setOpen}
			/>
		</>
	);
}
