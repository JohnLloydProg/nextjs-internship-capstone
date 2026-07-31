"use server";

import { auth } from "@clerk/nextjs/server";
import type { FormState } from "./projects";
import { z } from "zod";
import { createAssignment } from "../db/mutations/projects";
import { revalidatePath } from "next/cache";
import { getUserByEmail } from "../db/queries/users";

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
