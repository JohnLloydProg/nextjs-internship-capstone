"use client";

import { FileIcon, Loader2, Paperclip, X } from "lucide-react";
import { useActionState, useRef, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLists } from "@/hooks/use-lists";
import { useMembers } from "@/hooks/use-members";
import { createTaskAction } from "@/lib/actions/tasks";
import { formatBytes } from "@/lib/utils";

export function CreateTaskModal({
	projectId,
	defaultListId,
	open,
	onOpenChange,
}: {
	projectId: string;
	defaultListId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [state, formAction, isPending] = useActionState(
		createTaskAction.bind(null, projectId),
		null,
	);
	const lists = useLists((state) => state.lists);
	const members = useMembers((state) => state.members);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [stagedFiles, setStagedFiles] = useState<File[]>([]);

	const syncInputFiles = (files: File[]) => {
		const dataTransfer = new DataTransfer();
		for (const file of files) dataTransfer.items.add(file);
		if (fileInputRef.current) fileInputRef.current.files = dataTransfer.files;
	};

	const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		const incoming = Array.from(e.target.files ?? []);
		if (incoming.length === 0) return;

		const next = [...stagedFiles, ...incoming];
		setStagedFiles(next);
		syncInputFiles(next);
	};

	const handleRemoveFile = (index: number) => {
		const next = stagedFiles.filter((_, i) => i !== index);
		setStagedFiles(next);
		syncInputFiles(next);
	};

	const handleOpenChange = (next: boolean) => {
		if (!next) {
			setStagedFiles([]);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
		onOpenChange(next);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-3xl lg:max-w-4xl bg-card border-border shadow-lg">
				<DialogHeader>
					<DialogTitle className="text-foreground text-xl tracking-tight">
						New Task
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Fill in the details below to add a new task to your board.
					</DialogDescription>
				</DialogHeader>

				<form
					action={formAction}
					className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 mt-4"
				>
					<div className="flex flex-col gap-5">
						<div className="space-y-2">
							<Label htmlFor="title" className="text-foreground font-semibold">
								Task Title <span className="text-destructive">*</span>
							</Label>
							<Input
								id="title"
								name="title"
								placeholder="e.g., Update landing page hero"
								required
							/>
							{state?.errors?.title && (
								<p className="text-sm text-destructive">
									{state.errors.title[0]}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="description"
								className="flex items-center justify-between text-foreground font-semibold"
							>
								Description
								<span className="text-xs text-muted-foreground font-normal">
									Optional
								</span>
							</Label>
							<Textarea
								id="description"
								name="description"
								placeholder="Add more details about this task..."
								className="resize-none h-20"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-foreground font-semibold">
								List <span className="text-destructive">*</span>
							</Label>
							<Select name="listId" defaultValue={defaultListId} required>
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
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<div className="space-y-2">
								<Label className="text-foreground font-semibold">
									Priority
								</Label>
								<Select defaultValue="medium" name="priority">
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
							</div>

							<div className="space-y-2">
								<Label className="text-foreground font-semibold">
									Assignee
								</Label>
								<Select name="assigneeId">
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select team member" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">Unassigned</SelectItem>
										{members.map((member) => (
											<SelectItem key={member.id} value={member.id}>
												{member.firstName} {member.lastName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="dueDate"
								className="flex items-center justify-between text-foreground font-semibold"
							>
								Due Date
								<span className="text-xs text-muted-foreground font-normal">
									Optional
								</span>
							</Label>
							<Input
								id="dueDate"
								name="dueDate"
								type="date"
								className="text-foreground"
							/>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Label className="text-foreground font-semibold">Attachments</Label>

						{stagedFiles.length === 0 ? (
							<div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 min-h-16 flex items-center justify-center">
								<p className="text-xs text-muted-foreground text-center">
									No files selected
								</p>
							</div>
						) : (
							<div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-thin">
								{stagedFiles.map((file, index) => (
									<div
										key={`${file.name}-${file.lastModified}`}
										className="group/attachment flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2"
									>
										<div className="w-9 h-9 rounded-md bg-background border border-border overflow-hidden shrink-0 flex items-center justify-center">
											<FileIcon className="w-4 h-4 text-muted-foreground" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-xs font-medium text-foreground truncate">
												{file.name}
											</p>
											<p className="text-[10px] text-muted-foreground">
												{formatBytes(file.size)}
											</p>
										</div>
										<button
											type="button"
											onClick={() => handleRemoveFile(index)}
											className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
										>
											<X className="w-3.5 h-3.5" />
										</button>
									</div>
								))}
							</div>
						)}

						<label className="flex items-center justify-center gap-2 h-8 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary cursor-pointer transition-colors">
							<Paperclip className="w-3.5 h-3.5" />
							Add files
							<input
								ref={fileInputRef}
								type="file"
								name="files"
								multiple
								onChange={handleFilesSelected}
								className="hidden"
							/>
						</label>
						<p className="text-[10px] text-muted-foreground">
							Files upload once the task is created.
						</p>
					</div>

					<DialogFooter className="md:col-span-2 mt-2 sm:justify-end gap-2">
						<DialogClose asChild>
							<Button
								type="button"
								variant="ghost"
								className="text-muted-foreground hover:text-foreground"
							>
								Cancel
							</Button>
						</DialogClose>
						<Button type="submit" disabled={isPending}>
							{isPending && <Loader2 className="w-4 h-4 animate-spin" />}
							Create Task
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
