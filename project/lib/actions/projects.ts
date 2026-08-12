"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/dist/client/components/navigation";
import { z } from "zod";
import { getLoggedInUser, LoggedInOwner } from "../authentication";
import {
	createProject,
	deleteProject,
	updateProject,
} from "../db/mutations/projects";

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
	const user = await getLoggedInUser();
	if (!user) return { success: false, message: "Unauthorized" };

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

const updateProjectSchema = z.object({
	name: z.string().min(1, "Project name is required").max(255),
	description: z.string().max(300, "Maximum length is 300 only").optional(),
	status: z.enum(["active", "paused", "closed"]),
	dueDate: z.preprocess(
		(val) => (val === "" ? undefined : new Date(val as string)),
		z.date().optional(),
	),
});
export async function updateProjectAction(
	projectId: string,
	_prevState: FormState | null,
	formData: FormData,
): Promise<FormState> {
	const isOwner = await LoggedInOwner(projectId);
	if (!isOwner) {
		return {
			success: false,
			message: "Only the project owner can edit this project",
		};
	}

	const data = Object.fromEntries(formData.entries());
	const validatedFields = updateProjectSchema.safeParse(data);

	if (!validatedFields.success) {
		return {
			errors: z.flattenError(validatedFields.error).fieldErrors,
			success: false,
		};
	}

	try {
		await updateProject(projectId, validatedFields.data);
	} catch (error) {
		console.error("Error while updating project:", error);
		return {
			success: false,
			message: "Database error: Failed to update project.",
		};
	}

	revalidatePath(`/projects/${projectId}`);
	revalidatePath(`/projects/${projectId}/settings`);

	return {
		message: "Project updated successfully",
		success: true,
	};
}

export async function deleteProjectAction(
	projectId: string,
): Promise<FormState> {
	const isOwner = await LoggedInOwner(projectId);
	if (!isOwner) {
		return {
			success: false,
			message: "Only the project owner can delete this project",
		};
	}

	try {
		await deleteProject(projectId);
	} catch (error) {
		console.error("Error while deleting project:", error);
		return {
			success: false,
			message: "Database error: Failed to delete project.",
		};
	}

	revalidatePath("/projects");
	redirect("/projects");
}
