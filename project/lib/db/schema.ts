import { defineRelations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const priorityEnum = pgEnum("priority", [
	"low",
	"medium",
	"high",
	"urgent",
]);

export const projectStatusEnum = pgEnum("project_status", [
	"active",
	"paused",
	"closed",
]);

export const assginmentRole = pgEnum("assignment_role", [
	"editor",
	"commenter",
	"viewer",
]);

export const roles = pgTable("roles", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 255 }).notNull(),
	accessLevel: integer("access_level").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable(
	"users",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		clerkId: text("clerk_id").notNull().unique(),
		email: text("email").notNull().unique(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		profilePic: text("profile_pic"),
		bio: text("bio"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(t) => [index("users_clerk_id_idx").on(t.clerkId)],
);

export const projects = pgTable(
	"projects",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		description: text("description"),
		ownerId: uuid("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		status: projectStatusEnum("status").default("active").notNull(),
		dueDate: timestamp("due_date"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(t) => [index("projects_owner_id_idx").on(t.ownerId)],
);

export const assignments = pgTable(
	"assignments",
	{
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		role: assginmentRole("role_id").default("viewer").notNull(),
		accepted: boolean("accepted").default(false).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(t) => [
		primaryKey({ columns: [t.projectId, t.userId] }),
		index("assignments_project_id_idx").on(t.projectId),
		index("assignments_user_id_idx").on(t.userId),
		index("assignments_composite_idx").on(t.projectId, t.userId),
	],
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
		suggestedLimit: integer("suggested_limit"),
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
		priority: priorityEnum("priority").default("medium").notNull(),
		dueDate: timestamp("due_date"),
		position: integer("position").notNull(),
		startedAt: timestamp("stated_at"),
		finishedAt: timestamp("finished_at"),
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

export const notifications = pgTable(
	"notifications",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		receiverId: uuid("received_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		title: varchar("title", { length: 500 }).notNull(),
		description: text("description"),
		link: text("link").notNull(),
		isRead: boolean("is_read").notNull().default(false),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(t) => [index("notifications_receiver_id_idx").on(t.receiverId)],
);

export const relations = defineRelations(
	{
		users,
		projects,
		lists,
		tasks,
		comments,
		roles,
		notifications,
		assignments,
	},
	(r) => ({
		projects: {
			owner: r.one.users({
				from: r.projects.ownerId,
				to: r.users.id,
				optional: false,
				alias: "ownership_relation",
			}),
			lists: r.many.lists(),
			assignments: r.many.assignments(),
		},
		users: {
			ownedProjects: r.many.projects({
				from: r.users.id,
				to: r.projects.ownerId,
				alias: "ownership_relation",
			}),
			tasks: r.many.tasks(),
			comments: r.many.comments(),
			assignments: r.many.assignments(),
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
		notifications: {
			receiver: r.one.users({
				from: r.notifications.receiverId,
				to: r.users.id,
				optional: false,
			}),
		},
		assignments: {
			project: r.one.projects({
				from: r.assignments.projectId,
				to: r.projects.id,
				optional: false,
			}),
			user: r.one.users({
				from: r.assignments.userId,
				to: r.users.id,
				optional: false,
			}),
		},
	}),
);
