import type { WebhookEvent } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { Webhook } from "svix";
import {
	createUser,
	deleteUserByClerkId,
	updateUserByClerkId,
} from "@/lib/db/mutations/users";

export async function POST(req: NextRequest) {
	const SECRET = process.env.CLERK_WEBHOOK_SECRET;

	if (!SECRET) {
		throw new Error(
			"Error: Please add the CLERK_WEBHOOK_SECRET to the environment variables",
		);
	}

	const svix_id = req.headers.get("svix-id");
	const svix_timestamp = req.headers.get("svix-timestamp");
	const svix_signature = req.headers.get("svix-signature");

	if (!svix_id || !svix_timestamp || !svix_signature) {
		return new Response("Error: Missing Svix headers", {
			status: 400,
		});
	}

	const payload = await req.json();
	const body = JSON.stringify(payload);

	const webhook = new Webhook(SECRET);

	let event: WebhookEvent;

	try {
		event = webhook.verify(body, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		}) as WebhookEvent;
	} catch (error) {
		console.error("Error verifying webhook:", error);
		return new Response("Error: Verification failed", {
			status: 400,
		});
	}

	const eventType = event.type;

	switch (eventType) {
		case "user.created": {
			const { id, email_addresses, first_name, last_name, image_url } =
				event.data;
			const primaryEmail = email_addresses[0]?.email_address;

			if (!first_name || !last_name)
				return new Response("Missing name details", { status: 400 });

			try {
				const user = await createUser({
					clerkId: id,
					email: primaryEmail,
					firstName: first_name,
					lastName: last_name,
					profilePic: image_url,
				});

				console.log(
					`Created User(id: ${user.id}, clerkId: ${id}, email: ${primaryEmail})`,
				);
			} catch (error) {
				console.error("Error creating user:", error);
				return new Response("Error creating user", {
					status: 500,
				});
			}
			break;
		}
		case "user.updated": {
			const { id, email_addresses, first_name, last_name, image_url } =
				event.data;
			const primaryEmail = email_addresses[0]?.email_address;

			if (!first_name || !last_name)
				return new Response("Missing name details", { status: 400 });

			try {
				const user = await updateUserByClerkId(id, {
					email: primaryEmail,
					firstName: first_name,
					lastName: last_name,
					profilePic: image_url,
				});

				if (!user)
					return new Response(`Can't find user with Clerk ID: ${id}`, {
						status: 404,
					});

				console.log(
					`Updated User(id: ${user.id}, clerkId: ${id}, email: ${primaryEmail})`,
				);
			} catch (error) {
				console.error("Error updating user:", error);
				return new Response("Error updating user", { status: 500 });
			}
			break;
		}
		case "user.deleted": {
			const { id } = event.data;

			if (!id) return new Response("ID was not provided", { status: 400 });

			try {
				await deleteUserByClerkId(id);

				console.log("User deleted with Clerk ID:", id);
			} catch (error) {
				console.error("Error deleting user", error);
				return new Response("Error deleting uesr", { status: 500 });
			}
			break;
		}
	}

	return new Response("Event was processed succsessfully", { status: 200 });
}
