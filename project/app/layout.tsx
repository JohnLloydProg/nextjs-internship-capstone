import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Public_Sans, Lato } from "next/font/google";
import type React from "react";
import { cn } from "@/lib/utils";
import "./globals.css";

const publicSans = Public_Sans({
	subsets: ["latin"],
	weight: "700",
	variable: "--font-heading",
});
const lato = Lato({
	subsets: ["latin"],
	variable: "--font-sans",
	weight: "400",
});

export const metadata: Metadata = {
	title: "Project Management Tool",
	description: "Team collaboration and project management platform",
	generator: "v0.dev",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(publicSans.variable, lato.variable, "font-sans")}
		>
			<body className="overflow-x-hidden">
				<ClerkProvider appearance={{ theme: shadcn }}>{children}</ClerkProvider>
			</body>
		</html>
	);
}
