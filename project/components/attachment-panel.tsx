import { FileIcon, Loader2, Paperclip, X } from "lucide-react";
import Image from "next/image";
import {
	useActionState,
	useEffect,
	useRef,
	useState,
	useTransition,
} from "react";
import {
	createAttachmentAction,
	deleteAttachmentAction,
} from "@/lib/actions/attachments";
import { getAttachmentUrl } from "@/lib/storage";
import type { Task } from "../types/index";
import { Label } from "./ui/label";
import Link from "next/link";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentsPanel({
	task,
	projectId,
}: {
	task: Task;
	projectId: string;
}) {
	const [state, formAction, isPending] = useActionState(
		createAttachmentAction.bind(null, projectId).bind(null, task.id),
		null,
	);
	const formRef = useRef<HTMLFormElement>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [, startDeleteTransition] = useTransition();

	useEffect(() => {
		if (state?.success) formRef.current?.reset();
	}, [state]);

	const handleDelete = (attachmentId: string) => {
		setDeletingId(attachmentId);
		startDeleteTransition(async () => {
			await deleteAttachmentAction(projectId, task.id, attachmentId);
			setDeletingId(null);
		});
	};

	return (
		<div className="space-y-2">
			<Label className="text-foreground font-semibold">Attachments</Label>

			{task.attachments.length === 0 ? (
				<div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 min-h-16 flex items-center justify-center">
					<p className="text-xs text-muted-foreground text-center">
						No attachments yet
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-thin">
					{task.attachments.map((attachment) => (
						<div
							key={attachment.id}
							className="group/attachment flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2"
						>
							<div className="w-9 h-9 rounded-md bg-background border border-border overflow-hidden shrink-0 flex items-center justify-center">
								{attachment.mimeType.startsWith("image/") ? (
									<Image
										src={getAttachmentUrl(attachment.storageKey)}
										alt={attachment.fileName}
										width={36}
										height={36}
										className="w-full h-full object-cover"
									/>
								) : (
									<FileIcon className="w-4 h-4 text-muted-foreground" />
								)}
							</div>
							<Link
								href={getAttachmentUrl(attachment.storageKey)}
								target="_blank"
								rel="noopener noreferrer"
								title={attachment.fileName}
								className="flex-1 min-w-0"
							>
								<p className="text-xs font-medium text-foreground hover:text-primary truncate">
									{attachment.fileName}
								</p>
								<p className="text-[10px] text-muted-foreground">
									{formatBytes(attachment.sizeBytes)}
								</p>
							</Link>
							<button
								type="button"
								onClick={() => handleDelete(attachment.id)}
								disabled={deletingId === attachment.id}
								className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover/attachment:opacity-100 transition-opacity disabled:opacity-100"
							>
								{deletingId === attachment.id ? (
									<Loader2 className="w-3.5 h-3.5 animate-spin" />
								) : (
									<X className="w-3.5 h-3.5" />
								)}
							</button>
						</div>
					))}
				</div>
			)}

			<form ref={formRef} action={formAction} className="flex flex-col gap-1.5">
				<div className="flex items-center gap-2">
					<Input
						type="file"
						name="file"
						disabled={isPending}
						className="h-8 text-xs"
					/>
					<Button
						type="submit"
						variant="secondary"
						size="icon-sm"
						disabled={isPending}
						className="shrink-0"
					>
						{isPending ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
						) : (
							<Paperclip className="w-3.5 h-3.5" />
						)}
					</Button>
				</div>
				{state?.message && !state.success && (
					<p className="text-xs text-destructive">{state.message}</p>
				)}
			</form>
		</div>
	);
}
