import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Public_Sans } from "next/font/google";
import type React from "react";
import { cn } from "@/lib/utils";
import "./globals.css";

const jetbrainsMonoHeading = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-heading",
});

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({ subsets: ["latin"] });

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
			className={cn(
				"font-sans",
				publicSans.variable,
				jetbrainsMonoHeading.variable,
			)}
		>
			<body className={`${inter.className} overflow-x-hidden`}>
				<ClerkProvider appearance={{ theme: shadcn }}>{children}</ClerkProvider>
			</body>
		</html>
	);
}
