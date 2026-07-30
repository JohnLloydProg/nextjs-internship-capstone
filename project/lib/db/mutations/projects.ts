import { eq } from "drizzle-orm";
import { db } from "..";
import { projects } from "../schema";

type NewProject = typeof projects.$inferInsert;
type UpdateProject = Partial<
	Omit<NewProject, "id" | "createdAt" | "updatedAt">
>;

export async function createProject(data: NewProject) {
	const [project] = await db.insert(projects).values(data).returning();
	return project;
}

export async function updateProject(projectId: string, data: UpdateProject) {
	const [updatedProject] = await db
		.update(projects)
		.set(data)
		.where(eq(projects.id, projectId))
		.returning();

	return updatedProject;
}

export async function deleteProject(projectId: string) {
	const [deletedProject] = await db
		.delete(projects)
		.where(eq(projects.id, projectId))
		.returning();

	return deletedProject;
}
