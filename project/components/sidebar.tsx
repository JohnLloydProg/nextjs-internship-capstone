"use client";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
	BarChart2,
	CalendarDays,
	Folder,
	Home,
	Settings,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

const NAV_ITEMS = [
	{ name: "Dashboard", href: "/dashboard", icon: Home },
	{ name: "Projects", href: "/projects", icon: Folder },
	{ name: "Team", href: "/team", icon: Users },
	{ name: "Analytics", href: "/analytics", icon: BarChart2 },
	{ name: "Calendar", href: "/calendar", icon: CalendarDays },
	{ name: "Settings", href: "/settings", icon: Settings },
];

export default function SidebarNav() {
	const pathname = usePathname();
	const { user, isSignedIn } = useUser();

	return (
		<div className="flex flex-col sticky top-0 left-0 h-lvh">
			<div className="ml-5 mt-5">
				<Link href="/" className="text-2xl font-bold tracking-tight z-10">
					<span className="text-white">Project</span>
					<span className="text-primary">Suite</span>
				</Link>
				{isSignedIn && user && (
					<div className="flex gap-3 items-center mt-1">
						<Link
							href="/settings"
							className="h-10 w-10 rounded-full border-2 border-primary overflow-clip"
						>
							<Image
								src={user.imageUrl}
								alt="profile-pic"
								width={30}
								height={30}
								className="h-full w-full object-cover"
							/>
						</Link>
						<h4 className="text-white font-semibold">
							{user.firstName} {user.lastName}
						</h4>
					</div>
				)}
			</div>

			<nav className="flex flex-col gap-2 w-full mt-5">
				{NAV_ITEMS.map((item) => {
					const isActive = pathname === item.href;
					const Icon = item.icon;

					return (
						<Link
							key={item.name}
							href={item.href}
							className={`flex items-center gap-3 px-6 py-3 transition-all ${
								isActive
									? "border-l-4 border-primary bg-linear-to-r from-[#9E7F1F] to-[#D1B252] text-white font-medium"
									: "text-muted-foreground hover:text-white hover:bg-white/5"
							}`}
						>
							<Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
							{item.name}
						</Link>
					);
				})}
			</nav>

			<SignOutButton redirectUrl="/">
				<Button
					variant="ghost"
					className="bg-linear-to-br from-[#9E7F1F] to-[#D1B252] text-white font-medium rounded-full px-6 py-5 hover:text-white cursor-pointer mt-auto mb-5 mx-3"
				>
					Sign Out
				</Button>
			</SignOutButton>
		</div>
	);
}
