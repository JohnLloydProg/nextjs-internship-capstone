"use client";

import { Show, SignOutButton, useUser } from "@clerk/nextjs";
import { LucideBell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

export function Header() {
	const { user, isSignedIn } = useUser();
	const path = usePathname();

	return (
		<header className="w-full bg-[#09090B] px-8 py-4 flex items-center justify-between shadow-sm relative">
			<Link href="/" className="text-2xl font-bold tracking-tight z-10">
				<span className="text-white">Project</span>
				<span className="text-primary">Suite</span>
			</Link>

			{path === "/" && (
				<nav className="hidden md:flex items-center gap-10 absolute left-1/2 transform -translate-x-1/2">
					<Link
						href="/dashboard"
						className="text-primary font-medium hover:text-primary/80 transition-colors"
					>
						Dashboard
					</Link>
					<Link
						href="/projects"
						className="text-zinc-300 font-medium hover:text-white transition-colors"
					>
						Projects
					</Link>
				</nav>
			)}

			<Show when="signed-out">
				<div className="flex bg-linear-to-br from-[#9E7F1F] to-[#D1B252] rounded-full overflow-hidden items-center z-10">
					<Link
						href="/sign-in"
						className="text-white hover:bg-black/15 hover:text-white rounded-none px-6 py-2.5 font-medium transition-colors text-center cursor-pointer"
					>
						Sign In
					</Link>

					<div className="w-px h-5 bg-black/20" />

					<Link
						href="/sign-up"
						className="text-white hover:bg-black/15 hover:text-white rounded-none px-6 py-2.5 font-medium transition-colors text-center cursor-pointer"
					>
						Sign Up
					</Link>
				</div>
			</Show>
			<Show when="signed-in">
				{isSignedIn && user && (
					<div className="flex gap-5 items-center">
						<LucideBell size={24} color="#c59f27" />
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
						<SignOutButton redirectUrl="/">
							<Button
								variant="ghost"
								className="bg-linear-to-br from-[#9E7F1F] to-[#D1B252] text-white font-medium rounded-full px-6 py-5 hover:text-white cursor-pointer"
							>
								Sign Out
							</Button>
						</SignOutButton>
					</div>
				)}
			</Show>
		</header>
	);
}
