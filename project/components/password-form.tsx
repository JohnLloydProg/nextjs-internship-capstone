"use client";

import { useReverification, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PasswordForm() {
	const { user, isLoaded } = useUser();

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [signOutOthers, setSignOutOthers] = useState(true);

	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const changePassword = useReverification(() =>
		user?.updatePassword({
			newPassword,
			...(hasPassword ? { currentPassword } : {}),
			signOutOfOtherSessions: signOutOthers,
		}),
	);

	if (!isLoaded || !user) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const hasPassword = user.passwordEnabled;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);

		if (newPassword !== confirmPassword) {
			setError("New passwords don't match");
			return;
		}
		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}

		setIsPending(true);
		try {
			await changePassword();
			await setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setSuccess(true);
		} catch (err) {
			console.error("Error updating password:", err);
			const message =
				err instanceof Error && "errors" in err
					? ((err as { errors?: { message: string }[] }).errors?.[0]?.message ??
						"Failed to update password")
					: "Failed to update password";
			setError(message);
		} finally {
			setIsPending(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-4 bg-card border-border border rounded-xl p-4 shadow-2xs"
		>
			{hasPassword && (
				<div className="space-y-1.5">
					<Label htmlFor="currentPassword">Current Password</Label>
					<Input
						id="currentPassword"
						type="password"
						value={currentPassword}
						onChange={(e) => setCurrentPassword(e.target.value)}
						disabled={isPending}
						required
					/>
				</div>
			)}

			<div className="space-y-1.5">
				<Label htmlFor="newPassword">New Password</Label>
				<Input
					id="newPassword"
					type="password"
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
					disabled={isPending}
					required
					minLength={8}
				/>
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="confirmPassword">Confirm New Password</Label>
				<Input
					id="confirmPassword"
					type="password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					disabled={isPending}
					required
					minLength={8}
				/>
			</div>

			<label className="flex items-center gap-2 text-sm text-muted-foreground">
				<input
					type="checkbox"
					checked={signOutOthers}
					onChange={(e) => setSignOutOthers(e.target.checked)}
					disabled={isPending}
				/>
				Sign out of all other devices
			</label>

			{error && <p className="text-sm text-destructive">{error}</p>}
			{success && (
				<p className="text-sm text-primary">Password updated successfully</p>
			)}

			<div className="flex justify-end pt-2">
				<Button type="submit" disabled={isPending}>
					{isPending && <Loader2 className="w-4 h-4 animate-spin" />}
					Update Password
				</Button>
			</div>
		</form>
	);
}
