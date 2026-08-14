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
	attachments: Attachment[];
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
	attachments: Attachment[];
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

export interface Attachment {
	id: string;
	fileName: string;
	mimeType: string;
	sizeBytes: number;
	storageKey: string;
	uploadedBy: User | null;
	createdAt: Date;
}

export interface TaskHistory {
	id: string;
	taskId: string;
	changedBy: User | null;
	editId: string;
	fieldName: string;
	oldValue: string | null;
	newValue: string | null;
	changedAt: Date;
}

export type TaskField =
	| "title"
	| "description"
	| "listId"
	| "assigneeId"
	| "priority"
	| "dueDate"
	| "startedAt"
	| "finishedAt";

export type ObserverEvent = "changed" | "equals";

export interface SetAutomation {
	id: string;
	observerId: string;
	fieldName: TaskField;
	value: string;
	createdAt: Date;
}

export interface NotifyAutomation {
	observerId: string;
	userId: string;
	enabled: boolean;
	user: {
		id: string;
		firstName: string;
		lastName: string;
		profilePic: string | null;
	};
	createdAt: Date;
}

export interface TaskObserver {
	id: string;
	projectId: string;
	fieldName: TaskField;
	event: ObserverEvent;
	value: string | null;
	createdAt: Date;
	setters: SetAutomation[];
	notifiers: NotifyAutomation[];
}
