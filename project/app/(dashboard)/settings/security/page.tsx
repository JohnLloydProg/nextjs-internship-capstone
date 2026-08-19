import EmailForm from "@/components/email-form";
import PasswordForm from "@/components/password-form";

export default async function SecuritySection() {
	return (
		<div className="flex flex-col gap-5">
			<EmailForm />
			<PasswordForm />
		</div>
	);
}
