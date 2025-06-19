"use client";

import BaseTile from "@/components/tiles/base-tile";
import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { z } from "zod";
import RequirementsField, { Requirement } from "@/components/forms/requirements-field";
import { Color } from "@/components/utils";
import useNotification from "@/components/notifications/useNotification";
import { editUserPasswordAction } from "./actions";
import { redirect } from "next/navigation";

export default function PasswordForm({ className, token }: { className?: string; token: string }) {
	const { addNotification } = useNotification();

	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(editUserPasswordAction, { message: undefined });
	const [requirements, setRequirements] = useState<Requirement[]>([]);

	const [newPassword, setNewPassword] = useState<string | undefined>(undefined);
	const [confirmPassword, setConfirmPassword] = useState<string | undefined>(undefined);

	const [newPasswordError, setNewPasswordError] = useState<string | undefined>(undefined);
	const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>(undefined);

	useEffect(() => {
		if (typeof state.message === "string") {
			if (state.message == "success") {
				addNotification("Password reset!", Color.Success);
				redirect("/login");
			} else {
				addNotification(state.message, Color.Warning);
			}
		}

		if (!state || typeof state.message !== "object" || state.message === null) return;

		setNewPasswordError(state.message.newPassword?.join(", ") || "");
		setConfirmPasswordError(state.message.confirmPassword?.join(", ") || "");
	}, [state]);

	useEffect(() => {
		setRequirements([
			{ title: "Minimum of 8 characters", fullfilled: z.string().min(8).safeParse(newPassword).success, part: 1 },
			{
				title: "Uppercase and lowercase letters",
				fullfilled: z
					.string()
					.regex(/(?=.*[a-z])(?=.*[A-Z])/)
					.safeParse(newPassword).success,
				part: 1,
			},
			{
				title: "Numbers and symbols",
				fullfilled: z
					.string()
					.regex(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)
					.safeParse(newPassword).success,
				part: 1,
			},
		]);
	}, [newPassword]);

	useEffect(() => {
		if (newPassword === undefined) return;

		setNewPasswordError(requirements.some((requirement) => !requirement.fullfilled) ? "Password not strong enough" : "");
	}, [requirements, newPassword]);

	useEffect(() => {
		if (confirmPassword === undefined) return;

		setConfirmPasswordError(newPasswordError ? newPasswordError : confirmPassword !== newPassword ? "Passwords don't match" : "");
	}, [newPassword, confirmPassword, newPasswordError]);

	const valid = newPasswordError === "" && confirmPasswordError === "";

	return (
		<form action={formAction} className='h-100 d-flex flex-column'>
			<input type='hidden' name='token' value={token} />
			<div className='row gy-3'>
				<div className='col-12 col-md-6'>
					<div>
						<label className='form-label' htmlFor='password'>
							New Password
						</label>
						<input
							className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (newPasswordError !== undefined ? (newPasswordError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
							placeholder='Your new Password'
							name='newPassword'
							id='newPassword'
							type='password'
							value={newPassword === undefined ? "" : newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
						/>
						<p className='invalid-feedback d-block my-0'>&nbsp;{newPasswordError}</p>
					</div>
					<div>
						<label className='form-label' htmlFor='confirmPassword'>
							Confirm Password
						</label>
						<input
							className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (confirmPasswordError !== undefined ? (confirmPasswordError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
							placeholder='Confirm your new Password'
							name='confirmPassword'
							id='confirmPassword'
							type='password'
							value={confirmPassword === undefined ? "" : confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
						<p className='invalid-feedback d-block my-0'>&nbsp;{confirmPasswordError}</p>
					</div>
				</div>
				<div className='col-12 col-md-6 d-flex flex-column'>
					<RequirementsField className='mb-auto' requirements={requirements} />

					<p className={"text-center mb-0 text-" + (state?.message === "success" ? "success" : "danger")}>&nbsp;{typeof state?.message == "string" ? (state?.message === "success" ? "Success!" : state.message) : ""}</p>
				</div>
			</div>

			<div className='w-100 d-flex justify-content-center mt-4'>
				<button className={`btn btn-${!valid ? "outline-" : ""}success px-5`} type='submit' disabled={pending || !valid}>
					{pending ? "Saving..." : "Reset now"}
				</button>
			</div>
		</form>
	);
}
