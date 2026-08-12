"use client";

import { FileIcon, Loader2, Paperclip, Send, X } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { createCommentAction } from "@/lib/actions/comments";
import { Button } from "./ui/button";

export default function CommentComposer({
	projectId,
	taskId,
}: {
	projectId: string;
	taskId: string | null;
}) {
	const boundAction = taskId
		? createCommentAction.bind(null, projectId).bind(null, taskId)
		: async () => ({ success: false as const, message: "Select a task first" });

	const [state, formAction, isPending] = useActionState(boundAction, null);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
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

	const disabled = !taskId || isPending;

	return (
		<div className="border-t border-border bg-muted/30 p-4">
			{state?.message && (
				<p
					className={`text-sm mb-2 ${
						state.success ? "text-muted-foreground" : "text-destructive"
					}`}
				>
					{state.message}
				</p>
			)}

			{stagedFiles.length > 0 && (
				<div className="flex flex-wrap gap-2 mb-2">
					{stagedFiles.map((file, index) => (
						<div
							key={`${file.name}-${file.lastModified}`}
							className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full border border-border bg-background text-xs text-foreground"
						>
							<FileIcon className="w-3 h-3 shrink-0 text-muted-foreground" />
							<span className="truncate max-w-28">{file.name}</span>
							<button
								type="button"
								onClick={() => handleRemoveFile(index)}
								className="text-muted-foreground hover:text-destructive"
							>
								<X className="w-3 h-3" />
							</button>
						</div>
					))}
				</div>
			)}

			<form
				ref={formRef}
				action={formAction}
				onSubmit={() => {
					setTimeout(() => setStagedFiles([]), 0);
				}}
				className="flex items-center gap-3"
			>
				<label
					className={`w-9 h-9 shrink-0 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground transition-colors ${
						taskId
							? "hover:text-foreground hover:border-primary cursor-pointer"
							: "opacity-50 cursor-not-allowed"
					}`}
				>
					<Paperclip className="w-4 h-4" />
					<input
						ref={fileInputRef}
						type="file"
						name="files"
						multiple
						disabled={!taskId}
						onChange={handleFilesSelected}
						className="hidden"
					/>
				</label>
				<input
					name="content"
					required
					placeholder={
						taskId ? "Write a comment..." : "Select a task to comment"
					}
					disabled={disabled}
					className="flex-1 h-9 rounded-full border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring disabled:opacity-50"
				/>
				<Button
					variant="secondary"
					size="icon-lg"
					type="submit"
					disabled={disabled}
					className="rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
				>
					{isPending ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						<Send className="w-4 h-4" />
					)}
				</Button>
			</form>
		</div>
	);
}
