// TypeScript type definitions
// Task 1.3: Set up project structure and folder organization

export interface User {
	id: string;
	clerkId: string;
	email: string;
	firstName: string;
	lastName: string;
	jobPosition: string | null;
	profilePic: string | null;
	bio: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Member extends User {
	role: "editor" | "commenter" | "viewer" | "owner";
}

export interface Project {
	id: string;
	name: string;
	description: string | null;
	owner: User;
	status: string;
	createdAt: Date;
	updatedAt: Date;
	dueDate: Date | null;
}

export interface List {
	id: string;
	name: string;
	projectId: string;
	position: number;
	suggestedLimit: number | null;
	createdAt: Date;
	updatedAt: Date;
	tasks: Task[];
}

export interface Task {
	id: string;
	title: string;
	description: string | null;
	listId: string;
	assignee: Omit<User, "role"> | null;
	priority: "low" | "medium" | "high" | "urgent";
	dueDate: Date | null;
	position: number;
	startedAt: Date | null;
	finishedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Comment {
	id: string;
	content: string;
	taskId: string;
	author: User;
	createdAt: Date;
	updatedAt: Date;
}

export interface Notification {
	id: string;
	receiverId: string;
	title: string;
	description: string;
	link: string;
	isRead: boolean;
	createdAt: Date;
}
