"use client";

import { Loader2 } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { updateAssignmentRoleAction } from "@/lib/actions/users";
import type { Member } from "@/types/index";

export default function EditPermissionsModal({
	member,
	projectId,
	open,
	onOpenChange,
}: {
	member: Member;
	projectId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [role, setRole] = useState(member.role);
	const [isLoading, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	function handleSave() {
		setError(null);
		startTransition(async () => {
			const result = await updateAssignmentRoleAction(
				projectId,
				member.id,
				role,
			);
			if (result.success) {
				onOpenChange(false);
			} else {
				setError(result.message ?? "Failed to update permissions");
			}
		});
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!isLoading) {
					setRole(member.role);
					setError(null);
					onOpenChange(next);
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Permissions</DialogTitle>
					<DialogDescription>
						{`Change ${member.firstName} ${member.lastName}'s role on this project.`}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-1.5 py-2">
					<Label htmlFor="role">Role</Label>
					<Select
						value={role}
						onValueChange={(value) => setRole(value as Member["role"])}
						disabled={isLoading}
					>
						<SelectTrigger id="role">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="editor">Editor</SelectItem>
							<SelectItem value="commenter">Commenter</SelectItem>
							<SelectItem value="viewer">Viewer</SelectItem>
						</SelectContent>
					</Select>
					{error && <p className="text-sm text-destructive">{error}</p>}
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={isLoading}>
							Cancel
						</Button>
					</DialogClose>
					<Button
						onClick={handleSave}
						disabled={isLoading || role === member.role}
					>
						{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
