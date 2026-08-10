"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAssignment } from "../db/mutations/projects";
import {
	deleteAssignmentByCompositeID,
	updateAssignmentByCompositeID,
	updateUserByClerkId,
} from "../db/mutations/users";
import {
	getUserByClerkId,
	getUserByEmail,
	userIsOwner,
} from "../db/queries/users";
import type { FormState } from "./projects";

const inviteMemberSchema = z.object({
	userId: z.string(),
	role: z.enum(["commenter", "editor", "viewer"]).optional().default("viewer"),
});

export async function inviteMemberAction(
	projectId: string,
	_prevState: FormState | null,
	formData: FormData,
): Promise<FormState> {
	const { userId: currentUserId } = await auth();
	if (!currentUserId) return { success: false, message: "Unauthorized" };

	const data = Object.fromEntries(formData.entries());
	const user = await getUserByEmail(data.email.toString());
	if (!user) return { success: false, message: "Email does not exist!" };

	const validatedFields = inviteMemberSchema.safeParse({
		...data,
		userId: user.id,
	});

	if (!validatedFields.success) {
		return {
			errors: z.flattenError(validatedFields.error).fieldErrors,
			success: false,
		};
	}

	try {
		await createAssignment({
			projectId: projectId,
			userId: validatedFields.data.userId,
			role: validatedFields.data.role,
		});
	} catch (error) {
		console.error("Error while creating assignment:", error);
		return {
			success: false,
			message: "Database error: Failed to invite member.",
		};
	}

	revalidatePath(`/projects/${projectId}`);
	revalidatePath(`/projects/${projectId}/members`);

	return {
		message: "Member invited successfully",
		success: true,
	};
}

export async function removeAssignmentAction(
	projectId: string,
	userId: string,
): Promise<FormState> {
	const { userId: currentUserId } = await auth();
	if (!currentUserId) return { success: false, message: "Unauthorized" };

	try {
		await deleteAssignmentByCompositeID(projectId, userId);
	} catch (error) {
		console.error("Error while deleting assignment:", error);
		return {
			success: false,
			message: "Database error: Failed to remove member.",
		};
	}

	revalidatePath(`/projects/${projectId}`);
	revalidatePath(`/projects/${projectId}/members`);

	return {
		message: "Member removed successfully",
		success: true,
	};
}

export async function acceptInviteAction(
	projectId: string,
): Promise<FormState> {
	const { userId } = await auth();
	if (!userId) return { success: false, message: "Unauthorized" };

	const user = await getUserByClerkId(userId);
	if (!user) return { success: false, message: "User not found" };

	try {
		await updateAssignmentByCompositeID(projectId, user.id, { accepted: true });
	} catch (error) {
		console.error("Error while accepting invite:", error);
		return {
			success: false,
			message: "Database error: Failed to accept invite.",
		};
	}

	revalidatePath("/teams");
	revalidatePath(`/projects/${projectId}`);
	return { success: true, message: "Invite accepted" };
}

const updateRoleSchema = z.object({
	role: z.enum(["editor", "commenter", "viewer"]),
});

export async function updateAssignmentRoleAction(
	projectId: string,
	memberId: string,
	role: string,
): Promise<FormState> {
	const { userId } = await auth();
	if (!userId) return { success: false, message: "Unauthorized" };

	const isOwner = await userIsOwner(projectId, userId);
	if (!isOwner) {
		return {
			success: false,
			message: "Only the project owner can edit permissions",
		};
	}

	const validatedFields = updateRoleSchema.safeParse({ role });
	if (!validatedFields.success) {
		return {
			errors: z.flattenError(validatedFields.error).fieldErrors,
			success: false,
		};
	}

	try {
		await updateAssignmentByCompositeID(projectId, memberId, {
			role: validatedFields.data.role,
		});
	} catch (error) {
		console.error("Error while updating assignment role:", error);
		return {
			success: false,
			message: "Database error: Failed to update role.",
		};
	}

	revalidatePath(`/projects/${projectId}/members`);
	revalidatePath("/teams");

	return { success: true, message: "Permissions updated" };
}

const updateProfileSchema = z.object({
	firstName: z.string().min(1, "First name is required").max(100),
	lastName: z.string().min(1, "Last name is required").max(100),
	email: z
		.string()
		.regex(
			/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
			"Enter a valid email address",
		),
	jobPosition: z.preprocess(
		(val) => (val === "" ? undefined : val),
		z.string().max(100).optional(),
	),
	bio: z.preprocess(
		(val) => (val === "" ? undefined : val),
		z.string().max(500, "Bio must be 500 characters or less").optional(),
	),
});

export async function updateUserAction(
	_prevState: FormState | null,
	formData: FormData,
): Promise<FormState> {
	const { userId: clerkId } = await auth();
	if (!clerkId) return { success: false, message: "Unauthorized" };

	const data = Object.fromEntries(formData.entries());
	const validatedFields = updateProfileSchema.safeParse(data);

	if (!validatedFields.success) {
		return {
			errors: z.flattenError(validatedFields.error).fieldErrors,
			success: false,
		};
	}

	try {
		const updated = await updateUserByClerkId(clerkId, validatedFields.data);
		if (!updated) return { success: false, message: "User not found" };
	} catch (error) {
		console.error("Error while updating profile:", error);
		return {
			success: false,
			message: "Database error: Failed to update profile.",
		};
	}

	revalidatePath("/settings");

	return { success: true, message: "Profile updated successfully" };
}
