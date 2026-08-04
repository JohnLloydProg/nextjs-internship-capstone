"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function TeamSectionToggle({
	trigger,
	children,
}: {
	trigger: React.ReactNode;
	children: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="w-full bg-card border border-border rounded-xl overflow-hidden">
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-expanded={isOpen}
				className="w-full px-6 py-4 flex items-center justify-between bg-primary/80"
			>
				{trigger}
				<ChevronDown
					className={`w-5 h-5 text-primary-foreground shrink-0 transition-transform duration-200 ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>

			{isOpen && <div className="p-6">{children}</div>}
		</div>
	);
}
