"use client";

import { FileIcon, Loader2, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState, useTransition } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	deleteCommentAction,
	updateCommentAction,
} from "@/lib/actions/comments";
import type { Comment } from "@/types/index";

const EDIT_WINDOW_MS = 300 * 1000;

export default function CommentContainer({
	comment,
	projectId,
	currentUserId,
}: {
	comment: Comment;
	projectId: string;
	currentUserId: string;
}) {
	const isAuthor = comment.author.id === currentUserId;
	const remainingAtMount =
		EDIT_WINDOW_MS - (Date.now() - new Date(comment.createdAt).getTime());

	const [canModify, setCanModify] = useState(isAuthor && remainingAtMount > 0);
	const [isEditing, setIsEditing] = useState(false);
	const [contentValue, setContentValue] = useState(comment.content);

	useEffect(() => {
		if (!isAuthor || remainingAtMount <= 0) return;
		const timeout = setTimeout(() => setCanModify(false), remainingAtMount);
		return () => clearTimeout(timeout);
	}, [isAuthor, remainingAtMount]);

	const [state, formAction, isPending] = useActionState(
		updateCommentAction.bind(null, projectId).bind(null, comment),
		null,
	);
	const [isDeleting, startDeleteTransition] = useTransition();

	useEffect(() => {
		if (state?.success) setIsEditing(false);
	}, [state]);

	const handleDelete = () => {
		startDeleteTransition(async () => {
			await deleteCommentAction(projectId, comment);
		});
	};

	return (
		<div className="group/comment flex gap-3 items-start">
			<div className="w-9 h-9 rounded-full bg-muted overflow-hidden shrink-0">
				{comment.author.profilePic && (
					<Image
						src={comment.author.profilePic}
						alt={`${comment.author.firstName} ${comment.author.lastName}`}
						width={36}
						height={36}
						className="w-full h-full object-cover"
					/>
				)}
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<p className="font-bold text-primary text-sm">
						{comment.author.firstName} {comment.author.lastName}
					</p>

					{canModify && !isEditing && (
						<div className="flex items-center gap-1.5 opacity-0 group-hover/comment:opacity-100 transition-opacity">
							<button
								type="button"
								onClick={() => setIsEditing(true)}
								className="text-muted-foreground hover:text-primary"
							>
								<Pencil className="w-3 h-3" />
								<span className="sr-only">Edit comment</span>
							</button>

							<AlertDialog>
								<AlertDialogTrigger asChild>
									<button
										type="button"
										disabled={isDeleting}
										className="text-muted-foreground hover:text-destructive"
									>
										{isDeleting ? (
											<Loader2 className="w-3 h-3 animate-spin" />
										) : (
											<Trash2 className="w-3 h-3" />
										)}
										<span className="sr-only">Delete comment</span>
									</button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Delete this comment?</AlertDialogTitle>
										<AlertDialogDescription>
											This action cannot be undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
											onClick={handleDelete}
										>
											Delete
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					)}
				</div>

				{isEditing ? (
					<form action={formAction} className="flex flex-col gap-1.5 max-w-md">
						<textarea
							name="content"
							value={contentValue}
							onChange={(e) => setContentValue(e.target.value)}
							rows={2}
							className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring resize-none"
						/>
						{state?.errors?.content && (
							<p className="text-xs text-destructive">
								{state.errors.content[0]}
							</p>
						)}
						{state?.message && !state.success && (
							<p className="text-xs text-destructive">{state.message}</p>
						)}
						<div className="flex items-center gap-2">
							<Button type="submit" size="sm" disabled={isPending}>
								{isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
								Save
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => {
									setContentValue(comment.content);
									setIsEditing(false);
								}}
							>
								Cancel
							</Button>
						</div>
					</form>
				) : (
					<div className="bg-muted/50 border border-border rounded-lg overflow-hidden max-w-md">
						<p className="px-4 py-2.5 text-sm text-foreground">
							{comment.content}
						</p>
						{comment.attachments.length > 0 && (
							<div className="px-3 pb-3 flex flex-wrap gap-2">
								{comment.attachments.map((attachment) =>
									attachment.mimeType.startsWith("image/") ? (
										<Link
											key={attachment.id}
											href={attachment.storageKey}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Image
												src={attachment.storageKey}
												alt={attachment.fileName}
												width={180}
												height={140}
												className="rounded-md object-cover border border-border hover:border-primary transition-colors"
											/>
										</Link>
									) : (
										<Link
											key={attachment.id}
											href={attachment.storageKey}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background text-xs font-medium text-foreground hover:text-primary"
										>
											<FileIcon className="w-3.5 h-3.5 shrink-0" />
											<span className="truncate max-w-32">
												{attachment.fileName}
											</span>
										</Link>
									),
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
