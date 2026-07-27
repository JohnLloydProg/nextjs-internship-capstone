import { Menu } from "lucide-react";
import type React from "react";
import SidebarNav from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen w-full bg-background">
			<aside className="hidden md:flex flex-col w-64 bg-foreground border-r border-border shrink-0">
				<SidebarNav />
			</aside>

			<div className="flex flex-col flex-1 w-full">
				<header className="flex md:hidden items-center p-4 bg-foreground border-b border-border">
					<Sheet>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="text-white hover:bg-white/10"
							>
								<Menu className="w-6 h-6" />
								<span className="sr-only">Toggle Sidebar</span>
							</Button>
						</SheetTrigger>
						<SheetContent
							side="left"
							className="w-64 p-0 bg-foreground border-r-zinc-800"
						>
							<SidebarNav />
						</SheetContent>
					</Sheet>
					<span className="ml-4 font-bold text-lg text-white tracking-tight">
						Project<span className="text-primary">Suite</span>
					</span>
				</header>

				<main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}
