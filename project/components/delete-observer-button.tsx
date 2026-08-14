"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteObserverAction } from "@/lib/actions/automation";

export default function DeleteObserverButton({
	projectId,
	observerId,
}: {
	projectId: string;
	observerId: string;
}) {
	const [isPending, startTransition] = useTransition();

	return (
		<Button
			variant="ghost"
			size="icon"
			disabled={isPending}
			onClick={() =>
				startTransition(async () => {
					await deleteObserverAction(projectId, observerId);
				})
			}
			className="shrink-0 text-muted-foreground hover:text-destructive"
		>
			{isPending ? (
				<Loader2 className="w-4 h-4 animate-spin" />
			) : (
				<Trash2 className="w-4 h-4" />
			)}
		</Button>
	);
}
