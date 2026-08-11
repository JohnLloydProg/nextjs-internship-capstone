import { createHash } from "node:crypto";
import { del, put } from "@vercel/blob";

export function hashBuffer(buffer: Buffer): string {
	return createHash("sha256").update(buffer.toString()).digest("hex");
}

function sanitizeFileName(fileName: string): string {
	return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export async function uploadFile(
	buffer: Buffer,
	fileName: string,
	hash: string,
	mimeType: string,
): Promise<string> {
	const safeName = `${hash}-${sanitizeFileName(fileName)}`;

	const blob = await put(`attachments/${safeName}`, buffer, {
		access: "public",
		contentType: mimeType,
		addRandomSuffix: false,
	});

	return blob.url;
}

export async function deleteFile(storageKey: string): Promise<void> {
	await del(storageKey);
}

export function getAttachmentUrl(storageKey: string): string {
	return storageKey;
}
