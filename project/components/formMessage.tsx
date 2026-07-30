import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { FormState } from "@/lib/actions/projects";

export function FormMessage({
	state,
}: {
	state: FormState | null | undefined;
}) {
	if (!state) return null;

	if (state.success) {
		return (
			<div className="flex items-start gap-3 p-4 rounded-lg bg-[#bbf7d0]/50 dark:bg-[#166534]/20 border border-[#bbf7d0] dark:border-[#166534]/30 text-[#166534] dark:text-[#bbf7d0]">
				<CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
				<div className="text-sm font-medium pt-0.5">
					{state.message || "Operation completed successfully."}
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
			<AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
			<div className="flex flex-col gap-2 text-sm pt-0.5">
				{state.message && <div className="font-semibold">{state.message}</div>}

				{state.errors && Object.keys(state.errors).length > 0 && (
					<ul className="list-disc list-inside space-y-1">
						{Object.entries(state.errors).map(([field, messages]) => {
							if (!messages || messages.length === 0) return null;

							return messages.map((msg) => (
								<li key={msg}>
									<span className="font-semibold capitalize">
										{field.replace(/([A-Z])/g, " $1").trim()}
									</span>
									: {msg}
								</li>
							));
						})}
					</ul>
				)}
			</div>
		</div>
	);
}
