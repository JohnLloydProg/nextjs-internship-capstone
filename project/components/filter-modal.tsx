"use client";

import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function FilterModal() {
	const [status, setStatus] = React.useState<string | null>("active");
	const [sortBy, setSortBy] = React.useState<string | null>("newest");
	const router = useRouter();

	const statuses = [
		{ id: "active", label: "Active" },
		{ id: "paused", label: "Paused" },
		{ id: "closed", label: "Closed" },
	];

	const sortOptions = [
		{ id: "true", label: "Newest First" },
		{ id: "false", label: "Oldest First" },
	];

	const handleApply = () => {
		router.push(`/projects?status=${status}&newest=${sortBy}`);
		console.log("Applying filters:", { status, sortBy });
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="secondary">
					<Filter size={16} />
					Filter
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-100 bg-card border-border shadow-lg">
				<DialogHeader>
					<DialogTitle className="text-foreground text-xl tracking-tight">
						Filter Projects
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Refine your dashboard view by selecting the options below.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-6 py-4">
					<div className="space-y-3">
						<Label className="text-foreground font-semibold">
							Project Status
						</Label>
						<div className="flex flex-wrap gap-2">
							{statuses.map((s) => (
								<button
									type="button"
									key={s.id}
									onClick={() => setStatus(s.id)}
									className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
										status === s.id
											? "bg-primary border-primary text-primary-foreground"
											: "bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
									}`}
								>
									{s.label}
								</button>
							))}
						</div>
					</div>

					<div className="space-y-3">
						<Label className="text-foreground font-semibold">Sort By</Label>
						<div className="flex flex-wrap gap-2">
							{sortOptions.map((option) => (
								<button
									type="button"
									key={option.id}
									onClick={() => setSortBy(option.id)}
									className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
										sortBy === option.id
											? "bg-zinc-800 dark:bg-zinc-200 border-zinc-800 dark:border-zinc-200 text-white dark:text-black"
											: "bg-transparent border-border text-muted-foreground hover:border-zinc-500 hover:text-foreground"
									}`}
								>
									{option.label}
								</button>
							))}
						</div>
					</div>
				</div>

				<DialogFooter className="sm:justify-end gap-2 mt-2">
					<DialogClose asChild>
						<Button
							variant="ghost"
							className="text-muted-foreground hover:text-foreground"
						>
							Cancel
						</Button>
					</DialogClose>
					<DialogClose asChild>
						<Button
							onClick={handleApply}
							className="bg-linear-to-r from-[#9E7F1F] to-[#D1B252] text-white hover:opacity-90 border-none font-semibold"
						>
							Apply Filters
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
