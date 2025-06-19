"use client";
import BaseTile from "@/components/tiles/base-tile";
import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { z } from "zod";
import { editUserPasswordAction, editUserSettingsAction } from "../actions";
import RequirementsField, { Requirement } from "@/components/forms/requirements-field";
import { Color } from "@/components/utils";
import useNotification from "@/components/notifications/useNotification";
import LabelAddition from "@/components/forms/labelAddition";

export default function PasswordForm({ className }: { className?: string }) {
	const { addNotification } = useNotification();

	const { pending } = useFormStatus();
	const [state, formAction] = useActionState(editUserPasswordAction, { message: undefined });
	const [requirements, setRequirements] = useState<Requirement[]>([]);

	const [oldPassword, setOldPassword] = useState<string | undefined>(undefined);
	const [newPassword, setNewPassword] = useState<string | undefined>(undefined);
	const [confirmPassword, setConfirmPassword] = useState<string | undefined>(undefined);

	const [oldPasswordError, setOldPasswordError] = useState<string | undefined>(undefined);
	const [newPasswordError, setNewPasswordError] = useState<string | undefined>(undefined);
	const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>(undefined);

	const [confirmDiscard, setConfirmDiscard] = useState<number>(0);

	useEffect(() => {
		if (confirmDiscard == 1) setTimeout(() => setConfirmDiscard(2), 500);
		else if (confirmDiscard == 2) setTimeout(() => setConfirmDiscard(0), 3000);
	}, [confirmDiscard]);

	const discardChanges = () => {
		setConfirmDiscard(0);

		setOldPasswordError(undefined);
		setNewPasswordError(undefined);
		setConfirmPasswordError(undefined);
		setOldPassword(undefined);
		setNewPassword(undefined);
		setConfirmPassword(undefined);
	};

	useEffect(() => {
		if (typeof state.message === "string") {
			if (state.message == "success") {
				addNotification("Password reset!", Color.Success);
			} else {
				addNotification(state.message, Color.Warning);
			}
		}

		if (typeof state.message !== "object" || state.message === null) {
			if (state.message === "success") discardChanges();
			return;
		}

		setOldPasswordError(state.message.oldPassword?.join(", ") || "");
		setNewPasswordError(state.message.newPassword?.join(", ") || "");
		setConfirmPasswordError(state.message.confirmPassword?.join(", ") || "");
	}, [state]);

	useEffect(() => {
		if (oldPassword === undefined) return;
		const parsed = z.string().trim().min(1, "Required").safeParse(oldPassword);
		setOldPasswordError(parsed.success ? "" : parsed.error.errors[0].message);
	}, [oldPassword]);

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

	const valid = [oldPasswordError, newPasswordError, confirmPasswordError].every((error) => error === "");

	return (
		<BaseTile title='Reset Password' className={className}>
			<form action={formAction} className='h-100 d-flex flex-column'>
				<div className='row gy-3'>
					<div className='col-12 col-md-6'>
						<div>
							<label className='form-label' htmlFor='oldPassword'>
								Old Password
								<LabelAddition />
							</label>
							<input
								className={"bg-light bg-opacity-10 form-control text-white fenix border-" + (oldPasswordError !== undefined ? (oldPasswordError.length > 0 ? "danger is-invalid" : "success is-valid") : "light")}
								placeholder='Your old Password'
								name='oldPassword'
								id='oldPassword'
								type='password'
								value={oldPassword === undefined ? "" : oldPassword}
								onChange={(e) => setOldPassword(e.target.value)}
							/>
							<p className='invalid-feedback d-block my-0'>&nbsp;{oldPasswordError}</p>
						</div>
						<div>
							<label className='form-label' htmlFor='password'>
								New Password
								<LabelAddition />
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
								<LabelAddition />
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

						<p className='text-danger'>&nbsp;{typeof state?.message == "string" && state.message !== "success" ? state.message : ""}</p>
						<div className='d-flex'>
							{confirmDiscard == 0 ? (
								<button className='btn btn-outline-danger px-4' type='button' onClick={() => setConfirmDiscard(1)}>
									Discard<span className='d-none d-sm-inline d-md-none d-xl-inline'> Changes</span>
								</button>
							) : (
								<button className='btn btn-danger px-4' type='button' disabled={confirmDiscard !== 2} onClick={() => discardChanges()}>
									Confirm<span className='d-sm-none d-xl-inline'> Discard</span>
								</button>
							)}
							<button className={` flex-grow-1 btn btn-${!valid ? "outline-" : ""}success px-4 ms-3`} type='submit' disabled={pending || !valid}>
								{pending ? (
									"Saving..."
								) : (
									<>
										Reset<span className='d-none d-sm-inline d-lg-none d-xl-inline'> now</span>
									</>
								)}
							</button>
						</div>
						<p className='invalid-feedback d-block my-0'>&nbsp;</p>
					</div>
				</div>
			</form>
		</BaseTile>
	);
}
