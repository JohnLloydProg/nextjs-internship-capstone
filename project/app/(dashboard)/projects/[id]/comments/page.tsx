import { FileIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import CommentComposer from "@/components/comment-composer";
import {
	getCommentsByTaskId,
	getTaskCommentThreads,
} from "@/lib/db/queries/comments";

export default async function ProjectCommentsPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ taskId?: string }>;
}) {
	const { id: projectId } = await params;
	const { taskId } = await searchParams;

	const threads = await getTaskCommentThreads(projectId);
	const selectedThread = threads.find(
		(thread) => thread.taskId === taskId,
		threads,
	);

	if (!taskId && threads.length > 0) {
		redirect(`/projects/${projectId}/comments?taskId=${threads[0].taskId}`);
	}

	const comments = selectedThread
		? await getCommentsByTaskId(selectedThread.taskId)
		: [];

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 w-full max-w-6xl h-[calc(100vh-220px)]">
			<div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm">
				<div className="px-6 py-4 bg-primary">
					<h2 className="text-xl font-bold text-primary-foreground">
						Comments
					</h2>
				</div>
				<div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border">
					{threads.length === 0 ? (
						<p className="p-6 text-sm text-muted-foreground">
							No tasks in this project yet.
						</p>
					) : (
						threads.map((thread) => (
							<Link
								key={thread.taskId}
								href={`/projects/${projectId}/comments?taskId=${thread.taskId}`}
								className={`block px-6 py-4 hover:bg-muted/50 transition-colors ${
									thread.taskId === taskId ? "bg-primary/20" : ""
								}`}
							>
								<h3 className="font-bold text-foreground text-sm mb-1">
									{thread.taskTitle}
								</h3>
								{thread.latestComment ? (
									<p className="text-sm text-muted-foreground line-clamp-2">
										<span className="font-medium text-foreground">
											{thread.latestComment.authorFirstName}:
										</span>{" "}
										{thread.latestComment.content}
									</p>
								) : (
									<p className="text-sm text-muted-foreground italic">
										No comments yet
									</p>
								)}
							</Link>
						))
					)}
				</div>
			</div>

			<div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm">
				<div className="px-6 py-4 bg-primary">
					<h2 className="text-xl font-bold text-primary-foreground">
						{selectedThread ? selectedThread.taskTitle : "Select a task"}
					</h2>
				</div>

				<div className="flex-1 overflow-y-auto scrollbar-thin p-6 flex flex-col gap-6">
					{!selectedThread ? (
						<p className="text-sm text-muted-foreground">
							Pick a task on the left to view its comments.
						</p>
					) : comments.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No comments yet. Be the first to say something.
						</p>
					) : (
						comments.map((comment) => (
							<div key={comment.id} className="flex gap-3 items-start">
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
									<p className="font-bold text-primary text-sm mb-1">
										{comment.author.firstName} {comment.author.lastName}
									</p>
									<div className="bg-muted/50 border border-border rounded-lg overflow-hidden max-w-md">
										<p className="px-4 py-2.5 text-sm text-foreground">
											{comment.content}
										</p>
										{comment.attachments.length > 0 && (
											<div className="px-3 pb-3 flex flex-wrap gap-2">
												{comment.attachments.map((attachment) =>
													attachment.mimeType.startsWith("image/") ? (
														<Image
															key={attachment.id}
															src={attachment.storageKey}
															alt={attachment.fileName}
															width={180}
															height={140}
															className="rounded-md object-cover border border-border"
														/>
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
								</div>
							</div>
						))
					)}
				</div>

				<CommentComposer
					projectId={projectId}
					taskId={selectedThread?.taskId ?? null}
				/>
			</div>
		</div>
	);
}
