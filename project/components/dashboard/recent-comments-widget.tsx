import Image from "next/image";
import Link from "next/link";
import type { RecentCommentSummary } from "@/lib/db/queries/dashboard";
import { formatRelativeTime } from "@/lib/utils";

export default function RecentCommentsWidget({
	comments,
}: {
	comments: RecentCommentSummary[];
}) {
	return (
		<div className="bg-card border border-border rounded-xl p-6">
			<h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4">
				Recent Comments
			</h3>
			{comments.length === 0 ? (
				<p className="text-sm text-muted-foreground py-4 text-center">
					No comments yet.
				</p>
			) : (
				<div className="flex flex-col gap-4">
					{comments.map((comment) => (
						<Link
							key={comment.id}
							href={`/projects/${comment.projectId}/comments?taskId=${comment.taskId}`}
							className="flex items-start gap-3 hover:opacity-80 transition-opacity"
						>
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
							<div className="min-w-0">
								<p className="text-sm font-bold text-foreground">
									{comment.author.firstName} {comment.author.lastName}
								</p>
								<p className="text-xs text-muted-foreground line-clamp-2">
									{comment.content}
								</p>
								<p className="text-[10px] text-muted-foreground mt-0.5">
									{formatRelativeTime(comment.createdAt)}
								</p>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
