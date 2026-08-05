"use client";

import { UserPlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { InviteMemberModal } from "./modals/invite-member-modal";

export default function InviteMemberButton({
	projectId,
	variant = "default",
	className,
}: {
	projectId: string;
	variant?:
		| "default"
		| "link"
		| "outline"
		| "secondary"
		| "ghost"
		| "destructive"
		| null;
	className?: string;
}) {
	const [isOpen, setOpen] = useState<boolean>(false);

	return (
		<>
			<Button
				onClick={() => setOpen(true)}
				className={className}
				variant={variant}
			>
				<UserPlusIcon className="w-4 h-4 mr-2" />
				Invite Member
			</Button>
			<InviteMemberModal
				projectId={projectId}
				open={isOpen}
				onOpenChange={setOpen}
			/>
		</>
	);
}
