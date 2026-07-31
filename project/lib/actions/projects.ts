"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { User } from "@/types/index";
import { createProject } from "../db/mutations/projects";
import { getUserByClerkId } from "../db/queries/users";

export interface FormState {
	success: boolean;
	message?: string;
	errors?: Record<string, string[] | undefined>;
}

const createProjectSchema = z.object({
	name: z
		.string()
		.min(3)
		.max(30, "Project name must be 3 to 30 characters only"),
	ownerId: z.string(),
	description: z.string().max(300, "Maximum length is 300 only").optional(),
	status: z.enum(["active", "paused", "closed"]),
	dueDate: z.preprocess(
		(val) => (val === "" ? undefined : new Date(val as string)),
		z.date().optional(),
	),
});
export async function CreateProjectAction(
	_: FormState | null,
	formData: FormData,
): Promise<FormState> {
	const { userId } = await auth();
	if (!userId) return { success: false, message: "Unauthorized" };

	let user: User | null;
	try {
		user = await getUserByClerkId(userId);
	} catch (error) {
		console.error("Error while getting user:", error);
		return { success: false, message: "Error while getting user." };
	}
	if (!user) return { success: false, message: "Can't find user" };

	const data = Object.fromEntries(formData.entries());
	const parseResult = createProjectSchema.safeParse({
		...data,
		ownerId: user.id,
		status: "active",
	});

	if (!parseResult.success)
		return {
			success: false,
			errors: z.flattenError(parseResult.error).fieldErrors,
		};

	try {
		await createProject(parseResult.data);
	} catch (error) {
		console.error("Error while creating project:", error);
		return { success: false, message: "Error while creating project." };
	}

	revalidatePath("/projects");

	return { success: true, message: "Created the project successfully" };
}
