"use client";

import { useReverification, useUser } from "@clerk/nextjs";
import { Loader2, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EmailForm() {
	const { user, isLoaded } = useUser();

	const [newEmail, setNewEmail] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const [addError, setAddError] = useState<string | null>(null);

	const [verifyingEmailId, setVerifyingEmailId] = useState<string | null>(null);
	const [verificationCode, setVerificationCode] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [verifyError, setVerifyError] = useState<string | null>(null);

	const [pendingActionId, setPendingActionId] = useState<string | null>(null);

	const changeEmail = useReverification(() =>
		user?.createEmailAddress({ email: newEmail }).then((emailAddress) => {
			emailAddress.prepareVerification({ strategy: "email_code" });
			setVerifyingEmailId(emailAddress.id);
		}),
	);

	if (!isLoaded || !user) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const handleAddEmail = async () => {
		setAddError(null);
		if (!newEmail) return;

		setIsAdding(true);
		try {
			await changeEmail();
			setNewEmail("");
		} catch (error) {
			console.error("Error adding email:", error);
			const message =
				error instanceof Error && "errors" in error
					? ((error as { errors?: { message: string }[] }).errors?.[0]
							?.message ?? "Failed to add email")
					: "Failed to add email";
			setAddError(message);
		} finally {
			setIsAdding(false);
		}
	};

	const handleVerifyEmail = async () => {
		if (!verifyingEmailId || !verificationCode) return;
		setVerifyError(null);
		setIsVerifying(true);

		try {
			const emailAddress = user.emailAddresses.find(
				(e) => e.id === verifyingEmailId,
			);
			if (!emailAddress) throw new Error("Email not found");

			await emailAddress.attemptVerification({ code: verificationCode });
			await user.reload();
			setVerifyingEmailId(null);
			setVerificationCode("");
		} catch (error) {
			console.error("Error verifying email:", error);
			setVerifyError("Invalid or expired code");
		} finally {
			setIsVerifying(false);
		}
	};

	const handleSetPrimary = async (emailId: string) => {
		setPendingActionId(emailId);
		try {
			await user.update({ primaryEmailAddressId: emailId });
			await user.reload();
		} catch (error) {
			console.error("Error setting primary email:", error);
		} finally {
			setPendingActionId(null);
		}
	};

	const handleDelete = async (emailId: string) => {
		setPendingActionId(emailId);
		try {
			const emailAddress = user.emailAddresses.find((e) => e.id === emailId);
			await emailAddress?.destroy();
			await user.reload();
		} catch (error) {
			console.error("Error deleting email:", error);
		} finally {
			setPendingActionId(null);
		}
	};

	return (
		<div className="flex flex-col gap-8 bg-card border-border border rounded-xl shadow-2xs p-4">
			<div className="flex flex-col gap-2 overflow-y-auto h-40 bg-background p-2 rounded-xl scrollbar-thin">
				{user.emailAddresses.map((email) => {
					const isPrimary = email.id === user.primaryEmailAddressId;
					const isUnverified = email.verification?.status !== "verified";

					return (
						<div
							key={email.id}
							className="flex items-center justify-between gap-3 border border-primary rounded-lg px-4 py-2.5 bg-card"
						>
							<div className="flex items-center gap-2 min-w-0">
								<span className="text-sm text-foreground truncate">
									{email.emailAddress}
								</span>
								{isPrimary && (
									<span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
										Primary
									</span>
								)}
								{isUnverified && (
									<span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
										Unverified
									</span>
								)}
							</div>

							<div className="flex items-center gap-1 shrink-0">
								{!isPrimary && !isUnverified && (
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										title="Make primary"
										disabled={pendingActionId === email.id}
										onClick={() => handleSetPrimary(email.id)}
									>
										{pendingActionId === email.id ? (
											<Loader2 className="w-3.5 h-3.5 animate-spin" />
										) : (
											<Star className="w-3.5 h-3.5" />
										)}
									</Button>
								)}
								{!isPrimary && (
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										title="Remove"
										disabled={pendingActionId === email.id}
										onClick={() => handleDelete(email.id)}
										className="text-muted-foreground hover:text-destructive"
									>
										{pendingActionId === email.id ? (
											<Loader2 className="w-3.5 h-3.5 animate-spin" />
										) : (
											<Trash2 className="w-3.5 h-3.5" />
										)}
									</Button>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{verifyingEmailId ? (
				<div className="flex flex-col gap-2 border border-border rounded-lg p-4 bg-muted/30">
					<Label htmlFor="verificationCode">
						Enter the code sent to your new email
					</Label>
					<div className="flex items-center gap-2">
						<Input
							id="verificationCode"
							value={verificationCode}
							onChange={(e) => setVerificationCode(e.target.value)}
							placeholder="123456"
							disabled={isVerifying}
						/>
						<Button
							type="button"
							onClick={handleVerifyEmail}
							disabled={isVerifying}
						>
							{isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
							Verify
						</Button>
						<Button
							type="button"
							variant="ghost"
							onClick={() => {
								setVerifyingEmailId(null);
								setVerificationCode("");
							}}
						>
							Cancel
						</Button>
					</div>
					{verifyError && (
						<p className="text-sm text-destructive">{verifyError}</p>
					)}
				</div>
			) : (
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="newEmail">Add email address</Label>
					<div className="flex items-center gap-2">
						<Input
							id="newEmail"
							type="email"
							value={newEmail}
							onChange={(e) => setNewEmail(e.target.value)}
							placeholder="you@example.com"
							disabled={isAdding}
						/>
						<Button
							type="button"
							onClick={handleAddEmail}
							disabled={isAdding || !newEmail}
						>
							{isAdding && <Loader2 className="w-4 h-4 animate-spin" />}
							Add
						</Button>
					</div>
					{addError && <p className="text-sm text-destructive">{addError}</p>}
				</div>
			)}
		</div>
	);
}
