"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
	{ name: "Profile", link: "/settings" },
	{ name: "Notifications", link: "/settings/notifications" },
	{ name: "Security", link: "/settings/security" },
	{ name: "Appearance", link: "/settings/appearance" },
];

export default function SettingsNav() {
	const pathname = usePathname();

	return (
		<nav className="flex flex-col gap-2">
			{SECTIONS.map((section) => {
				const isActive = section.link === pathname;

				return (
					<Link
						key={section.name}
						href={section.link}
						className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
							isActive
								? "border-primary text-primary bg-primary/5"
								: "border-transparent text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:hover:text-muted-foreground"
						}`}
					>
						{section.name}
						{isActive && <ChevronRight className="w-4 h-4" />}
					</Link>
				);
			})}
		</nav>
	);
}
