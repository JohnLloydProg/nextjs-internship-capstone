import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/lib/db/queries/users";
import ProfileForm from "../../../components/profile-form";

export default async function SettingsPage() {
	const { userId } = await auth();
	if (!userId) redirect("/sign-in");

	const user = await getUserByClerkId(userId);
	if (!user) redirect("/sign-in");

	return <ProfileForm user={user} />;
}
