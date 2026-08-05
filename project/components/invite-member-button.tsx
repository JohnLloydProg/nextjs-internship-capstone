import { UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { InviteMemberModal } from "./invite-member-modal";

export default function InviteMemberButton({
	projectId,
}: {
	projectId: string;
}) {
	const [isOpen, setOpen] = useState<boolean>(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>
				<UserPlus className="w-4 h-4 mr-2" />
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
