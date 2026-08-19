"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import type { ChangeEvent } from "react";
import { useActionState, useRef, useState } from "react";
import { FormMessage } from "@/components/formMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateUserAction } from "@/lib/actions/users";
import type { User } from "@/types/index";

export default function ProfileForm({ user }: { user: User }) {
	const [state, formAction, isPending] = useActionState(updateUserAction, null);
	const formRef = useRef<HTMLFormElement>(null);
	const [profilePic, setProfilePic] = useState(user.profilePic);

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const selectedProfile = event.target.files[0];
			setProfilePic(URL.createObjectURL(selectedProfile));
		}
	};

	return (
		<div className="bg-card border border-border rounded-xl shadow-sm p-8">
			<form ref={formRef} action={formAction} className="flex flex-col gap-6">
				<div className="flex items-center gap-4 pb-6 border-b border-border">
					<div className="w-16 h-16 rounded-full border-2 border-primary bg-muted overflow-hidden shrink-0 relative">
						{profilePic && (
							<Image
								src={profilePic}
								alt={`${user.firstName} ${user.lastName}`}
								width={64}
								height={64}
								className="w-full h-full object-cover"
							/>
						)}
						<input
							id="profile"
							name="profile"
							type="file"
							className="absolute w-full h-full left-0 top-0 opacity-0 cursor-pointer"
							onChange={handleFileChange}
						/>
					</div>
					<h2 className="text-2xl font-bold text-foreground tracking-tight">
						{user.firstName} {user.lastName}
					</h2>
				</div>

				<FormMessage state={state} />

				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div className="space-y-1.5">
						<Label
							htmlFor="firstName"
							className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
						>
							First Name
						</Label>
						<Input
							id="firstName"
							name="firstName"
							defaultValue={user.firstName}
							disabled={isPending}
						/>
						{state?.errors?.firstName && (
							<p className="text-sm text-destructive">
								{state.errors.firstName[0]}
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label
							htmlFor="lastName"
							className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
						>
							Last Name
						</Label>
						<Input
							id="lastName"
							name="lastName"
							defaultValue={user.lastName}
							disabled={isPending}
						/>
						{state?.errors?.lastName && (
							<p className="text-sm text-destructive">
								{state.errors.lastName[0]}
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label
							htmlFor="jobPosition"
							className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
						>
							Role
						</Label>
						<Input
							id="jobPosition"
							name="jobPosition"
							defaultValue={user.jobPosition ?? ""}
							disabled={isPending}
						/>
					</div>
				</div>

				<div className="space-y-1.5">
					<Label
						htmlFor="bio"
						className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
					>
						Bio
					</Label>
					<Textarea
						id="bio"
						name="bio"
						defaultValue={user.bio ?? ""}
						disabled={isPending}
						className="min-h-32 resize-none"
					/>
					{state?.errors?.bio && (
						<p className="text-sm text-destructive">{state.errors.bio[0]}</p>
					)}
				</div>

				<div className="flex justify-end items-center gap-3 pt-4 border-t border-border">
					<Button
						type="button"
						variant="ghost"
						disabled={isPending}
						onClick={() => formRef.current?.reset()}
					>
						Reset
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending && <Loader2 className="w-4 h-4 animate-spin" />}
						Save Changes
					</Button>
				</div>
			</form>
		</div>
	);
}
