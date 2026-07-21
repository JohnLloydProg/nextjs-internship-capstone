import {
	pgTable,
	text,
	timestamp,
	uuid,
	integer,
	pgEnum,
	index,
} from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";

export const priorityEnum = pgEnum("priority", [
	"low",
	"medium",
	"high",
	"urgent",
]);

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	clerkId: text("clerk_id").notNull().unique(),
	email: text("email").notNull().unique(),
	name: text("name").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export const projects = pgTable(
	"projects",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		description: text("description"),
		ownerId: uuid("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		dueDate: timestamp("due_date"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(t) => [index("projects_owner_id_idx").on(t.ownerId)],
);

export const lists = pgTable(
	"lists",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		position: integer("position").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(t) => [index("lists_project_id_idx").on(t.projectId)],
);

export const tasks = pgTable(
	"tasks",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		title: text("title").notNull(),
		description: text("description"),
		listId: uuid("list_id")
			.notNull()
			.references(() => lists.id, { onDelete: "cascade" }),
		assigneeId: uuid("assignee_id").references(() => users.id, {
			onDelete: "set null",
		}),
		priority: priorityEnum("priority").default("medium"),
		dueDate: timestamp("due_date"),
		position: integer("position").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		index("tasks_list_id_idx").on(t.listId),
		index("tasks_assignee_id_idx").on(t.assigneeId),
	],
);

export const comments = pgTable(
	"comments",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		content: text("content").notNull(),
		taskId: uuid("task_id")
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		authorId: uuid("author_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		index("comments_task_id_idx").on(t.taskId),
		index("comments_author_id_idx").on(t.authorId),
	],
);

export const relations = defineRelations(
	{ users, projects, lists, tasks, comments },
	(r) => ({
		projects: {
			owner: r.one.users({
				from: r.projects.ownerId,
				to: r.users.id,
				optional: false,
			}),
			lists: r.many.lists(),
		},
		users: {
			projects: r.many.projects(),
			tasks: r.many.tasks(),
			comments: r.many.comments(),
		},
		lists: {
			project: r.one.projects({
				from: r.lists.projectId,
				to: r.projects.id,
				optional: false,
			}),
			tasks: r.many.tasks(),
		},
		tasks: {
			list: r.one.lists({
				from: r.tasks.listId,
				to: r.lists.id,
				optional: false,
			}),
			assignee: r.one.users({
				from: r.tasks.assigneeId,
				to: r.users.id,
				optional: true,
			}),
			comments: r.many.comments(),
		},
		comments: {
			task: r.one.tasks({
				from: r.comments.taskId,
				to: r.tasks.id,
				optional: false,
			}),
			author: r.one.users({
				from: r.comments.authorId,
				to: r.users.id,
				optional: false,
			}),
		},
	}),
);
