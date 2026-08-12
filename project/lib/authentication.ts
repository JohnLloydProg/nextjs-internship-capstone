import { auth } from "@clerk/nextjs/server";
import type { User } from "../types/index";
import { getUserByClerkId, userIsOwner } from "./db/queries/users";

export async function getLoggedInUser(): Promise<User | null> {
	const { userId: clerkId } = await auth();
	if (!clerkId) return null;

	try {
		return await getUserByClerkId(clerkId);
	} catch (error) {
		console.error("Error while getting user:", error);
		return null;
	}
}

export async function LoggedInOwner(projectId: string): Promise<boolean> {
	const { userId: clerkId } = await auth();
	if (!clerkId) return false;

	const isOwner = await userIsOwner(projectId, clerkId);
	return isOwner;
}
