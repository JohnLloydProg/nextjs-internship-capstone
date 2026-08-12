"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProjectNavBar({ projectId }: { projectId: string }) {
	const pathName = usePathname();
	const navigations = [
		{ link: `/projects/${projectId}`, content: "Tasks" },
		{ link: `/projects/${projectId}/members`, content: "Members" },
		{ link: `/projects/${projectId}/comments`, content: "Comments" },
		{ link: `/projects/${projectId}/settings`, content: "Settings" },
	];

	const linkColor = (link: string) => {
		return pathName === link
			? " inline-flex items-center border bg-white text-primary border-primary "
			: "border hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 text-muted-foreground border-muted-foreground hover:border-foreground ";
	};

	console.log(pathName);

	return (
		<div className="flex items-center gap-2">
			{navigations.map((nav) => (
				<Link
					key={nav.content}
					href={nav.link}
					className={`cursor-pointer ${linkColor(nav.link)} px-3 py-1 rounded-md`}
				>
					{nav.content}
				</Link>
			))}
		</div>
	);
}
